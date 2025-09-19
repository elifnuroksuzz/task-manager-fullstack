const express = require('express');
const { User } = require('../models');
const { generateToken, createResponse, createAuthResponse } = require('../config/auth');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Kullanıcı kayıt
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasyon
    if (!name || !email || !password) {
      return res.status(400).json(
        createResponse(false, 'Tüm alanlar zorunludur')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        createResponse(false, 'Şifre en az 6 karakter olmalıdır')
      );
    }

    // Email kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json(
        createResponse(false, 'Bu email adresi zaten kullanımda')
      );
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    res.status(201).json(
      createAuthResponse(user, token)
    );

  } catch (error) {
    console.error('Register hatası:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json(createResponse(false, message));
    }

    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   POST /api/auth/login
// @desc    Kullanıcı giriş
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json(
        createResponse(false, 'Email ve şifre gereklidir')
      );
    }

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!user) {
      return res.status(401).json(
        createResponse(false, 'Email veya şifre hatalı')
      );
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(
        createResponse(false, 'Email veya şifre hatalı')
      );
    }

    // Aktif kullanıcı kontrolü
    if (!user.isActive) {
      return res.status(401).json(
        createResponse(false, 'Hesabınız deaktif edilmiş')
      );
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    // Şifreyi response'dan kaldır
    user.password = undefined;

    res.json(createAuthResponse(user, token));

  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   GET /api/auth/me
// @desc    Giriş yapmış kullanıcının bilgileri
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json(
      createResponse(true, 'Kullanıcı bilgileri', req.user)
    );
  } catch (error) {
    console.error('Get me hatası:', error);
    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// @route   PUT /api/auth/me
// @desc    Kullanıcı bilgilerini güncelle
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json(
        createResponse(false, 'İsim en az 2 karakter olmalıdır')
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    res.json(
      createResponse(true, 'Profil güncellendi', user)
    );

  } catch (error) {
    console.error('Update profile hatası:', error);
    res.status(500).json(
      createResponse(false, 'Sunucu hatası')
    );
  }
});

// Test route'u kaldıralım - artık gerçek route'lar var
module.exports = router;