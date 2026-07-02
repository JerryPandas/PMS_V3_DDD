using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// Project aggregate root. Project number format: "26aa01" (year + project code + sequence).
/// A project can have multiple sub-items (ProjectItem), each tracking its own progress and status.
/// </summary>
public class Project : BaseEntity
{
    /// <summary>Project number, e.g. 26aa01, unique business identifier</summary>
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
