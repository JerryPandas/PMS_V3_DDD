using PMS.Application.DTOs.File;

namespace PMS.Application.Interfaces;

public interface IFileService
{
    Task<List<ProjectFileDto>> GetFilesAsync(int projectId, CancellationToken ct = default);
    Task<ProjectFileDto> UploadAsync(int projectId, Stream content, string fileName, string contentType, long size, int? uploadedById, CancellationToken ct = default);
    Task<(Stream stream, string contentType, string fileName)?> DownloadAsync(int fileId, CancellationToken ct = default);
    Task DeleteAsync(int fileId, CancellationToken ct = default);
}
