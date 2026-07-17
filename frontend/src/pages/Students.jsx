import { useState, useEffect } from 'react'
import api from '../services/api'
import { exportCSV } from '../services/export'

const DEPTS = ['CSE','ECE','EEE','ME','CE','IT']
const EMPTY = { roll_no:'', first_name:'', last_name:'', email:'', phone:'', date_of_birth:'', gender:'', department:'CSE', semester:1, admission_year:2024, address:'', blood_group:'', guardian_name:'', guardian_phone:'', status:'Active' }

export default function Students() {
  const [students, setStudents] = useState([])
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
    api.get('/students/', { params }).then(r => setStudents(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, dept])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = s => { setEditing(s.id); setForm({ ...s, date_of_birth: s.date_of_birth || '' }); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await api.patch(`/students/${editing}/`, form)
      else await api.post('/students/', form)
      setModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this student?')) return
    await api.delete(`/students/${id}/`); load()
  }

  const statusBadge = s => {
    const map = { Active: 'badge-success', Inactive: 'badge-secondary', Graduated: 'badge-info', Suspended: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Students</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportCSV(students, 'students.csv')}>⬇ Export CSV</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
        </div>
      </div>

      <div className="search-bar">
        <input placeholder="Search by name, roll no, email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Email</th><th>Dept</th><th>Sem</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.roll_no}</td>
                  <td>{s.full_name}</td>
                  <td style={{ fontSize: 13 }}>{s.email}</td>
                  <td><span className="badge badge-info">{s.department}</span></td>
                  <td>{s.semester}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: 6, padding: '5px 12px', fontSize: 13 }} onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => del(s.id)}>Delete</button>
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
              <h3>{editing ? 'Edit Student' : 'Add Student'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="grid-2">
                <div className="form-group"><label>Roll No *</label><input value={form.roll_no} onChange={e => setForm({...form, roll_no: e.target.value})} required /></div>
                <div className="form-group"><label>Department *</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>First Name *</label><input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required /></div>
                <div className="form-group"><label>Last Name *</label><input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>Semester</label><input type="number" min={1} max={8} value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} /></div>
                <div className="form-group"><label>Admission Year</label><input type="number" value={form.admission_year} onChange={e => setForm({...form, admission_year: e.target.value})} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Blood Group</label><input value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {['Active','Inactive','Graduated','Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Address</label><textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Guardian Name</label><input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} /></div>
                <div className="form-group"><label>Guardian Phone</label><input value={form.guardian_phone} onChange={e => setForm({...form, guardian_phone: e.target.value})} /></div>
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
