namespace PMS.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>保存文件到磁盘，返回 (存储文件名, 相对路径)</summary>
    Task<(string storedFileName, string relativePath)> SaveAsync(Stream content, string originalFileName, int projectId, CancellationToken ct = default);
    string GetPhysicalPath(string relativePath);
}
