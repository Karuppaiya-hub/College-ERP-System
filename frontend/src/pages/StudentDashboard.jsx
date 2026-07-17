import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const TABS = ['Overview', 'Attendance', 'Grades', 'Fees', 'Exams']

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [grades, setGrades] = useState([])
  const [fees, setFees] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  const studentId = user?.student_profile

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    Promise.all([
      api.get(`/students/${studentId}/`),
      api.get(`/attendance/student/${studentId}/stats/`),
      api.get(`/grades/student/${studentId}/`),
      api.get(`/fees/student/${studentId}/summary/`),
      api.get('/exams/?status=Scheduled'),
    ]).then(([p, a, g, f, e]) => {
      setProfile(p.data)
      setAttendance(a.data)
      setGrades(g.data.grades || [])
      setFees(f.data)
      setExams(e.data.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [studentId])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const attPct = attendance?.attendance_percentage || 0
  const attColor = attPct >= 75 ? '#10b981' : attPct >= 60 ? '#f59e0b' : '#ef4444'

  if (loading) return <div className="loading" />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f2f8 0%,#e8eaf6 100%)' }}>
      {/* Top Nav */}
      <header style={{
        background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',
        padding:'0 28px', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:'0 4px 20px rgba(79,70,229,0.3)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#818cf8,#6366f1)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          }}>🏫</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:15 }}>College ERP</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, letterSpacing:'1px' }}>STUDENT PORTAL</div>
          </div>
        </div>

        {/* Tab Nav */}
        <div style={{ display:'flex', gap:4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer',
              fontSize:13, fontWeight:600, transition:'all 0.2s',
              background: tab === t ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: tab === t ? 'white' : 'rgba(255,255,255,0.6)',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'white', fontSize:13, fontWeight:600 }}>{user?.username}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>Student</div>
          </div>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#10b981,#06b6d4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700, color:'white',
          }}>{user?.username?.slice(0,2).toUpperCase()}</div>
          <button onClick={logout} style={{
            background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)',
            color:'#fca5a5', borderRadius:8, padding:'6px 12px', fontSize:12,
            fontWeight:600, cursor:'pointer',
          }}>🚪 Logout</button>
        </div>
      </header>

      <div style={{ padding:28 }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'Overview' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            {/* Hero */}
            <div style={{
              background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)',
              borderRadius:20, padding:'28px 32px', marginBottom:24, color:'white',
              position:'relative', overflow:'hidden',
              boxShadow:'0 16px 48px rgba(99,102,241,0.3)',
            }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
              <div style={{ position:'absolute', bottom:-50, right:100, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:13, opacity:0.6, marginBottom:6 }}>
                  {now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                </div>
                <h1 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>{greeting}, {user?.username}! 👋</h1>
                <p style={{ opacity:0.7, fontSize:14 }}>Here's your academic summary for today.</p>
                {profile && (
                  <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
                    {[
                      { label:'Roll No', value:profile.roll_no },
                      { label:'Department', value:profile.department },
                      { label:'Semester', value:`Sem ${profile.semester}` },
                      { label:'Status', value:profile.status },
                    ].map(s => (
                      <div key={s.label} style={{
                        background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)',
                        borderRadius:12, padding:'10px 16px', border:'1px solid rgba(255,255,255,0.15)',
                      }}>
                        <div style={{ fontSize:11, opacity:0.6, marginBottom:2 }}>{s.label}</div>
                        <div style={{ fontSize:14, fontWeight:700 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { label:'Attendance', value:`${attPct}%`, icon:'✅', bg:`linear-gradient(135deg,${attColor},${attColor}99)`, shadow:`${attColor}40`, sub: attPct >= 75 ? 'Good standing' : '⚠️ Below 75%' },
                { label:'Subjects', value: grades.length || '—', icon:'📚', bg:'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow:'rgba(99,102,241,0.3)', sub:'Enrolled courses' },
                { label:'Fee Balance', value: fees ? `₹${Number(fees.balance).toLocaleString()}` : '—', icon:'💰', bg: fees?.balance > 0 ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'linear-gradient(135deg,#10b981,#06b6d4)', shadow:'rgba(16,185,129,0.3)', sub: fees?.balance > 0 ? 'Due amount' : 'Fully paid' },
                { label:'Upcoming Exams', value: exams.length, icon:'📝', bg:'linear-gradient(135deg,#f59e0b,#f97316)', shadow:'rgba(245,158,11,0.3)', sub:'Scheduled exams' },
              ].map(s => (
                <div key={s.label} style={{
                  background:'white', borderRadius:16, padding:20,
                  boxShadow:`0 4px 20px ${s.shadow}`, display:'flex', alignItems:'center', gap:14,
                  transition:'transform 0.2s', cursor:'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                >
                  <div style={{
                    width:50, height:50, borderRadius:14, background:s.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:22, flexShrink:0, boxShadow:`0 4px 12px ${s.shadow}`,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:'#1a1a2e' }}>{s.value}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{s.label}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance ring + Upcoming exams */}
            <div className="grid-2">
              <div className="card">
                <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>📊 Attendance Overview</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Current semester</div>
                <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                  <div style={{ position:'relative', width:120, height:120 }}>
                    <svg width="120" height="120" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={attColor} strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - attPct / 100)}`}
                        strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ fontSize:22, fontWeight:800, color:attColor }}>{attPct}%</div>
                      <div style={{ fontSize:10, color:'#9ca3af' }}>Attendance</div>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    {attendance && [
                      { label:'Present', value:attendance.present, color:'#10b981' },
                      { label:'Absent', value:attendance.absent, color:'#ef4444' },
                      { label:'Late', value:attendance.late, color:'#f59e0b' },
                      { label:'Total', value:attendance.total_classes, color:'#6366f1' },
                    ].map(r => (
                      <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:r.color }} />
                          {r.label}
                        </div>
                        <span style={{ fontWeight:700, fontSize:14, color:r.color }}>{r.value}</span>
                      </div>
                    ))}
                    {attPct < 75 && (
                      <div style={{ background:'#fee2e2', borderRadius:8, padding:'8px 10px', fontSize:12, color:'#991b1b', marginTop:8 }}>
                        ⚠️ Attendance below 75% — risk of detention
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>📅 Upcoming Exams</div>
                {exams.length === 0
                  ? <div className="empty-state"><div className="empty-state-icon">📝</div><p>No upcoming exams</p></div>
                  : exams.map(e => (
                    <div key={e.id} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                      borderBottom:'1px solid #f3f4f6',
                    }}>
                      <div style={{
                        width:42, height:42, borderRadius:10, background:'#fef3c7',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
                      }}>📝</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{e.name}</div>
                        <div style={{ fontSize:12, color:'#9ca3af' }}>{e.course_name} · {e.exam_type}</div>
                      </div>
                      <span style={{ fontSize:12, background:'#fef3c7', color:'#92400e', padding:'3px 10px', borderRadius:20, fontWeight:600, whiteSpace:'nowrap' }}>
                        {e.exam_date}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {tab === 'Attendance' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>✅ My Attendance</div>
            {attendance ? (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
                  {[
                    { label:'Total Classes', value:attendance.total_classes, color:'#6366f1', bg:'#ede9fe' },
                    { label:'Present', value:attendance.present, color:'#10b981', bg:'#d1fae5' },
                    { label:'Absent', value:attendance.absent, color:'#ef4444', bg:'#fee2e2' },
                    { label:'Late', value:attendance.late, color:'#f59e0b', bg:'#fef3c7' },
                    { label:'Excused', value:attendance.excused, color:'#06b6d4', bg:'#cffafe' },
                    { label:'Percentage', value:`${attPct}%`, color:attColor, bg:attColor+'20' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign:'center', padding:16 }}>
                      <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>Attendance Progress</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                    <div style={{ flex:1, height:14, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${attPct}%`, background:`linear-gradient(90deg,${attColor},${attColor}99)`, borderRadius:99, transition:'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color:attColor, minWidth:40 }}>{attPct}%</span>
                  </div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>
                    {attPct >= 75 ? '✅ You meet the 75% attendance requirement.' : `⚠️ You need ${Math.ceil((0.75 * attendance.total_classes - attendance.present) / 0.25)} more classes to reach 75%.`}
                  </div>
                </div>
              </>
            ) : <div className="empty-state"><div className="empty-state-icon">✅</div><p>No attendance data</p></div>}
          </div>
        )}

        {/* ── GRADES TAB ── */}
        {tab === 'Grades' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>📊 My Grades</div>
            {grades.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">📊</div><p>No grades available yet</p></div>
              : (
                <div className="card">
                  <table>
                    <thead>
                      <tr><th>Exam</th><th>Course</th><th>Type</th><th>Marks</th><th>Max</th><th>Grade</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                      {grades.map(g => {
                        const pct = g.exam_max_marks ? Math.round((g.marks_obtained / g.exam_max_marks) * 100) : 0
                        const passed = g.marks_obtained >= (g.exam_pass_marks || 40)
                        return (
                          <tr key={g.id}>
                            <td style={{ fontWeight:600, fontSize:13 }}>{g.exam_name}</td>
                            <td style={{ fontSize:12, color:'#6b7280' }}>{g.course_name}</td>
                            <td><span className="badge badge-info">{g.exam_type}</span></td>
                            <td style={{ fontWeight:700, color: passed ? '#10b981' : '#ef4444' }}>{g.marks_obtained}</td>
                            <td style={{ color:'#9ca3af' }}>{g.exam_max_marks}</td>
                            <td><span className="badge badge-purple">{g.grade || '—'}</span></td>
                            <td><span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>{passed ? 'Pass' : 'Fail'}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ── FEES TAB ── */}
        {tab === 'Fees' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>💰 My Fees</div>
            {fees ? (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                  {[
                    { label:'Total Fee', value:`₹${Number(fees.total_fee).toLocaleString()}`, color:'#6366f1', bg:'#ede9fe' },
                    { label:'Amount Paid', value:`₹${Number(fees.total_paid).toLocaleString()}`, color:'#10b981', bg:'#d1fae5' },
                    { label:'Balance Due', value:`₹${Number(fees.balance).toLocaleString()}`, color: fees.balance > 0 ? '#ef4444' : '#10b981', bg: fees.balance > 0 ? '#fee2e2' : '#d1fae5' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {fees.payments?.length > 0 && (
                  <div className="card">
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Payment History</div>
                    <table>
                      <thead><tr><th>Fee Type</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {fees.payments.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontSize:13 }}>{p.fee_type}</td>
                            <td style={{ fontWeight:600 }}>₹{Number(p.amount_paid).toLocaleString()}</td>
                            <td style={{ fontSize:12 }}>{p.payment_method}</td>
                            <td style={{ fontSize:12 }}>{p.payment_date}</td>
                            <td><span className={`badge ${p.status === 'Paid' ? 'badge-success' : p.status === 'Pending' ? 'badge-danger' : 'badge-warning'}`}>{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : <div className="empty-state"><div className="empty-state-icon">💰</div><p>No fee data available</p></div>}
          </div>
        )}

        {/* ── EXAMS TAB ── */}
        {tab === 'Exams' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>📝 My Exams</div>
            {exams.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">📝</div><p>No upcoming exams</p></div>
              : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                  {exams.map(e => {
                    const daysLeft = Math.ceil((new Date(e.exam_date) - new Date()) / 86400000)
                    const urgency = daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981'
                    return (
                      <div key={e.id} className="card" style={{ borderLeft:`4px solid ${urgency}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                          <span className="badge badge-info">{e.exam_type}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:urgency }}>
                            {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow!' : `${daysLeft} days left`}
                          </span>
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{e.name}</div>
                        <div style={{ fontSize:13, color:'#6b7280', marginBottom:10 }}>{e.course_name}</div>
                        <div style={{ display:'flex', gap:12, fontSize:12, color:'#9ca3af' }}>
                          <span>📅 {e.exam_date}</span>
                          {e.start_time && <span>⏰ {e.start_time}</span>}
                          <span>📊 Max: {e.max_marks}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  )
}
