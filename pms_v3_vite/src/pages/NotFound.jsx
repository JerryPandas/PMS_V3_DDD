import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>404</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Page Not Found</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  )
}
