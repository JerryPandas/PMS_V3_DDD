import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Select, MenuItem, Switch, Chip, LinearProgress
} from '@mui/material'
import { getUsers, updateUserRole, updateUserActive } from '../api/users'
import { useAuth } from '../context/AuthContext'

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin · 系统管理者' },
  { value: 'Manager', label: 'Manager · 项目管理' },
  { value: 'Member', label: 'Member · 一般用户' },
  { value: 'Visitor', label: 'Visitor · 仅查看' }
]

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getUsers().then(setUsers).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role)
    load()
  }

  const handleActiveToggle = async (id, isActive) => {
    await updateUserActive(id, isActive)
    load()
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>账户与角色管理</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        设置每个登录账户的角色（Admin / Manager / Member / Visitor），或禁用账户
      </Typography>

      <Paper>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户名</TableCell>
              <TableCell>关联人员</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>启用状态</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {u.userName}
                  {u.userName === currentUser?.userName && <Chip label="当前账号" size="small" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{u.personName || '—'}</TableCell>
                <TableCell>
                  <Select
                    size="small" value={u.role} sx={{ minWidth: 190 }}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={u.isActive} onChange={(e) => handleActiveToggle(u.id, e.target.checked)} />
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>暂无账户</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
