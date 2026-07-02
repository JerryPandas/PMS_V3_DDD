namespace PMS.Application.DTOs.File;

public record ProjectFileDto(int Id, int ProjectId, string FileName, long SizeBytes, string ContentType, DateTime CreatedAt, string? UploadedByName, string DownloadUrl);
