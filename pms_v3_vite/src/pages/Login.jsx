import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Alert, Link } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(userName, password)
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'primary.main', backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(201,162,39,0.12), transparent 40%)'
    }}>
      <Paper elevation={0} sx={{ width: 380, p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>欢迎回来</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          登录项目管理系统 PMS
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth label="用户名" margin="normal" autoFocus
            value={userName} onChange={(e) => setUserName(e.target.value)}
            required
          />
          <TextField
            fullWidth label="密码" type="password" margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit" fullWidth variant="contained" color="primary"
            size="large" sx={{ mt: 3, mb: 1.5, py: 1.1 }}
            disabled={loading}
          >
            {loading ? '登录中…' : '登录'}
          </Button>
          <Typography variant="body2" align="center" color="text.secondary">
            还没有账号？<Link component={RouterLink} to="/register">立即注册</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
