import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Button, MenuItem, TextField, Select, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { getProjects } from '../api/projects'
import { getPeople } from '../api/personnel'
import { getBoards, createBoard, createCard, updateCard, moveCard, deleteCard } from '../api/kanban'
import KanbanColumnView from '../components/Kanban/KanbanColumnView'
import KanbanCardDialog from '../components/Kanban/KanbanCardDialog'
import { usePermissions } from '../hooks/usePermissions'

export default function Kanban() {
  const { canWriteContent } = usePermissions()
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [projectId, setProjectId] = useState('')
  const [boards, setBoards] = useState([])
  const [boardId, setBoardId] = useState('')
  const [loading, setLoading] = useState(true)

  const [newBoardOpen, setNewBoardOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

  const [cardDialog, setCardDialog] = useState({ open: false, mode: 'create', column: null, card: null })

  useEffect(() => {
    getProjects().then(setProjects)
    getPeople().then(setPeople)
  }, [])

  const loadBoards = useCallback((pid) => {
    setLoading(true)
    getBoards(pid || undefined).then((list) => {
      setBoards(list)
      setBoardId(list[0]?.id || '')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadBoards(projectId) }, [projectId, loadBoards])

  const currentBoard = boards.find((b) => b.id === boardId)

  const handleCreateBoard = async () => {
    const board = await createBoard({ projectId: projectId || null, name: newBoardName })
    setNewBoardOpen(false)
    setNewBoardName('')
    loadBoards(projectId)
  }

  const refreshCurrentBoard = () => loadBoards(projectId)

  // ---- Drag and drop card ----
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id }))
  }

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const targetSortOrder = targetColumn.cards.length
    await moveCard({ cardId: data.cardId, targetColumnId: targetColumn.id, targetSortOrder })
    refreshCurrentBoard()
  }

  // ---- Create/Edit card ----
  const openAddCard = (column) => setCardDialog({ open: true, mode: 'create', column, card: null })
  const openEditCard = (card) => setCardDialog({ open: true, mode: 'edit', column: null, card })
  const closeCardDialog = () => setCardDialog({ open: false, mode: 'create', column: null, card: null })

  const handleCardSubmit = async (form) => {
    if (cardDialog.mode === 'create') {
      await createCard({ columnId: cardDialog.column.id, ...form })
    } else {
      await updateCard(cardDialog.card.id, form)
    }
    closeCardDialog()
    refreshCurrentBoard()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Kanban</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Select size="small" displayEmpty value={projectId} onChange={(e) => setProjectId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.projectNo} · {p.name}</MenuItem>)}
          </Select>
          <Select size="small" displayEmpty value={boardId} onChange={(e) => setBoardId(e.target.value)} sx={{ minWidth: 160 }}>
            {boards.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </Select>
          {canWriteContent && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => setNewBoardOpen(true)}>New Board</Button>
          )}
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!loading && currentBoard && (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', flexGrow: 1, pb: 1 }}>
          {currentBoard.columns.map((col) => (
            <KanbanColumnView
              key={col.id}
              column={col}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onCardClick={openEditCard}
              onAddCard={openAddCard}
              readOnly={!canWriteContent}
            />
          ))}
        </Box>
      )}

      {!loading && !currentBoard && (
        <Typography color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
          No boards. Click "New Board" to create one
        </Typography>
      )}

      <Dialog open={newBoardOpen} onClose={() => setNewBoardOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Board Name" sx={{ mt: 1 }}
            value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewBoardOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateBoard} disabled={!newBoardName}>Create</Button>
        </DialogActions>
      </Dialog>

      <KanbanCardDialog
        open={cardDialog.open}
        mode={cardDialog.mode}
        initialCard={cardDialog.card}
        people={people}
        onClose={closeCardDialog}
        onSubmit={handleCardSubmit}
      />
    </Box>
  )
}
