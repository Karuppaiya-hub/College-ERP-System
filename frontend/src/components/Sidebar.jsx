import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const groups = [
  {
    label: 'MAIN',
    links: [{ to: '/', icon: '⚡', label: 'Dashboard' }]
  },
  {
    label: 'ACADEMICS',
    links: [
      { to: '/students', icon: '🎓', label: 'Students' },
      { to: '/faculty', icon: '👨🏫', label: 'Faculty' },
      { to: '/courses', icon: '📚', label: 'Courses' },
      { to: '/attendance', icon: '✅', label: 'Attendance' },
      { to: '/exams', icon: '📝', label: 'Exams' },
      { to: '/fees', icon: '💰', label: 'Fees' },
    ]
  },
  {
    label: 'FACILITIES',
    links: [
      { to: '/library', icon: '📖', label: 'Library' },
      { to: '/hostel', icon: '🏠', label: 'Hostel' },
      { to: '/transport', icon: '🚌', label: 'Transport' },
      { to: '/laboratory', icon: '🔬', label: 'Laboratory' },
      { to: '/cafeteria', icon: '🍽️', label: 'Cafeteria' },
    ]
  },
  {
    label: 'CAMPUS LIFE',
    links: [
      { to: '/placement', icon: '💼', label: 'Placement' },
      { to: '/sports', icon: '🏅', label: 'Sports' },
    ]
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AD'
  const w = collapsed ? 64 : 240

  return (
    <aside style={{
      width: w, minWidth: w,
      background: 'linear-gradient(180deg, #0f0c29 0%, #1e1b4b 50%, #24243e 100%)',
      color: '#c7d2fe', display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'fixed', left: 0, top: 0, zIndex: 100, overflowY: 'hidden',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      transition: 'width 0.25s ease',
    }}>
      {/* Logo + Toggle */}
      <div style={{ padding: collapsed ? '16px 14px' : '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            cursor: 'pointer',
          }} onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>🏫</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>College ERP</div>
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 1, letterSpacing: '0.5px' }}>MANAGEMENT SYSTEM</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 12px' }}>
        {groups.map(g => (
          <div key={g.label}>
            {!collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.25)',
                padding: '14px 18px 6px',
              }}>{g.label}</div>
            )}
            {collapsed && <div style={{ height: 8 }} />}
            {g.links.map(l => {
              const isActive = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)
              return (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  title={collapsed ? l.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? 0 : 10,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '9px 18px',
                    fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : 'rgba(199,210,254,0.7)',
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                    borderLeft: collapsed ? 'none' : `3px solid ${isActive ? '#818cf8' : 'transparent'}`,
                    borderRadius: collapsed ? 0 : '0 8px 8px 0',
                    marginRight: collapsed ? 0 : 8,
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: 18, width: collapsed ? '100%' : 20, textAlign: 'center' }}>{l.icon}</span>
                  {!collapsed && <span>{l.label}</span>}
                  {!collapsed && isActive && (
                    <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{ padding: collapsed ? '10px 8px' : '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: 11, opacity: 0.5, textTransform: 'capitalize' }}>{user?.role || 'Admin'}</div>
            </div>
          </div>
        )}
        <button onClick={logout} title="Sign Out" style={{
          width: '100%', padding: collapsed ? '8px 0' : '8px', borderRadius: 8,
          fontSize: collapsed ? 18 : 12, fontWeight: 600,
          background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', transition: 'all 0.2s',
        }}>{collapsed ? '🚪' : '🚪 Sign Out'}</button>
      </div>
    </aside>
  )
}
