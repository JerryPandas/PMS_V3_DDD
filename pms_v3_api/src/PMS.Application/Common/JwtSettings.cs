namespace PMS.Application.Common;

/// <summary>
/// JWT configuration, corresponding to the "Jwt" section in appsettings.json.
/// AccessTokenExpireMinutes = 30, RefreshTokenExpireDays = 1, both configurable in settings file.
/// </summary>
public class JwtSettings
{
    public string Issuer { get; set; } = "PMS";
    public string Audience { get; set; } = "PMS.Client";
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenExpireMinutes { get; set; } = 30;
    public int RefreshTokenExpireDays { get; set; } = 1;
}
