import { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  useEffect(() => {
    if (!numVal) return
    let start = 0
    const step = numVal / 30
    const timer = setInterval(() => {
      start += step
      if (start >= numVal) { setDisplay(numVal); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [numVal])
  const formatted = typeof value === 'string' && value.includes('₹')
    ? `₹${Number(display).toLocaleString()}`
    : display.toLocaleString()
  return <span className="count-animate">{prefix}{formatted}{suffix}</span>
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const quickLinks = [
  { to: '/students', icon: '🎓', label: 'Students', color: '#ede9fe', accent: '#6366f1' },
  { to: '/faculty', icon: '👨🏫', label: 'Faculty', color: '#dbeafe', accent: '#3b82f6' },
  { to: '/exams', icon: '📝', label: 'Exams', color: '#fef3c7', accent: '#f59e0b' },
  { to: '/fees', icon: '💰', label: 'Fees', color: '#d1fae5', accent: '#10b981' },
  { to: '/placement', icon: '💼', label: 'Placement', color: '#fce7f3', accent: '#ec4899' },
  { to: '/sports', icon: '🏅', label: 'Sports', color: '#ccfbf1', accent: '#0d9488' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    api.get('/dashboard/').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading" />
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Failed to load dashboard</p></div>

  const stats = [
    { label: 'Total Students', value: data.total_students, sub: `${data.active_students} active`, icon: '🎓', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow: 'rgba(99,102,241,0.3)' },
    { label: 'Faculty Members', value: data.total_faculty, sub: 'Active staff', icon: '👨🏫', bg: 'linear-gradient(135deg,#06b6d4,#3b82f6)', shadow: 'rgba(6,182,212,0.3)' },
    { label: 'Active Courses', value: data.total_courses, sub: 'This semester', icon: '📚', bg: 'linear-gradient(135deg,#10b981,#06b6d4)', shadow: 'rgba(16,185,129,0.3)' },
    { label: 'Fee Collected', value: `₹${Number(data.fee_collected).toLocaleString()}`, sub: 'Total revenue', icon: '💰', bg: 'linear-gradient(135deg,#f59e0b,#f97316)', shadow: 'rgba(245,158,11,0.3)' },
    { label: 'Books Available', value: data.available_books, sub: `${data.issued_books} issued`, icon: '📖', bg: 'linear-gradient(135deg,#ec4899,#8b5cf6)', shadow: 'rgba(236,72,153,0.3)' },
    { label: 'Overdue Books', value: data.overdue_books, sub: 'Need attention', icon: '⚠️', bg: 'linear-gradient(135deg,#ef4444,#f97316)', shadow: 'rgba(239,68,68,0.3)' },
  ]

  // Build mock trend data from dept counts
  const trendData = (data.students_by_department || []).map((d, i) => ({
    name: d.department?.slice(0, 4) || `Dept${i+1}`,
    students: d.count,
    target: Math.round(d.count * 1.2),
  }))

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28, color: 'white',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-60, right:120, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', top:20, right:200, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:13, opacity:0.7, marginBottom:6, letterSpacing:'0.5px' }}>
                {now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </div>
              <h1 style={{ fontSize:26, fontWeight:800, marginBottom:6, letterSpacing:'-0.5px' }}>
                {greeting}, {user?.username}! 👋
              </h1>
              <p style={{ opacity:0.75, fontSize:14 }}>Here's what's happening at your college today.</p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[
                { label:'Students', value:data.total_students, icon:'🎓' },
                { label:'Faculty', value:data.total_faculty, icon:'👨🏫' },
                { label:'Courses', value:data.total_courses, icon:'📚' },
              ].map(s => (
                <div key={s.label} style={{
                  background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)',
                  borderRadius:14, padding:'14px 20px', textAlign:'center',
                  border:'1px solid rgba(255,255,255,0.15)', minWidth:90,
                }}>
                  <div style={{ fontSize:22 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, marginTop:4 }}>{s.value}</div>
                  <div style={{ fontSize:11, opacity:0.7, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background:'white', borderRadius:16, padding:'20px',
            boxShadow:`0 4px 20px ${s.shadow}`, border:'1px solid rgba(255,255,255,0.8)',
            transition:'all 0.25s', cursor:'default',
            display:'flex', alignItems:'center', gap:16,
          }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{
              width:52, height:52, borderRadius:14, background:s.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:24, flexShrink:0, boxShadow:`0 6px 16px ${s.shadow}`,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', letterSpacing:'-0.5px' }}><AnimatedNumber value={s.value} /></div>
              <div style={{ fontSize:13, color:'#374151', fontWeight:600, marginTop:1 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>⚡ Quick Access</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:12 }}>
          {quickLinks.map(q => (
            <div key={q.to} onClick={() => navigate(q.to)} style={{
              background:'white', borderRadius:14, padding:'18px 14px', textAlign:'center',
              cursor:'pointer', border:`2px solid transparent`, transition:'all 0.2s',
              boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=q.accent; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${q.color}` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.06)' }}
            >
              <div style={{ fontSize:30, marginBottom:8 }}>{q.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{q.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>📊 Students by Department</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>Enrollment distribution</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:13 }} />
              <Bar dataKey="students" fill="url(#barGrad)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>🍩 Department Share</div>
          <div style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Active student distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.students_by_department} dataKey="count" nameKey="department"
                cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.students_by_department.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginTop:8 }}>
            {data.students_by_department.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i%COLORS.length], flexShrink:0 }} />
                <span style={{ color:'#6b7280' }}>{d.department} ({d.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>📋 Recent Enrollments</div>
            <button onClick={() => navigate('/students')} style={{ fontSize:12, color:'#6366f1', background:'#ede9fe', border:'none', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontWeight:600 }}>View All</button>
          </div>
          {data.recent_enrollments.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">📋</div><p>No recent enrollments</p></div>
            : <table>
                <thead><tr><th>Student</th><th>Course</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recent_enrollments.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight:600, fontSize:13 }}>{e.student_name}</td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{e.course_name}</td>
                      <td><span className="badge badge-success">{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>📅 Upcoming Exams</div>
            <button onClick={() => navigate('/exams')} style={{ fontSize:12, color:'#f59e0b', background:'#fef3c7', border:'none', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontWeight:600 }}>View All</button>
          </div>
          {data.upcoming_exams.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">📝</div><p>No upcoming exams</p></div>
            : <table>
                <thead><tr><th>Exam</th><th>Course</th><th>Date</th></tr></thead>
                <tbody>
                  {data.upcoming_exams.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight:600, fontSize:13 }}>{e.name}</td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{e.course_name}</td>
                      <td>
                        <span style={{ fontSize:12, background:'#fef3c7', color:'#92400e', padding:'3px 10px', borderRadius:20, fontWeight:600 }}>
                          {e.exam_date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e', marginBottom:16 }}>⚡ Activity Feed</div>
        <div>
          {[
            ...data.recent_enrollments.map(e => ({ icon:'🎓', text:`${e.student_name} enrolled in ${e.course_name}`, color:'#6366f1', time:'Recently' })),
            ...data.upcoming_exams.map(e => ({ icon:'📝', text:`Exam: ${e.name} on ${e.exam_date}`, color:'#f59e0b', time:e.exam_date })),
          ].slice(0, 8).map((item, i) => (
            <div key={i} className="timeline-item" style={{ borderBottom: i < 7 ? '1px solid #f3f4f6' : 'none' }}>
              <div className="timeline-dot" style={{ background: item.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.icon} {item.text}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
          {data.recent_enrollments.length === 0 && data.upcoming_exams.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon">⚡</div><p>No recent activity</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
