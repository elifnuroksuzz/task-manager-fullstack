const { createResponse } = require('../config/auth');

// Task validasyon middleware'i
const validateTask = (req, res, next) => {
  const { title, status, priority } = req.body;

  // Başlık kontrolü
  if (req.method === 'POST' && (!title || title.trim().length === 0)) {
    return res.status(400).json(
      createResponse(false, 'Görev başlığı gereklidir')
    );
  }

  // Status kontrolü
  if (status && !['todo', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json(
      createResponse(false, 'Geçersiz status değeri')
    );
  }

  // Priority kontrolü
  if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return res.status(400).json(
      createResponse(false, 'Geçersiz priority değeri')
    );
  }

  next();
};

module.exports = { validateTask };