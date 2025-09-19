const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    minlength: [2, 'İsim en az 2 karakter olmalıdır'],
    maxlength: [50, 'İsim en fazla 50 karakter olmalıdır']
  },
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir email adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // createdAt ve updatedAt otomatik eklenir
});

// Şifreyi kaydetmeden önce hashle
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmemişse devam et
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre doğrulama metodu
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Şifre karşılaştırma hatası');
  }
};

// JSON'a çevirirken şifreyi gizle
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Static method: Email ile kullanıcı bul
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual: Kullanıcının görev sayısı (sonra ekleyeceğiz)
UserSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user',
  count: true
});

module.exports = mongoose.model('User', UserSchema);