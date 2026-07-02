using PMS.Application.Interfaces;

namespace PMS.Infrastructure.Security;

/// <summary>基于 BCrypt 的密码哈希实现</summary>
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}
