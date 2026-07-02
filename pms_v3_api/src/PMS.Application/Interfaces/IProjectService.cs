using PMS.Application.DTOs.Project;

namespace PMS.Application.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetProjectsAsync(CancellationToken ct = default);
    Task<ProjectDetailDto?> GetProjectDetailAsync(int id, CancellationToken ct = default);
    Task<ProjectDto> CreateProjectAsync(UpsertProjectRequest request, CancellationToken ct = default);
    Task<ProjectDto> UpdateProjectAsync(int id, UpsertProjectRequest request, CancellationToken ct = default);
    Task DeleteProjectAsync(int id, CancellationToken ct = default);

    Task<ProjectItemDto> AddItemAsync(int projectId, UpsertProjectItemRequest request, CancellationToken ct = default);
    Task<ProjectItemDto> UpdateItemAsync(int projectId, int itemId, UpsertProjectItemRequest request, CancellationToken ct = default);
    Task DeleteItemAsync(int projectId, int itemId, CancellationToken ct = default);
}
