import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const ref = useRef()

  useEffect(() => {
    Promise.all([
      api.get('/library/issues/?status=Overdue'),
      api.get('/fees/payments/?status=Pending'),
      api.get('/exams/?status=Scheduled'),
    ]).then(([issues, fees, exams]) => {
      const items = []
      if (issues.data.length) items.push({ icon: '📚', text: `${issues.data.length} overdue book(s)`, color: '#fee2e2', link: '/library' })
      if (fees.data.length) items.push({ icon: '💰', text: `${fees.data.length} pending fee payment(s)`, color: '#fef3c7', link: '/fees' })
      const upcoming = exams.data.filter(e => {
        const d = new Date(e.exam_date)
        const diff = (d - new Date()) / 86400000
        return diff >= 0 && diff <= 7
      })
      if (upcoming.length) items.push({ icon: '📝', text: `${upcoming.length} exam(s) in next 7 days`, color: '#dbeafe', link: '/exams' })
      setNotes(items)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'relative', background: 'white', border: '1.5px solid #e5e7eb',
        borderRadius: 10, width: 38, height: 38, fontSize: 17, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        🔔
        {notes.length > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ef4444',
            color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%',
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{notes.length}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 46, width: 300, background: 'white',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 200,
          border: '1px solid #e5e7eb', overflow: 'hidden', animation: 'slideUp 0.15s ease',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: 14 }}>
            Notifications {notes.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 20, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>{notes.length}</span>}
          </div>
          {notes.length === 0
            ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>✅ All clear!</div>
            : notes.map((n, i) => (
              <a key={i} href={n.link} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderBottom: '1px solid #f9fafb', background: n.color + '55',
                textDecoration: 'none', color: '#1a1a2e', fontSize: 13,
              }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span>{n.text}</span>
              </a>
            ))
          }
        </div>
      )}
    </div>
  )
}

function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef()

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(() => {
      Promise.all([
        api.get(`/students/?search=${q}`),
        api.get(`/faculty/?search=${q}`),
        api.get(`/courses/?search=${q}`),
      ]).then(([s, f, c]) => {
        setResults([
          ...s.data.slice(0, 3).map(x => ({ type: 'Student', label: x.full_name, sub: x.roll_no, link: '/students', icon: '🎓' })),
          ...f.data.slice(0, 3).map(x => ({ type: 'Faculty', label: x.full_name, sub: x.employee_id, link: '/faculty', icon: '👨🏫' })),
          ...c.data.slice(0, 3).map(x => ({ type: 'Course', label: x.name, sub: x.code, link: '/courses', icon: '📚' })),
        ])
      }).finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
      background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10,
      fontSize: 13, color: '#9ca3af', cursor: 'pointer', minWidth: 200,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      🔍 Search... <kbd style={{ marginLeft: 'auto', background: '#f3f4f6', borderRadius: 4, padding: '1px 5px', fontSize: 11, color: '#6b7280' }}>Ctrl K</kbd>
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,35,0.5)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div style={{ width: '100%', maxWidth: 560, background: 'white', borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'slideUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search students, faculty, courses..."
            style={{ flex: 1, border: 'none', fontSize: 15, outline: 'none', background: 'transparent' }} />
          {loading && <span style={{ fontSize: 12, color: '#9ca3af' }}>Searching...</span>}
          <kbd onClick={() => setOpen(false)} style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Esc</kbd>
        </div>
        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { navigate(r.link); setOpen(false); setQ('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.type} · {r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {q && results.length === 0 && !loading && (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No results for "{q}"</div>
        )}
        {!q && (
          <div style={{ padding: '12px 18px 16px' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>QUICK LINKS</div>
            {[['🎓', 'Students', '/students'], ['👨🏫', 'Faculty', '/faculty'], ['📚', 'Courses', '/courses'], ['✅', 'Attendance', '/attendance']].map(([icon, label, link]) => (
              <div key={link} onClick={() => { navigate(link); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const sidebarW = sidebarCollapsed ? 64 : 240

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div style={{ marginLeft: sidebarW, flex: 1, minHeight: '100vh', transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 90,
          background: 'rgba(240,242,248,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(229,231,235,0.8)',
          padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <GlobalSearch />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Dark Mode */}
            <button onClick={() => setDarkMode(d => !d)} title="Toggle dark mode" style={{
              background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10,
              width: 38, height: 38, fontSize: 17, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>{darkMode ? '☀️' : '🌙'}</button>

            <NotificationBell />

            {/* Export CSV shortcut */}
            <button onClick={() => navigate('/fees')} title="Fee Reports" style={{
              background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10,
              width: 38, height: 38, fontSize: 17, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>📊</button>

            {/* User chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10,
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'white',
              }}>{user?.username?.slice(0, 2).toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{user?.username}</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
