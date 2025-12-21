/**
 * Utility function to clean doctor names by removing any leading "Dr." or "Dr " prefixes
 * @param {string} name - The doctor's name that may contain a "Dr." prefix
 * @returns {string} - Cleaned name without the "Dr." prefix
 */
export const cleanDoctorName = (name) => {
  if (!name) return '';
  
  // Remove any leading "Dr." or "Dr " (case insensitive)
  return name.replace(/^dr\.?\s*/i, '').trim();
};