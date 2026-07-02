using PMS.Application.DTOs.Dashboard;
using PMS.Application.Interfaces;
using PMS.Domain.Enums;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

/// <summary>
/// Dashboard statistics service, provides chart data sources for frontend MUI Charts.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _uow;
    public DashboardService(IUnitOfWork uow) => _uow = uow;

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var projects = _uow.Projects.Query().Where(p => !p.IsDeleted).ToList();
        var people = _uow.People.Query().Where(p => !p.IsDeleted).ToList();
        var cards = _uow.KanbanCards.Query().Where(c => !c.IsDeleted).ToList();
        var columns = _uow.KanbanColumns.Query().ToList();
        var items = _uow.ProjectItems.Query().Where(i => !i.IsDeleted).ToList();

        var statusDist = projects.GroupBy(p => p.Status)
            .Select(g => new StatusCountDto(g.Key.ToString(), g.Count()))
            .ToList();

        var doneColumnIds = columns.Where(c => c.Name == "Done").Select(c => c.Id).ToHashSet();

        var assignees = _uow.KanbanCardAssignees.Query().ToList();
        var workloads = people.Select(p =>
        {
            var myCardIds = assignees.Where(a => a.PersonId == p.Id).Select(a => a.CardId).ToHashSet();
            var myCards = cards.Where(c => myCardIds.Contains(c.Id)).ToList();
            return new PersonWorkloadDto(p.Name, myCards.Count, myCards.Count(c => doneColumnIds.Contains(c.ColumnId)));
        }).Where(w => w.TotalCards > 0).ToList();

        var monthlyTrends = Enumerable.Range(0, 6).Select(offset =>
        {
            var month = DateTime.UtcNow.AddMonths(-5 + offset);
            var monthKey = month.ToString("yyyy-MM");
            var completed = items.Count(i => i.ActualEnd.HasValue && i.ActualEnd.Value.ToString("yyyy-MM") == monthKey);
            var created = items.Count(i => i.CreatedAt.ToString("yyyy-MM") == monthKey);
            return new MonthlyTrendDto(monthKey, completed, created);
        }).ToList();

        return new DashboardSummaryDto(
            projects.Count,
            projects.Count(p => p.Status == ProjectStatus.InProgress),
            people.Count,
            cards.Count,
            statusDist,
            workloads,
            monthlyTrends
        );
    }
}
