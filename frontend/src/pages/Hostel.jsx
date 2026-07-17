import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_HOSTEL = { name:'', hostel_type:'Boys', warden_name:'', warden_phone:'', warden_email:'', total_rooms:0, total_capacity:0, address:'', amenities:'', monthly_fee:'' }
const EMPTY_ROOM = { hostel:'', room_number:'', floor:1, room_type:'Double', capacity:2, status:'Available', has_ac:false, has_attached_bath:false, monthly_rent:'' }
const EMPTY_ALLOTMENT = { student:'', room:'', allotment_date:'', remarks:'' }
const EMPTY_COMPLAINT = { student:'', hostel:'', room:'', category:'Electrical', title:'', description:'', priority:'Medium' }

export default function Hostel() {
  const [tab, setTab] = useState('overview')
  const [hostels, setHostels] = useState([])
  const [rooms, setRooms] = useState([])
  const [allotments, setAllotments] = useState([])
  const [complaints, setComplaints] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/hostel/'),
      api.get('/hostel/rooms/'),
      api.get('/hostel/allotments/'),
      api.get('/hostel/complaints/'),
      api.get('/students/'),
      api.get('/hostel/stats/'),
    ]).then(([h, r, a, c, s, st]) => {
      setHostels(h.data); setRooms(r.data); setAllotments(a.data)
      setComplaints(c.data); setStudents(s.data); setStats(st.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openModal = (type, data = null) => {
    setModal(type); setEditing(data?.id || null)
    if (type === 'hostel') setForm(data || EMPTY_HOSTEL)
    if (type === 'room') setForm(data || EMPTY_ROOM)
    if (type === 'allotment') setForm(EMPTY_ALLOTMENT)
    if (type === 'complaint') setForm(EMPTY_COMPLAINT)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const endpoints = { hostel: '/hostel/', room: '/hostel/rooms/', allotment: '/hostel/allotments/', complaint: '/hostel/complaints/' }
      if (editing) await api.patch(`${endpoints[modal]}${editing}/`, form)
      else await api.post(endpoints[modal], form)
      setModal(null); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const updateComplaint = async (id, status) => {
    await api.patch(`/hostel/complaints/${id}/`, { status }); loadAll()
  }

  const vacate = async id => {
    if (!confirm('Vacate this allotment?')) return
    await api.patch(`/hostel/allotments/${id}/`, { status: 'Vacated', vacating_date: new Date().toISOString().split('T')[0] })
    loadAll()
  }

  const tabs = ['overview', 'rooms', 'allotments', 'complaints']

  const priorityColor = p => ({ Low: '#d1fae5', Medium: '#fef3c7', High: '#fee2e2', Urgent: '#fecaca' }[p] || '#f3f4f6')
  const statusBadge = (s, map) => <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>

  return (
    <div>
      <div className="page-header">
        <h2>🏠 Hostel Management</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => openModal('hostel')}>+ Add Hostel</button>
          <button className="btn btn-secondary" onClick={() => openModal('room')}>+ Add Room</button>
          <button className="btn btn-primary" onClick={() => openModal('allotment')}>+ Allot Room</button>
          <button className="btn" style={{ background: '#f59e0b', color: 'white' }} onClick={() => openModal('complaint')}>+ Complaint</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { l: 'Total Hostels', v: stats.total_hostels, icon: '🏠', bg: '#ede9fe' },
            { l: 'Available Rooms', v: stats.available_rooms, icon: '🚪', bg: '#d1fae5' },
            { l: 'Occupied Rooms', v: stats.occupied_rooms, icon: '👥', bg: '#dbeafe' },
            { l: 'Open Complaints', v: stats.open_complaints, icon: '⚠️', bg: '#fee2e2' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.v}</h3><p>{s.l}</p></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 18px', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)',
            background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : '#374151',
            borderRadius: i === 0 ? '8px 0 0 8px' : i === tabs.length - 1 ? '0 8px 8px 0' : '0',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          {tab === 'overview' && (
            <div className="grid-2">
              {hostels.map(h => (
                <div key={h.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700 }}>{h.name}</h3>
                      <span className="badge badge-info" style={{ marginTop: 4 }}>{h.hostel_type}</span>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 13 }} onClick={() => openModal('hostel', h)}>Edit</button>
                  </div>
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['Warden', h.warden_name || '—'], ['Phone', h.warden_phone || '—'], ['Total Rooms', h.total_rooms], ['Capacity', h.total_capacity], ['Available', h.available_rooms], ['Monthly Fee', `₹${h.monthly_fee}`]].map(([l, v]) => (
                      <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{l}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {h.amenities && <p style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>🏷️ {h.amenities}</p>}
                </div>
              ))}
              {hostels.length === 0 && <div className="empty-state" style={{ gridColumn: 'span 2' }}>No hostels added yet</div>}
            </div>
          )}

          {tab === 'rooms' && (
            <div className="card">
              <table>
                <thead><tr><th>Hostel</th><th>Room No</th><th>Floor</th><th>Type</th><th>Capacity</th><th>Occupancy</th><th>AC</th><th>Status</th><th>Rent</th><th>Action</th></tr></thead>
                <tbody>
                  {rooms.length === 0 ? <tr><td colSpan={10} className="empty-state">No rooms found</td></tr>
                    : rooms.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 13 }}>{hostels.find(h => h.id === r.hostel)?.name || r.hostel}</td>
                        <td style={{ fontWeight: 600 }}>{r.room_number}</td>
                        <td>{r.floor}</td>
                        <td><span className="badge badge-info">{r.room_type}</span></td>
                        <td>{r.capacity}</td>
                        <td>{r.current_occupancy}/{r.capacity}</td>
                        <td>{r.has_ac ? '❄️' : '—'}</td>
                        <td>{statusBadge(r.status, { Available: 'badge-success', Occupied: 'badge-danger', Maintenance: 'badge-warning', Reserved: 'badge-info' })}</td>
                        <td>₹{r.monthly_rent}</td>
                        <td><button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openModal('room', r)}>Edit</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'allotments' && (
            <div className="card">
              <table>
                <thead><tr><th>Student</th><th>Roll No</th><th>Hostel</th><th>Room</th><th>Allotment Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {allotments.length === 0 ? <tr><td colSpan={7} className="empty-state">No allotments found</td></tr>
                    : allotments.map(a => (
                      <tr key={a.id}>
                        <td>{a.student_name}</td>
                        <td style={{ fontSize: 13 }}>{a.student_roll}</td>
                        <td style={{ fontSize: 13 }}>{a.hostel_name}</td>
                        <td style={{ fontWeight: 600 }}>{a.room_number}</td>
                        <td style={{ fontSize: 13 }}>{a.allotment_date}</td>
                        <td>{statusBadge(a.status, { Active: 'badge-success', Vacated: 'badge-secondary', Suspended: 'badge-danger' })}</td>
                        <td>{a.status === 'Active' && <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => vacate(a.id)}>Vacate</button>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'complaints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complaints.length === 0 ? <div className="empty-state card">No complaints found</div>
                : complaints.map(c => (
                  <div key={c.id} className="card" style={{ borderLeft: `4px solid ${priorityColor(c.priority)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</span>
                          <span className="badge badge-info">{c.category}</span>
                          <span style={{ background: priorityColor(c.priority), padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{c.priority}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{c.student_name} • {c.hostel_name} • {new Date(c.created_at).toLocaleDateString()}</p>
                        <p style={{ fontSize: 14, marginTop: 6 }}>{c.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexDirection: 'column', minWidth: 120 }}>
                        {statusBadge(c.status, { Open: 'badge-danger', 'In Progress': 'badge-warning', Resolved: 'badge-success', Closed: 'badge-secondary' })}
                        {c.status !== 'Resolved' && c.status !== 'Closed' && (
                          <select style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                            value={c.status} onChange={e => updateComplaint(c.id, e.target.value)}>
                            {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
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
              <h3>{{ hostel: editing ? 'Edit Hostel' : 'Add Hostel', room: editing ? 'Edit Room' : 'Add Room', allotment: 'Allot Room', complaint: 'Register Complaint' }[modal]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={save}>
              {modal === 'hostel' && (
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Hostel Name *</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="form-group"><label>Type</label><select value={form.hostel_type || 'Boys'} onChange={e => setForm({ ...form, hostel_type: e.target.value })}>{['Boys', 'Girls', 'Mixed'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Monthly Fee</label><input type="number" value={form.monthly_fee || ''} onChange={e => setForm({ ...form, monthly_fee: e.target.value })} /></div>
                  <div className="form-group"><label>Warden Name</label><input value={form.warden_name || ''} onChange={e => setForm({ ...form, warden_name: e.target.value })} /></div>
                  <div className="form-group"><label>Warden Phone</label><input value={form.warden_phone || ''} onChange={e => setForm({ ...form, warden_phone: e.target.value })} /></div>
                  <div className="form-group"><label>Total Rooms</label><input type="number" value={form.total_rooms || 0} onChange={e => setForm({ ...form, total_rooms: e.target.value })} /></div>
                  <div className="form-group"><label>Total Capacity</label><input type="number" value={form.total_capacity || 0} onChange={e => setForm({ ...form, total_capacity: e.target.value })} /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Amenities</label><input value={form.amenities || ''} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Gym, Laundry..." /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Address</label><textarea rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                </div>
              )}
              {modal === 'room' && (
                <div className="grid-2">
                  <div className="form-group"><label>Hostel *</label><select value={form.hostel || ''} onChange={e => setForm({ ...form, hostel: e.target.value })} required><option value="">Select</option>{hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                  <div className="form-group"><label>Room Number *</label><input value={form.room_number || ''} onChange={e => setForm({ ...form, room_number: e.target.value })} required /></div>
                  <div className="form-group"><label>Floor</label><input type="number" value={form.floor || 1} onChange={e => setForm({ ...form, floor: e.target.value })} /></div>
                  <div className="form-group"><label>Room Type</label><select value={form.room_type || 'Double'} onChange={e => setForm({ ...form, room_type: e.target.value })}>{['Single', 'Double', 'Triple', 'Dormitory'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity || 2} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
                  <div className="form-group"><label>Monthly Rent</label><input type="number" value={form.monthly_rent || ''} onChange={e => setForm({ ...form, monthly_rent: e.target.value })} /></div>
                  <div className="form-group"><label>Status</label><select value={form.status || 'Available'} onChange={e => setForm({ ...form, status: e.target.value })}>{['Available', 'Occupied', 'Maintenance', 'Reserved'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group" style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 24 }}>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={form.has_ac || false} onChange={e => setForm({ ...form, has_ac: e.target.checked })} /> AC</label>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={form.has_attached_bath || false} onChange={e => setForm({ ...form, has_attached_bath: e.target.checked })} /> Attached Bath</label>
                  </div>
                </div>
              )}
              {modal === 'allotment' && (
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Student *</label><select value={form.student || ''} onChange={e => setForm({ ...form, student: e.target.value })} required><option value="">Select Student</option>{students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Room *</label><select value={form.room || ''} onChange={e => setForm({ ...form, room: e.target.value })} required><option value="">Select Room</option>{rooms.filter(r => r.status === 'Available').map(r => <option key={r.id} value={r.id}>{hostels.find(h => h.id === r.hostel)?.name} - Room {r.room_number} ({r.room_type})</option>)}</select></div>
                  <div className="form-group"><label>Allotment Date *</label><input type="date" value={form.allotment_date || ''} onChange={e => setForm({ ...form, allotment_date: e.target.value })} required /></div>
                  <div className="form-group"><label>Remarks</label><input value={form.remarks || ''} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
                </div>
              )}
              {modal === 'complaint' && (
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Student *</label><select value={form.student || ''} onChange={e => setForm({ ...form, student: e.target.value })} required><option value="">Select Student</option>{students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group"><label>Hostel *</label><select value={form.hostel || ''} onChange={e => setForm({ ...form, hostel: e.target.value })} required><option value="">Select Hostel</option>{hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                  <div className="form-group"><label>Category</label><select value={form.category || 'Electrical'} onChange={e => setForm({ ...form, category: e.target.value })}>{['Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Security', 'Internet', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Priority</label><select value={form.priority || 'Medium'} onChange={e => setForm({ ...form, priority: e.target.value })}>{['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Title *</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Description *</label><textarea rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
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
