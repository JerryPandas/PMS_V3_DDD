namespace PMS.Application.Common;

/// <summary>
/// Business exception carrying HTTP status code, converted to ProblemDetails response by global exception middleware.
/// </summary>
public class ApiException : Exception
{
    public int StatusCode { get; }
    public ApiException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}
