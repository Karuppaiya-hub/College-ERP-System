import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_SPORT = { name:'', category:'Team', description:'', coach_name:'', venue:'', max_team_size:11, is_active:true }
const EMPTY_TOURNAMENT = { sport:'', name:'', tournament_type:'Intra-College', start_date:'', end_date:'', venue:'', description:'', status:'Upcoming', prize_details:'' }
const EMPTY_PARTICIPATION = { student:'', sport:'', tournament:'', role:'Player', jersey_number:'', position:'', notes:'' }
const EMPTY_ACHIEVEMENT = { student:'', sport:'', tournament:'', achievement_type:'Winner', title:'', description:'', achievement_date:'', prize_amount:'' }

const SPORT_CATEGORIES = ['Team','Individual','Aquatics','Combat','Athletics']
const TOURNAMENT_TYPES = ['Intra-College','Inter-College','District','State','National']
const TOURNAMENT_STATUS = ['Upcoming','Ongoing','Completed','Cancelled']
const ROLES = ['Player','Captain','Vice-Captain','Coach','Manager']
const ACHIEVEMENT_TYPES = ['Winner','Runner-up','Third Place','Best Player','Best Bowler','Best Batsman','Participation','Special Award']

const STATUS_COLORS = {
  Upcoming:'badge-info', Ongoing:'badge-warning', Completed:'badge-success', Cancelled:'badge-danger',
  Winner:'badge-success', 'Runner-up':'badge-warning', 'Third Place':'badge-info', Participation:'badge-secondary',
}

const SPORT_ICONS = { Football:'⚽', Cricket:'🏏', Basketball:'🏀', Volleyball:'🏐', Tennis:'🎾', Badminton:'🏸', Swimming:'🏊', Athletics:'🏃', Chess:'♟️', Kabaddi:'🤼' }
const getSportIcon = name => SPORT_ICONS[name] || '🏅'

export default function Sports() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [sports, setSports] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [participations, setParticipations] = useState([])
  const [achievements, setAchievements] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/sports/stats/'),
      api.get('/sports/'),
      api.get('/sports/tournaments/'),
      api.get('/sports/participations/'),
      api.get('/sports/achievements/'),
      api.get('/students/'),
    ]).then(([st, sp, to, pa, ac, s]) => {
      setStats(st.data); setSports(sp.data); setTournaments(to.data)
      setParticipations(pa.data); setAchievements(ac.data); setStudents(s.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openModal = (type, item = null) => {
    setModal(type); setEditId(item?.id || null)
    const defaults = { sport: EMPTY_SPORT, tournament: EMPTY_TOURNAMENT, participation: EMPTY_PARTICIPATION, achievement: EMPTY_ACHIEVEMENT }
    setForm(item || defaults[type])
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    const endpoints = { sport: '/sports/', tournament: '/sports/tournaments/', participation: '/sports/participations/', achievement: '/sports/achievements/' }
    try {
      if (editId) await api.patch(`${endpoints[modal]}${editId}/`, form)
      else await api.post(endpoints[modal], form)
      setModal(null); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const del = async (type, id) => {
    const endpoints = { sport: '/sports/', tournament: '/sports/tournaments/', participation: '/sports/participations/', achievement: '/sports/achievements/' }
    if (!confirm('Delete?')) return
    await api.delete(`${endpoints[type]}${id}/`); loadAll()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="page-header">
        <h2>🏅 Sports Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => openModal('sport')}>+ Sport</button>
          <button className="btn btn-primary" onClick={() => openModal('tournament')}>+ Tournament</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { l:'Total Sports', v:stats.total_sports, icon:'🏅', bg:'#dbeafe' },
            { l:'Tournaments', v:stats.total_tournaments, icon:'🏆', bg:'#d1fae5' },
            { l:'Participants', v:stats.total_participants, icon:'🎽', bg:'#ede9fe' },
            { l:'Achievements', v:stats.total_achievements, icon:'🥇', bg:'#fef3c7' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.v}</h3><p>{s.l}</p></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:0, marginBottom:20 }}>
        {[['overview','📊 Overview'],['sports','🏅 Sports'],['tournaments','🏆 Tournaments'],['participations','🎽 Participants'],['achievements','🥇 Achievements']].map(([t,l],i,arr) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 20px', fontSize:13, fontWeight:500, border:'1px solid var(--border)',
            background: tab===t ? 'var(--primary)' : 'white', color: tab===t ? 'white' : '#374151',
            borderRadius: i===0 ? '8px 0 0 8px' : i===arr.length-1 ? '0 8px 8px 0' : 0,
          }}>{l}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          {tab === 'overview' && stats && (
            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>🏆 Recent Achievements</h3>
                {stats.recent_achievements?.length ? stats.recent_achievements.map((a,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:24 }}>{a.achievement_type==='Winner'?'🥇':a.achievement_type==='Runner-up'?'🥈':'🥉'}</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{a.title}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>{a.student_name} &nbsp;|&nbsp; {a.sport_name}</div>
                    </div>
                    <span className={`badge ${STATUS_COLORS[a.achievement_type]||'badge-secondary'}`} style={{ marginLeft:'auto' }}>{a.achievement_type}</span>
                  </div>
                )) : <p style={{ color:'#6b7280', fontSize:14 }}>No achievements yet</p>}
              </div>
              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>📅 Upcoming Tournaments</h3>
                {stats.upcoming_tournaments?.length ? stats.upcoming_tournaments.map((t,i) => (
                  <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{t.name}</div>
                        <div style={{ fontSize:12, color:'#6b7280' }}>{t.sport_name} &nbsp;|&nbsp; {t.tournament_type}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:12, color:'#6b7280' }}>📅 {t.start_date}</div>
                        <span className="badge badge-info">{t.status}</span>
                      </div>
                    </div>
                  </div>
                )) : <p style={{ color:'#6b7280', fontSize:14 }}>No upcoming tournaments</p>}
              </div>
            </div>
          )}

          {tab === 'sports' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
              {sports.length === 0 ? <div className="empty-state">No sports added</div>
                : sports.map(s => (
                  <div key={s.id} className="card" style={{ borderTop:`3px solid ${s.is_active ? '#6366f1' : '#d1d5db'}`, textAlign:'center' }}>
                    <div style={{ fontSize:48, marginBottom:8 }}>{getSportIcon(s.name)}</div>
                    <div style={{ fontWeight:700, fontSize:17 }}>{s.name}</div>
                    <span className="badge badge-info" style={{ margin:'6px 0' }}>{s.category}</span>
                    {s.coach_name && <p style={{ fontSize:13, color:'#6b7280', marginTop:6 }}>👨‍🏫 {s.coach_name}</p>}
                    {s.venue && <p style={{ fontSize:13, color:'#6b7280' }}>📍 {s.venue}</p>}
                    {s.description && <p style={{ fontSize:13, color:'#6b7280', marginTop:6 }}>{s.description}</p>}
                    <div style={{ display:'flex', gap:6, marginTop:12 }}>
                      <button className="btn btn-secondary" style={{ flex:1, fontSize:12, padding:'5px' }} onClick={() => openModal('sport', s)}>Edit</button>
                      <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('sport', s.id)}>Del</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'tournaments' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {tournaments.length === 0 ? <div className="empty-state card">No tournaments found</div>
                : tournaments.map(t => (
                  <div key={t.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontSize:20 }}>{getSportIcon(t.sport_name)}</span>
                          <span style={{ fontWeight:700, fontSize:16 }}>{t.name}</span>
                          <span className={`badge ${STATUS_COLORS[t.status]||'badge-secondary'}`}>{t.status}</span>
                          <span className="badge badge-info">{t.tournament_type}</span>
                        </div>
                        <p style={{ fontSize:13, color:'#6b7280' }}>🏅 {t.sport_name} &nbsp;|&nbsp; 📍 {t.venue}</p>
                        <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>📅 {t.start_date} → {t.end_date}</p>
                        {t.prize_details && <p style={{ fontSize:13, color:'#059669', marginTop:4 }}>🏆 {t.prize_details}</p>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => openModal('tournament', t)}>Edit</button>
                        <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('tournament', t.id)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'participations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                <button className="btn btn-primary" onClick={() => openModal('participation')}>+ Add Participant</button>
              </div>
              {participations.length === 0 ? <div className="empty-state card">No participants registered</div>
                : participations.map(p => (
                  <div key={p.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                          {getSportIcon(p.sport_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600 }}>{p.student_name}</div>
                          <div style={{ fontSize:13, color:'#6b7280' }}>
                            {p.sport_name} &nbsp;|&nbsp; {p.tournament_name || 'No tournament'} &nbsp;|&nbsp;
                            <span className="badge badge-info" style={{ marginLeft:4 }}>{p.role}</span>
                            {p.jersey_number && <span style={{ marginLeft:8 }}>👕 #{p.jersey_number}</span>}
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('participation', p.id)}>Del</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'achievements' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                <button className="btn btn-primary" onClick={() => openModal('achievement')}>+ Add Achievement</button>
              </div>
              {achievements.length === 0 ? <div className="empty-state card">No achievements recorded</div>
                : achievements.map(a => (
                  <div key={a.id} className="card" style={{ borderLeft:`4px solid ${a.achievement_type==='Winner'?'#f59e0b':a.achievement_type==='Runner-up'?'#9ca3af':'#6366f1'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <span style={{ fontSize:32 }}>{a.achievement_type==='Winner'?'🥇':a.achievement_type==='Runner-up'?'🥈':a.achievement_type==='Third Place'?'🥉':'🏅'}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                          <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>🎓 {a.student_name} &nbsp;|&nbsp; 🏅 {a.sport_name}</div>
                          {a.tournament_name && <div style={{ fontSize:13, color:'#6b7280' }}>🏆 {a.tournament_name}</div>}
                          {a.description && <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{a.description}</div>}
                          <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>📅 {a.achievement_date}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                        <span className={`badge ${STATUS_COLORS[a.achievement_type]||'badge-secondary'}`}>{a.achievement_type}</span>
                        {a.prize_amount && <span style={{ fontWeight:700, color:'#059669' }}>₹{a.prize_amount}</span>}
                        <button className="btn btn-danger" style={{ fontSize:12, padding:'4px 8px' }} onClick={() => del('achievement', a.id)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{{ sport:'🏅 Sport', tournament:'🏆 Tournament', participation:'🎽 Participant', achievement:'🥇 Achievement' }[modal]} {editId ? 'Edit' : 'Add'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={save}>
              {modal === 'sport' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Sport Name *</label><input value={form.name||''} onChange={e=>f('name',e.target.value)} required /></div>
                  <div className="form-group"><label>Category</label><select value={form.category||'Team'} onChange={e=>f('category',e.target.value)}>{SPORT_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Coach Name</label><input value={form.coach_name||''} onChange={e=>f('coach_name',e.target.value)} /></div>
                  <div className="form-group"><label>Venue</label><input value={form.venue||''} onChange={e=>f('venue',e.target.value)} /></div>
                  <div className="form-group"><label>Max Team Size</label><input type="number" value={form.max_team_size||11} onChange={e=>f('max_team_size',e.target.value)} /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>f('description',e.target.value)} /></div>
                </div>
              )}
              {modal === 'tournament' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Tournament Name *</label><input value={form.name||''} onChange={e=>f('name',e.target.value)} required /></div>
                  <div className="form-group"><label>Sport *</label><select value={form.sport||''} onChange={e=>f('sport',e.target.value)} required><option value="">Select Sport</option>{sports.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div className="form-group"><label>Type</label><select value={form.tournament_type||'Intra-College'} onChange={e=>f('tournament_type',e.target.value)}>{TOURNAMENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Start Date *</label><input type="date" value={form.start_date||''} onChange={e=>f('start_date',e.target.value)} required /></div>
                  <div className="form-group"><label>End Date</label><input type="date" value={form.end_date||''} onChange={e=>f('end_date',e.target.value)} /></div>
                  <div className="form-group"><label>Venue</label><input value={form.venue||''} onChange={e=>f('venue',e.target.value)} /></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Upcoming'} onChange={e=>f('status',e.target.value)}>{TOURNAMENT_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Prize Details</label><input value={form.prize_details||''} onChange={e=>f('prize_details',e.target.value)} /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>f('description',e.target.value)} /></div>
                </div>
              )}
              {modal === 'participation' && (
                <div className="grid-2">
                  <div className="form-group"><label>Student *</label><select value={form.student||''} onChange={e=>f('student',e.target.value)} required><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Sport *</label><select value={form.sport||''} onChange={e=>f('sport',e.target.value)} required><option value="">Select Sport</option>{sports.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div className="form-group"><label>Tournament</label><select value={form.tournament||''} onChange={e=>f('tournament',e.target.value)}><option value="">None</option>{tournaments.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                  <div className="form-group"><label>Role</label><select value={form.role||'Player'} onChange={e=>f('role',e.target.value)}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div className="form-group"><label>Jersey Number</label><input value={form.jersey_number||''} onChange={e=>f('jersey_number',e.target.value)} /></div>
                  <div className="form-group"><label>Position</label><input value={form.position||''} onChange={e=>f('position',e.target.value)} placeholder="e.g. Forward, Goalkeeper" /></div>
                </div>
              )}
              {modal === 'achievement' && (
                <div className="grid-2">
                  <div className="form-group"><label>Student *</label><select value={form.student||''} onChange={e=>f('student',e.target.value)} required><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Sport *</label><select value={form.sport||''} onChange={e=>f('sport',e.target.value)} required><option value="">Select Sport</option>{sports.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  <div className="form-group"><label>Tournament</label><select value={form.tournament||''} onChange={e=>f('tournament',e.target.value)}><option value="">None</option>{tournaments.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                  <div className="form-group"><label>Achievement Type</label><select value={form.achievement_type||'Winner'} onChange={e=>f('achievement_type',e.target.value)}>{ACHIEVEMENT_TYPES.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Title *</label><input value={form.title||''} onChange={e=>f('title',e.target.value)} required /></div>
                  <div className="form-group"><label>Achievement Date *</label><input type="date" value={form.achievement_date||''} onChange={e=>f('achievement_date',e.target.value)} required /></div>
                  <div className="form-group"><label>Prize Amount (₹)</label><input type="number" value={form.prize_amount||''} onChange={e=>f('prize_amount',e.target.value)} /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>f('description',e.target.value)} /></div>
                </div>
              )}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
