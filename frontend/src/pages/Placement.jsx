import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_COMPANY = { name:'', industry:'Technology', website:'', description:'', hr_contact_name:'', hr_contact_email:'', hr_contact_phone:'', is_active:true }
const EMPTY_DRIVE = { company:'', title:'', drive_date:'', registration_deadline:'', job_role:'', job_type:'Full-time', package_lpa:'', location:'', eligibility_criteria:'', description:'', status:'Upcoming' }
const EMPTY_APP = { student:'', drive:'', status:'Applied', notes:'' }
const EMPTY_INTERVIEW = { application:'', round_number:1, interview_type:'Technical', scheduled_date:'', duration_minutes:60, interviewer_name:'', location:'', notes:'', result:'Pending' }

const INDUSTRIES = ['Technology','Finance','Healthcare','Manufacturing','Consulting','Education','Retail','Other']
const JOB_TYPES = ['Full-time','Part-time','Internship','Contract']
const DRIVE_STATUS = ['Upcoming','Ongoing','Completed','Cancelled']
const APP_STATUS = ['Applied','Shortlisted','Interview Scheduled','Selected','Rejected','Withdrawn']
const INTERVIEW_TYPES = ['Technical','HR','Managerial','Group Discussion','Aptitude']
const INTERVIEW_RESULTS = ['Pending','Passed','Failed','On Hold']

const STATUS_COLORS = {
  Applied:'badge-info', Shortlisted:'badge-warning', 'Interview Scheduled':'badge-info',
  Selected:'badge-success', Rejected:'badge-danger', Withdrawn:'badge-secondary',
  Upcoming:'badge-info', Ongoing:'badge-warning', Completed:'badge-success', Cancelled:'badge-danger',
  Passed:'badge-success', Failed:'badge-danger', Pending:'badge-warning', 'On Hold':'badge-secondary',
}

export default function Placement() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [drives, setDrives] = useState([])
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'company'|'drive'|'app'|'interview'
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/placement/stats/'),
      api.get('/placement/companies/'),
      api.get('/placement/drives/'),
      api.get('/placement/applications/'),
      api.get('/placement/interviews/'),
      api.get('/students/'),
    ]).then(([st, co, dr, ap, iv, s]) => {
      setStats(st.data); setCompanies(co.data); setDrives(dr.data)
      setApplications(ap.data); setInterviews(iv.data); setStudents(s.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openModal = (type, item = null) => {
    setModal(type); setEditId(item?.id || null)
    const defaults = { company: EMPTY_COMPANY, drive: EMPTY_DRIVE, app: EMPTY_APP, interview: EMPTY_INTERVIEW }
    setForm(item || defaults[type])
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    const endpoints = { company: '/placement/companies/', drive: '/placement/drives/', app: '/placement/applications/', interview: '/placement/interviews/' }
    try {
      if (editId) await api.patch(`${endpoints[modal]}${editId}/`, form)
      else await api.post(endpoints[modal], form)
      setModal(null); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const del = async (type, id) => {
    const endpoints = { company: '/placement/companies/', drive: '/placement/drives/', app: '/placement/applications/', interview: '/placement/interviews/' }
    if (!confirm('Delete?')) return
    await api.delete(`${endpoints[type]}${id}/`); loadAll()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="page-header">
        <h2>💼 Placement Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => openModal('company')}>+ Company</button>
          <button className="btn btn-primary" onClick={() => openModal('drive')}>+ Drive</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { l:'Companies', v:stats.total_companies, icon:'🏢', bg:'#dbeafe' },
            { l:'Active Drives', v:stats.active_drives, icon:'📋', bg:'#d1fae5' },
            { l:'Students Placed', v:stats.students_placed, icon:'🎓', bg:'#ede9fe' },
            { l:'Avg Package', v:`${stats.avg_package || 0} LPA`, icon:'💰', bg:'#fef3c7' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.v}</h3><p>{s.l}</p></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:0, marginBottom:20 }}>
        {[['overview','📊 Overview'],['companies','🏢 Companies'],['drives','📋 Drives'],['applications','📝 Applications'],['interviews','🎤 Interviews']].map(([t,l],i,arr) => (
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
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>🏆 Top Recruiters</h3>
                {stats.top_companies?.length ? stats.top_companies.map((c,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{ width:28, height:28, borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{i+1}</span>
                      <span style={{ fontWeight:600, fontSize:14 }}>{c.company__name}</span>
                    </div>
                    <span className="badge badge-success">{c.selected} selected</span>
                  </div>
                )) : <p style={{ color:'#6b7280', fontSize:14 }}>No data yet</p>}
              </div>
              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>📊 Application Status</h3>
                {stats.application_stats?.length ? stats.application_stats.map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span className={`badge ${STATUS_COLORS[s.status]||'badge-secondary'}`}>{s.status}</span>
                    <span style={{ fontWeight:700, fontSize:16 }}>{s.count}</span>
                  </div>
                )) : <p style={{ color:'#6b7280', fontSize:14 }}>No applications yet</p>}
              </div>
            </div>
          )}

          {tab === 'companies' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
              {companies.length === 0 ? <div className="empty-state">No companies added</div>
                : companies.map(c => (
                  <div key={c.id} className="card" style={{ borderTop:`3px solid ${c.is_active ? '#6366f1' : '#d1d5db'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:16 }}>🏢 {c.name}</div>
                        <span className="badge badge-info" style={{ marginTop:4 }}>{c.industry}</span>
                      </div>
                      <span className={`badge ${c.is_active ? 'badge-success' : 'badge-secondary'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    {c.description && <p style={{ fontSize:13, color:'#6b7280', marginTop:8 }}>{c.description}</p>}
                    {c.hr_contact_name && <p style={{ fontSize:13, marginTop:8 }}>👤 {c.hr_contact_name} &nbsp;|&nbsp; 📧 {c.hr_contact_email}</p>}
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'var(--primary)' }}>🔗 {c.website}</a>}
                    <div style={{ display:'flex', gap:6, marginTop:12 }}>
                      <button className="btn btn-secondary" style={{ flex:1, fontSize:12, padding:'5px' }} onClick={() => openModal('company', c)}>Edit</button>
                      <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('company', c.id)}>Del</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'drives' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {drives.length === 0 ? <div className="empty-state card">No drives scheduled</div>
                : drives.map(d => (
                  <div key={d.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:16 }}>{d.title}</span>
                          <span className={`badge ${STATUS_COLORS[d.status]||'badge-secondary'}`}>{d.status}</span>
                          <span className="badge badge-info">{d.job_type}</span>
                        </div>
                        <p style={{ fontSize:13, color:'#6b7280' }}>🏢 {d.company_name} &nbsp;|&nbsp; 💼 {d.job_role} &nbsp;|&nbsp; 📍 {d.location}</p>
                        <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>📅 Drive: {d.drive_date} &nbsp;|&nbsp; ⏰ Deadline: {d.registration_deadline}</p>
                        {d.package_lpa && <p style={{ fontSize:14, fontWeight:600, color:'#059669', marginTop:4 }}>💰 {d.package_lpa} LPA</p>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => openModal('drive', d)}>Edit</button>
                        <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('drive', d.id)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'applications' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                <button className="btn btn-primary" onClick={() => openModal('app')}>+ Add Application</button>
              </div>
              {applications.length === 0 ? <div className="empty-state card">No applications yet</div>
                : applications.map(a => (
                  <div key={a.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <span style={{ fontWeight:600 }}>🎓 {a.student_name}</span>
                          <span style={{ color:'#6b7280', fontSize:13 }}>→</span>
                          <span style={{ fontWeight:600 }}>📋 {a.drive_title}</span>
                          <span className={`badge ${STATUS_COLORS[a.status]||'badge-secondary'}`}>{a.status}</span>
                        </div>
                        <p style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>Applied: {new Date(a.applied_date).toLocaleDateString()}</p>
                        {a.notes && <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>📝 {a.notes}</p>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <select style={{ padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }}
                          value={a.status} onChange={async e => { await api.patch(`/placement/applications/${a.id}/`, { status: e.target.value }); loadAll() }}>
                          {APP_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('app', a.id)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'interviews' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                <button className="btn btn-primary" onClick={() => openModal('interview')}>+ Schedule Interview</button>
              </div>
              {interviews.length === 0 ? <div className="empty-state card">No interviews scheduled</div>
                : interviews.map(iv => (
                  <div key={iv.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontWeight:600 }}>Round {iv.round_number}</span>
                          <span className="badge badge-info">{iv.interview_type}</span>
                          <span className={`badge ${STATUS_COLORS[iv.result]||'badge-secondary'}`}>{iv.result}</span>
                        </div>
                        <p style={{ fontSize:13, color:'#6b7280' }}>📅 {new Date(iv.scheduled_date).toLocaleString()} &nbsp;|&nbsp; ⏱️ {iv.duration_minutes} min</p>
                        {iv.interviewer_name && <p style={{ fontSize:13, color:'#6b7280' }}>👤 {iv.interviewer_name} &nbsp;|&nbsp; 📍 {iv.location}</p>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <select style={{ padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }}
                          value={iv.result} onChange={async e => { await api.patch(`/placement/interviews/${iv.id}/`, { result: e.target.value }); loadAll() }}>
                          {INTERVIEW_RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button className="btn btn-danger" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => del('interview', iv.id)}>Del</button>
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
              <h3>{{ company:'🏢 Company', drive:'📋 Drive', app:'📝 Application', interview:'🎤 Interview' }[modal]} {editId ? 'Edit' : 'Add'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={save}>
              {modal === 'company' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Company Name *</label><input value={form.name||''} onChange={e=>f('name',e.target.value)} required /></div>
                  <div className="form-group"><label>Industry</label><select value={form.industry||'Technology'} onChange={e=>f('industry',e.target.value)}>{INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}</select></div>
                  <div className="form-group"><label>Website</label><input value={form.website||''} onChange={e=>f('website',e.target.value)} placeholder="https://..." /></div>
                  <div className="form-group"><label>HR Contact Name</label><input value={form.hr_contact_name||''} onChange={e=>f('hr_contact_name',e.target.value)} /></div>
                  <div className="form-group"><label>HR Email</label><input type="email" value={form.hr_contact_email||''} onChange={e=>f('hr_contact_email',e.target.value)} /></div>
                  <div className="form-group"><label>HR Phone</label><input value={form.hr_contact_phone||''} onChange={e=>f('hr_contact_phone',e.target.value)} /></div>
                  <div className="form-group" style={{display:'flex',alignItems:'center',gap:8,paddingTop:24}}><label style={{display:'flex',gap:6,alignItems:'center',cursor:'pointer'}}><input type="checkbox" checked={form.is_active!==false} onChange={e=>f('is_active',e.target.checked)} /> Active</label></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>f('description',e.target.value)} /></div>
                </div>
              )}
              {modal === 'drive' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Drive Title *</label><input value={form.title||''} onChange={e=>f('title',e.target.value)} required /></div>
                  <div className="form-group"><label>Company *</label><select value={form.company||''} onChange={e=>f('company',e.target.value)} required><option value="">Select Company</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="form-group"><label>Job Role *</label><input value={form.job_role||''} onChange={e=>f('job_role',e.target.value)} required /></div>
                  <div className="form-group"><label>Job Type</label><select value={form.job_type||'Full-time'} onChange={e=>f('job_type',e.target.value)}>{JOB_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Package (LPA)</label><input type="number" step="0.1" value={form.package_lpa||''} onChange={e=>f('package_lpa',e.target.value)} /></div>
                  <div className="form-group"><label>Drive Date *</label><input type="date" value={form.drive_date||''} onChange={e=>f('drive_date',e.target.value)} required /></div>
                  <div className="form-group"><label>Registration Deadline</label><input type="date" value={form.registration_deadline||''} onChange={e=>f('registration_deadline',e.target.value)} /></div>
                  <div className="form-group"><label>Location</label><input value={form.location||''} onChange={e=>f('location',e.target.value)} /></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Upcoming'} onChange={e=>f('status',e.target.value)}>{DRIVE_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Eligibility Criteria</label><textarea rows={2} value={form.eligibility_criteria||''} onChange={e=>f('eligibility_criteria',e.target.value)} /></div>
                </div>
              )}
              {modal === 'app' && (
                <div className="grid-2">
                  <div className="form-group"><label>Student *</label><select value={form.student||''} onChange={e=>f('student',e.target.value)} required><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Drive *</label><select value={form.drive||''} onChange={e=>f('drive',e.target.value)} required><option value="">Select Drive</option>{drives.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Applied'} onChange={e=>f('status',e.target.value)}>{APP_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>Notes</label><input value={form.notes||''} onChange={e=>f('notes',e.target.value)} /></div>
                </div>
              )}
              {modal === 'interview' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Application *</label><select value={form.application||''} onChange={e=>f('application',e.target.value)} required><option value="">Select Application</option>{applications.map(a=><option key={a.id} value={a.id}>{a.student_name} → {a.drive_title}</option>)}</select></div>
                  <div className="form-group"><label>Round Number</label><input type="number" min="1" value={form.round_number||1} onChange={e=>f('round_number',e.target.value)} /></div>
                  <div className="form-group"><label>Interview Type</label><select value={form.interview_type||'Technical'} onChange={e=>f('interview_type',e.target.value)}>{INTERVIEW_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Scheduled Date *</label><input type="datetime-local" value={form.scheduled_date||''} onChange={e=>f('scheduled_date',e.target.value)} required /></div>
                  <div className="form-group"><label>Duration (min)</label><input type="number" value={form.duration_minutes||60} onChange={e=>f('duration_minutes',e.target.value)} /></div>
                  <div className="form-group"><label>Interviewer Name</label><input value={form.interviewer_name||''} onChange={e=>f('interviewer_name',e.target.value)} /></div>
                  <div className="form-group"><label>Location / Link</label><input value={form.location||''} onChange={e=>f('location',e.target.value)} /></div>
                  <div className="form-group"><label>Result</label><select value={form.result||'Pending'} onChange={e=>f('result',e.target.value)}>{INTERVIEW_RESULTS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Notes</label><textarea rows={2} value={form.notes||''} onChange={e=>f('notes',e.target.value)} /></div>
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
