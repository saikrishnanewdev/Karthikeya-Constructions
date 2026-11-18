import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import './App.css';

const PHONE_DISPLAY = '+91 9848081090';
const PHONE_LINK = 'tel:+919848081090';

// Simple inline icons (no emoji): picked by service title.
function ServiceIcon({ title }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (/interior/i.test(title)) {
    return (<svg {...common}><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 11h.01M15 11h.01" /></svg>);
  }
  if (/renovat/i.test(title)) {
    return (<svg {...common}><path d="M3 21h18M6 21V10l6-6 6 6v11M9 21v-4h6v4M14 7l3 3" /></svg>);
  }
  return (<svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>);
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [status, setStatus] = useState('');
  const [adminForm, setAdminForm] = useState({ title:'', category:'Commercial', year:new Date().getFullYear(), status:'ongoing', image:'' });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data: p } = await supabase.from('projects').select('*');
    const { data: s } = await supabase.from('services').select('*');
    setProjects(p || []);
    setServices(s || []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('inquiries').insert([form]);
    if (!error) { setStatus('sent'); setForm({name:'',email:'',phone:'',message:''}); }
    else setStatus('error');
  };

  const addProject = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { data } = await supabase.from('projects').update(adminForm).eq('id', editingId).select();
      if (data) { setProjects(prev=>prev.map(x=>x.id===editingId?data[0]:x)); setEditingId(null); setAdminForm({ title:'', category:'Commercial', year:new Date().getFullYear(), status:'ongoing', image:'' }); }
      return;
    }
    const { data } = await supabase.from('projects').insert([adminForm]).select();
    if (data) { setProjects(prev=>[...prev, data[0]]); setAdminForm({ title:'', category:'Commercial', year:new Date().getFullYear(), status:'ongoing', image:'' }); }
  };
  const editProject = (p) => { setEditingId(p.id); setAdminForm({ title:p.title, category:p.category, year:p.year, status:p.status, image:p.image }); };
  const delProject = async (id) => { await supabase.from('projects').delete().eq('id', id); setProjects(prev=>prev.filter(p=>p.id!==id)); };

  if (window.location.pathname === '/admin') {
    return (
      <div className="app">
        <header className="nav"><div className="logo">Admin</div></header>
        <section className="section">
          {!adminToken ? (
            <div className="contact">
              <h2>Admin Login</h2>
              <form onSubmit={e=>{e.preventDefault(); if(adminPass==='admin123') setAdminToken(adminPass);}} className="form">
                <input type="password" placeholder="Password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} />
                <button className="btn btn-primary" type="submit">Login</button>
              </form>
            </div>
          ) : (
            <>
              <div className="section-head"><h2>Manage Projects</h2></div>
              <form onSubmit={addProject} className="form">
                <input placeholder="Title" value={adminForm.title} onChange={e=>setAdminForm({...adminForm,title:e.target.value})} required />
                <input placeholder="Category" value={adminForm.category} onChange={e=>setAdminForm({...adminForm,category:e.target.value})} />
                <input placeholder="Year" type="number" value={adminForm.year} onChange={e=>setAdminForm({...adminForm,year:+e.target.value})} />
                <select value={adminForm.status} onChange={e=>setAdminForm({...adminForm,status:e.target.value})}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <input placeholder="Image URL" value={adminForm.image} onChange={e=>setAdminForm({...adminForm,image:e.target.value})} />
                <button className="btn btn-primary" type="submit">{editingId?'Update Project':'Add Project'}</button>
              </form>
              <div className="grid-3" style={{marginTop:24}}>
                {projects.map(p=>(
                  <div className="card" key={p.id}>
                    <h3>{p.title}</h3>
                    <p>{p.category} · {p.year} · {p.status}</p>
                    <button className="btn btn-outline" onClick={()=>editProject(p)} style={{marginTop:12,marginRight:8}}>Edit</button>
                    <button className="btn btn-outline" onClick={()=>delProject(p.id)} style={{marginTop:12}}>Delete</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="nav">
        <div className="logo">
          <span className="logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M12 7v.01" /></svg>
          </span>
          <span className="logo-text">Karthikeya <span>Constructions</span></span>
        </div>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="mobile-menu">
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-call" href={PHONE_LINK} onClick={() => setMenuOpen(false)}>Call {PHONE_DISPLAY}</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Building Tomorrow's Landmarks, Today.</h1>
          <p>Karthikeya Constructions delivers end-to-end residential, commercial and industrial construction with precision engineering.</p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-primary">Start Your Project</a>
            <a href="#projects" className="btn btn-outline">View Our Work</a>
          </div>
        </div>
        <div className="hero-img">
          <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80" alt="Construction site with building plans" width="900" height="600" loading="eager" fetchPriority="high" decoding="async" />
        </div>
      </section>

      <section id="services" className="section">
        <div className="section-head">
          <h2>Our Services</h2>
          <p>Comprehensive construction solutions tailored to your vision.</p>
        </div>
        <div className="grid-3">
          {services.map(s => (
            <div className="card service-card" key={s.id}>
              <span className="service-icon"><ServiceIcon title={s.title} /></span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="section alt">
        <div className="section-head">
          <h2>Featured Projects</h2>
          <p>A selection of recent work.</p>
        </div>
        <div className="filters">
          {['all','completed','ongoing'].map(f => (
            <button key={f} className={`filter ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="grid-3">
          {projects.filter(p=>filter==='all'||p.status===filter).map(p => (
            <div className="project" key={p.id}>
              <img src={p.image} alt={p.title} />
              <div className="overlay">
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.category} {' · '} {p.year} {' · '} {p.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="section">
        <div className="contact">
          <h2>Ready to Build Something Great?</h2>
          <p>Tell us about your project.</p>
          <a className="btn btn-call" href={PHONE_LINK}>Call {PHONE_DISPLAY}</a>
          <form onSubmit={submit} className="form">
            <div className="field">
              <label htmlFor="contact-name">Name *</label>
              <input id="contact-name" name="name" placeholder="Your name" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email *</label>
              <input id="contact-email" name="email" placeholder="you@example.com" type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="field">
              <label htmlFor="contact-phone">Phone</label>
              <input id="contact-phone" name="phone" placeholder="Your phone number" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message *</label>
              <textarea id="contact-message" name="message" placeholder="Tell us about your project" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={status==='sending'}>Send Message</button>
            {status==='sent' && <p className="ok">Thanks! We'll be in touch.</p>}
            {status==='error' && <p className="err">Something went wrong.</p>}
          </form>
        </div>
      </section>

      <section className="section about">
        <div className="section-head"><h2>About</h2></div>
        <div className="card">
          <p><strong>Raj Kumar</strong></p>
          <p>Residential, commercial and industrial construction in Hyderabad — with quality, safety, and on-time delivery.</p>
          <p>Mobile: <a href={PHONE_LINK}>{PHONE_DISPLAY}</a></p>
          <p>Address: Hyderabad</p>
        </div>
      </section>

      <footer>
        <nav className="footer-links" aria-label="Footer">
          <a href="#services">Services</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <p>Call: <a href={PHONE_LINK}>{PHONE_DISPLAY}</a> · Hyderabad</p>
        <p>© 2026 Karthikeya Constructions. All rights reserved.</p>
      </footer>
    </div>
  );
}
