import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Box, Autocomplete, Chip
} from '@mui/material'

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' }
]

/**
 * Kanban card create/edit dialog.
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
      <DialogTitle>{mode === 'edit' ? 'Edit Card' : 'New Card'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '1rem !important' }}>
        <TextField label="Title" fullWidth autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField label="Description" fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select label="Priority" fullWidth value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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
          renderInput={(params) => <TextField {...params} label="Assignee" placeholder="Select Assignee" />}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.title}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
