import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem, Divider, Chip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined'
import ProjectsIcon from '@mui/icons-material/FolderOpenOutlined'
import KanbanIcon from '@mui/icons-material/ViewKanbanOutlined'
import PeopleIcon from '@mui/icons-material/GroupsOutlined'
import AdminIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'

const drawerWidth = 232

const ROLE_LABELS = { Admin: 'System Administrator', Manager: 'Project Manager', Member: 'Regular User', Visitor: 'Read Only' }

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { canViewPersonnel, canManageUsers, isVisitor } = usePermissions()
  const [anchorEl, setAnchorEl] = useState(null)

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Projects', path: '/projects', icon: <ProjectsIcon /> },
    { label: 'Kanban', path: '/kanban', icon: <KanbanIcon /> },
    // Personnel management page is completely hidden from Visitor
    ...(canViewPersonnel ? [{ label: 'Personnel', path: '/personnel', icon: <PeopleIcon /> }] : []),
    // Account & role management visible to Admin only
    ...(canManageUsers ? [{ label: 'Management', path: '/users', icon: <AdminIcon /> }] : [])
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRight: 'none'
          }
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
            PMS{/* PMS <Box component="span" sx={{ color: 'secondary.main' }}>Project Management</Box> */}
          </Typography>
        </Toolbar>
        <List sx={{ px: 1.5, mt: 1 }}>
          {navItems.map((item) => {
            const selected = location.pathname === item.path
            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: selected ? 'secondary.main' : 'rgba(245,246,248,0.85)',
                  bgcolor: selected ? 'rgba(201,162,39,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(245,246,248,0.08)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(201,162,39,0.18)' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
              </ListItemButton>
            )
          })}
        </List>
        {isVisitor && (
          <Box sx={{ px: 2.5, mt: 'auto', mb: 2 }}>
            <Chip
              size="small" label="Read Only Mode" color="warning"
              sx={{ bgcolor: 'rgba(201,162,39,0.18)', color: 'secondary.main', fontWeight: 700 }}
            />
          </Box>
        )}
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 700 }}>
                {(user?.userName || '?').slice(0, 1).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user?.userName}</Typography>
                <Typography variant="caption" color="text.secondary">{ROLE_LABELS[user?.role] || user?.role}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
