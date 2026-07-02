import { Navigate, Outlet } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'

/**
 * 基于角色的路由守卫。roles 为空表示只需登录即可（等价于 ProtectedRoute）；
 * 传入角色数组时，仅当前用户角色命中其一才能访问，否则展示"无权限"提示。
 * 用于把「人员管理」「账户管理」这类管理界面对 Visitor 完全隐藏。
 */
export default function RequireRole({ roles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>无权限访问</Typography>
        <Typography color="text.secondary">当前账号（{user?.role}）没有访问此页面的权限</Typography>
      </Box>
    )
  }

  return <Outlet />
}
