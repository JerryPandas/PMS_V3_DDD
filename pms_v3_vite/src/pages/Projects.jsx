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
  { value: 'Planning', label: 'Planning', color: 'default' },
  { value: 'InProgress', label: 'In Progress', color: 'primary' },
  { value: 'OnHold', label: 'On Hold', color: 'warning' },
  { value: 'Completed', label: 'Completed', color: 'success' },
  { value: 'Cancelled', label: 'Cancelled', color: 'error' }
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
    if (!window.confirm('Delete this project?')) return
    await deleteProject(id)
    load()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Projects</Typography>
        {canManageProjects && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>New Project</Button>
        )}
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project No.</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items Progress</TableCell>
              {canManageProjects && <TableCell align="right">Actions</TableCell>}
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
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>{canManageProjects ? 'No projects. Click "New Project" to create one' : 'No projects'}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Project</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Project No." placeholder="e.g. 26aa01" fullWidth autoFocus
            value={form.projectNo} onChange={(e) => setForm({ ...form, projectNo: e.target.value })}
          />
          <TextField
            label="Project Name" fullWidth
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Description" fullWidth multiline minRows={2}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            select label="Status" fullWidth value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.projectNo || !form.name}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { STATUS_OPTIONS, statusChip }
