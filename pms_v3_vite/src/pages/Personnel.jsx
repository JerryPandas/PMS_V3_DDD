import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, LinearProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { getPeople, createPerson, updatePerson, deletePerson } from '../api/personnel'
import { usePermissions } from '../hooks/usePermissions'

const emptyForm = { name: '', department: '', position: '', email: '', phone: '' }

export default function Personnel() {
  const { canManagePersonnel } = usePermissions()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getPeople().then(setPeople).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({ name: p.name, department: p.department || '', position: p.position || '', email: p.email || '', phone: p.phone || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) await updatePerson(editingId, form)
      else await createPerson(form)
      setDialogOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确认删除该人员吗？')) return
    await deletePerson(id)
    load()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>人员管理</Typography>
        {canManagePersonnel && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增人员</Button>
        )}
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>部门</TableCell>
              <TableCell>职位</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>电话</TableCell>
              {canManagePersonnel && <TableCell align="right">操作</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 14 }}>
                      {p.name?.slice(0, 1)}
                    </Avatar>
                    {p.name}
                  </Box>
                </TableCell>
                <TableCell>{p.department || '—'}</TableCell>
                <TableCell>{p.position || '—'}</TableCell>
                <TableCell>{p.email || '—'}</TableCell>
                <TableCell>{p.phone || '—'}</TableCell>
                {canManagePersonnel && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && people.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>暂无人员，点击右上角新增</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? '编辑人员' : '新增人员'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="姓名" fullWidth autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="部门" fullWidth value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <TextField label="职位" fullWidth value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <TextField label="邮箱" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="电话" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name}>{saving ? '保存中…' : '保存'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
