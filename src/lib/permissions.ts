/**
 * Complete list of all permissions in the FixMe platform
 * ADMIN users always have ALL permissions - this cannot be changed
 * Staff members only have the permissions assigned to their role
 */

export const ALL_PERMISSIONS = {
  // User Management
  'users.view': 'View all users',
  'users.create': 'Create new users',
  'users.edit': 'Edit user profiles',
  'users.ban': 'Ban and unban users',
  'users.delete': 'Delete user accounts',
  'users.verify_fixer': 'Verify fixer KVK numbers',

  // Job & Request Management
  'jobs.view': 'View all jobs and requests',
  'jobs.edit': 'Edit repair requests',
  'jobs.cancel': 'Cancel jobs',
  'jobs.reassign': 'Reassign jobs to different fixers',
  'jobs.delete': 'Delete repair requests',

  // Dispute Management
  'disputes.view': 'View all disputes',
  'disputes.resolve': 'Resolve disputes (refund or release)',
  'disputes.message': 'Send messages to users about disputes',

  // Finance
  'finance.view': 'View payments and revenue',
  'finance.refund': 'Issue refunds',
  'finance.export': 'Export financial reports',
  'finance.vouchers': 'Create and manage vouchers',
  'finance.adjust': 'Add credit to user accounts',

  // Categories
  'categories.view': 'View categories',
  'categories.create': 'Create new categories',
  'categories.edit': 'Edit categories',
  'categories.delete': 'Delete categories',

  // Platform Settings
  'settings.view': 'View platform settings',
  'settings.edit': 'Change platform settings (commission, rules, etc.)',

  // Content Management
  'content.view': 'View website content',
  'content.edit': 'Edit marketing texts, hero images, homepage content',

  // Staff Management
  'staff.view': 'View staff members and roles',
  'staff.create': 'Create new staff roles and add staff',
  'staff.edit': 'Edit staff roles and permissions',
  'staff.remove': 'Remove staff members',

  // Notifications
  'notifications.send': 'Send announcements to all users',
  'notifications.manage': 'Manage notification templates',
} as const;

export type Permission = keyof typeof ALL_PERMISSIONS;

/**
 * Permission categories for organizing the UI
 */
export const PERMISSION_CATEGORIES = {
  'User Management': [
    'users.view',
    'users.create',
    'users.edit',
    'users.ban',
    'users.delete',
    'users.verify_fixer',
  ],
  'Job Management': [
    'jobs.view',
    'jobs.edit',
    'jobs.cancel',
    'jobs.reassign',
    'jobs.delete',
  ],
  'Dispute Management': [
    'disputes.view',
    'disputes.resolve',
    'disputes.message',
  ],
  'Finance': [
    'finance.view',
    'finance.refund',
    'finance.export',
    'finance.vouchers',
    'finance.adjust',
  ],
  'Categories': [
    'categories.view',
    'categories.create',
    'categories.edit',
    'categories.delete',
  ],
  'Platform Settings': [
    'settings.view',
    'settings.edit',
  ],
  'Content Management': [
    'content.view',
    'content.edit',
  ],
  'Staff Management': [
    'staff.view',
    'staff.create',
    'staff.edit',
    'staff.remove',
  ],
  'Notifications': [
    'notifications.send',
    'notifications.manage',
  ],
} as const;

/**
 * Pre-made role templates for quick role creation
 */
export const ROLE_TEMPLATES = {
  'Dispute Manager': {
    description: 'Handles customer disputes and refund requests',
    permissions: [
      'disputes.view',
      'disputes.resolve',
      'disputes.message',
      'jobs.view',
      'finance.view',
    ],
  },
  'Content Editor': {
    description: 'Manages website content and marketing materials',
    permissions: [
      'content.view',
      'content.edit',
    ],
  },
  'Finance Officer': {
    description: 'Manages payments, refunds, and financial reports',
    permissions: [
      'finance.view',
      'finance.refund',
      'finance.export',
      'finance.vouchers',
    ],
  },
  'Customer Support': {
    description: 'Assists users and manages general support tasks',
    permissions: [
      'users.view',
      'users.edit',
      'jobs.view',
      'disputes.view',
      'disputes.message',
      'notifications.send',
    ],
  },
  'Full Manager': {
    description: 'Has access to most features except critical staff and settings changes',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.ban',
      'users.verify_fixer',
      'jobs.view',
      'jobs.edit',
      'jobs.cancel',
      'jobs.reassign',
      'disputes.view',
      'disputes.resolve',
      'disputes.message',
      'finance.view',
      'finance.refund',
      'finance.export',
      'finance.vouchers',
      'categories.view',
      'categories.create',
      'categories.edit',
      'content.view',
      'content.edit',
      'staff.view',
      'notifications.send',
      'notifications.manage',
    ],
  },
} as const;

export type RoleTemplateName = keyof typeof ROLE_TEMPLATES;
