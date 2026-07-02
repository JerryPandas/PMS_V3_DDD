use pms_v3
INSERT INTO dbo.PMS_Users (
        CreatedAt,
        IsDeleted,
        UserName,
        PasswordHash,
        Role,
        IsActive,
        PersonId
    )
VALUES (
        SYSUTCDATETIME(),
        0,
        N'admin',
        -- admin / Admin@123456
        N'$2b$11$oMBMZ/Ywq2ml3dwmKWp8.ObtqY5uL6srT8DlJda9lCOm6eMKBy8r2',
        0,
        -- Role: 0=Admin
        1,
        -- IsActive
        NULL -- 未关联人员档案，可后续在人员管理里创建后手动关联
    );

-- UPDATE dbo.PMS_Users SET Role = 0 WHERE UserName = N'你的用户名';