import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Box, Autocomplete, Chip
} from '@mui/material'

const PRIORITY_OPTIONS = [
  { value: 'Low', label: '低' },
  { value: 'Normal', label: '普通' },
  { value: 'High', label: '高' },
  { value: 'Urgent', label: '紧急' }
]

/**
 * 新建 / 编辑看板卡片弹窗。
 * mode: 'create' | 'edit'
 */
export default function KanbanCardDialog({ open, mode, initialCard, people, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Normal', dueDate: '', assigneeIds: [] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialCard) {
        setForm({
          title: initialCard.title,
          description: initialCard.description || '',
          priority: initialCard.priority,
          dueDate: initialCard.dueDate?.slice(0, 10) || '',
          assigneeIds: initialCard.assigneeIds || []
        })
      } else {
        setForm({ title: '', description: '', priority: 'Normal', dueDate: '', assigneeIds: [] })
      }
    }
  }, [open, mode, initialCard])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        dueDate: form.dueDate || null
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedPeople = people.filter((p) => form.assigneeIds.includes(p.id))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? '编辑卡片' : '新建卡片'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField label="标题" fullWidth autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField label="描述" fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select label="优先级" fullWidth value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField label="截止日期" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Box>
        <Autocomplete
          multiple
          options={people}
          getOptionLabel={(p) => p.name}
          value={selectedPeople}
          onChange={(_, value) => setForm({ ...form, assigneeIds: value.map((p) => p.id) })}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option.name} size="small" {...getTagProps({ index })} key={option.id} />)
          }
          renderInput={(params) => <TextField {...params} label="负责人" placeholder="选择负责人" />}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.title}>
          {saving ? '保存中…' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
