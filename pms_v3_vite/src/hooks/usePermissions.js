import { useAuth } from '../context/AuthContext'

/**
 * Centralized permission check based on current user's role.
 * Role definitions (mapping to backend UserRole enum / [Authorize(Roles=...)] on Controllers):
 *   Admin   - System administrator, full access
 *   Manager - Manages projects (CRUD on projects/items/kanban/files)
 *   Member  - Regular user (daily operations on kanban/items/files, cannot create/delete projects)
 *   Visitor - Read-only, cannot access personnel management
 */
export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role || ''

  const isAdmin = role === 'Admin'
  const isManager = role === 'Manager'
  const isMember = role === 'Member'
  const isVisitor = role === 'Visitor'

  return {
    role,
    isAdmin,
    isManager,
    isMember,
    isVisitor,
    // Project management (create/edit/delete projects): Admin, Manager
    canManageProjects: isAdmin || isManager,
    // Daily content operations (items, kanban cards, file upload/delete): Admin, Manager, Member
    canWriteContent: isAdmin || isManager || isMember,
    // Personnel management: hidden from Visitor; view access for Admin/Manager/Member
    canViewPersonnel: isAdmin || isManager || isMember,
    // Personnel CRUD: Admin only
    canManagePersonnel: isAdmin,
    // Account & role management: Admin only
    canManageUsers: isAdmin
  }
}
