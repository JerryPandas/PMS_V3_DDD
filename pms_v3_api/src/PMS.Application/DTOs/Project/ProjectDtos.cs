using PMS.Domain.Enums;

namespace PMS.Application.DTOs.Project;

public record ProjectItemDto(
    int Id, int ProjectId, string Name, string? Description,
    ProjectStatus Status, int Progress,
    DateTime? PlannedStart, DateTime? PlannedEnd, DateTime? ActualEnd,
    int? OwnerId, string? OwnerName, int SortOrder
);

public record UpsertProjectItemRequest(
    string Name, string? Description, ProjectStatus Status, int Progress,
    DateTime? PlannedStart, DateTime? PlannedEnd, DateTime? ActualEnd,
    int? OwnerId, int SortOrder
);

public record ProjectDto(
    int Id, string ProjectNo, string Name, string? Description,
    ProjectStatus Status, DateTime? StartDate, DateTime? EndDate,
    int? ManagerId, string? ManagerName,
    int ItemCount, int CompletedItemCount
);

public record ProjectDetailDto(
    int Id, string ProjectNo, string Name, string? Description,
    ProjectStatus Status, DateTime? StartDate, DateTime? EndDate,
    int? ManagerId, string? ManagerName,
    List<ProjectItemDto> Items
);

public record UpsertProjectRequest(
    string ProjectNo, string Name, string? Description, ProjectStatus Status,
    DateTime? StartDate, DateTime? EndDate, int? ManagerId
);
