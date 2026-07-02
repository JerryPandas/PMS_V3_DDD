namespace PMS.Application.DTOs.Users;

/// <summary>登录账户信息（用于「账户与权限管理」界面，仅 Admin 可见）</summary>
public record UserDto(int Id, string UserName, string Role, bool IsActive, int? PersonId, string? PersonName, DateTime CreatedAt);

/// <summary>
/// 修改角色请求。Role 取值必须是 UserRole 枚举名之一：
/// "Admin" | "Manager" | "Member" | "Visitor"
/// </summary>
public record UpdateUserRoleRequest(string Role);

public record UpdateUserActiveRequest(bool IsActive);
