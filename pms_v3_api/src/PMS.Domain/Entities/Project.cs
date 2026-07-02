using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// 项目聚合根。项目编号形如 "26aa01"（年份+项目代号+序号）。
/// 一个项目下可以有多个子项（ProjectItem），子项各自跟踪进度与状态。
/// </summary>
public class Project : BaseEntity
{
    /// <summary>项目号，例如 26aa01，业务唯一</summary>
    public string ProjectNo { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int? ManagerId { get; set; }
    public Person? Manager { get; set; }

    public ICollection<ProjectItem> Items { get; set; } = new List<ProjectItem>();
    public ICollection<ProjectFile> Files { get; set; } = new List<ProjectFile>();
    public ICollection<KanbanBoard> Boards { get; set; } = new List<KanbanBoard>();
}
