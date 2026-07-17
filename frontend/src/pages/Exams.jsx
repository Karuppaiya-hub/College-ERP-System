import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY = { name:'', course:'', exam_type:'Internal', max_marks:100, pass_marks:40, exam_date:'', start_time:'', end_time:'', status:'Scheduled' }

export default function Exams() {
  const [exams, setExams] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [resultsModal, setResultsModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [results, setResults] = useState(null)
  const [gradesModal, setGradesModal] = useState(false)
  const [gradeExam, setGradeExam] = useState(null)
  const [gradeData, setGradeData] = useState([])

  const load = () => {
    setLoading(true)
    api.get('/exams/').then(r => setExams(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    api.get('/courses/').then(r => setCourses(r.data))
    api.get('/students/').then(r => setStudents(r.data))
  }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = e => { setEditing(e.id); setForm({ ...e, start_time: e.start_time || '', end_time: e.end_time || '' }); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.start_time) delete payload.start_time
      if (!payload.end_time) delete payload.end_time
      if (editing) await api.patch(`/exams/${editing}/`, payload)
      else await api.post('/exams/', payload)
      setModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this exam?')) return
    await api.delete(`/exams/${id}/`); load()
  }

  const viewResults = async exam => {
    setSelectedExam(exam)
    const r = await api.get(`/exams/${exam.id}/results/`)
    setResults(r.data)
    setResultsModal(true)
  }

  const openGrades = exam => {
    setGradeExam(exam)
    setGradeData(students.map(s => ({ student: s.id, name: s.full_name, roll_no: s.roll_no, marks_obtained: '', grade: '', remarks: '' })))
    setGradesModal(true)
  }

  const submitGrades = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const grades = gradeData.filter(g => g.marks_obtained !== '').map(({ student, marks_obtained, grade, remarks }) => ({ student, marks_obtained: parseFloat(marks_obtained), grade, remarks }))
      await api.post('/exams/submit-grades/', { exam: gradeExam.id, grades })
      setGradesModal(false); load()
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Error'))
    } finally { setSaving(false) }
  }

  const statusBadge = s => {
    const map = { Scheduled: 'badge-info', Ongoing: 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Exams</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Exam</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <table>
            <thead><tr><th>Name</th><th>Course</th><th>Type</th><th>Date</th><th>Max Marks</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No exams found</td></tr>
              ) : exams.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ fontSize: 13 }}>{e.course_name}</td>
                  <td><span className="badge badge-info">{e.exam_type}</span></td>
                  <td style={{ fontSize: 13 }}>{e.exam_date}</td>
                  <td>{e.max_marks}</td>
                  <td>{statusBadge(e.status)}</td>
                  <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(e)}>Edit</button>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => viewResults(e)}>Results</button>
                    <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openGrades(e)}>Grades</button>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del(e.id)}>Del</button>
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
              <h3>{editing ? 'Edit Exam' : 'Add Exam'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Exam Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid-2">
                <div className="form-group"><label>Course *</label>
                  <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Exam Type</label>
                  <select value={form.exam_type} onChange={e => setForm({...form, exam_type: e.target.value})}>
                    {['Internal','Mid-Semester','End-Semester','Practical','Assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Max Marks</label><input type="number" value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} /></div>
                <div className="form-group"><label>Pass Marks</label><input type="number" value={form.pass_marks} onChange={e => setForm({...form, pass_marks: e.target.value})} /></div>
                <div className="form-group"><label>Exam Date *</label><input type="date" value={form.exam_date} onChange={e => setForm({...form, exam_date: e.target.value})} required /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {['Scheduled','Ongoing','Completed','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resultsModal && results && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setResultsModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>Results: {selectedExam?.name}</h3>
              <button className="modal-close" onClick={() => setResultsModal(false)}>×</button>
            </div>
            <div className="grid-4" style={{ marginBottom: 16, gap: 8 }}>
              {[['Total', results.total_students], ['Avg', Number(results.average_marks).toFixed(1)], ['Pass', results.pass_count], ['Fail', results.fail_count]].map(([l, v]) => (
                <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Student</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
                <tbody>
                  {results.results.map(r => (
                    <tr key={r.id}>
                      <td>{r.student_name}</td>
                      <td>{r.marks_obtained}</td>
                      <td>{r.grade || '—'}</td>
                      <td style={{ fontSize: 13 }}>{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {gradesModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setGradesModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>Submit Grades: {gradeExam?.name}</h3>
              <button className="modal-close" onClick={() => setGradesModal(false)}>×</button>
            </div>
            <form onSubmit={submitGrades}>
              <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 16 }}>
                <table>
                  <thead><tr><th>Roll No</th><th>Name</th><th>Marks</th><th>Grade</th></tr></thead>
                  <tbody>
                    {gradeData.map((row, i) => (
                      <tr key={row.student}>
                        <td style={{ fontSize: 13 }}>{row.roll_no}</td>
                        <td style={{ fontSize: 13 }}>{row.name}</td>
                        <td><input type="number" value={row.marks_obtained} placeholder="0-100" style={{ width: 70, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                          onChange={e => { const d = [...gradeData]; d[i].marks_obtained = e.target.value; setGradeData(d) }} /></td>
                        <td><input value={row.grade} placeholder="A/B/C..." style={{ width: 60, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                          onChange={e => { const d = [...gradeData]; d[i].grade = e.target.value; setGradeData(d) }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setGradesModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Grades'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
