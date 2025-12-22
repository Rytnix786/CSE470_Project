/**
 * Utility function to clean doctor names by removing any leading "Dr." or "Dr " prefixes
 * @param {string} name - The doctor's name that may contain a "Dr." prefix
 * @returns {string} - Cleaned name without the "Dr." prefix
 */
const cleanDoctorName = (name) => {
  if (!name) return '';
  
  // Remove any leading "Dr." or "Dr " (case insensitive)
  return name.replace(/^dr\.?\s*/i, '').trim();
};

/**
 * Utility function to format doctor names with "Dr." prefix if not already present
 * @param {string} name - The doctor's name that may or may not contain a "Dr." prefix
 * @returns {string} - Formatted name with exactly one "Dr." prefix
 */
const formatDoctorName = (name='') => {
  if (!name) return 'Doctor';
  
  const cleanedName = cleanDoctorName(name);
  return `Dr. ${cleanedName}`;
};

module.exports = {
  cleanDoctorName,
  formatDoctorName
};