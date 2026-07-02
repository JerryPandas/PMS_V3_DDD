namespace PMS.Application.Common;

/// <summary>
/// JWT 配置项，对应 appsettings.json 的 "Jwt" 节点。
/// AccessTokenExpireMinutes = 30，RefreshTokenExpireDays = 1，均可在配置文件中调整。
/// </summary>
public class JwtSettings
{
    public string Issuer { get; set; } = "PMS";
    public string Audience { get; set; } = "PMS.Client";
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenExpireMinutes { get; set; } = 30;
    public int RefreshTokenExpireDays { get; set; } = 1;
}
