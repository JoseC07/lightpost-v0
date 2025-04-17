import { z } from 'zod'; // For runtime validation

// Define all possible permissions in the system
export const Permissions = {
  READ_POSTS: 'read:posts',
  CREATE_POSTS: 'create:posts',
  EDIT_POSTS: 'edit:posts',
  DELETE_POSTS: 'delete:posts',
  MODERATE_POSTS: 'moderate:posts',
  MANAGE_USERS: 'manage:users',
} as const;

// Define available roles
export enum UserRole {
  USER = 'user',        // Basic authenticated user
  PAID_USER = 'paid',   // Premium user with additional features
  MODERATOR = 'moderator',    // Content moderation capabilities
  ADMIN = 'admin',       // Full system access
}

// Helper type for role-based access control
export type RolePermissions = {
  [key in UserRole]: string[];
};

// Map roles to their permissions
export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    Permissions.READ_POSTS,
    Permissions.CREATE_POSTS,
  ],
  [UserRole.PAID_USER]: [
    Permissions.READ_POSTS,
    Permissions.CREATE_POSTS,
    Permissions.EDIT_POSTS,
    Permissions.MODERATE_POSTS,
  ],
  [UserRole.MODERATOR]: [
    Permissions.READ_POSTS,
    Permissions.CREATE_POSTS,
    Permissions.EDIT_POSTS,
    Permissions.MODERATE_POSTS,
  ],
  [UserRole.ADMIN]: Object.values(Permissions), // Admins get all permissions
};

// Zod schema for runtime validation
export const roleSchema = z.nativeEnum(UserRole); 