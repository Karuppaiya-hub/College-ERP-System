import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_LAB = { name:'', lab_code:'', department:'CSE', location:'', capacity:30, lab_incharge:null, status:'Available', description:'', specialization:'' }
const EMPTY_EQ = { lab:'', name:'', equipment_id:'', brand:'', model:'', quantity:1, working_count:1, purchase_date:'', purchase_cost:'', status:'Working', last_maintenance:'', next_maintenance:'', remarks:'' }
const EMPTY_BOOKING = { lab:'', booked_by:'', course:null, booking_date:'', start_time:'', end_time:'', purpose:'', student_count:0 }
const DEPTS = ['CSE','ECE','EEE','ME','CE','IT']

export default function Laboratory() {
  const [tab, setTab] = useState('labs')
  const [labs, setLabs] = useState([])
  const [equipment, setEquipment] = useState([])
  const [bookings, setBookings] = useState([])
  const [faculty, setFaculty] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/labs/'),
      api.get('/labs/equipment/'),
      api.get('/labs/bookings/'),
      api.get('/faculty/'),
      api.get('/courses/'),
      api.get('/labs/stats/'),
    ]).then(([l, e, b, f, c, s]) => {
      setLabs(l.data); setEquipment(e.data); setBookings(b.data)
      setFaculty(f.data); setCourses(c.data); setStats(s.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openModal = (type, data = null) => {
    setModal(type); setEditing(data?.id || null)
    if (type === 'lab') setForm(data ? { ...data, lab_incharge: data.lab_incharge || null } : EMPTY_LAB)
    if (type === 'equipment') setForm(data ? { ...data, purchase_date: data.purchase_date||'', last_maintenance: data.last_maintenance||'', next_maintenance: data.next_maintenance||'' } : EMPTY_EQ)
    if (type === 'booking') setForm(EMPTY_BOOKING)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const endpoints = { lab: '/labs/', equipment: '/labs/equipment/', booking: '/labs/bookings/' }
      const payload = { ...form }
      if (modal === 'lab' && !payload.lab_incharge) payload.lab_incharge = null
      if (modal === 'equipment') ['purchase_date','last_maintenance','next_maintenance'].forEach(k => { if (!payload[k]) delete payload[k] })
      if (modal === 'booking' && !payload.course) payload.course = null
      if (editing) await api.patch(`${endpoints[modal]}${editing}/`, payload)
      else await api.post(endpoints[modal], payload)
      setModal(null); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const del = async (type, id) => {
    if (!confirm('Delete?')) return
    const endpoints = { lab: '/labs/', equipment: '/labs/equipment/' }
    await api.delete(`${endpoints[type]}${id}/`); loadAll()
  }

  const updateBooking = async (id, status) => {
    await api.patch(`/labs/bookings/${id}/`, { status }); loadAll()
  }

  const statusColor = { Available: 'badge-success', Occupied: 'badge-warning', Maintenance: 'badge-danger' }
  const eqColor = { Working: 'badge-success', Faulty: 'badge-danger', 'Under Repair': 'badge-warning', Condemned: 'badge-secondary' }
  const bookColor = { Pending: 'badge-warning', Approved: 'badge-success', Rejected: 'badge-danger', Completed: 'badge-secondary', Cancelled: 'badge-secondary' }

  return (
    <div>
      <div className="page-header">
        <h2>🔬 Laboratory Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => openModal('lab')}>+ Add Lab</button>
          <button className="btn btn-secondary" onClick={() => openModal('equipment')}>+ Add Equipment</button>
          <button className="btn btn-primary" onClick={() => openModal('booking')}>+ Book Lab</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { l:'Total Labs', v:stats.total_labs, icon:'🔬', bg:'#ede9fe' },
            { l:'Available', v:stats.available_labs, icon:'✅', bg:'#d1fae5' },
            { l:'Total Equipment', v:stats.total_equipment, icon:'🖥️', bg:'#dbeafe' },
            { l:'Faulty Equipment', v:stats.faulty_equipment, icon:'⚠️', bg:'#fee2e2' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.v}</h3><p>{s.l}</p></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:0, marginBottom:20 }}>
        {['labs','equipment','bookings'].map((t,i,arr) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 20px', fontSize:14, fontWeight:500, border:'1px solid var(--border)',
            background: tab===t ? 'var(--primary)' : 'white', color: tab===t ? 'white' : '#374151',
            borderRadius: i===0 ? '8px 0 0 8px' : i===arr.length-1 ? '0 8px 8px 0' : '0',
            textTransform:'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          {tab === 'labs' && (
            <div className="grid-2">
              {labs.length === 0 ? <div className="empty-state card" style={{ gridColumn:'span 2' }}>No labs found</div>
                : labs.map(l => (
                  <div key={l.id} className="card" style={{ borderLeft:'4px solid var(--secondary)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize:17, fontWeight:700 }}>{l.name}</h3>
                        <div style={{ display:'flex', gap:6, marginTop:4 }}>
                          <span className="badge badge-info">{l.lab_code}</span>
                          <span className="badge badge-secondary">{l.department}</span>
                          <span className={`badge ${statusColor[l.status]}`}>{l.status}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => openModal('lab', l)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => del('lab', l.id)}>Del</button>
                      </div>
                    </div>
                    <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {[['Capacity', l.capacity], ['Equipment', l.equipment_count], ['Incharge', l.incharge_name||'—'], ['Location', l.location||'—']].map(([k,v]) => (
                        <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'8px 12px' }}>
                          <div style={{ fontSize:11, color:'#6b7280' }}>{k}</div>
                          <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {l.specialization && <p style={{ marginTop:8, fontSize:13, color:'#6b7280' }}>🏷️ {l.specialization}</p>}
                  </div>
                ))}
            </div>
          )}

          {tab === 'equipment' && (
            <div className="card">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Lab</th><th>Brand</th><th>Qty</th><th>Working</th><th>Status</th><th>Next Maintenance</th><th>Actions</th></tr></thead>
                <tbody>
                  {equipment.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>No equipment found</td></tr>
                    : equipment.map(eq => (
                      <tr key={eq.id}>
                        <td style={{ fontSize:13, fontWeight:600 }}>{eq.equipment_id}</td>
                        <td>{eq.name}</td>
                        <td style={{ fontSize:13 }}>{eq.lab_name}</td>
                        <td style={{ fontSize:13 }}>{eq.brand||'—'}</td>
                        <td>{eq.quantity}</td>
                        <td><span className={`badge ${eq.working_count === eq.quantity ? 'badge-success' : 'badge-warning'}`}>{eq.working_count}/{eq.quantity}</span></td>
                        <td><span className={`badge ${eqColor[eq.status]||'badge-secondary'}`}>{eq.status}</span></td>
                        <td style={{ fontSize:13 }}>{eq.next_maintenance||'—'}</td>
                        <td style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => openModal('equipment', eq)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => del('equipment', eq.id)}>Del</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'bookings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {bookings.length === 0 ? <div className="empty-state card">No bookings found</div>
                : bookings.map(b => (
                  <div key={b.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:15 }}>{b.lab_name}</span>
                          <span className={`badge ${bookColor[b.status]||'badge-secondary'}`}>{b.status}</span>
                        </div>
                        <p style={{ fontSize:13, color:'#6b7280' }}>
                          👨‍🏫 {b.faculty_name} &nbsp;|&nbsp; 📅 {b.booking_date} &nbsp;|&nbsp; ⏰ {b.start_time} - {b.end_time} &nbsp;|&nbsp; 👥 {b.student_count} students
                        </p>
                        <p style={{ fontSize:14, marginTop:4 }}>📋 {b.purpose}</p>
                        {b.course_name && <p style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>📚 {b.course_name}</p>}
                      </div>
                      {b.status === 'Pending' && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-success" style={{ padding:'5px 12px', fontSize:13 }} onClick={() => updateBooking(b.id, 'Approved')}>Approve</button>
                          <button className="btn btn-danger" style={{ padding:'5px 12px', fontSize:13 }} onClick={() => updateBooking(b.id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                      {b.status === 'Approved' && (
                        <button className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:13 }} onClick={() => updateBooking(b.id, 'Completed')}>Mark Done</button>
                      )}
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
              <h3>{{ lab: editing?'Edit Lab':'Add Lab', equipment: editing?'Edit Equipment':'Add Equipment', booking:'Book Laboratory' }[modal]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={save}>
              {modal === 'lab' && (
                <div className="grid-2">
                  <div className="form-group"><label>Lab Code *</label><input value={form.lab_code||''} onChange={e=>setForm({...form,lab_code:e.target.value})} required /></div>
                  <div className="form-group"><label>Department</label><select value={form.department||'CSE'} onChange={e=>setForm({...form,department:e.target.value})}>{DEPTS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Lab Name *</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                  <div className="form-group"><label>Location</label><input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})} /></div>
                  <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity||30} onChange={e=>setForm({...form,capacity:e.target.value})} /></div>
                  <div className="form-group"><label>Lab Incharge</label><select value={form.lab_incharge||''} onChange={e=>setForm({...form,lab_incharge:e.target.value||null})}><option value="">— None —</option>{faculty.map(f=><option key={f.id} value={f.id}>{f.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Available'} onChange={e=>setForm({...form,status:e.target.value})}>{['Available','Occupied','Maintenance'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Specialization</label><input value={form.specialization||''} onChange={e=>setForm({...form,specialization:e.target.value})} placeholder="e.g. Machine Learning, VLSI Design" /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                </div>
              )}
              {modal === 'equipment' && (
                <div className="grid-2">
                  <div className="form-group"><label>Equipment ID *</label><input value={form.equipment_id||''} onChange={e=>setForm({...form,equipment_id:e.target.value})} required /></div>
                  <div className="form-group"><label>Lab *</label><select value={form.lab||''} onChange={e=>setForm({...form,lab:e.target.value})} required><option value="">Select Lab</option>{labs.map(l=><option key={l.id} value={l.id}>{l.lab_code} - {l.name}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Equipment Name *</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                  <div className="form-group"><label>Brand</label><input value={form.brand||''} onChange={e=>setForm({...form,brand:e.target.value})} /></div>
                  <div className="form-group"><label>Model</label><input value={form.model||''} onChange={e=>setForm({...form,model:e.target.value})} /></div>
                  <div className="form-group"><label>Quantity</label><input type="number" min={1} value={form.quantity||1} onChange={e=>setForm({...form,quantity:e.target.value})} /></div>
                  <div className="form-group"><label>Working Count</label><input type="number" min={0} value={form.working_count||1} onChange={e=>setForm({...form,working_count:e.target.value})} /></div>
                  <div className="form-group"><label>Purchase Cost</label><input type="number" value={form.purchase_cost||''} onChange={e=>setForm({...form,purchase_cost:e.target.value})} /></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Working'} onChange={e=>setForm({...form,status:e.target.value})}>{['Working','Faulty','Under Repair','Condemned'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>Last Maintenance</label><input type="date" value={form.last_maintenance||''} onChange={e=>setForm({...form,last_maintenance:e.target.value})} /></div>
                  <div className="form-group"><label>Next Maintenance</label><input type="date" value={form.next_maintenance||''} onChange={e=>setForm({...form,next_maintenance:e.target.value})} /></div>
                </div>
              )}
              {modal === 'booking' && (
                <div className="grid-2">
                  <div className="form-group"><label>Lab *</label><select value={form.lab||''} onChange={e=>setForm({...form,lab:e.target.value})} required><option value="">Select Lab</option>{labs.filter(l=>l.status==='Available').map(l=><option key={l.id} value={l.id}>{l.lab_code} - {l.name}</option>)}</select></div>
                  <div className="form-group"><label>Faculty *</label><select value={form.booked_by||''} onChange={e=>setForm({...form,booked_by:e.target.value})} required><option value="">Select Faculty</option>{faculty.map(f=><option key={f.id} value={f.id}>{f.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Course</label><select value={form.course||''} onChange={e=>setForm({...form,course:e.target.value||null})}><option value="">— None —</option>{courses.map(c=><option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
                  <div className="form-group"><label>Booking Date *</label><input type="date" value={form.booking_date||''} onChange={e=>setForm({...form,booking_date:e.target.value})} required /></div>
                  <div className="form-group"><label>Start Time *</label><input type="time" value={form.start_time||''} onChange={e=>setForm({...form,start_time:e.target.value})} required /></div>
                  <div className="form-group"><label>End Time *</label><input type="time" value={form.end_time||''} onChange={e=>setForm({...form,end_time:e.target.value})} required /></div>
                  <div className="form-group"><label>Student Count</label><input type="number" value={form.student_count||0} onChange={e=>setForm({...form,student_count:e.target.value})} /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Purpose *</label><input value={form.purpose||''} onChange={e=>setForm({...form,purpose:e.target.value})} required placeholder="e.g. Practical Session - Data Structures" /></div>
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
