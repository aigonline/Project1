import { User } from '../types/user.types';

/**
 * Get profile image URL for a user
 * @param user User object or user ID
 * @returns URL to user's profile image or default avatar
 */
export function getProfileImageUrl(user: User | string | undefined): string {
  if (!user) {
    return '/assets/images/default-avatar.png';
  }
  
  if (typeof user === 'string') {
    // Just ID provided, return default with ID
    return `/assets/images/default-avatar.png`;
  }
  
  // Full user object
  if (user.profilePicture) {
    return user.profilePicture;
  }
  
  return '/assets/images/default-avatar.png';
}

/**
 * Get full name of user
 * @param user User object or user parts
 * @returns Formatted full name
 */
export function getFullName(user: User | { firstName?: string; lastName?: string }): string {
  if (!user) return 'Unknown User';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  return `${firstName} ${lastName}`.trim() || 'Unknown User';
}

/**
 * Get role display name
 * @param role User role
 * @returns Formatted role name
 */
export function getRoleDisplayName(role: string): string {
  switch (role?.toLowerCase()) {
    case 'student':
      return 'Student';
    case 'instructor':
      return 'Instructor';
    case 'admin':
      return 'Administrator';
    default:
      return role || 'User';
  }
}
export function getGradeColorClass(grade: number): string {
  if (grade >= 90) return 'grade-excellent';
  if (grade >= 80) return 'grade-good';
  if (grade >= 70) return 'grade-average';
  if (grade >= 60) return 'grade-pass';
  return 'grade-fail';
}
