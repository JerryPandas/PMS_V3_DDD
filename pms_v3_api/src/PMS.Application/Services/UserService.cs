using PMS.Application.Common;
using PMS.Application.DTOs.Users;
using PMS.Application.Interfaces;
using PMS.Domain.Enums;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _uow;
    public UserService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<UserDto>> GetAllAsync(CancellationToken ct = default)
    {
        var users = _uow.Users.Query().Where(u => !u.IsDeleted).OrderBy(u => u.UserName).ToList();
        return users.Select(ToDto).ToList();
    }

    public async Task<UserDto> UpdateRoleAsync(int userId, string role, CancellationToken ct = default)
    {
        if (!Enum.TryParse<UserRole>(role, ignoreCase: true, out var parsedRole))
            throw new ApiException("Invalid role, must be one of: Admin / Manager / Member / Visitor", 400);

        var user = await _uow.Users.GetByIdAsync(userId, ct) ?? throw new ApiException("User not found", 404);
        user.Role = parsedRole;
        user.UpdatedAt = DateTime.UtcNow;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        return ToDto(user);
    }

    public async Task<UserDto> UpdateActiveAsync(int userId, bool isActive, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct) ?? throw new ApiException("User not found", 404);
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        return ToDto(user);
    }

    private static UserDto ToDto(Domain.Entities.User u) => new(
        u.Id, u.UserName, u.Role.ToString(), u.IsActive, u.PersonId, u.Person?.Name, u.CreatedAt
    );
}
