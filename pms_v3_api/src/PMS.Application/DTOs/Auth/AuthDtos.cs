namespace PMS.Application.DTOs.Auth;

public record RegisterRequest(string UserName, string Password, string? DisplayName);

public record LoginRequest(string UserName, string Password);

public record RefreshRequest(string RefreshToken);

/// <summary>
/// 登录/刷新成功后返回给前端的令牌信息。
/// AccessTokenExpiresAt / RefreshTokenExpiresAt 便于前端提前调度刷新。
/// </summary>
public record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt,
    string UserName,
    string Role
);
