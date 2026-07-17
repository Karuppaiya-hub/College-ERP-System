import { useState, useEffect } from 'react'
import api from '../services/api'
import { exportCSV } from '../services/export'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ student: '', course: '', date_from: '', date_to: '' })
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkCourse, setBulkCourse] = useState('')
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkData, setBulkData] = useState([])
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState(null)
  const [statsStudent, setStatsStudent] = useState('')

  const load = () => {
    setLoading(true)
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    api.get('/attendance/', { params }).then(r => setRecords(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters])
  useEffect(() => {
    api.get('/students/').then(r => setStudents(r.data))
    api.get('/courses/').then(r => setCourses(r.data))
  }, [])

  const openBulk = () => {
    setBulkCourse('')
    setBulkDate(new Date().toISOString().split('T')[0])
    setBulkData([])
    setBulkModal(true)
  }

  const loadBulkStudents = courseId => {
    setBulkCourse(courseId)
    if (!courseId) { setBulkData([]); return }
    api.get('/students/').then(r => {
      setBulkData(r.data.map(s => ({ student: s.id, name: s.full_name, roll_no: s.roll_no, status: 'Present', remarks: '' })))
    })
  }

  const submitBulk = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/attendance/bulk-mark/', {
        course: parseInt(bulkCourse), date: bulkDate,
        attendances: bulkData.map(({ student, status, remarks }) => ({ student, status, remarks }))
      })
      setBulkModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const loadStats = () => {
    if (!statsStudent) return
    api.get(`/attendance/student/${statsStudent}/stats/`).then(r => setStats(r.data))
  }

  const statusBadge = s => {
    const map = { Present: 'badge-success', Absent: 'badge-danger', Late: 'badge-warning', Excused: 'badge-info' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Attendance</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportCSV(records, 'attendance.csv')}>⬇ Export CSV</button>
          <button className="btn btn-primary" onClick={openBulk}>+ Bulk Mark Attendance</button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Student Attendance Stats</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
              value={statsStudent} onChange={e => setStatsStudent(e.target.value)}>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={loadStats}>View</button>
          </div>
          {stats && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{stats.student.full_name}</p>
              <div className="grid-4" style={{ gap: 8 }}>
                {[['Total', stats.total_classes, '#dbeafe'], ['Present', stats.present, '#d1fae5'], ['Absent', stats.absent, '#fee2e2'], ['%', `${stats.attendance_percentage}%`, '#fef3c7']].map(([l, v, bg]) => (
                  <div key={l} style={{ background: bg, borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Filter Records</h3>
          <div className="grid-2" style={{ gap: 8 }}>
            <select style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
              value={filters.student} onChange={e => setFilters({...filters, student: e.target.value})}>
              <option value="">All Students</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}
            </select>
            <select style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
              value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <input type="date" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
              value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} />
            <input type="date" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
              value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <table>
            <thead><tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th><th>Remarks</th><th>Marked By</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No records found</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td>{r.student_name}</td>
                  <td style={{ fontSize: 13 }}>{r.course_name}</td>
                  <td style={{ fontSize: 13 }}>{r.date}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td style={{ fontSize: 13 }}>{r.remarks || '—'}</td>
                  <td style={{ fontSize: 13 }}>{r.marked_by_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {bulkModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBulkModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Bulk Mark Attendance</h3>
              <button className="modal-close" onClick={() => setBulkModal(false)}>×</button>
            </div>
            <form onSubmit={submitBulk}>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label>Course *</label>
                  <select value={bulkCourse} onChange={e => loadBulkStudents(e.target.value)} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} required />
                </div>
              </div>
              {bulkData.length > 0 && (
                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['Present','Absent','Late','Excused'].map(s => (
                      <button key={s} type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => setBulkData(d => d.map(r => ({ ...r, status: s })))}>All {s}</button>
                    ))}
                  </div>
                  <table>
                    <thead><tr><th>Roll No</th><th>Name</th><th>Status</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {bulkData.map((row, i) => (
                        <tr key={row.student}>
                          <td style={{ fontSize: 13 }}>{row.roll_no}</td>
                          <td style={{ fontSize: 13 }}>{row.name}</td>
                          <td>
                            <select value={row.status} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                              onChange={e => { const d = [...bulkData]; d[i].status = e.target.value; setBulkData(d) }}>
                              {['Present','Absent','Late','Excused'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <input value={row.remarks} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, width: '100%' }}
                              onChange={e => { const d = [...bulkData]; d[i].remarks = e.target.value; setBulkData(d) }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || bulkData.length === 0}>{saving ? 'Saving...' : `Submit (${bulkData.length} students)`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
