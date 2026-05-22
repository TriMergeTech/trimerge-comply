const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned in queries by default
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ['admin', 'analyst', 'viewer'],
      default: 'analyst',
    },

    // ----- OTP fields (Illia will plug into these) -----
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      purpose: {
        type: String,
        enum: ['email_verification', 'login', 'password_reset'],
        select: false,
      },
    },

    // ----- Password reset -----
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ----- Refresh token store (single active session per user) -----
    refreshToken: {
      type: String,
      select: false,
    },

    // ----- Audit fields -----
    lastLoginAt: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─── Indexes ────────────────────────────────────────────────
userSchema.index({ passwordResetToken: 1 });

// ─── Pre-save: hash password only when modified ──────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  this.password = await bcrypt.hash(this.password, rounds);
});

// ─── Instance method: compare password ──────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: check if account is locked ────────────
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

// ─── Instance method: safe public profile (no secrets) ──────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    phone: this.phone,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
