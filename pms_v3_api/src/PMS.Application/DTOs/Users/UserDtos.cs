namespace PMS.Application.DTOs.Users;

/// <summary>Login account info (for Account & Permission Management page, Admin only)</summary>
public record UserDto(int Id, string UserName, string Role, bool IsActive, int? PersonId, string? PersonName, DateTime CreatedAt);

/// <summary>
/// Update role request. Role must be one of the UserRole enum values:
/// "Admin" | "Manager" | "Member" | "Visitor"
/// </summary>
public record UpdateUserRoleRequest(string Role);

public record UpdateUserActiveRequest(bool IsActive);
