using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Application.DTOs.Kanban;
using PMS.Application.Interfaces;

namespace PMS.API.Controllers;

/// <summary>
/// 看板。权限：所有已登录角色（含 Visitor）均可查看；
/// 创建/编辑/移动/删除仅限 Admin、Manager、Member（Visitor 只读）。
/// </summary>
[ApiController]
[Route("api/kanban")]
[Authorize]
public class KanbanController : ControllerBase
{
    private readonly IKanbanService _service;
    public KanbanController(IKanbanService service) => _service = service;

    [HttpGet("boards")]
    public async Task<ActionResult<List<KanbanBoardDto>>> GetBoards([FromQuery] int? projectId)
        => Ok(await _service.GetBoardsAsync(projectId));

    [HttpGet("boards/{boardId:int}")]
    public async Task<ActionResult<KanbanBoardDto>> GetBoard(int boardId)
    {
        var board = await _service.GetBoardAsync(boardId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpPost("boards")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<KanbanBoardDto>> CreateBoard(CreateBoardRequest request)
        => Ok(await _service.CreateBoardAsync(request));

    [HttpPost("boards/{boardId:int}/columns")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<KanbanColumnDto>> CreateColumn(int boardId, CreateColumnRequest request)
        => Ok(await _service.CreateColumnAsync(boardId, request));

    [HttpPost("cards")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<KanbanCardDto>> CreateCard(CreateCardRequest request)
        => Ok(await _service.CreateCardAsync(request));

    [HttpPut("cards/{cardId:int}")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<ActionResult<KanbanCardDto>> UpdateCard(int cardId, UpdateCardRequest request)
        => Ok(await _service.UpdateCardAsync(cardId, request));

    /// <summary>拖拽卡片到新的列/顺序位置</summary>
    [HttpPost("cards/move")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<IActionResult> MoveCard(MoveCardRequest request)
    {
        await _service.MoveCardAsync(request);
        return NoContent();
    }

    /// <summary>整列/跨列卡片重排，按给定顺序持久化列与排序</summary>
    [HttpPost("cards/reorder")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<IActionResult> ReorderCards(ReorderCardsRequest request)
    {
        await _service.ReorderCardsAsync(request);
        return NoContent();
    }

    [HttpDelete("cards/{cardId:int}")]
    [Authorize(Roles = "Admin,Manager,Member")]
    public async Task<IActionResult> DeleteCard(int cardId)
    {
        await _service.DeleteCardAsync(cardId);
        return NoContent();
    }
}
