import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Alert, Link } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await register(userName, password, displayName)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'primary.main', backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(201,162,39,0.12), transparent 40%)'
    }}>
      <Paper elevation={0} sx={{ width: 380, p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>创建账号</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          注册 PMS 项目管理系统账号
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth label="用户名" margin="normal" autoFocus
            value={userName} onChange={(e) => setUserName(e.target.value)} required
          />
          <TextField
            fullWidth label="显示名称（可选）" margin="normal"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            fullWidth label="密码" type="password" margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <TextField
            fullWidth label="确认密码" type="password" margin="normal"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required
          />
          <Button
            type="submit" fullWidth variant="contained" color="primary"
            size="large" sx={{ mt: 3, mb: 1.5, py: 1.1 }}
            disabled={loading}
          >
            {loading ? '注册中…' : '注册'}
          </Button>
          <Typography variant="body2" align="center" color="text.secondary">
            已有账号？<Link component={RouterLink} to="/login">去登录</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
