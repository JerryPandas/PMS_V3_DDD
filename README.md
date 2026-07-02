# PMS 项目管理系统

一个基于 **DDD（领域驱动设计）分层架构** 的全栈项目管理系统，涵盖看板、人员管理、项目文件上传、项目/子项管理与数据可视化仪表盘。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vite + React 18 + MUI 5 + MUI X Charts + React Router DOM v7（Hash 路由） + Axios |
| 后端 | C# ASP.NET Core 8 Web API + Entity Framework Core 8 + JWT (AccessToken/RefreshToken) |
| 数据库 | SQL Server |
| 架构 | DDD 四层架构：Domain / Application / Infrastructure / API |

---

## 一、整体架构

```
PMS/
├─ backend/                       # .NET 8 Web API 解决方案
│  ├─ PMS.sln
│  ├─ database/
│  │  └─ schema.sql               # 手动建库 SQL 脚本（EF 迁移的替代方案，见下文）
│  └─ src/
│     ├─ PMS.Domain/              # 领域层：实体、枚举、仓储接口（不依赖任何其他层）
│     ├─ PMS.Application/         # 应用层：DTO、用例编排(Services)、服务接口
│     ├─ PMS.Infrastructure/      # 基础设施层：EF Core实现、JWT签发、密码哈希、文件存储
│     └─ PMS.API/                 # 表现层：Controller、依赖注入、中间件、appsettings
└─ frontend/                      # Vite + React 18 前端
   └─ src/
      ├─ api/                     # axios实例与各模块请求封装
      ├─ context/                 # AuthContext(登录状态)
      ├─ components/              # 布局、看板、路由守卫等公共组件
      └─ pages/                   # 登录/注册/仪表盘/项目/看板/人员管理页面
```

### DDD 分层依赖关系

```
PMS.API  ──依赖──►  PMS.Application  ──依赖──►  PMS.Domain
   │                                                 ▲
   └──────────────依赖────────────►  PMS.Infrastructure ──实现──┘
```

- **Domain 层**：只包含实体（`Entities`）、枚举（`Enums`）与仓储接口（`Interfaces/IRepository`, `IUnitOfWork`），不引用 EF Core、不引用任何框架，保持业务模型纯净。
- **Application 层**：定义用例接口（`IAuthService`、`IProjectService` 等）并实现具体编排逻辑（`Services/*.cs`），通过 `IUnitOfWork` 操作领域对象，同时定义 `IJwtService`、`IPasswordHasher`、`IFileStorageService` 等**由外层实现**的技术契约（依赖倒置原则，DIP）。
- **Infrastructure 层**：实现 Domain/Application 定义的接口——EF Core 的 `PmsDbContext`、`Repository<T>`、`UnitOfWork`，以及 JWT 签发（`JwtService`）、BCrypt 密码哈希（`PasswordHasher`）、本地磁盘文件存储（`LocalFileStorageService`）。
- **API 层**：只负责 HTTP 相关的职责——路由、模型绑定、依赖注入组装（`Program.cs`）、认证授权、全局异常中间件，不包含业务逻辑。

---

## 二、数据库设计

所有表前缀 `PMS_`，主要实体关系如下：

| 表 | 说明 | 关键字段 |
|---|---|---|
| `PMS_Users` | 登录账户 | UserName（唯一）, PasswordHash, Role, PersonId（关联人员档案） |
| `PMS_RefreshTokens` | 刷新令牌 | Token（唯一）, UserId, ExpiresAt, IsRevoked, ReplacedByToken |
| `PMS_People` | 人员管理档案 | Name, Department, Position, Email, Phone |
| `PMS_Projects` | 项目（如 `26aa01`） | ProjectNo（唯一）, Name, Status, ManagerId |
| `PMS_ProjectItems` | 项目子项/小项 | ProjectId, Name, Status, Progress, OwnerId |
| `PMS_ProjectFiles` | 项目上传文件 | ProjectId, FileName, RelativePath, SizeBytes |
| `PMS_KanbanBoards` | 看板 | ProjectId（可为空，表示全局看板）, Name |
| `PMS_KanbanColumns` | 看板列 | BoardId, Name, SortOrder, ColorHex |
| `PMS_KanbanCards` | 看板卡片 | ColumnId, Title, Priority, DueDate, ProjectItemId（可关联子项） |
| `PMS_KanbanCardAssignees` | 卡片-人员多对多关联 | CardId, PersonId |

所有业务表都继承 `BaseEntity`（`Id`, `CreatedAt`, `UpdatedAt`, `IsDeleted`），采用**软删除**，`DbContext` 中配置了全局查询过滤器 `HasQueryFilter`，删除的数据不会出现在正常查询结果中。

---

## 三、角色与权限体系（RBAC）

系统内置 4 种角色（`PMS.Domain.Enums.UserRole`），登录后签发的 AccessToken 中携带角色声明（`ClaimTypes.Role`），后端各 Controller 通过 `[Authorize(Roles = "...")]` 校验，前端通过 `usePermissions()` Hook 与 `RequireRole` 路由守卫做界面级别的隐藏/禁用（**注意：前端隐藏只是体验优化，真正的权限边界在后端**，即使前端按钮被隐藏，未授权角色直接调用 API 仍会被后端拒绝并返回 403）。

| 角色 | 说明 | 权限范围 |
|---|---|---|
| **Admin** | 系统管理者 | 全部权限，包括人员管理界面的增删改、账户与角色管理（`/users`） |
| **Manager** | 管理项目 | 项目/子项/看板/文件的增删改；可查看人员列表（用于分配任务），但不能增删改人员档案，不能管理账户角色 |
| **Member** | 一般用户 | 子项、看板卡片、文件的日常增删改；可查看人员列表；**不能**创建/编辑/删除项目本身，不能管理人员档案 |
| **Visitor** | 仅查看 | 项目/子项/看板/文件/仪表盘均为只读；**完全无法访问人员管理界面**（后端 403，前端路由直接拦截并隐藏导航入口） |

### 各模块权限矩阵

| 模块 | 查看 | 创建/编辑/删除 |
|---|---|---|
| 项目仪表盘 | 全部角色 | — |
| 项目列表/详情 | 全部角色 | Admin、Manager |
| 项目子项 | 全部角色 | Admin、Manager、Member |
| 看板 | 全部角色 | Admin、Manager、Member |
| 项目文件 | 全部角色（含下载） | Admin、Manager、Member |
| 人员管理界面 | Admin、Manager、Member | 仅 Admin |
| 账户与角色管理（`/users`） | 仅 Admin | 仅 Admin |

### 设置管理员账号的角色

新用户通过 `/api/auth/register` 自助注册时，默认角色固定为 `Member`（见 `AuthService.RegisterAsync`）。要把某个账户提升为 Admin / Manager / Visitor，有两种方式：

1. **通过界面**：用已有 Admin 账号登录后，进入侧边栏「账户管理」（`/users`），在角色下拉框中修改。
2. **通过 SQL**（适合初始化第一个 Admin 账号，此时系统里还没有任何 Admin）：
   ```sql
   UPDATE dbo.PMS_Users SET Role = 0 WHERE UserName = N'你的用户名';  -- 0 = Admin
   ```

---

## 四、JWT 双令牌认证机制

系统采用 **AccessToken + RefreshToken** 双令牌机制：

| 令牌 | 有效期 | 存储位置 | 用途 |
|---|---|---|---|
| AccessToken | **30 分钟**（`Jwt:AccessTokenExpireMinutes`） | 前端内存/localStorage，请求头 `Authorization: Bearer` | 访问受保护 API |
| RefreshToken | **1 天**（`Jwt:RefreshTokenExpireDays`） | 数据库 `PMS_RefreshTokens` + 前端 localStorage | 换取新的 AccessToken |

### 认证流程

1. **登录/注册**：`POST /api/auth/login` 或 `/api/auth/register`，成功后返回：
   ```json
   {
     "accessToken": "...",
     "accessTokenExpiresAt": "2026-07-01T09:00:00Z",
     "refreshToken": "...",
     "refreshTokenExpiresAt": "2026-07-02T08:30:00Z",
     "userName": "alice",
     "role": "Member"
   }
   ```
2. **发起业务请求**：前端 axios 请求拦截器（`frontend/src/api/axios.js`）在每次请求前检查本地 `accessTokenExpiresAt`：
   - 若未过期（预留 15 秒缓冲），直接携带 AccessToken 发起请求；
   - 若已过期，先检查 `refreshTokenExpiresAt`：
     - **RefreshToken 未过期** → 调用 `POST /api/auth/refresh` 换取新的 AccessToken + RefreshToken（**旋转刷新**：旧 RefreshToken 立即作废，`ReplacedByToken` 记录链路），刷新成功后再发起原请求；
     - **RefreshToken 已过期** → 清空本地令牌，跳转到 `#/login`，要求用户重新登录。
3. **响应拦截器兜底**：即使请求前校验通过，如果服务端仍返回 `401`（例如令牌被后台提前吊销），响应拦截器会再次尝试刷新一次，仍失败则强制登出。
4. **并发请求去重**：多个请求同时触发刷新时，只会发起一次 `/auth/refresh` 请求，其余请求排队等待同一个 Promise 结果，避免刷新风暴。

### 相关配置（`backend/src/PMS.API/appsettings.json`）

```json
"Jwt": {
  "Issuer": "PMS",
  "Audience": "PMS.Client",
  "SecretKey": "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS_LONG",
  "AccessTokenExpireMinutes": 30,
  "RefreshTokenExpireDays": 1
}
```

> ⚠️ **生产环境务必替换 `SecretKey`** 为足够长（≥32字符）的随机字符串，建议通过环境变量或 `dotnet user-secrets` 注入，不要提交到代码仓库。

---

## 五、后端启动步骤

### 1. 环境要求
- .NET 8 SDK
- SQL Server（本地或远程实例）

### 2. 配置连接字符串
编辑 `backend/src/PMS.API/appsettings.json` 的 `ConnectionStrings:Default`：
```
Server=localhost;Database=PMS_DB;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
```

### 3. 创建数据库

**方式一：EF Core 迁移（推荐，Schema 与代码始终保持同步）**
```bash
cd backend
dotnet tool install --global dotnet-ef   # 如未安装
dotnet ef migrations add InitialCreate --project src/PMS.Infrastructure --startup-project src/PMS.API
dotnet ef database update --project src/PMS.Infrastructure --startup-project src/PMS.API
```

**方式二：直接执行 SQL 脚本手动建库（不依赖 .NET SDK / dotnet-ef 工具）**
```sql
CREATE DATABASE PMS_DB;
GO
-- 然后在 PMS_DB 数据库下执行：
:r backend/database/schema.sql
```
`backend/database/schema.sql` 与 `PMS.Infrastructure/Persistence/Configurations` 下的 EF Core 实体配置一一对应（字段类型/长度/外键/唯一索引均一致），建表后即可直接启动后端，无需再跑 EF 迁移。

> 两种方式二选一即可，**不要同时使用**——如果先用脚本建了表，之后又跑 EF 迁移，会导致迁移历史表 `__EFMigrationsHistory` 缺失、EF 认为数据库是"空的"而尝试重复建表。若你手动建库后仍想以后用 EF 迁移管理表结构变更，可执行 `dotnet ef migrations add InitialCreate` 生成迁移文件后，手动在 `__EFMigrationsHistory` 表中插入一条对应记录（俗称"基线迁移"）。

### 4. 运行
```bash
cd backend/src/PMS.API
dotnet restore
dotnet run
```
默认地址：`https://localhost:5001`（Swagger UI: `/swagger`）。

---

## 六、前端启动步骤

### 1. 环境要求
- Node.js 18+

### 2. 安装依赖并启动
```bash
cd frontend
npm install
npm run dev
```
默认地址：`http://localhost:5173`，`vite.config.js` 中已配置 `/api` 代理转发到后端 `https://localhost:5001`（开发环境用于规避 CORS，生产环境请通过 Nginx/IIS 反向代理或直接配置 `VITE_API_BASE_URL`）。

### 3. 生产构建
```bash
npm run build
```
产物在 `frontend/dist`，由于使用 **Hash 路由**（`createHashRouter`），可直接部署到任意静态文件服务器 / IIS，无需配置服务端 URL 重写规则。

---

## 七、核心功能说明

### 1. 项目 / 子项管理（如 `26aa01`）
- 项目以唯一 **项目号**（如 `26aa01`）标识，进入项目详情页后可在"子项"标签下添加多个小项（`ProjectItem`），每个小项独立维护状态、进度百分比、计划/实际完成时间与负责人。
- 子项也可以在看板中被引用（`KanbanCard.ProjectItemId`），实现"看板任务"与"项目子项"的双向关联。

### 2. 看板
- 支持按项目筛选看板，或查看全局看板；新建看板时自动创建"待办/进行中/待验证/已完成"四个默认列。
- 卡片支持拖拽（HTML5 原生 Drag & Drop）跨列移动，调用 `POST /api/kanban/cards/move` 持久化新的列与排序。
- 卡片可设置优先级、截止日期、多负责人（关联 `PMS_People`）。

### 3. 人员管理
- 独立的人员档案（`Person`）与登录账户（`User`）解耦：一个登录账户可关联一个人员档案，人员档案也可脱离账户单独存在（例如尚未开通系统账号的同事）。

### 4. 文件上传
- 项目详情页"文件"标签下可上传/下载/删除文件，后端以 `VARBINARY`-free 的**本地磁盘存储**方式保存文件（`IFileStorageService`，生产环境可替换为对象存储实现），数据库仅保存元数据与相对路径。
- 单文件大小限制 50MB（可在 `FileService.UploadAsync` 与 Controller 的 `RequestSizeLimit` 中调整）。

### 5. 仪表盘（MUI X Charts）
- `GET /api/dashboard/summary` 聚合返回：项目状态分布（饼图）、人员任务负载（柱状图）、近 6 个月子项新增/完成趋势（折线图）。

---

## 八、主要 API 一览

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 认证 | POST | `/api/auth/register` | 注册 |
| 认证 | POST | `/api/auth/login` | 登录 |
| 认证 | POST | `/api/auth/refresh` | 刷新令牌 |
| 认证 | POST | `/api/auth/logout` | 注销（吊销 RefreshToken） |
| 账户管理 🔒Admin | GET | `/api/users` | 账户列表（角色/启用状态） |
| 账户管理 🔒Admin | PUT | `/api/users/{id}/role` | 修改角色（Admin/Manager/Member/Visitor） |
| 账户管理 🔒Admin | PUT | `/api/users/{id}/active` | 启用/禁用账户 |
| 项目 | GET/POST | `/api/projects` | 项目列表 / 创建（创建需 Admin/Manager） |
| 项目 | GET/PUT/DELETE | `/api/projects/{id}` | 项目详情 / 更新 / 删除（更新删除需 Admin/Manager） |
| 子项 | POST/PUT/DELETE | `/api/projects/{projectId}/items[/{itemId}]` | 子项增删改（需 Admin/Manager/Member） |
| 人员 🔒不含Visitor | GET | `/api/personnel[/{id}]` | 人员列表/详情（Admin/Manager/Member 可查看） |
| 人员 🔒Admin | POST/PUT/DELETE | `/api/personnel[/{id}]` | 人员增删改（仅 Admin） |
| 看板 | GET/POST | `/api/kanban/boards` | 看板列表 / 创建（创建需 Admin/Manager/Member） |
| 看板 | POST | `/api/kanban/boards/{boardId}/columns` | 新建列（需 Admin/Manager/Member） |
| 看板 | POST/PUT/DELETE | `/api/kanban/cards[/{cardId}]` | 卡片增删改（需 Admin/Manager/Member） |
| 看板 | POST | `/api/kanban/cards/move` | 拖拽移动卡片（需 Admin/Manager/Member） |
| 文件 | GET | `/api/files/project/{projectId}` | 文件列表 |
| 文件 | POST | `/api/files/project/{projectId}/upload` | 上传（需 Admin/Manager/Member） |
| 文件 | GET | `/api/files/{fileId}/download` | 下载（匿名可访问） |
| 文件 | DELETE | `/api/files/{fileId}` | 删除（需 Admin/Manager/Member） |
| 仪表盘 | GET | `/api/dashboard/summary` | 图表数据汇总（全部角色可查看） |

所有接口（除登录/注册/刷新/文件下载外）均需在请求头携带 `Authorization: Bearer {accessToken}`；未标注权限要求的接口，任意已登录角色（含 Visitor）均可调用。角色权限详情见第三节「角色与权限体系」。

---

## 九、扩展建议

- **更细粒度的权限**：当前按角色（Role）粗粒度控制，如需"只能管理自己创建的项目"等基于数据归属的权限（行级权限），可在 Application 层的 Service 方法中追加当前用户 Id 与资源归属的比对逻辑。
- **文件存储**：`IFileStorageService` 已做接口隔离，可平滑切换为 Azure Blob Storage / 阿里云 OSS 等实现。
- **多看板列自定义**：当前默认四列，`POST /api/kanban/boards/{boardId}/columns` 已支持自定义追加更多列（如"评审中"等）。
- **审计日志**：`BaseEntity` 已包含 `CreatedAt`/`UpdatedAt`，如需完整操作日志可新增 `AuditLog` 实体与中间件记录。
- **单元测试**：由于 Application 层通过接口依赖 `IUnitOfWork`，可使用 Moq 等框架对 Service 类做单元测试，无需真实数据库。

---

## 十、常见问题

**Q: 前端一直跳转登录页？**
A: 检查浏览器 localStorage 中 `pms_auth` 是否存在，以及后端 `Jwt:SecretKey` 是否与签发时一致；也可能是系统时间不同步导致令牌校验失败。

**Q: 文件上传 413 错误？**
A: 检查 IIS/Nginx 反向代理是否也设置了请求体大小限制（`RequestSizeLimit` 只控制 Kestrel 层）。

**Q: EF Core 迁移报错找不到 DbContext？**
A: 确认执行命令时 `--project` 指向 `PMS.Infrastructure`（DbContext 所在项目），`--startup-project` 指向 `PMS.API`（含 `Program.cs` 与配置文件）。
