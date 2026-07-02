import { Box, Paper, Typography, Chip, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import KanbanCardItem from './KanbanCardItem'

export default function KanbanColumnView({ column, onDragStart, onDrop, onCardClick, onAddCard, readOnly = false }) {
  return (
    <Paper
      onDragOver={(e) => !readOnly && e.preventDefault()}
      onDrop={(e) => !readOnly && onDrop(e, column)}
      sx={{ width: 300, flexShrink: 0, p: 1.5, bgcolor: '#F0F2F5', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: column.colorHex || 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{column.name}</Typography>
          <Chip size="small" label={column.cards.length} sx={{ height: 18, fontSize: 11 }} />
        </Box>
        {!readOnly && (
          <IconButton size="small" onClick={() => onAddCard(column)}><AddIcon fontSize="small" /></IconButton>
        )}
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, px: 0.5 }}>
        {column.cards.map((card) => (
          <KanbanCardItem key={card.id} card={card} onDragStart={onDragStart} onClick={onCardClick} readOnly={readOnly} />
        ))}
      </Box>
    </Paper>
  )
}
