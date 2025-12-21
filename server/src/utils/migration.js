const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * Migration script to fix doctor data inconsistencies
 * This ensures all existing doctor records have proper default values
 */
const runMigration = async () => {
  try {
    console.log('Starting doctor data migration...');
    
    // Fix User records - ensure all doctors have isActive=true
    const doctorUsers = await User.updateMany(
      { 
        role: 'DOCTOR',
        isActive: { $exists: false }
      },
      { 
        $set: { isActive: true }
      }
    );
    
    console.log(`Updated ${doctorUsers.nModified} doctor user records with isActive=true`);
    
    // Fix DoctorProfile records - ensure all have verificationStatus
    const doctorProfiles = await DoctorProfile.updateMany(
      { 
        verificationStatus: { $exists: false }
      },
      { 
        $set: { verificationStatus: 'PENDING' }
      }
    );
    
    console.log(`Updated ${doctorProfiles.nModified} doctor profiles with verificationStatus=PENDING`);
    
    console.log('Doctor data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

module.exports = { runMigration };