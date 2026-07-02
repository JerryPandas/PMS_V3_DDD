namespace PMS.Application.Common;

/// <summary>
/// 业务异常，携带 HTTP 状态码，由全局异常中间件统一转换为 ProblemDetails 响应。
/// </summary>
public class ApiException : Exception
{
    public int StatusCode { get; }
    public ApiException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}
