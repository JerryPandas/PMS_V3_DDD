import { useAuth } from '../context/AuthContext'

/**
 * 基于当前登录用户角色的权限判断集中封装。
 * 角色定义（与后端 UserRole 枚举 / Controller 上的 [Authorize(Roles=...)] 一一对应）：
 *   Admin   - 系统管理者，全部权限
 *   Manager - 管理项目（项目/子项/看板/文件的增删改）
 *   Member  - 一般用户（看板/子项/文件的日常操作，不能创建/删除项目）
 *   Visitor - 只读，且完全不能进入人员管理界面
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
    // 项目结构（创建/编辑/删除项目本身）：Admin、Manager
    canManageProjects: isAdmin || isManager,
    // 日常内容操作（子项、看板卡片、文件上传/删除）：Admin、Manager、Member
    canWriteContent: isAdmin || isManager || isMember,
    // 人员管理界面：Visitor 完全不可见；查看权限给 Admin/Manager/Member
    canViewPersonnel: isAdmin || isManager || isMember,
    // 人员档案的增删改：仅 Admin
    canManagePersonnel: isAdmin,
    // 账户与角色管理：仅 Admin
    canManageUsers: isAdmin
  }
}
