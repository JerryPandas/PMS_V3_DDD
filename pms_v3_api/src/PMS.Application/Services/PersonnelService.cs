using PMS.Application.Common;
using PMS.Application.DTOs.Personnel;
using PMS.Application.Interfaces;
using PMS.Domain.Entities;
using PMS.Domain.Interfaces;

namespace PMS.Application.Services;

public class PersonnelService : IPersonnelService
{
    private readonly IUnitOfWork _uow;
    public PersonnelService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<PersonDto>> GetAllAsync(CancellationToken ct = default)
    {
        var people = await _uow.People.ListAsync(p => !p.IsDeleted, ct);
        return people.Select(ToDto).ToList();
    }

    public async Task<PersonDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _uow.People.GetByIdAsync(id, ct);
        return p is null ? null : ToDto(p);
    }

    public async Task<PersonDto> CreateAsync(UpsertPersonRequest request, CancellationToken ct = default)
    {
        var person = new Person
        {
            Name = request.Name, Department = request.Department, Position = request.Position,
            Email = request.Email, Phone = request.Phone, Avatar = request.Avatar
        };
        await _uow.People.AddAsync(person, ct);
        await _uow.SaveChangesAsync(ct);
        return ToDto(person);
    }

    public async Task<PersonDto> UpdateAsync(int id, UpsertPersonRequest request, CancellationToken ct = default)
    {
        var person = await _uow.People.GetByIdAsync(id, ct) ?? throw new ApiException("Person not found", 404);
        person.Name = request.Name; person.Department = request.Department; person.Position = request.Position;
        person.Email = request.Email; person.Phone = request.Phone; person.Avatar = request.Avatar;
        person.UpdatedAt = DateTime.UtcNow;
        _uow.People.Update(person);
        await _uow.SaveChangesAsync(ct);
        return ToDto(person);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var person = await _uow.People.GetByIdAsync(id, ct) ?? throw new ApiException("Person not found", 404);
        person.IsDeleted = true;
        _uow.People.Update(person);
        await _uow.SaveChangesAsync(ct);
    }

    private static PersonDto ToDto(Person p) => new(p.Id, p.Name, p.Department, p.Position, p.Email, p.Phone, p.Avatar);
}
