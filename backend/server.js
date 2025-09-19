const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Environment variables'ları yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'lar
app.use(cors());
app.use(express.json()); // JSON verilerini parse etmek için

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı!');
  })
  .catch((error) => {
    console.error('❌ MongoDB bağlantı hatası:', error);
  });

// Test route'u
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager Backend API çalışıyor! 🚀',
    version: '1.0.0',
    endpoints: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/tasks',
      'POST /api/tasks'
    ]
  });
});

// API Routes (şimdilik boş, sonra ekleyeceğiz)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Sunucu hatası!' 
  });
});

// 404 handler - En sona koyuyoruz ve farklı syntax
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint bulunamadı!',
    requestedPath: req.path
  });
});

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`🔥 Server ${PORT} portunda çalışıyor!`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🛠️  Geliştirme modu aktif - dosya değişikliklerinde otomatik restart`);
});

