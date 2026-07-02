namespace PMS.Domain.Enums;

/// <summary>
/// 系统用户角色（决定接口访问权限，见各 Controller 上的 [Authorize(Roles=...)]）：
///   Admin   - 系统管理者，拥有全部权限，包括人员管理界面的增删改
///   Manager - 管理项目，可创建/编辑/删除项目及子项、看板、文件
///   Member  - 一般用户，可正常使用看板/子项/文件等日常功能，但不能创建/删除项目、不能进入人员管理界面的增删改
///   Visitor - 仅可查看项目/看板/仪表盘/文件等内容，无法做任何修改，且无法访问人员管理界面
/// </summary>
public enum UserRole
{
    Admin = 0,
    Manager = 1,
    Member = 2,
    Visitor = 3
}
