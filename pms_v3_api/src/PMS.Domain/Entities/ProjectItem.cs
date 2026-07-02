using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// Project sub-item (specific work item/sub-task belonging to a Project),
/// e.g. items like "Structure Design", "Prototype Trial" under project 26aa01.
/// </summary>
public class ProjectItem : BaseEntity
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    /// <summary>Progress percentage 0-100</summary>
    public int Progress { get; set; } = 0;

    public DateTime? PlannedStart { get; set; }
    public DateTime? PlannedEnd { get; set; }
    public DateTime? ActualEnd { get; set; }

    public int? OwnerId { get; set; }
    public Person? Owner { get; set; }

    public int SortOrder { get; set; } = 0;
}
