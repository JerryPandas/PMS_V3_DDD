using PMS.Application.Interfaces;

namespace PMS.Infrastructure.Security;

/// <summary>
/// Local disk file storage implementation. Can be replaced with Azure Blob / S3 in production,
/// just implement IFileStorageService interface (demonstrates dependency inversion / pluggable design).
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;

    public LocalFileStorageService(string rootPath)
    {
        _rootPath = rootPath;
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<(string storedFileName, string relativePath)> SaveAsync(Stream content, string originalFileName, int projectId, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(originalFileName);
        var storedFileName = $"{Guid.NewGuid():N}{ext}";
        var subDir = Path.Combine(_rootPath, projectId.ToString());
        Directory.CreateDirectory(subDir);

        var fullPath = Path.Combine(subDir, storedFileName);
        await using (var fs = new FileStream(fullPath, FileMode.Create))
        {
            await content.CopyToAsync(fs, ct);
        }

        var relativePath = Path.Combine(projectId.ToString(), storedFileName);
        return (storedFileName, relativePath);
    }

    public string GetPhysicalPath(string relativePath) => Path.Combine(_rootPath, relativePath);
}
