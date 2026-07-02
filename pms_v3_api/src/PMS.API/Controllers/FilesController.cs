using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// 项目文件。权限：所有已登录角色（含 Visitor）均可查看/下载；
/// 上传/删除仅限 Admin、Manager、Member（Visitor 只读）。
/// </summary>
[ApiController]
[Route("api/files")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileService _service;
    public FilesController(IFileService service) => _service = service;

    [HttpGet("project/{projectId:int}")]
    public async Task<IActionResult> GetFiles(int projectId) => Ok(await _service.GetFilesAsync(projectId));

    [HttpPost("project/{projectId:int}/upload")]
    [Authorize(Roles = "Admin,Manager,Member")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Upload(int projectId, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest(new { message = "请选择要上传的文件" });

        var uploadedByIdClaim = User.FindFirst("PersonId")?.Value;
        int? uploadedById = int.TryParse(uploadedByIdClaim, out var pid) ? pid : null;

        await using var stream = file.OpenReadStream();
        var result = await _service.UploadAsync(projectId, stream, file.FileName, file.ContentType, file.Length, uploadedById);
        return Ok(result);
    }

    [HttpGet("{fileId:int}/download")]
    [AllowAnonymous] // 简化下载体验；如需鉴权可移除并改用带 token 的请求
    public async Task<IActionResult> Download(int fileId)
    {
        var result = await _service.DownloadAsync(fileId);
        if (result is null) return NotFound();
        var (stream, contentType, fileName) = result.Value;
        return File(stream, string.IsNullOrEmpty(contentType) ? "application/octet-stream" : contentType, fileName);
    }

    [HttpDelete("{fileId:int}")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<IActionResult> Delete(int fileId)
    {
        await _service.DeleteAsync(fileId);
        return NoContent();
    }
}
