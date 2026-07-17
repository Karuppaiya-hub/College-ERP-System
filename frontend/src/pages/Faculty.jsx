import { useState, useEffect } from 'react'
import api from '../services/api'

const DEPTS = ['CSE','ECE','EEE','ME','CE','IT']
const EMPTY = { employee_id:'', first_name:'', last_name:'', email:'', phone:'', department:'CSE', designation:'', qualification:'', specialization:'', date_of_joining:'', salary:'0', status:'Active' }

export default function Faculty() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (dept) params.department = dept
    api.get('/faculty/', { params }).then(r => setList(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, dept])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = f => { setEditing(f.id); setForm({ ...f, date_of_joining: f.date_of_joining || '' }); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await api.patch(`/faculty/${editing}/`, form)
      else await api.post('/faculty/', form)
      setModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this faculty?')) return
    await api.delete(`/faculty/${id}/`); load()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Faculty</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Faculty</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search by name, employee ID, email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <table>
            <thead><tr><th>Emp ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Designation</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No faculty found</td></tr>
              ) : list.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.employee_id}</td>
                  <td>{f.full_name}</td>
                  <td style={{ fontSize: 13 }}>{f.email}</td>
                  <td><span className="badge badge-info">{f.department}</span></td>
                  <td style={{ fontSize: 13 }}>{f.designation || '—'}</td>
                  <td><span className={`badge ${f.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>{f.status}</span></td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: 6, padding: '5px 12px', fontSize: 13 }} onClick={() => openEdit(f)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => del(f.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Faculty' : 'Add Faculty'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="grid-2">
                <div className="form-group"><label>Employee ID *</label><input value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required /></div>
                <div className="form-group"><label>Department *</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>First Name *</label><input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required /></div>
                <div className="form-group"><label>Last Name *</label><input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>Designation</label><input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
                <div className="form-group"><label>Qualification</label><input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} /></div>
                <div className="form-group"><label>Specialization</label><input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} /></div>
                <div className="form-group"><label>Date of Joining</label><input type="date" value={form.date_of_joining} onChange={e => setForm({...form, date_of_joining: e.target.value})} /></div>
                <div className="form-group"><label>Salary</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {['Active','Inactive','On Leave'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
