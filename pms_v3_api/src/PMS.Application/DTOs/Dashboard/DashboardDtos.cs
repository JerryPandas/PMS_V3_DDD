namespace PMS.Application.DTOs.Dashboard;

/// <summary>项目状态分布，用于饼图/柱图</summary>
public record StatusCountDto(string Status, int Count);

/// <summary>人员任务负载，用于柱状图</summary>
public record PersonWorkloadDto(string PersonName, int TotalCards, int DoneCards);

/// <summary>项目进度趋势（按月完成的子项数量），用于折线图</summary>
public record MonthlyTrendDto(string Month, int CompletedItems, int NewItems);

public record DashboardSummaryDto(
    int TotalProjects,
    int ActiveProjects,
    int TotalPeople,
    int TotalCards,
    List<StatusCountDto> ProjectStatusDistribution,
    List<PersonWorkloadDto> Workloads,
    List<MonthlyTrendDto> MonthlyTrends
);
