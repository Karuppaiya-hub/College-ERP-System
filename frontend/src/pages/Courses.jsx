import { useState, useEffect } from 'react'
import api from '../services/api'

const DEPTS = ['CSE','ECE','EEE','ME','CE','IT']
const EMPTY = { code:'', name:'', department:'CSE', semester:1, credits:3, theory_hours:3, practical_hours:1, max_strength:60, faculty:null, status:'Active' }

export default function Courses() {
  const [list, setList] = useState([])
  const [faculty, setFaculty] = useState([])
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
    api.get('/courses/', { params }).then(r => setList(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, dept])
  useEffect(() => { api.get('/faculty/').then(r => setFaculty(r.data)) }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = c => { setEditing(c.id); setForm({ ...c, faculty: c.faculty || null }); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await api.patch(`/courses/${editing}/`, form)
      else await api.post('/courses/', form)
      setModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this course?')) return
    await api.delete(`/courses/${id}/`); load()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Courses</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Dept</th><th>Sem</th><th>Credits</th><th>Faculty</th><th>Enrolled</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No courses found</td></tr>
              ) : list.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.code}</td>
                  <td>{c.name}</td>
                  <td><span className="badge badge-info">{c.department}</span></td>
                  <td>{c.semester}</td>
                  <td>{c.credits}</td>
                  <td style={{ fontSize: 13 }}>{c.faculty_name || '—'}</td>
                  <td>{c.enrolled_count}</td>
                  <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>{c.status}</span></td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: 6, padding: '5px 12px', fontSize: 13 }} onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => del(c.id)}>Delete</button>
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
              <h3>{editing ? 'Edit Course' : 'Add Course'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="grid-2">
                <div className="form-group"><label>Course Code *</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
                <div className="form-group"><label>Department *</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Course Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group"><label>Semester</label><input type="number" min={1} max={8} value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} /></div>
                <div className="form-group"><label>Credits</label><input type="number" value={form.credits} onChange={e => setForm({...form, credits: e.target.value})} /></div>
                <div className="form-group"><label>Theory Hours</label><input type="number" value={form.theory_hours} onChange={e => setForm({...form, theory_hours: e.target.value})} /></div>
                <div className="form-group"><label>Practical Hours</label><input type="number" value={form.practical_hours} onChange={e => setForm({...form, practical_hours: e.target.value})} /></div>
                <div className="form-group"><label>Max Strength</label><input type="number" value={form.max_strength} onChange={e => setForm({...form, max_strength: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {['Active','Inactive','Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Assign Faculty</label>
                  <select value={form.faculty || ''} onChange={e => setForm({...form, faculty: e.target.value || null})}>
                    <option value="">— None —</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.full_name} ({f.department})</option>)}
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
