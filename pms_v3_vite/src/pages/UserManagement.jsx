import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Select, MenuItem, Switch, Chip, LinearProgress
} from '@mui/material'
import { getUsers, updateUserRole, updateUserActive } from '../api/users'
import { useAuth } from '../context/AuthContext'

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin · System Administrator' },
  { value: 'Manager', label: 'Manager · Project Manager' },
  { value: 'Member', label: 'Member · Regular User' },
  { value: 'Visitor', label: 'Visitor · Read Only' }
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
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Account & Role Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set the role for each account (Admin / Manager / Member / Visitor), or disable an account
      </Typography>

      <Paper>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Linked Person</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {u.userName}
                  {u.userName === currentUser?.userName && <Chip label="Current" size="small" sx={{ ml: 1 }} />}
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
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>No accounts</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
