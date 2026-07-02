import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Button, IconButton, Table, TableHead, TableRow, TableCell,
  TableBody, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/EditOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import UploadIcon from '@mui/icons-material/UploadFileOutlined'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { getProjectDetail, addProjectItem, updateProjectItem, deleteProjectItem } from '../api/projects'
import { getFiles, uploadFile, deleteFile } from '../api/files'
import { statusChip, STATUS_OPTIONS } from './Projects'
import { usePermissions } from '../hooks/usePermissions'

const emptyItemForm = {
  name: '', description: '', status: 'Planning', progress: 0,
  plannedStart: '', plannedEnd: '', actualEnd: '', sortOrder: 0
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canWriteContent } = usePermissions()
  const [project, setProject] = useState(null)
  const [tab, setTab] = useState(0)
  const [files, setFiles] = useState([])
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadProject = useCallback(() => {
    getProjectDetail(id).then(setProject)
  }, [id])

  const loadFiles = useCallback(() => {
    getFiles(id).then(setFiles)
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])
  useEffect(() => { if (tab === 1) loadFiles() }, [tab, loadFiles])

  const openCreateItem = () => {
    setEditingItemId(null)
    setItemForm(emptyItemForm)
    setItemDialogOpen(true)
  }

  const openEditItem = (item) => {
    setEditingItemId(item.id)
    setItemForm({
      name: item.name, description: item.description || '', status: item.status, progress: item.progress,
      plannedStart: item.plannedStart?.slice(0, 10) || '', plannedEnd: item.plannedEnd?.slice(0, 10) || '',
      actualEnd: item.actualEnd?.slice(0, 10) || '', sortOrder: item.sortOrder
    })
    setItemDialogOpen(true)
  }

  const handleSaveItem = async () => {
    setSaving(true)
    try {
      const payload = {
        ...itemForm,
        progress: Number(itemForm.progress),
        sortOrder: Number(itemForm.sortOrder),
        plannedStart: itemForm.plannedStart || null,
        plannedEnd: itemForm.plannedEnd || null,
        actualEnd: itemForm.actualEnd || null
      }
      if (editingItemId) {
        await updateProjectItem(id, editingItemId, payload)
      } else {
        await addProjectItem(id, payload)
      }
      setItemDialogOpen(false)
      loadProject()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('确认删除该子项吗？')) return
    await deleteProjectItem(id, itemId)
    loadProject()
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadFile(id, file)
      loadFiles()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('确认删除该文件吗？')) return
    await deleteFile(fileId)
    loadFiles()
  }

  if (!project) return <LinearProgress />

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 1.5 }}>
        返回项目列表
      </Button>

      <Paper sx={{ p: 3, mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 700 }}>{project.projectNo}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{project.name}</Typography>
            {project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>{project.description}</Typography>
            )}
          </Box>
          {statusChip(project.status)}
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="子项" />
        <Tab label="文件" />
      </Tabs>

      {tab === 0 && (
        <Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>项目子项</Typography>
            {canWriteContent && (
              <Button size="small" startIcon={<AddIcon />} onClick={openCreateItem}>添加小项</Button>
            )}
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名称</TableCell>
                <TableCell>状态</TableCell>
                <TableCell width={180}>进度</TableCell>
                <TableCell>负责人</TableCell>
                <TableCell>计划完成</TableCell>
                {canWriteContent && <TableCell align="right">操作</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {project.items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                    {item.description && <Typography variant="caption" color="text.secondary">{item.description}</Typography>}
                  </TableCell>
                  <TableCell>{statusChip(item.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={item.progress} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                      <Typography variant="caption">{item.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.ownerName || '—'}</TableCell>
                  <TableCell>{item.plannedEnd?.slice(0, 10) || '—'}</TableCell>
                  {canWriteContent && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditItem(item)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {project.items.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>暂无子项</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>项目文件</Typography>
            {canWriteContent && (
              <Button component="label" size="small" startIcon={<UploadIcon />} disabled={uploading}>
                {uploading ? '上传中…' : '上传文件'}
                <input type="file" hidden onChange={handleUpload} />
              </Button>
            )}
          </Box>
          <List>
            {files.map((f) => (
              <ListItem
                key={f.id}
                secondaryAction={
                  <>
                    <IconButton edge="end" component="a" href={f.downloadUrl} target="_blank" rel="noreferrer">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    {canWriteContent && (
                      <IconButton edge="end" onClick={() => handleDeleteFile(f.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                }
              >
                <ListItemIcon><InsertDriveFileIcon /></ListItemIcon>
                <ListItemText
                  primary={f.fileName}
                  secondary={`${(f.sizeBytes / 1024).toFixed(1)} KB · ${new Date(f.createdAt).toLocaleString()}`}
                />
              </ListItem>
            ))}
            {files.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无上传文件</Typography>
            )}
          </List>
        </Paper>
      )}

      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItemId ? '编辑子项' : '添加小项'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="名称" fullWidth autoFocus value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
          <TextField label="描述" fullWidth multiline minRows={2} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
          <TextField select label="状态" fullWidth value={itemForm.status} onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}>
            {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField
            label="进度 (%)" type="number" fullWidth
            inputProps={{ min: 0, max: 100 }}
            value={itemForm.progress} onChange={(e) => setItemForm({ ...itemForm, progress: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="计划开始" type="date" fullWidth InputLabelProps={{ shrink: true }} value={itemForm.plannedStart} onChange={(e) => setItemForm({ ...itemForm, plannedStart: e.target.value })} />
            <TextField label="计划完成" type="date" fullWidth InputLabelProps={{ shrink: true }} value={itemForm.plannedEnd} onChange={(e) => setItemForm({ ...itemForm, plannedEnd: e.target.value })} />
          </Box>
          <TextField label="实际完成" type="date" fullWidth InputLabelProps={{ shrink: true }} value={itemForm.actualEnd} onChange={(e) => setItemForm({ ...itemForm, actualEnd: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItemDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSaveItem} disabled={saving || !itemForm.name}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
