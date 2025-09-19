const mongoose = require('mongoose');

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Görev başlığı gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık en fazla 100 karakter olmalıdır']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama en fazla 500 karakter olmalıdır'],
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'completed'],
      message: 'Status todo, in-progress veya completed olmalıdır'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Öncelik low, medium, high veya urgent olmalıdır'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Her tag en fazla 20 karakter olmalıdır']
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID gereklidir']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Görev tamamlandığında completedAt'i güncelle
TaskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

// Index'ler - performans için
TaskSchema.index({ user: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ createdAt: -1 });

// Static method: Kullanıcının görevlerini getir
TaskSchema.statics.getUserTasks = function(userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

// Virtual: Görevin gecikip gecikmediğini kontrol et
TaskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

module.exports = mongoose.model('Task', TaskSchema);