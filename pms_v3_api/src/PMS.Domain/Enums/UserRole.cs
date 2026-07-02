namespace PMS.Domain.Enums;

/// <summary>
/// System user roles (determine API access permissions, see [Authorize(Roles=...)] on each Controller):
///   Admin   - System administrator, full access including personnel management CRUD
///   Manager - Manages projects, can create/edit/delete projects, items, kanban, files
///   Member  - Regular user, can use kanban/items/files but cannot create/delete projects or access personnel management
///   Visitor - Read-only access to projects/kanban/dashboard/files, cannot modify anything, cannot access personnel management
/// </summary>
public enum UserRole
{
    Admin = 0,
    Manager = 1,
    Member = 2,
    Visitor = 3
}
