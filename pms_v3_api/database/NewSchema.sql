/*
  ============================================================================
  PMS Project Management System — Full Database Setup Script (SQL Server)
  ============================================================================
  This script contains:
  1. Safe drop of existing tables to ensure a clean setup.
  2. Table creation with resolved cascade path conflicts for SQL Server.
  3. Complete high-quality English mock data.
*/

USE pms_v3;
GO

SET NOCOUNT ON;

PRINT '============================================================';
PRINT 'STEP 1: Safely dropping existing tables if they exist...';
PRINT '============================================================';

IF OBJECT_ID('dbo.PMS_KanbanCardAssignees', 'U') IS NOT NULL DROP TABLE dbo.PMS_KanbanCardAssignees;
IF OBJECT_ID('dbo.PMS_KanbanCards', 'U') IS NOT NULL DROP TABLE dbo.PMS_KanbanCards;
IF OBJECT_ID('dbo.PMS_KanbanColumns', 'U') IS NOT NULL DROP TABLE dbo.PMS_KanbanColumns;
IF OBJECT_ID('dbo.PMS_KanbanBoards', 'U') IS NOT NULL DROP TABLE dbo.PMS_KanbanBoards;
IF OBJECT_ID('dbo.PMS_ProjectFiles', 'U') IS NOT NULL DROP TABLE dbo.PMS_ProjectFiles;
IF OBJECT_ID('dbo.PMS_ProjectItems', 'U') IS NOT NULL DROP TABLE dbo.PMS_ProjectItems;
IF OBJECT_ID('dbo.PMS_Projects', 'U') IS NOT NULL DROP TABLE dbo.PMS_Projects;
IF OBJECT_ID('dbo.PMS_RefreshTokens', 'U') IS NOT NULL DROP TABLE dbo.PMS_RefreshTokens;
IF OBJECT_ID('dbo.PMS_Users', 'U') IS NOT NULL DROP TABLE dbo.PMS_Users;
IF OBJECT_ID('dbo.PMS_People', 'U') IS NOT NULL DROP TABLE dbo.PMS_People;
GO

PRINT '============================================================';
PRINT 'STEP 2: Creating tables with correct constraints...';
PRINT '============================================================';

-- 1. PMS_People
CREATE TABLE dbo.PMS_People (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    Name          NVARCHAR(64)      NOT NULL,
    Department    NVARCHAR(64)      NULL,
    Position      NVARCHAR(64)      NULL,
    Email         NVARCHAR(128)     NULL,
    Phone         NVARCHAR(32)      NULL,
    Avatar        NVARCHAR(MAX)     NULL
);

-- 2. PMS_Users
CREATE TABLE dbo.PMS_Users (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    UserName      NVARCHAR(64)      NOT NULL,
    PasswordHash  NVARCHAR(256)     NOT NULL,
    Role          INT               NOT NULL DEFAULT 2,   -- 0=Admin 1=Manager 2=Member 3=Visitor
    IsActive      BIT               NOT NULL DEFAULT 1,
    PersonId      INT               NULL,
    CONSTRAINT UQ_PMS_Users_UserName UNIQUE (UserName),
    CONSTRAINT FK_PMS_Users_People FOREIGN KEY (PersonId)
        REFERENCES dbo.PMS_People(Id) ON DELETE SET NULL
);

-- 3. PMS_RefreshTokens
CREATE TABLE dbo.PMS_RefreshTokens (
    Id                INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt         DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2         NULL,
    IsDeleted         BIT               NOT NULL DEFAULT 0,
    Token             NVARCHAR(256)     NOT NULL,
    UserId            INT               NOT NULL,
    ExpiresAt         DATETIME2         NOT NULL,
    IsRevoked         BIT               NOT NULL DEFAULT 0,
    ReplacedByToken   NVARCHAR(256)     NULL,
    CreatedByIp       NVARCHAR(64)      NULL,
    CONSTRAINT UQ_PMS_RefreshTokens_Token UNIQUE (Token),
    CONSTRAINT FK_PMS_RefreshTokens_Users FOREIGN KEY (UserId)
        REFERENCES dbo.PMS_Users(Id) ON DELETE CASCADE
);

-- 4. PMS_Projects
CREATE TABLE dbo.PMS_Projects (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    ProjectNo     NVARCHAR(32)      NOT NULL,
    Name          NVARCHAR(128)     NOT NULL,
    Description   NVARCHAR(2000)    NULL,
    Status        INT               NOT NULL DEFAULT 0,    -- 0=Planning 1=InProgress 2=OnHold 3=Completed 4=Cancelled
    StartDate     DATETIME2         NULL,
    EndDate       DATETIME2         NULL,
    ManagerId     INT               NULL,
    CONSTRAINT UQ_PMS_Projects_ProjectNo UNIQUE (ProjectNo),
    CONSTRAINT FK_PMS_Projects_Manager FOREIGN KEY (ManagerId)
        REFERENCES dbo.PMS_People(Id) ON DELETE SET NULL
);

-- 5. PMS_ProjectItems
CREATE TABLE dbo.PMS_ProjectItems (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    ProjectId     INT               NOT NULL,
    Name          NVARCHAR(128)     NOT NULL,
    Description   NVARCHAR(2000)    NULL,
    Status        INT               NOT NULL DEFAULT 0,
    Progress      INT               NOT NULL DEFAULT 0,    -- 0-100
    PlannedStart  DATETIME2         NULL,
    PlannedEnd    DATETIME2         NULL,
    ActualEnd     DATETIME2         NULL,
    OwnerId       INT               NULL,
    SortOrder     INT               NOT NULL DEFAULT 0,
    CONSTRAINT FK_PMS_ProjectItems_Project FOREIGN KEY (ProjectId)
        REFERENCES dbo.PMS_Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PMS_ProjectItems_Owner FOREIGN KEY (OwnerId)
        REFERENCES dbo.PMS_People(Id) ON DELETE SET NULL
);

-- 6. PMS_ProjectFiles
CREATE TABLE dbo.PMS_ProjectFiles (
    Id               INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt        DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2         NULL,
    IsDeleted        BIT               NOT NULL DEFAULT 0,
    ProjectId        INT               NOT NULL,
    FileName         NVARCHAR(256)     NOT NULL,
    StoredFileName   NVARCHAR(256)     NOT NULL,
    RelativePath     NVARCHAR(512)     NOT NULL,
    SizeBytes        BIGINT            NOT NULL,
    ContentType      NVARCHAR(128)     NULL,
    UploadedById     INT               NULL,
    CONSTRAINT FK_PMS_ProjectFiles_Project FOREIGN KEY (ProjectId)
        REFERENCES dbo.PMS_Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PMS_ProjectFiles_UploadedBy FOREIGN KEY (UploadedById)
        REFERENCES dbo.PMS_People(Id) ON DELETE SET NULL
);

-- 7. PMS_KanbanBoards
CREATE TABLE dbo.PMS_KanbanBoards (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    ProjectId     INT               NULL,                  -- NULL means Global board
    Name          NVARCHAR(128)     NOT NULL,
    CONSTRAINT FK_PMS_KanbanBoards_Project FOREIGN KEY (ProjectId)
        REFERENCES dbo.PMS_Projects(Id) ON DELETE CASCADE
);

-- 8. PMS_KanbanColumns
CREATE TABLE dbo.PMS_KanbanColumns (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    BoardId       INT               NOT NULL,
    Name          NVARCHAR(64)      NOT NULL,
    SortOrder     INT               NOT NULL DEFAULT 0,
    ColorHex      NVARCHAR(16)      NULL,
    CONSTRAINT FK_PMS_KanbanColumns_Board FOREIGN KEY (BoardId)
        REFERENCES dbo.PMS_KanbanBoards(Id) ON DELETE CASCADE
);

-- 9. PMS_KanbanCards (★ Multiple Cascade Path Conflict Fixed Here ★)
CREATE TABLE dbo.PMS_KanbanCards (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt       DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2         NULL,
    IsDeleted       BIT               NOT NULL DEFAULT 0,
    ColumnId        INT               NOT NULL,
    ProjectItemId   INT               NULL,
    Title           NVARCHAR(256)     NOT NULL,
    Description     NVARCHAR(2000)    NULL,
    Priority        INT               NOT NULL DEFAULT 1,  -- 0=Low 1=Normal 2=High 3=Urgent
    DueDate         DATETIME2         NULL,
    SortOrder       INT               NOT NULL DEFAULT 0,
    CONSTRAINT FK_PMS_KanbanCards_Column FOREIGN KEY (ColumnId)
        REFERENCES dbo.PMS_KanbanColumns(Id) ON DELETE CASCADE,
    -- Fixed: Changed to ON DELETE NO ACTION to prevent multiple cascade paths
    CONSTRAINT FK_PMS_KanbanCards_ProjectItem FOREIGN KEY (ProjectItemId)
        REFERENCES dbo.PMS_ProjectItems(Id) ON DELETE NO ACTION
);

-- 10. PMS_KanbanCardAssignees
CREATE TABLE dbo.PMS_KanbanCardAssignees (
    Id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreatedAt     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2         NULL,
    IsDeleted     BIT               NOT NULL DEFAULT 0,
    CardId        INT               NOT NULL,
    PersonId      INT               NOT NULL,
    CONSTRAINT FK_PMS_KanbanCardAssignees_Card FOREIGN KEY (CardId)
        REFERENCES dbo.PMS_KanbanCards(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PMS_KanbanCardAssignees_Person FOREIGN KEY (PersonId)
        REFERENCES dbo.PMS_People(Id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IX_PMS_ProjectItems_ProjectId ON dbo.PMS_ProjectItems(ProjectId);
CREATE INDEX IX_PMS_ProjectFiles_ProjectId ON dbo.PMS_ProjectFiles(ProjectId);
CREATE INDEX IX_PMS_KanbanColumns_BoardId ON dbo.PMS_KanbanColumns(BoardId);
CREATE INDEX IX_PMS_KanbanCards_ColumnId ON dbo.PMS_KanbanCards(ColumnId);
CREATE INDEX IX_PMS_KanbanCardAssignees_CardId ON dbo.PMS_KanbanCardAssignees(CardId);
CREATE INDEX IX_PMS_KanbanCardAssignees_PersonId ON dbo.PMS_KanbanCardAssignees(PersonId);
CREATE INDEX IX_PMS_RefreshTokens_UserId ON dbo.PMS_RefreshTokens(UserId);
GO

PRINT 'All tables and indexes created successfully.';
GO

PRINT '============================================================';
PRINT 'STEP 3: Populating Full English Mock Data...';
PRINT '============================================================';

BEGIN TRANSACTION;

-- 1. PMS_People
SET IDENTITY_INSERT dbo.PMS_People ON;
INSERT INTO dbo.PMS_People (Id, CreatedAt, Name, Department, Position, Email, Phone, Avatar) VALUES
(1, '2026-01-10 08:00:00', 'Alice Smith', 'Management', 'Project Director', 'alice.smith@company.com', '+1-555-0101', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'),
(2, '2026-01-11 09:15:00', 'Bob Johnson', 'Engineering', 'Lead Developer', 'bob.johnson@company.com', '+1-555-0102', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'),
(3, '2026-01-12 10:30:00', 'Charlie Brown', 'Engineering', 'Frontend Engineer', 'charlie.brown@company.com', '+1-555-0103', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'),
(4, '2026-01-12 11:00:00', 'Diana Prince', 'Design', 'UI/UX Designer', 'diana.prince@company.com', '+1-555-0104', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'),
(5, '2026-01-15 14:20:00', 'Evan Wright', 'Quality Assurance', 'QA Analyst', 'evan.wright@company.com', '+1-555-0105', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan');
SET IDENTITY_INSERT dbo.PMS_People OFF;

-- 2. PMS_Users
SET IDENTITY_INSERT dbo.PMS_Users ON;
INSERT INTO dbo.PMS_Users (Id, CreatedAt, UserName, PasswordHash, Role, IsActive, PersonId) VALUES
(1, '2026-01-10 08:30:00', 'admin_alice', 'AQAAAAIAAYagAAAAEOf67BvXkP...[MockHash]...', 0, 1, 1),
(2, '2026-01-11 09:45:00', 'mgr_bob', 'AQAAAAIAAYagAAAAEOf67BvXkP...[MockHash]...', 1, 1, 2),
(3, '2026-01-12 10:45:00', 'dev_charlie', 'AQAAAAIAAYagAAAAEOf67BvXkP...[MockHash]...', 2, 1, 3),
(4, '2026-01-12 11:15:00', 'designer_diana', 'AQAAAAIAAYagAAAAEOf67BvXkP...[MockHash]...', 2, 1, 4),
(5, '2026-01-15 14:30:00', 'visitor_evan', 'AQAAAAIAAYagAAAAEOf67BvXkP...[MockHash]...', 3, 1, 5);
SET IDENTITY_INSERT dbo.PMS_Users OFF;

-- 3. PMS_RefreshTokens
SET IDENTITY_INSERT dbo.PMS_RefreshTokens ON;
INSERT INTO dbo.PMS_RefreshTokens (Id, CreatedAt, Token, UserId, ExpiresAt, IsRevoked, CreatedByIp) VALUES
(1, '2026-07-01 09:00:00', 'tkn_mock_98a7b6c5d4e3f2a1', 2, '2026-07-02 09:00:00', 0, '127.0.0.1'),
(2, '2026-07-01 10:15:00', 'tkn_mock_1a2b3c4d5e6f7g8h', 3, '2026-07-02 10:15:00', 0, '192.168.1.50');
SET IDENTITY_INSERT dbo.PMS_RefreshTokens OFF;

-- 4. PMS_Projects
SET IDENTITY_INSERT dbo.PMS_Projects ON;
INSERT INTO dbo.PMS_Projects (Id, CreatedAt, ProjectNo, Name, Description, Status, StartDate, EndDate, ManagerId) VALUES
(1, '2026-02-01 09:00:00', '26aa01', 'PMS Enterprise Upgrade v3', 'Migrating the legacy internal system to React + Vite + .NET 8 Web API architecture.', 1, '2026-03-01 00:00:00', '2026-09-30 00:00:00', 1),
(2, '2026-02-15 10:00:00', '26bb02', 'Customer Mobile App Dev', 'Cross-platform mobile client for external users to monitor project feeds.', 0, '2026-08-01 00:00:00', '2026-12-31 00:00:00', 2);
SET IDENTITY_INSERT dbo.PMS_Projects OFF;

-- 5. PMS_ProjectItems
SET IDENTITY_INSERT dbo.PMS_ProjectItems ON;
INSERT INTO dbo.PMS_ProjectItems (Id, CreatedAt, ProjectId, Name, Description, Status, Progress, PlannedStart, PlannedEnd, ActualEnd, OwnerId, SortOrder) VALUES
(1, '2026-02-02 10:00:00', 1, 'Database Schema Architecture', 'Design SQL Server tables and relations matching EF Core setup.', 3, 100, '2026-03-01 00:00:00', '2026-03-10 00:00:00', '2026-03-09 17:00:00', 2, 1),
(2, '2026-02-02 11:00:00', 1, 'UI/UX Interactive Prototype', 'Figma mockups for the dashboard, Kanban view, and user profiles.', 1, 75, '2026-03-11 00:00:00', '2026-04-15 00:00:00', NULL, 4, 2),
(3, '2026-02-02 14:00:00', 1, 'RESTful Authentication API', 'Implement JWT token workflow including secure HTTP-only cookie rotation.', 1, 40, '2026-04-16 00:00:00', '2026-05-30 00:00:00', NULL, 2, 3),
(4, '2026-02-16 11:00:00', 2, 'Requirements Discovery Session', 'Gathering core milestones and mock data schema requirements from stakeholders.', 0, 0, '2026-08-01 00:00:00', '2026-08-15 00:00:00', NULL, 1, 1);
SET IDENTITY_INSERT dbo.PMS_ProjectItems OFF;

-- 6. PMS_ProjectFiles
SET IDENTITY_INSERT dbo.PMS_ProjectFiles ON;
INSERT INTO dbo.PMS_ProjectFiles (Id, CreatedAt, ProjectId, FileName, StoredFileName, RelativePath, SizeBytes, ContentType, UploadedById) VALUES
(1, '2026-03-05 16:22:00', 1, 'db_v3_draft.sql', 'db471c99-1a48-4e8c-8cf2-ec067098418d.sql', 'projects/1/files/db471c99-1a48-4e8c-8cf2-ec067098418d.sql', 15420, 'text/plain', 2),
(2, '2026-03-20 11:05:00', 1, 'Dashboard_Layout_v2.png', 'f3012b1a-82bc-4401-b8d9-2169bdfcfc6b.png', 'projects/1/files/f3012b1a-82bc-4401-b8d9-2169bdfcfc6b.png', 2445102, 'image/png', 4);
SET IDENTITY_INSERT dbo.PMS_ProjectFiles OFF;

-- 7. PMS_KanbanBoards
SET IDENTITY_INSERT dbo.PMS_KanbanBoards ON;
INSERT INTO dbo.PMS_KanbanBoards (Id, CreatedAt, ProjectId, Name) VALUES
(1, '2026-02-05 09:00:00', 1, 'Sprint 1: System Blueprint'),
(2, '2026-02-20 13:30:00', NULL, 'Global Engineering Noticeboard');
SET IDENTITY_INSERT dbo.PMS_KanbanBoards OFF;

-- 8. PMS_KanbanColumns
SET IDENTITY_INSERT dbo.PMS_KanbanColumns ON;
INSERT INTO dbo.PMS_KanbanColumns (Id, CreatedAt, BoardId, Name, SortOrder, ColorHex) VALUES
(1, '2026-02-05 09:05:00', 1, 'Backlog', 1, '#64748B'),
(2, '2026-02-05 09:05:00', 1, 'In Progress', 2, '#3B82F6'),
(3, '2026-02-05 09:05:00', 1, 'Code Review', 3, '#F59E0B'),
(4, '2026-02-05 09:05:00', 1, 'Done', 4, '#10B981');
SET IDENTITY_INSERT dbo.PMS_KanbanColumns OFF;

-- 9. PMS_KanbanCards
SET IDENTITY_INSERT dbo.PMS_KanbanCards ON;
INSERT INTO dbo.PMS_KanbanCards (Id, CreatedAt, ColumnId, ProjectItemId, Title, Description, Priority, DueDate, SortOrder) VALUES
(1, '2026-03-01 10:00:00', 4, 1, 'Initialize SQL Database Schema', 'Deploy tables via internal configurations scripts and test index performance.', 2, '2026-03-10 18:00:00', 1),
(2, '2026-03-12 11:15:00', 2, 2, 'Build Sidebar & Navigation Tree', 'Hook up react-router-dom to render menu items reactively.', 1, '2026-04-10 00:00:00', 1),
(3, '2026-03-15 09:30:00', 2, 3, 'Vite HTTP Proxy Setup', 'Fix SSL mismatch issues and configure target proxy endpoints toward 127.0.0.1.', 3, '2026-03-25 12:00:00', 2),
(4, '2026-03-22 14:00:00', 1, NULL, 'Refactor CSS Variables for Dark Mode', 'Standardize material palette bindings across all customized dashboard containers.', 0, NULL, 1);
SET IDENTITY_INSERT dbo.PMS_KanbanCards OFF;

-- 10. PMS_KanbanCardAssignees
SET IDENTITY_INSERT dbo.PMS_KanbanCardAssignees ON;
INSERT INTO dbo.PMS_KanbanCardAssignees (Id, CreatedAt, CardId, PersonId) VALUES
(1, '2026-03-01 10:05:00', 1, 2),
(2, '2026-03-12 11:20:00', 2, 3),
(3, '2026-03-12 11:20:00', 2, 4),
(4, '2026-03-15 09:35:00', 3, 2),
(5, '2026-03-15 09:35:00', 3, 3);
SET IDENTITY_INSERT dbo.PMS_KanbanCardAssignees OFF;

COMMIT TRANSACTION;

PRINT '============================================================';
PRINT 'SUCCESS: Database structure created and mock data loaded!';
PRINT '============================================================';
GO