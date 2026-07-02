using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Users;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// Account & role management: Admin only.
/// Used to set a login account (User) to Admin / Manager / Member / Visitor,
/// or disable an account (IsActive=false prevents login).
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
