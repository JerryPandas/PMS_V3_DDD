using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Project;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// 项目管理。
/// 权限：所有已登录角色（含 Visitor）均可查看；
/// 创建/编辑/删除项目仅限 Admin、Manager（Manager 负责管理项目）；
/// 子项的增删改开放给 Admin、Manager、Member（Member 日常维护自己负责的子项进度）。
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

    // ---- 项目子项 (例如 26aa01 项目下的具体小项) ----

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
