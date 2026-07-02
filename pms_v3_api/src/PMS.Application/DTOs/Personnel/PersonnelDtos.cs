namespace PMS.Application.DTOs.Personnel;

public record PersonDto(int Id, string Name, string? Department, string? Position, string? Email, string? Phone, string? Avatar);

public record UpsertPersonRequest(string Name, string? Department, string? Position, string? Email, string? Phone, string? Avatar);
