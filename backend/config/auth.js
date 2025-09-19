const jwt = require('jsonwebtoken');

// JWT token oluştur
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d' // 7 gün geçerli
    }
  );
};

// Refresh token oluştur (gelişmiş projeler için)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '30d' // 30 gün geçerli
    }
  );
};

// Token'dan kullanıcı ID'sini al
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Response formatları
const createResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return response;
};

const createAuthResponse = (user, token) => {
  return {
    success: true,
    message: 'İşlem başarılı',
    data: {
      user,
      token,
      expiresIn: '7d'
    }
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  getUserIdFromToken,
  createResponse,
  createAuthResponse
};