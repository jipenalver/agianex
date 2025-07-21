// 👉 Navigation Types
export type MainNavigation = [string, string]
export type SubNavigation = [string, string, string, string]

// 👉 ADMINISTRATOR; Main Navigation; Title, Icon
export const adminNav: MainNavigation[] = [['Users Management', 'mdi-account-box-multiple']]

// 👉 ADMINISTRATOR; Sub Navigation; Title, Icon, Subtitle, Redirect Path;
export const adminItemsNav1: SubNavigation[] = [
  ['User Roles', 'mdi-tag-multiple', 'Add and Manage Roles', '/admin/users/roles'],
  ['List of Users', 'mdi-list-box', 'Add and Manage Users', '/admin/users/list'],
]

// 👉 Settings Navigation; Title, Icon, Subtitle, Redirect Path
export const settingsItemsNav: SubNavigation[] = [
  ['Account', 'mdi-account', '', '/settings/account'],
  ['Security', 'mdi-lock', '', '/settings/security'],
]
