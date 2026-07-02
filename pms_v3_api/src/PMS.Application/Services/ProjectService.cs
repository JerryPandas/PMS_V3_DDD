using PMS.Application.Common;
using PMS.Application.DTOs.Project;
using PMS.Application.Interfaces;
using PMS.Domain.Entities;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

/// <summary>
/// Project / project item use case orchestration.
/// </summary>
public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _uow;

    public ProjectService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<ProjectDto>> GetProjectsAsync(CancellationToken ct = default)
    {
        var projects = _uow.Projects.Query()
            .Where(p => !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id, p.ProjectNo, p.Name, p.Description, p.Status, p.StartDate, p.EndDate,
                p.ManagerId, ManagerName = p.Manager != null ? p.Manager.Name : null,
                Items = p.Items.Where(i => !i.IsDeleted).ToList()
            })
            .ToList();

        return projects.Select(p => new ProjectDto(
            p.Id, p.ProjectNo, p.Name, p.Description, p.Status, p.StartDate, p.EndDate,
            p.ManagerId, p.ManagerName,
            p.Items.Count,
            p.Items.Count(i => i.Status == Domain.Enums.ProjectStatus.Completed)
        )).ToList();
    }

    public async Task<ProjectDetailDto?> GetProjectDetailAsync(int id, CancellationToken ct = default)
    {
        var p = _uow.Projects.Query()
            .Where(x => x.Id == id && !x.IsDeleted)
            .Select(x => new
            {
                x.Id, x.ProjectNo, x.Name, x.Description, x.Status, x.StartDate, x.EndDate,
                x.ManagerId, ManagerName = x.Manager != null ? x.Manager.Name : null,
                Items = x.Items.Where(i => !i.IsDeleted).OrderBy(i => i.SortOrder).ToList()
            })
            .FirstOrDefault();

        if (p is null) return null;

        var itemDtos = p.Items.Select(i => new ProjectItemDto(
            i.Id, i.ProjectId, i.Name, i.Description, i.Status, i.Progress,
            i.PlannedStart, i.PlannedEnd, i.ActualEnd,
            i.OwnerId, i.Owner != null ? i.Owner.Name : null, i.SortOrder
        )).ToList();

        return new ProjectDetailDto(
            p.Id, p.ProjectNo, p.Name, p.Description, p.Status, p.StartDate, p.EndDate,
            p.ManagerId, p.ManagerName, itemDtos
        );
    }

    public async Task<ProjectDto> CreateProjectAsync(UpsertProjectRequest request, CancellationToken ct = default)
    {
        var dup = await _uow.Projects.ListAsync(p => p.ProjectNo == request.ProjectNo && !p.IsDeleted, ct);
        if (dup.Count > 0) throw new ApiException($"Project number {request.ProjectNo} already exists", 409);

        var project = new Project
        {
            ProjectNo = request.ProjectNo,
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ManagerId = request.ManagerId
        };
        await _uow.Projects.AddAsync(project, ct);
        await _uow.SaveChangesAsync(ct);

        return new ProjectDto(project.Id, project.ProjectNo, project.Name, project.Description,
            project.Status, project.StartDate, project.EndDate, project.ManagerId, null, 0, 0);
    }

    public async Task<ProjectDto> UpdateProjectAsync(int id, UpsertProjectRequest request, CancellationToken ct = default)
    {
        var project = await _uow.Projects.GetByIdAsync(id, ct)
            ?? throw new ApiException("Project not found", 404);

        project.ProjectNo = request.ProjectNo;
        project.Name = request.Name;
        project.Description = request.Description;
        project.Status = request.Status;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
        project.ManagerId = request.ManagerId;
        project.UpdatedAt = DateTime.UtcNow;

        _uow.Projects.Update(project);
        await _uow.SaveChangesAsync(ct);

        return new ProjectDto(project.Id, project.ProjectNo, project.Name, project.Description,
            project.Status, project.StartDate, project.EndDate, project.ManagerId, null, 0, 0);
    }

    public async Task DeleteProjectAsync(int id, CancellationToken ct = default)
    {
        var project = await _uow.Projects.GetByIdAsync(id, ct)
            ?? throw new ApiException("Project not found", 404);
        project.IsDeleted = true;
        _uow.Projects.Update(project);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<ProjectItemDto> AddItemAsync(int projectId, UpsertProjectItemRequest request, CancellationToken ct = default)
    {
        _ = await _uow.Projects.GetByIdAsync(projectId, ct) ?? throw new ApiException("Project not found", 404);

        var item = new ProjectItem
        {
            ProjectId = projectId,
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            Progress = request.Progress,
            PlannedStart = request.PlannedStart,
            PlannedEnd = request.PlannedEnd,
            ActualEnd = request.ActualEnd,
            OwnerId = request.OwnerId,
            SortOrder = request.SortOrder
        };
        await _uow.ProjectItems.AddAsync(item, ct);
        await _uow.SaveChangesAsync(ct);

        return new ProjectItemDto(item.Id, item.ProjectId, item.Name, item.Description, item.Status,
            item.Progress, item.PlannedStart, item.PlannedEnd, item.ActualEnd, item.OwnerId, null, item.SortOrder);
    }

    public async Task<ProjectItemDto> UpdateItemAsync(int projectId, int itemId, UpsertProjectItemRequest request, CancellationToken ct = default)
    {
        var item = await _uow.ProjectItems.GetByIdAsync(itemId, ct);
        if (item is null || item.ProjectId != projectId) throw new ApiException("Item not found", 404);

        item.Name = request.Name;
        item.Description = request.Description;
        item.Status = request.Status;
        item.Progress = request.Progress;
        item.PlannedStart = request.PlannedStart;
        item.PlannedEnd = request.PlannedEnd;
        item.ActualEnd = request.ActualEnd;
        item.OwnerId = request.OwnerId;
        item.SortOrder = request.SortOrder;
        item.UpdatedAt = DateTime.UtcNow;

        _uow.ProjectItems.Update(item);
        await _uow.SaveChangesAsync(ct);

        return new ProjectItemDto(item.Id, item.ProjectId, item.Name, item.Description, item.Status,
            item.Progress, item.PlannedStart, item.PlannedEnd, item.ActualEnd, item.OwnerId, null, item.SortOrder);
    }

    public async Task DeleteItemAsync(int projectId, int itemId, CancellationToken ct = default)
    {
        var item = await _uow.ProjectItems.GetByIdAsync(itemId, ct);
        if (item is null || item.ProjectId != projectId) throw new ApiException("Item not found", 404);
        item.IsDeleted = true;
        _uow.ProjectItems.Update(item);
        await _uow.SaveChangesAsync(ct);
    }
}
