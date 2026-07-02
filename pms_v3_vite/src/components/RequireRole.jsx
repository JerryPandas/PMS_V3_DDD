import { Navigate, Outlet } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'

/**
 * Role-based route guard. Empty roles means login is sufficient (equivalent to ProtectedRoute);
 * When roles array is provided, only matching roles can access; otherwise shows "Access Denied".
 * Used to completely hide management pages like Personnel/Account Management from Visitor.
 */
export default function RequireRole({ roles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Access Denied</Typography>
        <Typography color="text.secondary">Your account ({user?.role}) does not have permission to access this page</Typography>
      </Box>
    )
  }

  return <Outlet />
}
