using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Personnel;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// 人员档案管理（管理界面）。
/// 权限：Admin / Manager / Member 可查看（供分配任务负责人等场景使用），
/// Visitor 完全无法访问本控制器（含查看），增删改仅限 Admin。
/// </summary>
[ApiController]
[Route("api/personnel")]
[Authorize(Roles = "Admin,Manager,Member")]
public class PersonnelController : ControllerBase
{
    private readonly IPersonnelService _service;
    public PersonnelController(IPersonnelService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<PersonDto>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonDto>> GetById(int id)
    {
        var person = await _service.GetByIdAsync(id);
        return person is null ? NotFound() : Ok(person);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PersonDto>> Create(UpsertPersonRequest request) => Ok(await _service.CreateAsync(request));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PersonDto>> Update(int id, UpsertPersonRequest request) => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
