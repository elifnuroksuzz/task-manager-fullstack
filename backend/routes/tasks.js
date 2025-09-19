const express = require('express');
const { Task } = require('../models');
const { auth } = require('../middleware/auth');
const { createResponse } = require('../config/auth');

const router = express.Router();

// Tüm task route'ları korumalı (auth middleware)
router.use(auth);

// @route   GET /api/tasks
// @desc    Kullanıcının tüm görevlerini getir
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Filtreler
    const filters = { user: req.user._id };
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Görevleri getir
    const tasks = await Task.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Toplam sayı
    const total = await Task.countDocuments(filters);

    // İstatistikler
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const taskStats = {
      total,
      todo: stats.find(s => s._id === 'todo')?.count || 0,
      inProgress: stats.find(s => s._id === 'in-progress')?.count || 0,
      completed: stats.find(s => s._id === 'completed')?.count || 0
    };

    res.json({
      success: true,
      message: 'Görevler başarıyla getirildi',
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats: taskStats
      }
    });

  } catch (error) {
    console.error('Get tasks hatası:', error);
    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   GET /api/tasks/:id
// @desc    Belirli bir görevi getir
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    res.json(
      createResponse(true, 'Görev başarıyla getirildi', task)
    );

  } catch (error) {
    console.error('Get task hatası:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   POST /api/tasks
// @desc    Yeni görev oluştur
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    // Validasyon
    if (!title || title.trim().length === 0) {
      return res.status(400).json(
        createResponse(false, 'Görev başlığı gereklidir')
      );
    }

    // Yeni görev oluştur
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags && Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      user: req.user._id
    });

    await task.save();

    res.status(201).json(
      createResponse(true, 'Görev başarıyla oluşturuldu', task)
    );

  } catch (error) {
    console.error('Create task hatası:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json(createResponse(false, message));
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   PUT /api/tasks/:id
// @desc    Görevi güncelle
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Görevi bul
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    // Güncellenecek alanlar
    const updateFields = {};
    
    if (title) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (tags !== undefined) updateFields.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()) : [];

    // Görevi güncelle
    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(
      createResponse(true, 'Görev başarıyla güncellendi', task)
    );

  } catch (error) {
    console.error('Update task hatası:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json(createResponse(false, message));
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Görevi sil
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json(
      createResponse(true, 'Görev başarıyla silindi')
    );

  } catch (error) {
    console.error('Delete task hatası:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Görev durumunu güncelle (hızlı güncelleme)
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json(
        createResponse(false, 'Geçerli bir status giriniz (todo, in-progress, completed)')
      );
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    task.status = status;
    await task.save();

    res.json(
      createResponse(true, 'Görev durumu güncellendi', task)
    );

  } catch (error) {
    console.error('Update task status hatası:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json(
        createResponse(false, 'Görev bulunamadı')
      );
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Kullanıcının görev istatistikleri
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user._id;

    // Detaylı istatistikler
    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$dueDate', null] }
                  ]
                },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      highPriority: 0,
      overdue: 0
    };

    // Tamamlanma oranı
    result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

    res.json(
      createResponse(true, 'İstatistikler getirildi', result)
    );

  } catch (error) {
    console.error('Get stats hatası:', error);
    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

module.exports = router;