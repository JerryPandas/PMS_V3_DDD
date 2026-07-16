using PMS.Application.Common;
using PMS.Application.DTOs.Kanban;
using PMS.Application.Interfaces;
using PMS.Domain.Entities;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

/// <summary>
/// Kanban use case orchestration: CRUD and drag-and-drop for boards/columns/cards.
/// </summary>
public class KanbanService : IKanbanService
{
    private readonly IUnitOfWork _uow;
    public KanbanService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<KanbanBoardDto>> GetBoardsAsync(int? projectId, CancellationToken ct = default)
    {
        var query = _uow.KanbanBoards.Query().Where(b => !b.IsDeleted);
        if (projectId.HasValue) query = query.Where(b => b.ProjectId == projectId);
        var boards = query.ToList();
        return boards.Select(MapBoard).ToList();
    }

    public async Task<KanbanBoardDto?> GetBoardAsync(int boardId, CancellationToken ct = default)
    {
        var board = _uow.KanbanBoards.Query().FirstOrDefault(b => b.Id == boardId && !b.IsDeleted);
        return board is null ? null : MapBoard(board);
    }

    public async Task<KanbanBoardDto> CreateBoardAsync(CreateBoardRequest request, CancellationToken ct = default)
    {
        var board = new KanbanBoard { ProjectId = request.ProjectId, Name = request.Name };
        await _uow.KanbanBoards.AddAsync(board, ct);
        await _uow.SaveChangesAsync(ct);

        // Default standard four columns, following common kanban convention
        var defaultColumns = new[] { ("To Do", "#94a3b8"), ("In Progress", "#3b82f6"), ("In Review", "#f59e0b"), ("Done", "#22c55e") };
        int order = 0;
        foreach (var (name, color) in defaultColumns)
        {
            await _uow.KanbanColumns.AddAsync(new KanbanColumn { BoardId = board.Id, Name = name, ColorHex = color, SortOrder = order++ }, ct);
        }
        await _uow.SaveChangesAsync(ct);

        return MapBoard(board);
    }

    public async Task<KanbanColumnDto> CreateColumnAsync(int boardId, CreateColumnRequest request, CancellationToken ct = default)
    {
        _ = await _uow.KanbanBoards.GetByIdAsync(boardId, ct) ?? throw new ApiException("Board not found", 404);
        var column = new KanbanColumn { BoardId = boardId, Name = request.Name, SortOrder = request.SortOrder, ColorHex = request.ColorHex };
        await _uow.KanbanColumns.AddAsync(column, ct);
        await _uow.SaveChangesAsync(ct);
        return new KanbanColumnDto(column.Id, column.BoardId, column.Name, column.SortOrder, column.ColorHex, new());
    }

    public async Task<KanbanCardDto> CreateCardAsync(CreateCardRequest request, CancellationToken ct = default)
    {
        _ = await _uow.KanbanColumns.GetByIdAsync(request.ColumnId, ct) ?? throw new ApiException("Column not found", 404);

        var maxOrder = _uow.KanbanCards.Query().Where(c => c.ColumnId == request.ColumnId && !c.IsDeleted)
            .Select(c => (int?)c.SortOrder).Max() ?? -1;

        var card = new KanbanCard
        {
            ColumnId = request.ColumnId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ProjectItemId = request.ProjectItemId,
            SortOrder = maxOrder + 1
        };
        await _uow.KanbanCards.AddAsync(card, ct);
        await _uow.SaveChangesAsync(ct);

        if (request.AssigneeIds is { Count: > 0 })
        {
            foreach (var pid in request.AssigneeIds)
                await _uow.KanbanCardAssignees.AddAsync(new KanbanCardAssignee { CardId = card.Id, PersonId = pid }, ct);
            await _uow.SaveChangesAsync(ct);
        }

        return MapCard(card);
    }

    public async Task<KanbanCardDto> UpdateCardAsync(int cardId, UpdateCardRequest request, CancellationToken ct = default)
    {
        var card = await _uow.KanbanCards.GetByIdAsync(cardId, ct) ?? throw new ApiException("Card not found", 404);
        card.Title = request.Title;
        card.Description = request.Description;
        card.Priority = request.Priority;
        card.DueDate = request.DueDate;
        card.UpdatedAt = DateTime.UtcNow;
        _uow.KanbanCards.Update(card);

        if (request.AssigneeIds is not null)
        {
            var existing = _uow.KanbanCardAssignees.Query().Where(a => a.CardId == cardId).ToList();
            foreach (var a in existing) _uow.KanbanCardAssignees.Remove(a);
            foreach (var pid in request.AssigneeIds)
                await _uow.KanbanCardAssignees.AddAsync(new KanbanCardAssignee { CardId = cardId, PersonId = pid }, ct);
        }

        await _uow.SaveChangesAsync(ct);
        return MapCard(card);
    }

    public async Task MoveCardAsync(MoveCardRequest request, CancellationToken ct = default)
    {
        var card = await _uow.KanbanCards.GetByIdAsync(request.CardId, ct) ?? throw new ApiException("Card not found", 404);
        card.ColumnId = request.TargetColumnId;
        card.SortOrder = request.TargetSortOrder;
        card.UpdatedAt = DateTime.UtcNow;
        _uow.KanbanCards.Update(card);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task ReorderCardsAsync(ReorderCardsRequest request, CancellationToken ct = default)
    {
        var allIds = request.Columns.SelectMany(c => c.CardIds).Distinct().ToList();
        if (allIds.Count == 0) return;

        var cards = _uow.KanbanCards.Query().Where(c => allIds.Contains(c.Id) && !c.IsDeleted).ToList();
        var byId = cards.ToDictionary(c => c.Id);

        foreach (var col in request.Columns)
        {
            for (int i = 0; i < col.CardIds.Count; i++)
            {
                if (byId.TryGetValue(col.CardIds[i], out var card))
                {
                    card.ColumnId = col.ColumnId;
                    card.SortOrder = i;
                    card.UpdatedAt = DateTime.UtcNow;
                    _uow.KanbanCards.Update(card);
                }
            }
        }

        await _uow.SaveChangesAsync(ct);
    }

    public async Task DeleteCardAsync(int cardId, CancellationToken ct = default)
    {
        var card = await _uow.KanbanCards.GetByIdAsync(cardId, ct) ?? throw new ApiException("Card not found", 404);
        card.IsDeleted = true;
        _uow.KanbanCards.Update(card);
        await _uow.SaveChangesAsync(ct);
    }


    private KanbanBoardDto MapBoard(KanbanBoard board)
    {
        var columns = _uow.KanbanColumns.Query().Where(c => c.BoardId == board.Id && !c.IsDeleted).OrderBy(c => c.SortOrder).ToList();
        var columnDtos = columns.Select(col =>
        {
            var cards = _uow.KanbanCards.Query().Where(c => c.ColumnId == col.Id && !c.IsDeleted).OrderBy(c => c.SortOrder).ToList();
            return new KanbanColumnDto(col.Id, col.BoardId, col.Name, col.SortOrder, col.ColorHex, cards.Select(MapCard).ToList());
        }).ToList();

        return new KanbanBoardDto(board.Id, board.ProjectId, board.Name, columnDtos);
    }

    private KanbanCardDto MapCard(KanbanCard card)
    {
        var assignees = _uow.KanbanCardAssignees.Query().Where(a => a.CardId == card.Id).ToList();
        var people = _uow.People.Query().Where(p => assignees.Select(a => a.PersonId).Contains(p.Id)).ToList();
        return new KanbanCardDto(
            card.Id, card.ColumnId, card.ProjectItemId, card.Title, card.Description,
            card.Priority, card.DueDate, card.SortOrder,
            people.Select(p => p.Id).ToList(), people.Select(p => p.Name).ToList()
        );
    }
}
