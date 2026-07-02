using PMS.Application.Common;
using PMS.Application.DTOs.Auth;
using PMS.Application.Interfaces;
using PMS.Domain.Entities;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

/// <summary>
/// 认证用例编排：注册 / 登录 / 刷新令牌 / 注销。
/// 具体的密码哈希与 JWT 签发通过接口交给 Infrastructure 层实现（依赖倒置）。
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtService _jwt;
    private readonly IPasswordHasher _hasher;
    private readonly JwtSettings _settings;

    public AuthService(IUnitOfWork uow, IJwtService jwt, IPasswordHasher hasher, JwtSettings settings)
    {
        _uow = uow;
        _jwt = jwt;
        _hasher = hasher;
        _settings = settings;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ip, CancellationToken ct = default)
    {
        var existing = await _uow.Users.ListAsync(u => u.UserName == request.UserName, ct);
        if (existing.Count > 0)
            throw new ApiException("用户名已存在", 409);

        var user = new User
        {
            UserName = request.UserName,
            PasswordHash = _hasher.Hash(request.Password),
            Role = Domain.Enums.UserRole.Member,
            IsActive = true
        };
        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return await IssueTokensAsync(user, ip, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ip, CancellationToken ct = default)
    {
        var users = await _uow.Users.ListAsync(u => u.UserName == request.UserName, ct);
        var user = users.FirstOrDefault();
        if (user is null || !user.IsActive || !_hasher.Verify(request.Password, user.PasswordHash))
            throw new ApiException("用户名或密码错误", 401);

        return await IssueTokensAsync(user, ip, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, string? ip, CancellationToken ct = default)
    {
        var tokens = await _uow.RefreshTokens.ListAsync(t => t.Token == refreshToken, ct);
        var existing = tokens.FirstOrDefault();
        if (existing is null || !existing.IsActive)
            throw new ApiException("刷新令牌无效或已过期，请重新登录", 401);

        var user = await _uow.Users.GetByIdAsync(existing.UserId, ct);
        if (user is null || !user.IsActive)
            throw new ApiException("用户不存在或已被禁用", 401);

        // 旋转刷新令牌：旧的立即作废，签发新的一对令牌
        existing.IsRevoked = true;

        var response = await IssueTokensAsync(user, ip, ct);
        existing.ReplacedByToken = response.RefreshToken;
        _uow.RefreshTokens.Update(existing);
        await _uow.SaveChangesAsync(ct);

        return response;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct = default)
    {
        var tokens = await _uow.RefreshTokens.ListAsync(t => t.Token == refreshToken, ct);
        var existing = tokens.FirstOrDefault();
        if (existing is null) return;
        existing.IsRevoked = true;
        _uow.RefreshTokens.Update(existing);
        await _uow.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, string? ip, CancellationToken ct)
    {
        var (accessToken, accessExp) = _jwt.GenerateAccessToken(user);
        var refreshValue = _jwt.GenerateRefreshTokenValue();
        var refreshExp = DateTime.UtcNow.AddDays(_settings.RefreshTokenExpireDays);

        var refreshEntity = new RefreshToken
        {
            Token = refreshValue,
            UserId = user.Id,
            ExpiresAt = refreshExp,
            CreatedByIp = ip
        };
        await _uow.RefreshTokens.AddAsync(refreshEntity, ct);
        await _uow.SaveChangesAsync(ct);

        return new AuthResponse(
            accessToken, accessExp,
            refreshValue, refreshExp,
            user.UserName, user.Role.ToString()
        );
    }
}
