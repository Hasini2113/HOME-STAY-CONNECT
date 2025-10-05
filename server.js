require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
// Connect Mongo
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/homestayconnect'
mongoose.connect(mongoUri).then(()=>console.log('Mongo connected')).catch(e=>console.error('Mongo connect error', e.message))
// Models
const UserSchema = new mongoose.Schema({ name:String, email:{type:String,unique:true}, password:String, createdAt:Date }, { timestamps: true })
const User = mongoose.model('User', UserSchema)
const ListingSchema = new mongoose.Schema({ title:String, city:String, price:Number, img:String, hostId: mongoose.Types.ObjectId }, { timestamps: true })
const Listing = mongoose.model('Listing', ListingSchema)
const BookingSchema = new mongoose.Schema({ listingId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, startDate:Date, endDate:Date, guests:Number, createdAt:Date }, { timestamps:true })
const Booking = mongoose.model('Booking', BookingSchema)
// Auth helpers
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'
function authMiddleware(req,res,next){
  const auth = req.headers.authorization
  if(!auth) return res.status(401).json({error:'missing token'})
  const token = auth.split(' ')[1]
  try{
    const data = jwt.verify(token, JWT_SECRET)
    req.userId = data.id
    next()
  }catch(err){ return res.status(401).json({error:'invalid token'}) }
}
// Routes
app.post('/api/auth/register', async (req,res)=> {
  const { name, email, password } = req.body
  if(!email || !password) return res.status(400).json({error:'missing fields'})
  const hashed = await bcrypt.hash(password, 10)
  try{
    const user = await User.create({ name, email, password:hashed })
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  }catch(e){ res.status(400).json({ error: 'email_exists_or_error', message: e.message }) }
})
app.post('/api/auth/login', async (req,res)=> {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if(!user) return res.status(400).json({ error:'invalid_credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(400).json({ error:'invalid_credentials' })
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
app.get('/api/auth/me', authMiddleware, async (req,res)=> {
  const u = await User.findById(req.userId).select('-password')
  res.json({ name: u.name, email: u.email, id: u._id })
})
// Public listings
app.get('/api/listings', async (req,res)=> {
  const list = await Listing.find().limit(50)
  res.json(list)
})
// Seed route (for demo only) — create sample data if none
app.post('/api/seed', async (req,res)=>{
  const count = await Listing.countDocuments()
  if(count>0) return res.json({ seeded:false, count })
  const docs = [
    { title:'Sea View Bungalow — Goa', city:'Goa', price:3200, img:'https://images.unsplash.com/photo-1501117716987-c8e2f6c76a6c?q=80&w=800&auto=format&fit=crop' },
    { title:'Cozy Studio — Pondicherry', city:'Pondicherry', price:1800, img:'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=800&auto=format&fit=crop' },
    { title:'Heritage House — Jaipur', city:'Jaipur', price:2500, img:'https://images.unsplash.com/photo-1505691723518-36a33f0b6b96?q=80&w=800&auto=format&fit=crop' }
  ]
  await Listing.insertMany(docs)
  res.json({ seeded:true, count: await Listing.countDocuments() })
})
// Bookings
app.post('/api/bookings', authMiddleware, async (req,res)=> {
  const { listingId, startDate, endDate, guests } = req.body
  if(!listingId || !startDate || !endDate) return res.status(400).json({ error:'missing_fields' })
  const b = await Booking.create({ listingId, userId: req.userId, startDate: new Date(startDate), endDate: new Date(endDate), guests })
  res.json(b)
})
app.get('/api/bookings', authMiddleware, async (req,res)=> {
  const bookings = await Booking.find({ userId: req.userId }).populate('listingId')
  res.json(bookings)
})
// Simple health
app.get('/api/health', (req,res)=> res.json({ ok:true }))
const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('Server running on', PORT))
