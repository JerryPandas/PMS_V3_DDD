using PMS.Domain.Entities;

namespace PMS.Application.Interfaces;

/// <summary>
/// JWT 签发/校验服务契约，具体实现在 Infrastructure 层（依赖倒置）。
/// </summary>
public interface IJwtService
{
    /// <summary>生成 AccessToken，并返回其过期时间（UTC）</summary>
    (string token, DateTime expiresAt) GenerateAccessToken(User user);

    /// <summary>生成随机 RefreshToken 字符串（不含业务信息，仅作为不透明凭证）</summary>
    string GenerateRefreshTokenValue();
}
