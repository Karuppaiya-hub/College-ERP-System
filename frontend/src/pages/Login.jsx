import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { key: 'admin',   label: 'Admin',   icon: '🛡️', color: '#6366f1', desc: 'Full system access' },
  { key: 'student', label: 'Student', icon: '🎓', color: '#10b981', desc: 'Student portal access' },
  { key: 'faculty', label: 'Faculty', icon: '👨🏫', color: '#f59e0b', desc: 'Faculty portal access' },
]

export default function Login() {
  const [role, setRole]     = useState('admin')
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const active = ROLES.find(r => r.key === role)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password, role)
      if (user.role === 'student') navigate('/student')
      else navigate('/')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.detail
        || data?.non_field_errors?.[0]
        || data?.username?.[0]
        || data?.password?.[0]
        || 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #24243e 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position:'absolute', top:-120, left:-120, width:400, height:400, borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', bottom:-100, right:-80, width:350, height:350, borderRadius:'50%', background:'rgba(16,185,129,0.1)', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', top:'40%', right:'10%', width:200, height:200, borderRadius:'50%', background:'rgba(245,158,11,0.08)', filter:'blur(40px)' }} />

      {/* Left branding panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', color: 'white',
      }} className="hide-mobile">
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:48 }}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, boxShadow:'0 8px 24px rgba(99,102,241,0.4)',
          }}>🏫</div>
          <div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px' }}>College ERP</div>
            <div style={{ fontSize:12, opacity:0.5, letterSpacing:'1px' }}>MANAGEMENT SYSTEM</div>
          </div>
        </div>

        <h1 style={{ fontSize:42, fontWeight:900, lineHeight:1.15, marginBottom:20, letterSpacing:'-1px' }}>
          Welcome to<br />
          <span style={{ background:'linear-gradient(90deg,#818cf8,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Smart Campus
          </span>
        </h1>
        <p style={{ fontSize:16, opacity:0.65, lineHeight:1.7, maxWidth:380, marginBottom:48 }}>
          A unified platform for students, faculty, and administrators to manage academics, facilities, and campus life.
        </p>

        {/* Feature pills */}
        {[
          ['📊', 'Real-time Analytics Dashboard'],
          ['🔔', 'Smart Notifications & Alerts'],
          ['📱', 'Mobile-friendly Interface'],
          ['🔒', 'Role-based Secure Access'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:'rgba(255,255,255,0.08)', backdropFilter:'blur(10px)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            }}>{icon}</div>
            <span style={{ fontSize:14, opacity:0.8 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Right login card */}
      <div style={{
        width: 480, display:'flex', alignItems:'center', justifyContent:'center',
        padding: 32,
      }}>
        <div style={{
          background:'rgba(255,255,255,0.97)', borderRadius:24, padding:'40px 36px',
          width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
          backdropFilter:'blur(20px)',
        }}>
          {/* Role tabs */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#9ca3af', marginBottom:12, letterSpacing:'0.5px' }}>
              SELECT PORTAL
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {ROLES.map(r => (
                <button key={r.key} onClick={() => { setRole(r.key); setError('') }} style={{
                  flex:1, padding:'10px 6px', borderRadius:12, border:'2px solid',
                  borderColor: role === r.key ? r.color : '#e5e7eb',
                  background: role === r.key ? r.color + '15' : 'white',
                  cursor:'pointer', transition:'all 0.2s', textAlign:'center',
                }}>
                  <div style={{ fontSize:20, marginBottom:3 }}>{r.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color: role === r.key ? r.color : '#6b7280' }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{
                width:40, height:40, borderRadius:12,
                background:`linear-gradient(135deg, ${active.color}, ${active.color}99)`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
                boxShadow:`0 4px 14px ${active.color}40`,
              }}>{active.icon}</div>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:'#1a1a2e' }}>{active.label} Login</div>
                <div style={{ fontSize:12, color:'#9ca3af' }}>{active.desc}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color:'#374151' }}>
                {role === 'student' ? 'Username / Roll Number' : 'Username'}
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>
                  {role === 'student' ? '🎓' : role === 'faculty' ? '👨🏫' : '🛡️'}
                </span>
                <input
                  type="text"
                  value={form.username}
                  placeholder={role === 'student' ? 'Enter roll number or username' : `Enter ${role} username`}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                  style={{ paddingLeft:38, borderColor: error ? '#ef4444' : undefined }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ color:'#374151' }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  placeholder="Enter password"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingLeft:38, paddingRight:44, borderColor: error ? '#ef4444' : undefined }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9ca3af',
                }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background:'#fee2e2', border:'1px solid #fecaca', borderRadius:10,
                padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8,
              }}>
                <span>⚠️</span>
                <span style={{ fontSize:13, color:'#991b1b' }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', borderRadius:12, border:'none',
              background: loading ? '#e5e7eb' : `linear-gradient(135deg, ${active.color}, ${active.color}cc)`,
              color: loading ? '#9ca3af' : 'white', fontSize:15, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 6px 20px ${active.color}40`,
              transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:'2px solid #9ca3af', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>{active.icon} Sign in as {active.label}</>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop:20, padding:'12px 14px', background:'#f8faff',
            borderRadius:10, border:'1px solid #e0e7ff',
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6366f1', marginBottom:4, letterSpacing:'0.5px' }}>DEMO CREDENTIALS</div>
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.8 }}>
              <b>Admin:</b> admin / admin123<br />
              <b>Student:</b> student1 / student123<br />
              <b>Faculty:</b> faculty1 / faculty123
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:12, color:'#9ca3af', marginTop:16 }}>
            © {new Date().getFullYear()} College ERP System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
