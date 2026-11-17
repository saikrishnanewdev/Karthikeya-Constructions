const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const projects = [
  { id:1, title:'Skyline Towers', category:'Commercial', year:2024, status:'completed', image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' },
  { id:2, title:'Green Villa Estate', category:'Residential', year:2023, status:'completed', image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80' },
  { id:3, title:'Metro Industrial Park', category:'Industrial', year:2024, status:'ongoing', image:'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80' }
];
const services = [
  { id:1, title:'Residential', desc:'Custom homes, villas and apartment complexes.' },
  { id:2, title:'Commercial', desc:'Office buildings, retail spaces and hospitality.' },
  { id:3, title:'Industrial', desc:'Warehouses, factories and infrastructure.' }
];
const testimonials = [
  { id:1, name:'Ramesh K.', text:'Delivered our villa on time with excellent quality.' },
  { id:2, name:'Priya S.', text:'Transparent pricing and professional team.' }
];

app.get('/api/projects', (req,res)=>res.json(projects));
app.get('/api/services', (req,res)=>res.json(services));
app.get('/api/testimonials', (req,res)=>res.json(testimonials));

const inquiries = [];
app.post('/api/contact', (req,res)=>{
  const { name, email, phone, message } = req.body || {};
  if(!name || !email || !message) return res.status(400).json({error:'Missing fields'});
  inquiries.push({ id:inquiries.length+1, name,email,phone,message,createdAt:new Date() });
  res.json({ ok:true });
});
app.get('/api/inquiries', (req,res)=>res.json(inquiries));

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';
function requireAdmin(req,res,next){ if(req.headers['x-admin-token']!==ADMIN_TOKEN) return res.status(401).json({error:'Unauthorized'}); next(); }
app.post('/api/projects', requireAdmin, (req,res)=>{
  const { title, category, year, status, image } = req.body || {};
  if(!title) return res.status(400).json({error:'Title required'});
  const p = { id: projects.length+1, title, category:category||'General', year: year||new Date().getFullYear(), status: status||'ongoing', image: image||'' };
  projects.push(p);
  res.json(p);
});
app.put('/api/projects/:id', requireAdmin, (req,res)=>{
  const p = projects.find(x=>x.id==req.params.id);
  if(!p) return res.status(404).json({error:'Not found'});
  const { title, category, year, status, image } = req.body || {};
  if(title) p.title=title;
  if(category) p.category=category;
  if(year) p.year=year;
  if(status) p.status=status;
  if(image) p.image=image;
  res.json(p);
});
  const idx = projects.findIndex(p=>p.id==req.params.id);
  if(idx===-1) return res.status(404).json({error:'Not found'});
  projects.splice(idx,1);
  res.json({ok:true});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log('Server on',PORT));
