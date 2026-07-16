import { Box, Paper, Typography, Chip, IconButton } from '@mui/material'
import { Droppable } from '@hello-pangea/dnd'
import AddIcon from '@mui/icons-material/Add'
import KanbanCardItem from './KanbanCardItem'

export default function KanbanColumnView({ column, onCardClick, onAddCard, readOnly = false }) {
  return (
    <Paper
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
      <Droppable droppableId={String(column.id)} isDropDisabled={readOnly}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ overflowY: 'auto', flexGrow: 1, px: 0.5, minHeight: 8, transition: 'background 0.2s', bgcolor: snapshot.isDraggingOver && !readOnly ? 'rgba(11,31,58,0.04)' : 'transparent' }}
          >
            {column.cards.map((card, index) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                index={index}
                onClick={onCardClick}
                readOnly={readOnly}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  )
}
