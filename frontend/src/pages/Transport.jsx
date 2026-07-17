import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_ROUTE = { route_number:'', route_name:'', start_point:'', end_point:'', stops:'', distance_km:'', departure_time:'', arrival_time:'', monthly_fee:'', is_active:true }
const EMPTY_VEHICLE = { vehicle_number:'', vehicle_type:'Bus', model:'', capacity:40, driver_name:'', driver_phone:'', driver_license:'', route:null, status:'Active', last_service_date:'', next_service_date:'', insurance_expiry:'', fitness_expiry:'' }
const EMPTY_PASS = { student:'', route:'', pass_number:'', boarding_point:'', valid_from:'', valid_to:'', amount_paid:'', payment_method:'Online', status:'Active' }

export default function Transport() {
  const [tab, setTab] = useState('routes')
  const [routes, setRoutes] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [passes, setPasses] = useState([])
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
      api.get('/transport/routes/'),
      api.get('/transport/vehicles/'),
      api.get('/transport/passes/'),
      api.get('/students/'),
      api.get('/transport/stats/'),
    ]).then(([r, v, p, s, st]) => {
      setRoutes(r.data); setVehicles(v.data); setPasses(p.data)
      setStudents(s.data); setStats(st.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openModal = (type, data = null) => {
    setModal(type); setEditing(data?.id || null)
    if (type === 'route') setForm(data || EMPTY_ROUTE)
    if (type === 'vehicle') setForm(data ? { ...data, route: data.route || null, last_service_date: data.last_service_date || '', next_service_date: data.next_service_date || '', insurance_expiry: data.insurance_expiry || '', fitness_expiry: data.fitness_expiry || '' } : EMPTY_VEHICLE)
    if (type === 'pass') setForm(EMPTY_PASS)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const endpoints = { route: '/transport/routes/', vehicle: '/transport/vehicles/', pass: '/transport/passes/' }
      const payload = { ...form }
      if (modal === 'vehicle') {
        ;['last_service_date','next_service_date','insurance_expiry','fitness_expiry'].forEach(k => { if (!payload[k]) delete payload[k] })
        if (!payload.route) payload.route = null
      }
      if (editing) await api.patch(`${endpoints[modal]}${editing}/`, payload)
      else await api.post(endpoints[modal], payload)
      setModal(null); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const del = async (type, id) => {
    if (!confirm('Delete?')) return
    const endpoints = { route: '/transport/routes/', vehicle: '/transport/vehicles/', pass: '/transport/passes/' }
    await api.delete(`${endpoints[type]}${id}/`); loadAll()
  }

  const tabs = ['routes', 'vehicles', 'passes']

  return (
    <div>
      <div className="page-header">
        <h2>🚌 Transport Management</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => openModal('route')}>+ Add Route</button>
          <button className="btn btn-secondary" onClick={() => openModal('vehicle')}>+ Add Vehicle</button>
          <button className="btn btn-primary" onClick={() => openModal('pass')}>+ Issue Pass</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { l: 'Active Routes', v: stats.total_routes, icon: '🗺️', bg: '#ede9fe' },
            { l: 'Total Vehicles', v: stats.total_vehicles, icon: '🚌', bg: '#dbeafe' },
            { l: 'Active Passes', v: stats.active_passes, icon: '🎫', bg: '#d1fae5' },
            { l: 'In Maintenance', v: stats.maintenance_vehicles, icon: '🔧', bg: '#fee2e2' },
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
            padding: '9px 20px', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)',
            background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : '#374151',
            borderRadius: i === 0 ? '8px 0 0 8px' : i === tabs.length - 1 ? '0 8px 8px 0' : '0',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          {tab === 'routes' && (
            <table>
              <thead><tr><th>Route No</th><th>Name</th><th>From → To</th><th>Distance</th><th>Departure</th><th>Fee/mo</th><th>Passes</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {routes.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>No routes found</td></tr>
                  : routes.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.route_number}</td>
                      <td>{r.route_name}</td>
                      <td style={{ fontSize: 13 }}>{r.start_point} → {r.end_point}</td>
                      <td>{r.distance_km} km</td>
                      <td style={{ fontSize: 13 }}>{r.departure_time}</td>
                      <td>₹{r.monthly_fee}</td>
                      <td><span className="badge badge-info">{r.pass_count}</span></td>
                      <td><span className={`badge ${r.is_active ? 'badge-success' : 'badge-secondary'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openModal('route', r)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del('route', r.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {tab === 'vehicles' && (
            <table>
              <thead><tr><th>Vehicle No</th><th>Type</th><th>Model</th><th>Capacity</th><th>Driver</th><th>Route</th><th>Insurance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {vehicles.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>No vehicles found</td></tr>
                  : vehicles.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 700 }}>{v.vehicle_number}</td>
                      <td><span className="badge badge-info">{v.vehicle_type}</span></td>
                      <td style={{ fontSize: 13 }}>{v.model || '—'}</td>
                      <td>{v.capacity}</td>
                      <td style={{ fontSize: 13 }}>{v.driver_name || '—'}</td>
                      <td style={{ fontSize: 13 }}>{v.route_name || '—'}</td>
                      <td style={{ fontSize: 12 }}>{v.insurance_expiry || '—'}</td>
                      <td><span className={`badge ${v.status === 'Active' ? 'badge-success' : v.status === 'Maintenance' ? 'badge-warning' : 'badge-secondary'}`}>{v.status}</span></td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openModal('vehicle', v)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del('vehicle', v.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {tab === 'passes' && (
            <table>
              <thead><tr><th>Pass No</th><th>Student</th><th>Route</th><th>Boarding Point</th><th>Valid From</th><th>Valid To</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {passes.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>No passes found</td></tr>
                  : passes.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{p.pass_number}</td>
                      <td>{p.student_name}</td>
                      <td style={{ fontSize: 13 }}>{p.route_name}</td>
                      <td style={{ fontSize: 13 }}>{p.boarding_point}</td>
                      <td style={{ fontSize: 13 }}>{p.valid_from}</td>
                      <td style={{ fontSize: 13 }}>{p.valid_to}</td>
                      <td>₹{p.amount_paid}</td>
                      <td><span className={`badge ${p.status === 'Active' ? 'badge-success' : p.status === 'Expired' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                      <td><button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del('pass', p.id)}>Cancel</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{{ route: editing ? 'Edit Route' : 'Add Route', vehicle: editing ? 'Edit Vehicle' : 'Add Vehicle', pass: 'Issue Transport Pass' }[modal]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={save}>
              {modal === 'route' && (
                <div className="grid-2">
                  <div className="form-group"><label>Route Number *</label><input value={form.route_number||''} onChange={e=>setForm({...form,route_number:e.target.value})} required /></div>
                  <div className="form-group"><label>Route Name *</label><input value={form.route_name||''} onChange={e=>setForm({...form,route_name:e.target.value})} required /></div>
                  <div className="form-group"><label>Start Point *</label><input value={form.start_point||''} onChange={e=>setForm({...form,start_point:e.target.value})} required /></div>
                  <div className="form-group"><label>End Point *</label><input value={form.end_point||''} onChange={e=>setForm({...form,end_point:e.target.value})} required /></div>
                  <div className="form-group"><label>Distance (km)</label><input type="number" value={form.distance_km||''} onChange={e=>setForm({...form,distance_km:e.target.value})} /></div>
                  <div className="form-group"><label>Monthly Fee</label><input type="number" value={form.monthly_fee||''} onChange={e=>setForm({...form,monthly_fee:e.target.value})} /></div>
                  <div className="form-group"><label>Departure Time *</label><input type="time" value={form.departure_time||''} onChange={e=>setForm({...form,departure_time:e.target.value})} required /></div>
                  <div className="form-group"><label>Arrival Time *</label><input type="time" value={form.arrival_time||''} onChange={e=>setForm({...form,arrival_time:e.target.value})} required /></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Stops (comma separated)</label><input value={form.stops||''} onChange={e=>setForm({...form,stops:e.target.value})} placeholder="Stop1, Stop2, Stop3..." /></div>
                </div>
              )}
              {modal === 'vehicle' && (
                <div className="grid-2">
                  <div className="form-group"><label>Vehicle Number *</label><input value={form.vehicle_number||''} onChange={e=>setForm({...form,vehicle_number:e.target.value})} required /></div>
                  <div className="form-group"><label>Type</label><select value={form.vehicle_type||'Bus'} onChange={e=>setForm({...form,vehicle_type:e.target.value})}>{['Bus','Mini Bus','Van'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Model</label><input value={form.model||''} onChange={e=>setForm({...form,model:e.target.value})} /></div>
                  <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity||40} onChange={e=>setForm({...form,capacity:e.target.value})} /></div>
                  <div className="form-group"><label>Driver Name</label><input value={form.driver_name||''} onChange={e=>setForm({...form,driver_name:e.target.value})} /></div>
                  <div className="form-group"><label>Driver Phone</label><input value={form.driver_phone||''} onChange={e=>setForm({...form,driver_phone:e.target.value})} /></div>
                  <div className="form-group"><label>Assign Route</label><select value={form.route||''} onChange={e=>setForm({...form,route:e.target.value||null})}><option value="">— None —</option>{routes.map(r=><option key={r.id} value={r.id}>{r.route_number} - {r.route_name}</option>)}</select></div>
                  <div className="form-group"><label>Status</label><select value={form.status||'Active'} onChange={e=>setForm({...form,status:e.target.value})}>{['Active','Maintenance','Inactive'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>Insurance Expiry</label><input type="date" value={form.insurance_expiry||''} onChange={e=>setForm({...form,insurance_expiry:e.target.value})} /></div>
                  <div className="form-group"><label>Fitness Expiry</label><input type="date" value={form.fitness_expiry||''} onChange={e=>setForm({...form,fitness_expiry:e.target.value})} /></div>
                </div>
              )}
              {modal === 'pass' && (
                <div className="grid-2">
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Student *</label><select value={form.student||''} onChange={e=>setForm({...form,student:e.target.value})} required><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                  <div className="form-group" style={{gridColumn:'span 2'}}><label>Route *</label><select value={form.route||''} onChange={e=>setForm({...form,route:e.target.value})} required><option value="">Select Route</option>{routes.filter(r=>r.is_active).map(r=><option key={r.id} value={r.id}>{r.route_number} - {r.route_name} (₹{r.monthly_fee}/mo)</option>)}</select></div>
                  <div className="form-group"><label>Pass Number *</label><input value={form.pass_number||''} onChange={e=>setForm({...form,pass_number:e.target.value})} required placeholder="TP-2024-001" /></div>
                  <div className="form-group"><label>Boarding Point *</label><input value={form.boarding_point||''} onChange={e=>setForm({...form,boarding_point:e.target.value})} required /></div>
                  <div className="form-group"><label>Valid From *</label><input type="date" value={form.valid_from||''} onChange={e=>setForm({...form,valid_from:e.target.value})} required /></div>
                  <div className="form-group"><label>Valid To *</label><input type="date" value={form.valid_to||''} onChange={e=>setForm({...form,valid_to:e.target.value})} required /></div>
                  <div className="form-group"><label>Amount Paid</label><input type="number" value={form.amount_paid||''} onChange={e=>setForm({...form,amount_paid:e.target.value})} /></div>
                  <div className="form-group"><label>Payment Method</label><select value={form.payment_method||'Online'} onChange={e=>setForm({...form,payment_method:e.target.value})}>{['Cash','Card','Online','Cheque','DD'].map(m=><option key={m} value={m}>{m}</option>)}</select></div>
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
