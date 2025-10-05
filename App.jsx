import React, {useState, useEffect} from 'react'
import axios from 'axios'
export default function App(){
  const [listings, setListings] = useState([])
  const [token, setToken] = useState(localStorage.getItem('hc_token') || '')
  const [user, setUser] = useState(null)
  useEffect(()=> {
    axios.get('/api/listings').then(r=>setListings(r.data)).catch(()=>{})
    if(token){
      axios.get('/api/auth/me', { headers: { Authorization: 'Bearer '+token } })
        .then(r=>setUser(r.data)).catch(()=>{ localStorage.removeItem('hc_token'); setToken('') })
    }
  },[token])
  async function loginDemo(){
    const res = await axios.post('/api/auth/login', { email: 'demo@hc.test', password: 'password' })
    localStorage.setItem('hc_token', res.data.token)
    setToken(res.data.token)
  }
  async function logout(){
    localStorage.removeItem('hc_token'); setToken(''); setUser(null)
  }
  return (<div className="min-h-screen bg-slate-50">
    <header className="bg-white shadow"><div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="font-bold text-lg">Homestay Connect</div>
      <div className="flex gap-3 items-center">
        {user ? <><span className="text-sm">Hi, {user.name}</span><button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button></> : <button onClick={loginDemo} className="px-3 py-1 bg-emerald-600 text-white rounded">Login (demo)</button>}
      </div>
    </div></header>
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Top Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listings.map(l=>(
          <div key={l._id} className="bg-white rounded shadow p-4">
            <img src={l.img} className="w-full h-40 object-cover rounded" alt={l.title}/>
            <h3 className="mt-2 font-semibold">{l.title}</h3>
            <div className="text-sm text-gray-500">{l.city}</div>
            <div className="mt-2 font-bold">₹{l.price}/night</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>alert('Booking demo - see BOOKINGS API')}>Book</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>)
}
