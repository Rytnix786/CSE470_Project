const User = require('../models/User');

/**
 * Ensure a valid admin test account exists for development
 * This function creates an admin account if it doesn't exist
 * It does NOT overwrite existing users
 * 
 * Email: admin@bracu.ac.bd
 * Password: Admin@123 (will be hashed correctly by pre-save hook)
 * Role: ADMIN
 */
const ensureAdminExists = async () => {
  // Only run in development environment
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@bracu.ac.bd' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists, skipping creation');
      return;
    }

    // Create new admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@bracu.ac.bd',
      password: 'Admin@123', // Plain text - will be hashed by pre-save hook
      role: 'ADMIN',
      isEmailVerified: true, // Skip email verification for convenience
      isActive: true
    });

    // Save user - pre-save hook will hash the password correctly
    await adminUser.save();
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@bracu.ac.bd');
    console.log('🔑 Password: Admin@123 (hashed correctly)');
  } catch (error) {
    console.error('❌ Error ensuring admin user exists:', error.message);
  }
};

module.exports = { ensureAdminExists };