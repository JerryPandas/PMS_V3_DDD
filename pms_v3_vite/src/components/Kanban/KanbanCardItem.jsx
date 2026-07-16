import { Paper, Typography, Box, Chip, Avatar, AvatarGroup } from '@mui/material'
import { Draggable } from '@hello-pangea/dnd'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'

const PRIORITY_META = {
  Low: { label: 'Low', color: '#5B6472' },
  Normal: { label: 'Normal', color: '#14335C' },
  High: { label: 'High', color: '#C9A227' },
  Urgent: { label: 'Urgent', color: '#B3432B' }
}

export default function KanbanCardItem({ card, index, onClick, readOnly = false }) {
  const meta = PRIORITY_META[card.priority] || PRIORITY_META.Normal
  const content = (
    <Paper
      elevation={0}
      onClick={() => !readOnly && onClick(card)}
      sx={{
        p: 1.5, mb: 1.2, borderRadius: 2, cursor: readOnly ? 'default' : 'grab',
        border: '1px solid rgba(11,31,58,0.08)',
        '&:hover': readOnly ? {} : { borderColor: 'secondary.main', boxShadow: '0 2px 8px rgba(11,31,58,0.08)' }
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.7 }}>{card.title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip size="small" label={meta.label} sx={{ bgcolor: `${meta.color}1A`, color: meta.color, fontWeight: 700, height: 20 }} />
        {card.dueDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
            <EventOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{card.dueDate.slice(5, 10)}</Typography>
          </Box>
        )}
      </Box>
      {card.assigneeNames?.length > 0 && (
        <AvatarGroup max={4} sx={{ mt: 1, justifyContent: 'flex-end', '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 11 } }}>
          {card.assigneeNames.map((n, i) => (
            <Avatar key={i} sx={{ bgcolor: 'primary.main' }}>{n.slice(0, 1)}</Avatar>
          ))}
        </AvatarGroup>
      )}
    </Paper>
  )

  if (readOnly) return content

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={snapshot.isDragging ? { borderRadius: 2, '& > *': { boxShadow: '0 4px 16px rgba(11,31,58,0.2)' } } : undefined}
        >
          {content}
        </Box>
      )}
    </Draggable>
  )
}
