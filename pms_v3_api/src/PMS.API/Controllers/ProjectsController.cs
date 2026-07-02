using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Project;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// Project management.
/// Permissions: All authenticated roles (including Visitor) can view;
/// Create/Edit/Delete projects restricted to Admin, Manager (Manager manages projects);
/// Item CRUD open to Admin, Manager, Member (Member maintains their assigned items' progress).
/// </summary>
[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;
    public ProjectsController(IProjectService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetAll() => Ok(await _service.GetProjectsAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailDto>> GetDetail(int id)
    {
        var detail = await _service.GetProjectDetailAsync(id);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ProjectDto>> Create(UpsertProjectRequest request)
        => Ok(await _service.CreateProjectAsync(request));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ProjectDto>> Update(int id, UpsertProjectRequest request)
        => Ok(await _service.UpdateProjectAsync(id, request));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteProjectAsync(id);
        return NoContent();
    }

    // ---- Project items (specific sub-items under a project, e.g. 26aa01) ----

    [HttpPost("{projectId:int}/items")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<ProjectItemDto>> AddItem(int projectId, UpsertProjectItemRequest request)
        => Ok(await _service.AddItemAsync(projectId, request));

    [HttpPut("{projectId:int}/items/{itemId:int}")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<ProjectItemDto>> UpdateItem(int projectId, int itemId, UpsertProjectItemRequest request)
        => Ok(await _service.UpdateItemAsync(projectId, itemId, request));

    [HttpDelete("{projectId:int}/items/{itemId:int}")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<IActionResult> DeleteItem(int projectId, int itemId)
    {
        await _service.DeleteItemAsync(projectId, itemId);
        return NoContent();
    }
}
