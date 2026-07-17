import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_BOOK = { isbn:'', title:'', author:'', publisher:'', category:'Textbook', edition:'', total_copies:1, available_copies:1, location:'' }
const EMPTY_ISSUE = { book:'', student:'', due_date:'' }

export default function Library() {
  const [books, setBooks] = useState([])
  const [issues, setIssues] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('books')
  const [search, setSearch] = useState('')
  const [bookModal, setBookModal] = useState(false)
  const [issueModal, setIssueModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookForm, setBookForm] = useState(EMPTY_BOOK)
  const [issueForm, setIssueForm] = useState(EMPTY_ISSUE)
  const [saving, setSaving] = useState(false)

  const loadBooks = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    api.get('/library/books/', { params }).then(r => setBooks(r.data)).finally(() => setLoading(false))
  }

  const loadIssues = () => {
    setLoading(true)
    api.get('/library/issues/').then(r => setIssues(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { tab === 'books' ? loadBooks() : loadIssues() }, [tab, search])
  useEffect(() => { api.get('/students/').then(r => setStudents(r.data)) }, [])

  const openAddBook = () => { setEditingBook(null); setBookForm(EMPTY_BOOK); setBookModal(true) }
  const openEditBook = b => { setEditingBook(b.id); setBookForm({ ...b }); setBookModal(true) }

  const saveBook = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingBook) await api.patch(`/library/books/${editingBook}/`, bookForm)
      else await api.post('/library/books/', bookForm)
      setBookModal(false); loadBooks()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const delBook = async id => {
    if (!confirm('Delete this book?')) return
    await api.delete(`/library/books/${id}/`); loadBooks()
  }

  const saveIssue = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/library/issues/', issueForm)
      setIssueModal(false); loadIssues(); loadBooks()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const returnBook = async issueId => {
    if (!confirm('Mark this book as returned?')) return
    try {
      const r = await api.post(`/library/issues/${issueId}/return/`)
      alert(`Book returned. Fine: ₹${r.data.fine}`)
      loadIssues(); loadBooks()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
  }

  const statusBadge = s => {
    const map = { Issued: 'badge-info', Returned: 'badge-success', Overdue: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Library</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={openAddBook}>+ Add Book</button>
          <button className="btn btn-primary" onClick={() => { setIssueForm(EMPTY_ISSUE); setIssueModal(true) }}>+ Issue Book</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {['books', 'issues'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 20px', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)',
            background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : '#374151',
            borderRadius: t === 'books' ? '8px 0 0 8px' : '0 8px 8px 0',
          }}>{t === 'books' ? 'Books' : 'Issued Books'}</button>
        ))}
      </div>

      {tab === 'books' && (
        <div className="search-bar">
          <input placeholder="Search by title, author, ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : tab === 'books' ? (
          <table>
            <thead><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Total</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>
              {books.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No books found</td></tr>
                : books.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontSize: 13 }}>{b.isbn}</td>
                    <td style={{ fontWeight: 600 }}>{b.title}</td>
                    <td style={{ fontSize: 13 }}>{b.author}</td>
                    <td><span className="badge badge-info">{b.category}</span></td>
                    <td>{b.total_copies}</td>
                    <td><span className={`badge ${b.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>{b.available_copies}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ marginRight: 6, padding: '5px 12px', fontSize: 13 }} onClick={() => openEditBook(b)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => delBook(b.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Book</th><th>Student</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Fine</th><th>Action</th></tr></thead>
            <tbody>
              {issues.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No issues found</td></tr>
                : issues.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontSize: 13 }}>{i.book_title}</td>
                    <td style={{ fontSize: 13 }}>{i.student_name}</td>
                    <td style={{ fontSize: 13 }}>{i.issue_date}</td>
                    <td style={{ fontSize: 13 }}>{i.due_date}</td>
                    <td style={{ fontSize: 13 }}>{i.return_date || '—'}</td>
                    <td>{statusBadge(i.status)}</td>
                    <td>{i.fine > 0 ? `₹${i.fine}` : '—'}</td>
                    <td>
                      {i.status !== 'Returned' && (
                        <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => returnBook(i.id)}>Return</button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {bookModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBookModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add Book'}</h3>
              <button className="modal-close" onClick={() => setBookModal(false)}>×</button>
            </div>
            <form onSubmit={saveBook}>
              <div className="grid-2">
                <div className="form-group"><label>ISBN *</label><input value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} required /></div>
                <div className="form-group"><label>Category</label>
                  <select value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})}>
                    {['Textbook','Reference','Journal','Magazine','Novel','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Title *</label><input value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required /></div>
                <div className="form-group"><label>Author *</label><input value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required /></div>
                <div className="form-group"><label>Publisher</label><input value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} /></div>
                <div className="form-group"><label>Edition</label><input value={bookForm.edition} onChange={e => setBookForm({...bookForm, edition: e.target.value})} /></div>
                <div className="form-group"><label>Location</label><input value={bookForm.location} onChange={e => setBookForm({...bookForm, location: e.target.value})} /></div>
                <div className="form-group"><label>Total Copies</label><input type="number" min={1} value={bookForm.total_copies} onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} /></div>
                <div className="form-group"><label>Available Copies</label><input type="number" min={0} value={bookForm.available_copies} onChange={e => setBookForm({...bookForm, available_copies: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {issueModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIssueModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Issue Book</h3>
              <button className="modal-close" onClick={() => setIssueModal(false)}>×</button>
            </div>
            <form onSubmit={saveIssue}>
              <div className="form-group"><label>Book *</label>
                <select value={issueForm.book} onChange={e => setIssueForm({...issueForm, book: e.target.value})} required>
                  <option value="">Select Book</option>
                  {books.filter(b => b.available_copies > 0).map(b => <option key={b.id} value={b.id}>{b.title} (Available: {b.available_copies})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Student *</label>
                <select value={issueForm.student} onChange={e => setIssueForm({...issueForm, student: e.target.value})} required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Due Date *</label><input type="date" value={issueForm.due_date} onChange={e => setIssueForm({...issueForm, due_date: e.target.value})} required /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Issuing...' : 'Issue Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
