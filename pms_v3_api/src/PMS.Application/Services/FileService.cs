using PMS.Application.Common;
using PMS.Application.DTOs.File;
using PMS.Application.Interfaces;
using PMS.Domain.Entities;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

public class FileService : IFileService
{
    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _storage;

    public FileService(IUnitOfWork uow, IFileStorageService storage)
    {
        _uow = uow;
        _storage = storage;
    }

    public async Task<List<ProjectFileDto>> GetFilesAsync(int projectId, CancellationToken ct = default)
    {
        var files = _uow.ProjectFiles.Query().Where(f => f.ProjectId == projectId && !f.IsDeleted)
            .OrderByDescending(f => f.CreatedAt).ToList();
        return files.Select(ToDto).ToList();
    }

    public async Task<ProjectFileDto> UploadAsync(int projectId, Stream content, string fileName, string contentType, long size, int? uploadedById, CancellationToken ct = default)
    {
        _ = await _uow.Projects.GetByIdAsync(projectId, ct) ?? throw new ApiException("项目不存在", 404);

        const long maxSize = 50 * 1024 * 1024; // 50MB
        if (size > maxSize) throw new ApiException("文件大小超过限制 (50MB)", 400);

        var (stored, relPath) = await _storage.SaveAsync(content, fileName, projectId, ct);

        var file = new ProjectFile
        {
            ProjectId = projectId,
            FileName = fileName,
            StoredFileName = stored,
            RelativePath = relPath,
            SizeBytes = size,
            ContentType = contentType,
            UploadedById = uploadedById
        };
        await _uow.ProjectFiles.AddAsync(file, ct);
        await _uow.SaveChangesAsync(ct);

        return ToDto(file);
    }

    public async Task<(Stream stream, string contentType, string fileName)?> DownloadAsync(int fileId, CancellationToken ct = default)
    {
        var file = await _uow.ProjectFiles.GetByIdAsync(fileId, ct);
        if (file is null || file.IsDeleted) return null;
        var path = _storage.GetPhysicalPath(file.RelativePath);
        if (!System.IO.File.Exists(path)) return null;
        Stream stream = System.IO.File.OpenRead(path);
        return (stream, file.ContentType, file.FileName);
    }

    public async Task DeleteAsync(int fileId, CancellationToken ct = default)
    {
        var file = await _uow.ProjectFiles.GetByIdAsync(fileId, ct) ?? throw new ApiException("文件不存在", 404);
        file.IsDeleted = true;
        _uow.ProjectFiles.Update(file);
        await _uow.SaveChangesAsync(ct);
    }

    private static ProjectFileDto ToDto(ProjectFile f) => new(
        f.Id, f.ProjectId, f.FileName, f.SizeBytes, f.ContentType, f.CreatedAt,
        f.UploadedBy?.Name, $"/api/files/{f.Id}/download"
    );
}
