using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Users;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// 账户与角色管理：仅 Admin 可访问。
/// 用于把某个登录账户（User）设置为 Admin / Manager / Member / Visitor 之一，
/// 或者禁用某个账户（IsActive=false 后该账户将无法登录）。
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;
    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPut("{id:int}/role")]
    public async Task<ActionResult<UserDto>> UpdateRole(int id, UpdateUserRoleRequest request)
        => Ok(await _service.UpdateRoleAsync(id, request.Role));

    [HttpPut("{id:int}/active")]
    public async Task<ActionResult<UserDto>> UpdateActive(int id, UpdateUserActiveRequest request)
        => Ok(await _service.UpdateActiveAsync(id, request.IsActive));
}
