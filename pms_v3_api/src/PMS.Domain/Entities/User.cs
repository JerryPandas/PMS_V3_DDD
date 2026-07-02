using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// 系统登录账户（聚合根）。与 Person（人员档案）解耦：
/// 一个 User 可以关联一个 Person，用于展示姓名/部门等人事信息。
/// </summary>
public class User : BaseEntity
{
    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Member;
    public bool IsActive { get; set; } = true;

    public int? PersonId { get; set; }
    public Person? Person { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
