using PMS.Application.DTOs.Kanban;

namespace PMS.Application.Interfaces;

public interface IKanbanService
{
    Task<List<KanbanBoardDto>> GetBoardsAsync(int? projectId, CancellationToken ct = default);
    Task<KanbanBoardDto?> GetBoardAsync(int boardId, CancellationToken ct = default);
    Task<KanbanBoardDto> CreateBoardAsync(CreateBoardRequest request, CancellationToken ct = default);

    Task<KanbanColumnDto> CreateColumnAsync(int boardId, CreateColumnRequest request, CancellationToken ct = default);

    Task<KanbanCardDto> CreateCardAsync(CreateCardRequest request, CancellationToken ct = default);
    Task<KanbanCardDto> UpdateCardAsync(int cardId, UpdateCardRequest request, CancellationToken ct = default);
    Task MoveCardAsync(MoveCardRequest request, CancellationToken ct = default);
    Task DeleteCardAsync(int cardId, CancellationToken ct = default);
}
