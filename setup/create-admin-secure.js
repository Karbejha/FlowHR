const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// User schema and model (simplified for this script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  department: { type: String, required: true },
  jobTitle: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hireDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  leaveBalance: {
    annual: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    casual: { type: Number, default: 5 }
  }
}, { timestamps: true });

// Hash password before saving
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@flowhr.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@flowhr.com');
      console.log('You can use this account to log in.');
      process.exit(0);
    }

    // Get passwords from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    const managerPassword = process.env.MANAGER_PASSWORD;
    const employeePassword = process.env.EMPLOYEE_PASSWORD;

    if (!adminPassword || !managerPassword || !employeePassword) {
      console.error('❌ ERROR: Missing required environment variables!');
      console.error('Please set the following environment variables:');
      console.error('- ADMIN_PASSWORD');
      console.error('- MANAGER_PASSWORD'); 
      console.error('- EMPLOYEE_PASSWORD');
      console.error('\nExample:');
      console.error('ADMIN_PASSWORD=your-secure-admin-password npm run setup');
      process.exit(1);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@flowhr.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      department: 'IT',
      jobTitle: 'System Administrator'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@flowhr.com');
    console.log('Password: [Set via ADMIN_PASSWORD environment variable]');
    console.log('Department: IT');
    console.log('Job Title: System Administrator');

    // Create a manager user
    const managerUser = new User({
      email: 'manager@flowhr.com',
      password: managerPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: 'manager',
      department: 'HR',
      jobTitle: 'HR Manager'
    });

    await managerUser.save();
    console.log('\n✅ Manager user created successfully!');
    console.log('Email: manager@flowhr.com');
    console.log('Password: [Set via MANAGER_PASSWORD environment variable]');
    console.log('Department: HR');
    console.log('Job Title: HR Manager');

    // Create an employee user
    const employeeUser = new User({
      email: 'employee@flowhr.com',
      password: employeePassword,
      firstName: 'Jane',
      lastName: 'Employee',
      role: 'employee',
      department: 'Engineering',
      jobTitle: 'Software Developer',
      managerId: managerUser._id
    });

    await employeeUser.save();
    console.log('\n✅ Employee user created successfully!');
    console.log('Email: employee@flowhr.com');
    console.log('Password: [Set via EMPLOYEE_PASSWORD environment variable]');
    console.log('Department: Engineering');
    console.log('Job Title: Software Developer');
    console.log('Manager: John Manager');

    console.log('\n🎉 All test users created successfully! You can now log in with any of these accounts.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
