import { useState, useEffect } from 'react'
import api from '../services/api'
import { exportCSV } from '../services/export'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const DEPTS = ['CSE','ECE','EEE','ME','CE','IT']
const EMPTY_STRUCT = { department:'CSE', semester:1, fee_type:'', amount:'', academic_year:'2024-25', due_date:'' }
const EMPTY_PAY = { student:'', structure:'', amount_paid:'', payment_method:'Online', transaction_id:'', receipt_no:'', status:'Paid', remarks:'' }

export default function Fees() {
  const [tab, setTab] = useState('payments')
  const [structures, setStructures] = useState([])
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [structModal, setStructModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [structForm, setStructForm] = useState(EMPTY_STRUCT)
  const [payForm, setPayForm] = useState(EMPTY_PAY)
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryStudent, setSummaryStudent] = useState('')

  useEffect(() => {
    api.get('/students/').then(r => setStudents(r.data))
    api.get('/fees/stats/').then(r => setStats(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    if (tab === 'structures') api.get('/fees/structures/').then(r => setStructures(r.data)).finally(() => setLoading(false))
    else api.get('/fees/payments/').then(r => setPayments(r.data)).finally(() => setLoading(false))
  }, [tab])

  const saveStruct = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/fees/structures/', structForm)
      setStructModal(false)
      api.get('/fees/structures/').then(r => setStructures(r.data))
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const savePay = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/fees/payments/', payForm)
      setPayModal(false)
      api.get('/fees/payments/').then(r => setPayments(r.data))
      api.get('/fees/stats/').then(r => setStats(r.data))
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const loadSummary = () => {
    if (!summaryStudent) return
    api.get(`/fees/student/${summaryStudent}/summary/`).then(r => setSummary(r.data))
  }

  const statusBadge = s => {
    const map = { Paid: 'badge-success', Partial: 'badge-warning', Pending: 'badge-danger', Refunded: 'badge-info' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Fee Management</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportCSV(payments, 'fee_payments.csv')}>⬇ Export CSV</button>
          <button className="btn btn-secondary" onClick={() => { setStructForm(EMPTY_STRUCT); setStructModal(true) }}>+ Fee Structure</button>
          <button className="btn btn-primary" onClick={() => { setPayForm(EMPTY_PAY); setPayModal(true) }}>+ Record Payment</button>
        </div>
      </div>

      {stats && (
        <div style={{ marginBottom: 24 }}>
          <div className="grid-4" style={{ marginBottom: 16 }}>
            {[
              ['Total Collected', `₹${Number(stats.total_collected).toLocaleString()}`, '#d1fae5', '💰'],
              ['Paid', stats.total_paid_transactions, '#dbeafe', '✅'],
              ['Partial', stats.total_partial_transactions, '#fef3c7', '⏳'],
              ['Pending', stats.total_pending_transactions, '#fee2e2', '⚠️'],
            ].map(([l, v, bg, icon]) => (
              <div key={l} className="stat-card">
                <div className="stat-icon" style={{ background: bg, fontSize: 22 }}>{icon}</div>
                <div className="stat-info"><h3>{v}</h3><p>{l}</p></div>
              </div>
            ))}
          </div>
          {stats.by_department?.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💹 Fee Collection by Department</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.by_department.map(d => ({ dept: d.student__department, amount: Number(d.total) }))} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="amount" fill="url(#feeGrad)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Student Fee Summary</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
            value={summaryStudent} onChange={e => setSummaryStudent(e.target.value)}>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={loadSummary}>View</button>
        </div>
        {summary && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>{summary.student.full_name}</p>
            <div className="grid-3" style={{ gap: 8, marginBottom: 12 }}>
              {[['Total Fee', `₹${Number(summary.total_fee).toLocaleString()}`, '#dbeafe'], ['Paid', `₹${Number(summary.total_paid).toLocaleString()}`, '#d1fae5'], ['Balance', `₹${Number(summary.balance).toLocaleString()}`, summary.balance > 0 ? '#fee2e2' : '#d1fae5']].map(([l, v, bg]) => (
                <div key={l} style={{ background: bg, borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {['payments', 'structures'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 20px', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)',
            background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : '#374151',
            borderRadius: t === 'payments' ? '8px 0 0 8px' : '0 8px 8px 0',
          }}>{t === 'payments' ? 'Payments' : 'Fee Structures'}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : tab === 'payments' ? (
          <table>
            <thead><tr><th>Student</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {payments.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No payments found</td></tr>
                : payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.student_name}</td>
                    <td style={{ fontSize: 13 }}>{p.fee_type}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(p.amount_paid).toLocaleString()}</td>
                    <td style={{ fontSize: 13 }}>{p.payment_method}</td>
                    <td style={{ fontSize: 13 }}>{p.payment_date}</td>
                    <td>{statusBadge(p.status)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Dept</th><th>Sem</th><th>Fee Type</th><th>Amount</th><th>Academic Year</th><th>Due Date</th></tr></thead>
            <tbody>
              {structures.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No structures found</td></tr>
                : structures.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-info">{s.department}</span></td>
                    <td>{s.semester}</td>
                    <td>{s.fee_type}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(s.amount).toLocaleString()}</td>
                    <td>{s.academic_year}</td>
                    <td style={{ fontSize: 13 }}>{s.due_date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {structModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setStructModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add Fee Structure</h3>
              <button className="modal-close" onClick={() => setStructModal(false)}>×</button>
            </div>
            <form onSubmit={saveStruct}>
              <div className="grid-2">
                <div className="form-group"><label>Department</label>
                  <select value={structForm.department} onChange={e => setStructForm({...structForm, department: e.target.value})}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Semester</label><input type="number" min={1} max={8} value={structForm.semester} onChange={e => setStructForm({...structForm, semester: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Fee Type *</label><input value={structForm.fee_type} onChange={e => setStructForm({...structForm, fee_type: e.target.value})} required placeholder="e.g. Tuition Fee, Exam Fee" /></div>
                <div className="form-group"><label>Amount *</label><input type="number" value={structForm.amount} onChange={e => setStructForm({...structForm, amount: e.target.value})} required /></div>
                <div className="form-group"><label>Academic Year</label><input value={structForm.academic_year} onChange={e => setStructForm({...structForm, academic_year: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Due Date *</label><input type="date" value={structForm.due_date} onChange={e => setStructForm({...structForm, due_date: e.target.value})} required /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStructModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="modal-close" onClick={() => setPayModal(false)}>×</button>
            </div>
            <form onSubmit={savePay}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Student *</label>
                  <select value={payForm.student} onChange={e => setPayForm({...payForm, student: e.target.value})} required>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Fee Structure *</label>
                  <select value={payForm.structure} onChange={e => setPayForm({...payForm, structure: e.target.value})} required>
                    <option value="">Select Structure</option>
                    {structures.map(s => <option key={s.id} value={s.id}>{s.department} Sem{s.semester} - {s.fee_type} (₹{s.amount})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Amount Paid *</label><input type="number" value={payForm.amount_paid} onChange={e => setPayForm({...payForm, amount_paid: e.target.value})} required /></div>
                <div className="form-group"><label>Payment Method</label>
                  <select value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}>
                    {['Cash','Card','Online','Cheque','DD'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Transaction ID</label><input value={payForm.transaction_id} onChange={e => setPayForm({...payForm, transaction_id: e.target.value})} /></div>
                <div className="form-group"><label>Receipt No</label><input value={payForm.receipt_no} onChange={e => setPayForm({...payForm, receipt_no: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Status</label>
                  <select value={payForm.status} onChange={e => setPayForm({...payForm, status: e.target.value})}>
                    {['Paid','Partial','Pending','Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
