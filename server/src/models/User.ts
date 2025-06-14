import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  managerId?: mongoose.Types.ObjectId;
  hireDate: Date;
  isActive: boolean;
  avatar?: string;
  dateOfBirth: Date; // Added date of birth
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
    unpaid?: number;
    maternity?: number;
    paternity?: number;
    other?: number;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.EMPLOYEE,
  },
  department: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IUser) {
      return this.role === UserRole.EMPLOYEE;
    },
  },
  hireDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: true, // Make date of birth required
  },
  leaveBalance: {
    annual: {
      type: Number,
      default: 20,
    },
    sick: {
      type: Number,
      default: 10,
    },
    casual: {
      type: Number,
      default: 5,
    },
    unpaid: {
      type: Number,
      default: 0,
    },
    maternity: {
      type: Number,
      default: 0,
    },
    paternity: {
      type: Number,
      default: 0,
    },
    other: {
      type: Number,
      default: 0,
    }
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);