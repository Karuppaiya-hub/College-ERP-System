import { useState, useEffect } from 'react'
import api from '../services/api'

const EMPTY_ITEM = { name:'', category:'Lunch', description:'', price:'', is_available:true, is_veg:true, calories:0, preparation_time:10, image_url:'' }
const CATEGORIES = ['Breakfast','Lunch','Snacks','Dinner','Beverages','Desserts']
const CAT_ICONS = { Breakfast:'🌅', Lunch:'🍱', Snacks:'🍿', Dinner:'🍽️', Beverages:'☕', Desserts:'🍰' }

export default function Cafeteria() {
  const [tab, setTab] = useState('menu')
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuModal, setMenuModal] = useState(false)
  const [orderModal, setOrderModal] = useState(false)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [catFilter, setCatFilter] = useState('')
  const [cart, setCart] = useState([])
  const [orderForm, setOrderForm] = useState({ student:'', payment_method:'Online', special_instructions:'' })

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/cafeteria/menu/'),
      api.get('/cafeteria/orders/'),
      api.get('/students/'),
      api.get('/cafeteria/stats/'),
    ]).then(([m, o, s, st]) => {
      setMenu(m.data); setOrders(o.data); setStudents(s.data); setStats(st.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const openMenuModal = (item = null) => {
    setEditingItem(item?.id || null)
    setForm(item || EMPTY_ITEM)
    setMenuModal(true)
  }

  const saveItem = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingItem) await api.patch(`/cafeteria/menu/${editingItem}/`, form)
      else await api.post('/cafeteria/menu/', form)
      setMenuModal(false); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const delItem = async id => {
    if (!confirm('Delete this menu item?')) return
    await api.delete(`/cafeteria/menu/${id}/`); loadAll()
  }

  const toggleAvailable = async item => {
    await api.patch(`/cafeteria/menu/${item.id}/`, { is_available: !item.is_available }); loadAll()
  }

  const addToCart = item => {
    const existing = cart.find(c => c.menu_item === item.id)
    if (existing) setCart(cart.map(c => c.menu_item === item.id ? { ...c, quantity: c.quantity + 1 } : c))
    else setCart([...cart, { menu_item: item.id, name: item.name, price: item.price, quantity: 1 }])
  }

  const removeFromCart = id => setCart(cart.filter(c => c.menu_item !== id))

  const cartTotal = cart.reduce((sum, c) => sum + (parseFloat(c.price) * c.quantity), 0)

  const placeOrder = async e => {
    e.preventDefault()
    if (cart.length === 0) { alert('Add items to cart first'); return }
    setSaving(true)
    try {
      const orderNum = `ORD-${Date.now()}`
      await api.post('/cafeteria/orders/', {
        ...orderForm,
        order_number: orderNum,
        order_items: cart.map(c => ({ menu_item: c.menu_item, quantity: c.quantity })),
      })
      setCart([]); setOrderModal(false); setOrderForm({ student:'', payment_method:'Online', special_instructions:'' }); loadAll()
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')) }
    finally { setSaving(false) }
  }

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/cafeteria/orders/${id}/`, { status }); loadAll()
  }

  const filteredMenu = catFilter ? menu.filter(m => m.category === catFilter) : menu

  const orderStatusColor = { Pending:'badge-warning', Preparing:'badge-info', Ready:'badge-success', Delivered:'badge-secondary', Cancelled:'badge-danger' }

  return (
    <div>
      <div className="page-header">
        <h2>🍽️ Cafeteria Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => openMenuModal()}>+ Add Menu Item</button>
          <button className="btn btn-primary" onClick={() => { setCart([]); setOrderModal(true) }}>🛒 New Order</button>
        </div>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { l:"Today's Orders", v:stats.today_orders, icon:'📋', bg:'#dbeafe' },
            { l:"Today's Revenue", v:`₹${Number(stats.today_revenue).toLocaleString()}`, icon:'💰', bg:'#d1fae5' },
            { l:'Pending Orders', v:stats.pending_orders, icon:'⏳', bg:'#fef3c7' },
            { l:'Menu Items', v:stats.total_menu_items, icon:'🍱', bg:'#ede9fe' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.v}</h3><p>{s.l}</p></div>
            </div>
          ))}
        </div>
      )}

      {stats?.popular_items?.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>🔥 Popular Items</h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {stats.popular_items.map((item, i) => (
              <div key={i} style={{ background: i===0?'#fef3c7':i===1?'#f3f4f6':'#f9fafb', borderRadius:10, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{item['menu_item__name']}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{item.total_qty} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:0, marginBottom:20 }}>
        {['menu','orders'].map((t,i,arr) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 24px', fontSize:14, fontWeight:500, border:'1px solid var(--border)',
            background: tab===t ? 'var(--primary)' : 'white', color: tab===t ? 'white' : '#374151',
            borderRadius: i===0 ? '8px 0 0 8px' : '0 8px 8px 0', textTransform:'capitalize',
          }}>{t === 'menu' ? '🍱 Menu' : '📋 Orders'}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          {tab === 'menu' && (
            <>
              <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                <button onClick={() => setCatFilter('')} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid var(--border)', background: catFilter==='' ? 'var(--primary)' : 'white', color: catFilter==='' ? 'white' : '#374151', fontSize:13, cursor:'pointer' }}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid var(--border)', background: catFilter===c ? 'var(--primary)' : 'white', color: catFilter===c ? 'white' : '#374151', fontSize:13, cursor:'pointer' }}>{CAT_ICONS[c]} {c}</button>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
                {filteredMenu.length === 0 ? <div className="empty-state">No items found</div>
                  : filteredMenu.map(item => (
                    <div key={item.id} className="card" style={{ opacity: item.is_available ? 1 : 0.6, position:'relative' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <span style={{ fontSize:20 }}>{CAT_ICONS[item.category]}</span>
                            <span style={{ fontWeight:700, fontSize:15 }}>{item.name}</span>
                            <span style={{ fontSize:16 }}>{item.is_veg ? '🟢' : '🔴'}</span>
                          </div>
                          <span className="badge badge-info" style={{ marginTop:4 }}>{item.category}</span>
                        </div>
                        <span style={{ fontWeight:700, fontSize:18, color:'var(--primary)' }}>₹{item.price}</span>
                      </div>
                      {item.description && <p style={{ fontSize:13, color:'#6b7280', marginTop:8 }}>{item.description}</p>}
                      <div style={{ display:'flex', gap:12, marginTop:8, fontSize:12, color:'#6b7280' }}>
                        {item.calories > 0 && <span>🔥 {item.calories} cal</span>}
                        <span>⏱️ {item.preparation_time} min</span>
                      </div>
                      <div style={{ display:'flex', gap:6, marginTop:12 }}>
                        <button onClick={() => toggleAvailable(item)} className="btn" style={{ flex:1, padding:'5px', fontSize:12, background: item.is_available ? '#d1fae5' : '#fee2e2', color: item.is_available ? '#065f46' : '#991b1b' }}>
                          {item.is_available ? '✅ Available' : '❌ Unavailable'}
                        </button>
                        <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => openMenuModal(item)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => delItem(item.id)}>Del</button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {tab === 'orders' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {orders.length === 0 ? <div className="empty-state card">No orders found</div>
                : orders.map(o => (
                  <div key={o.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontWeight:700 }}>#{o.order_number}</span>
                          <span className={`badge ${orderStatusColor[o.status]||'badge-secondary'}`}>{o.status}</span>
                          <span className={`badge ${o.payment_status==='Paid'?'badge-success':'badge-warning'}`}>{o.payment_status}</span>
                        </div>
                        <p style={{ fontSize:13, color:'#6b7280' }}>👤 {o.student_name} ({o.student_roll}) &nbsp;|&nbsp; 💳 {o.payment_method} &nbsp;|&nbsp; 🕐 {new Date(o.order_date).toLocaleString()}</p>
                        <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                          {o.items?.map(item => (
                            <span key={item.id} style={{ background:'#f3f4f6', borderRadius:8, padding:'4px 10px', fontSize:13 }}>
                              {item.item_name} × {item.quantity} = ₹{item.subtotal}
                            </span>
                          ))}
                        </div>
                        {o.special_instructions && <p style={{ fontSize:13, color:'#6b7280', marginTop:6 }}>📝 {o.special_instructions}</p>}
                      </div>
                      <div style={{ textAlign:'right', minWidth:120 }}>
                        <div style={{ fontWeight:700, fontSize:18, color:'var(--primary)' }}>₹{o.total_amount}</div>
                        {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                          <select style={{ marginTop:8, padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:12 }}
                            value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}>
                            {['Pending','Preparing','Ready','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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

      {menuModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMenuModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className="modal-close" onClick={() => setMenuModal(false)}>×</button>
            </div>
            <form onSubmit={saveItem}>
              <div className="grid-2">
                <div className="form-group" style={{gridColumn:'span 2'}}><label>Item Name *</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                <div className="form-group"><label>Category</label><select value={form.category||'Lunch'} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Price (₹) *</label><input type="number" step="0.01" value={form.price||''} onChange={e=>setForm({...form,price:e.target.value})} required /></div>
                <div className="form-group"><label>Calories</label><input type="number" value={form.calories||0} onChange={e=>setForm({...form,calories:e.target.value})} /></div>
                <div className="form-group"><label>Prep Time (min)</label><input type="number" value={form.preparation_time||10} onChange={e=>setForm({...form,preparation_time:e.target.value})} /></div>
                <div className="form-group" style={{gridColumn:'span 2', display:'flex', gap:20, alignItems:'center', paddingTop:8}}>
                  <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer' }}><input type="checkbox" checked={form.is_veg||false} onChange={e=>setForm({...form,is_veg:e.target.checked})} /> 🟢 Vegetarian</label>
                  <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer' }}><input type="checkbox" checked={form.is_available!==false} onChange={e=>setForm({...form,is_available:e.target.checked})} /> ✅ Available</label>
                </div>
                <div className="form-group" style={{gridColumn:'span 2'}}><label>Description</label><textarea rows={2} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOrderModal(false)}>
          <div className="modal" style={{ maxWidth:700 }}>
            <div className="modal-header">
              <h3>🛒 Place New Order</h3>
              <button className="modal-close" onClick={() => setOrderModal(false)}>×</button>
            </div>
            <form onSubmit={placeOrder}>
              <div className="grid-2" style={{ marginBottom:16 }}>
                <div className="form-group" style={{gridColumn:'span 2'}}><label>Student *</label><select value={orderForm.student} onChange={e=>setOrderForm({...orderForm,student:e.target.value})} required><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.roll_no} - {s.full_name}</option>)}</select></div>
                <div className="form-group"><label>Payment Method</label><select value={orderForm.payment_method} onChange={e=>setOrderForm({...orderForm,payment_method:e.target.value})}>{['Cash','Card','Online'].map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                <div className="form-group"><label>Special Instructions</label><input value={orderForm.special_instructions} onChange={e=>setOrderForm({...orderForm,special_instructions:e.target.value})} placeholder="Allergies, preferences..." /></div>
              </div>

              <h4 style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>Select Items:</h4>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8, maxHeight:220, overflowY:'auto', marginBottom:16 }}>
                {menu.filter(m => m.is_available).map(item => (
                  <div key={item.id} style={{ border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.is_veg?'🟢':'🔴'} {item.name}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price}</div>
                    </div>
                    <button type="button" onClick={() => addToCart(item)} style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:6, width:28, height:28, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:16 }}>
                  <h4 style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>🛒 Cart</h4>
                  {cart.map(c => (
                    <div key={c.menu_item} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:13 }}>{c.name} × {c.quantity}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:13, fontWeight:600 }}>₹{(parseFloat(c.price)*c.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => removeFromCart(c.menu_item)} style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:4, padding:'2px 8px', cursor:'pointer', fontSize:12 }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, marginTop:8, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
                    <span>Total</span><span style={{ color:'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setOrderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || cart.length===0}>{saving ? 'Placing...' : `Place Order (₹${cartTotal.toFixed(2)})`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
