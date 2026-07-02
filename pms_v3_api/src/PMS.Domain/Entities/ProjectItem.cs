using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// 项目子项（属于某个 Project 的具体工作项/子任务），
/// 例如 26aa01 项目下的 "结构设计"、"样机试制" 等子项。
/// </summary>
public class ProjectItem : BaseEntity
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    /// <summary>进度百分比 0-100</summary>
    public int Progress { get; set; } = 0;

    public DateTime? PlannedStart { get; set; }
    public DateTime? PlannedEnd { get; set; }
    public DateTime? ActualEnd { get; set; }

    public int? OwnerId { get; set; }
    public Person? Owner { get; set; }

    public int SortOrder { get; set; } = 0;
}
