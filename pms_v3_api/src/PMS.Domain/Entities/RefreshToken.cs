using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 刷新令牌。AccessToken 失效时间较短（30 分钟），
/// RefreshToken 有效期为 1 天，过期后必须重新登录。
/// </summary>
public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public string? ReplacedByToken { get; set; }
    public string? CreatedByIp { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
