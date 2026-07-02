using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 项目文件上传记录，文件本身存储在磁盘（或对象存储），
/// 数据库中保存元数据与访问路径。
/// </summary>
public class ProjectFile : BaseEntity
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;

    public int? UploadedById { get; set; }
    public Person? UploadedBy { get; set; }
}
