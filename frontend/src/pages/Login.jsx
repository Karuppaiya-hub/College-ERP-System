import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)'
    }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🏫</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>College ERP</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} placeholder="Enter username"
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} placeholder="Enter password"
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
