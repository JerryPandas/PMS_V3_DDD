using PMS.Application.DTOs.Users;

namespace PMS.Application.Interfaces;

/// <summary>
/// 账户与权限管理（区别于 IPersonnelService 管理的“人员档案”，
/// 这里管理的是“登录账户 + 角色”），仅供 Admin 使用。
/// </summary>
public interface IUserService
{
    Task<List<UserDto>> GetAllAsync(CancellationToken ct = default);
    Task<UserDto> UpdateRoleAsync(int userId, string role, CancellationToken ct = default);
    Task<UserDto> UpdateActiveAsync(int userId, bool isActive, CancellationToken ct = default);
}
