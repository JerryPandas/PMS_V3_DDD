import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, LinearProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { getProjects, createProject, deleteProject } from '../api/projects'
import { usePermissions } from '../hooks/usePermissions'

const STATUS_OPTIONS = [
  { value: 'Planning', label: '规划中', color: 'default' },
  { value: 'InProgress', label: '进行中', color: 'primary' },
  { value: 'OnHold', label: '已暂停', color: 'warning' },
  { value: 'Completed', label: '已完成', color: 'success' },
  { value: 'Cancelled', label: '已取消', color: 'error' }
]

function statusChip(status) {
  const opt = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0]
  return <Chip size="small" label={opt.label} color={opt.color} variant={opt.color === 'default' ? 'outlined' : 'filled'} />
}

export default function Projects() {
  const navigate = useNavigate()
  const { canManageProjects } = usePermissions()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ projectNo: '', name: '', description: '', status: 'Planning' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getProjects().then(setProjects).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await createProject(form)
      setDialogOpen(false)
      setForm({ projectNo: '', name: '', description: '', status: 'Planning' })
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('确认删除该项目吗？')) return
    await deleteProject(id)
    load()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>项目列表</Typography>
        {canManageProjects && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>新建项目</Button>
        )}
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>项目号</TableCell>
              <TableCell>项目名称</TableCell>
              <TableCell>负责人</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>子项进度</TableCell>
              {canManageProjects && <TableCell align="right">操作</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{p.projectNo}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.managerName || '—'}</TableCell>
                <TableCell>{statusChip(p.status)}</TableCell>
                <TableCell>{p.itemCount > 0 ? `${p.completedItemCount}/${p.itemCount}` : '—'}</TableCell>
                {canManageProjects && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleDelete(e, p.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && projects.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>{canManageProjects ? '暂无项目，点击右上角新建' : '暂无项目'}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新建项目</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="项目号" placeholder="例如 26aa01" fullWidth autoFocus
            value={form.projectNo} onChange={(e) => setForm({ ...form, projectNo: e.target.value })}
          />
          <TextField
            label="项目名称" fullWidth
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="描述" fullWidth multiline minRows={2}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            select label="状态" fullWidth value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.projectNo || !form.name}>
            {saving ? '创建中…' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { STATUS_OPTIONS, statusChip }
