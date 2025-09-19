const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT token doğrulama middleware'i
const auth = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Token bulunamadı.'
      });
    }

    // "Bearer " kısmını kaldır
    const cleanToken = token.startsWith('Bearer ') 
      ? token.slice(7, token.length) 
      : token;

    // Token'ı doğrula
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token geçersiz. Kullanıcı bulunamadı.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif edilmiş.'
      });
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware hatası:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token geçersiz.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

// Opsiyonel auth - token varsa kullanıcıyı ekle, yoksa devam et
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (token) {
      const cleanToken = token.startsWith('Bearer ') 
        ? token.slice(7, token.length) 
        : token;

      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Hata olsa bile devam et
    next();
  }
};

module.exports = { auth, optionalAuth };