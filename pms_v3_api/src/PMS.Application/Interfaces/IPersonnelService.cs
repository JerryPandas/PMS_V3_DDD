using PMS.Application.DTOs.Personnel;

namespace PMS.Application.Interfaces;

public interface IPersonnelService
{
    Task<List<PersonDto>> GetAllAsync(CancellationToken ct = default);
    Task<PersonDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PersonDto> CreateAsync(UpsertPersonRequest request, CancellationToken ct = default);
    Task<PersonDto> UpdateAsync(int id, UpsertPersonRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
