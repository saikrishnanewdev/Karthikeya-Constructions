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
  const [adminError, setAdminError] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [status, setStatus] = useState('');
  const [adminForm, setAdminForm] = useState({ title:'', category:'Commercial', year:new Date().getFullYear(), status:'ongoing', image:'' });
  const [editingId, setEditingId] = useState(null);
  const [inquiries, setInquiries] = useState([]);

  const loadInquiries = async () => {
    let { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) { const r = await supabase.from('inquiries').select('*'); data = r.data; }
    setInquiries(data || []);
  };
  useEffect(() => { if (adminToken) loadInquiries(); }, [adminToken]);

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
  const delInquiry = async (id) => { await supabase.from('inquiries').delete().eq('id', id); setInquiries(prev=>prev.filter(q=>q.id!==id)); };
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' });
  const [pwMsg, setPwMsg] = useState('');
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwMsg('New passwords do not match.'); return; }
    if (pwForm.next.length < 6) { setPwMsg('New password must be at least 6 characters.'); return; }
    const { data, error } = await supabase.rpc('change_admin_password', { old_p: pwForm.current, new_p: pwForm.next });
    if (error) { setPwMsg('Password change is not set up yet. Please try again later.'); return; }
    if (data) { setPwMsg('Password changed. Use the new password next time you log in.'); setPwForm({ current:'', next:'', confirm:'' }); }
    else setPwMsg('Current password is wrong.');
  };
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg('Uploading...');
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const { error } = await supabase.storage.from('project-images').upload(path, file);
    if (error) { setUploadMsg('Upload failed: ' + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('project-images').getPublicUrl(path);
    setAdminForm(f => ({ ...f, image: data.publicUrl }));
    setUploadMsg('Uploaded. Click Add/Update Project to save it.');
    setUploading(false);
  };

  if (window.location.pathname === '/admin') {
    return (
      <div className="app admin">
        <header className="nav admin-nav">
          <div className="logo">
            <span className="logo-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M12 7v.01" /></svg>
            </span>
            <span className="logo-text">Karthikeya <span>Constructions</span></span>
          </div>
          {adminToken && (
            <div className="admin-nav-actions">
              <a href="/" className="btn btn-outline">View Site</a>
              <button className="btn btn-outline" type="button" onClick={()=>{setAdminToken(''); setAdminPass('');}}>Logout</button>
            </div>
          )}
        </header>
        {!adminToken ? (
          <main className="admin-main">
            <div className="admin-panel admin-login">
              <h1>Admin Login</h1>
              <p className="sub">Sign in to manage projects, enquiries and settings.</p>
              <form onSubmit={async e=>{e.preventDefault(); setAdminError(''); const { data, error } = await supabase.rpc('check_admin_password', { p: adminPass }); if (data) setAdminToken('ok'); else setAdminError(error ? 'Login is not set up yet. Please try again later.' : 'Wrong password. Try again.');}} className="form admin-form">
                <div className="field">
                  <label htmlFor="admin-password">Password</label>
                  <input id="admin-password" type="password" placeholder="Enter admin password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} />
                </div>
                {adminError && <p className="err">{adminError}</p>}
                <button className="btn btn-primary" type="submit">Login</button>
              </form>
            </div>
          </main>
        ) : (
          <main className="admin-main">
            <div className="admin-title">
              <h1>Admin Dashboard</h1>
              <p>Manage projects, customer enquiries and settings for Karthikeya Constructions.</p>
            </div>
            <div className="admin-stats">
              <div className="stat"><b>{projects.length}</b><span>Total Projects</span></div>
              <div className="stat"><b>{projects.filter(p=>p.status==='ongoing').length}</b><span>Ongoing</span></div>
              <div className="stat"><b>{projects.filter(p=>p.status==='completed').length}</b><span>Completed</span></div>
              <div className="stat"><b>{inquiries.length}</b><span>Enquiries</span></div>
            </div>
            <section className="admin-panel">
              <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>
              <p className="sub">{editingId ? 'Update the project details below.' : 'Add a new project to the website.'}</p>
              <form onSubmit={addProject} className="form admin-form admin-form-grid">
                <div className="field">
                  <label htmlFor="project-title">Title *</label>
                  <input id="project-title" placeholder="e.g. Skyline Towers" value={adminForm.title} onChange={e=>setAdminForm({...adminForm,title:e.target.value})} required />
                </div>
                <div className="field">
                  <label htmlFor="project-category">Category</label>
                  <select id="project-category" value={adminForm.category} onChange={e=>setAdminForm({...adminForm,category:e.target.value})}>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="project-year">Year</label>
                  <input id="project-year" type="number" value={adminForm.year} onChange={e=>setAdminForm({...adminForm,year:+e.target.value})} />
                </div>
                <div className="field">
                  <label htmlFor="project-status">Status</label>
                  <select id="project-status" value={adminForm.status} onChange={e=>setAdminForm({...adminForm,status:e.target.value})}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="field field-full">
                  <label htmlFor="project-image">Image URL</label>
                  <input id="project-image" placeholder="https://..." value={adminForm.image} onChange={e=>setAdminForm({...adminForm,image:e.target.value})} />
                </div>
                <div className="field field-full">
                  <label htmlFor="project-upload">Or upload a photo</label>
                  <input id="project-upload" type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
                  {uploadMsg && <p style={{margin:0}}>{uploadMsg}</p>}
                  {adminForm.image && <img src={adminForm.image} alt="Project preview" style={{maxWidth:220, borderRadius:8}} />}
                </div>
                <div className="admin-form-actions field-full">
                  <button className="btn btn-primary" type="submit" disabled={uploading}>{editingId?'Update Project':'Add Project'}</button>
                  {editingId && <button className="btn btn-outline" type="button" onClick={()=>{setEditingId(null); setAdminForm({ title:'', category:'Commercial', year:new Date().getFullYear(), status:'ongoing', image:'' });}}>Cancel</button>}
                </div>
              </form>
            </section>
            <section className="admin-panel">
              <h2>Projects ({projects.length})</h2>
              <p className="sub">All projects shown on the website.</p>
              {projects.length === 0 ? (
                <p>No projects yet. Add your first project above.</p>
              ) : (
                <div className="project-list">
                  {projects.map(p=>(
                    <div className="project-row" key={p.id}>
                      {p.image && <img src={p.image} alt="" className="project-thumb" />}
                      <div className="project-row-info">
                        <h3>{p.title}</h3>
                        <p>{p.category} · {p.year}</p>
                      </div>
                      <span className={`pill ${p.status==='completed' ? 'pill-completed' : 'pill-ongoing'}`}>{p.status}</span>
                      <div className="project-row-actions">
                        <button className="btn btn-outline" onClick={()=>editProject(p)}>Edit</button>
                        <button className="btn btn-danger" onClick={()=>delProject(p.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="admin-panel">
              <h2>Customer Enquiries ({inquiries.length})</h2>
              <p className="sub">Messages sent through the contact form on the website, newest first.</p>
              {inquiries.length === 0 ? (
                <p>No enquiries yet. When a customer fills the contact form, their details will appear here.</p>
              ) : (
                <div className="grid-2">
                  {inquiries.map(q=>(
                    <div className="card enquiry-card" key={q.id}>
                      <h3>{q.name}</h3>
                      {q.created_at && <p>{new Date(q.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'numeric', minute:'2-digit' })}</p>}
                      {q.phone && <p>Phone: <a href={`tel:${q.phone.replace(/[^+\d]/g,'')}`}>{q.phone}</a></p>}
                      {q.email && <p>Email: <a href={`mailto:${q.email}`}>{q.email}</a></p>}
                      <p>{q.message}</p>
                      <button className="btn btn-danger" onClick={()=>delInquiry(q.id)} style={{marginTop:12}}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="admin-panel">
              <h2>Change Password</h2>
              <p className="sub">Update the admin login password. You will need the new password next time you log in.</p>
              <form onSubmit={changePassword} className="form admin-form">
                <div className="field">
                  <label htmlFor="pw-current">Current password</label>
                  <input id="pw-current" type="password" placeholder="Current password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} required />
                </div>
                <div className="field">
                  <label htmlFor="pw-new">New password</label>
                  <input id="pw-new" type="password" placeholder="New password (min 6 characters)" value={pwForm.next} onChange={e=>setPwForm({...pwForm,next:e.target.value})} required />
                </div>
                <div className="field">
                  <label htmlFor="pw-confirm">Confirm new password</label>
                  <input id="pw-confirm" type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} required />
                </div>
                {pwMsg && <p style={{margin:0}}>{pwMsg}</p>}
                <button className="btn btn-primary" type="submit">Change Password</button>
              </form>
            </section>
          </main>
        )}
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
          <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80" alt="Construction site with workers building a new structure" width="900" height="600" loading="eager" fetchPriority="high" decoding="async" />
        </div>
      </section>

      <section id="services" className="section">
        <div className="section-head">
          <h2>Our Services</h2>
          <p>Comprehensive construction solutions tailored to your vision.</p>
        </div>
        <div className="grid-3 scroll-row">
          {services.map(s => (
            <div className="card service-card" key={s.id}>
              <span className="service-icon"><ServiceIcon title={s.title} /></span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
        <p className="scroll-hint">Swipe to see more →</p>
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
        <div className="grid-3 scroll-row">
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
        <p className="scroll-hint">Swipe to see more →</p>
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
        <div className="section-head"><h2>Meet the Founder</h2></div>
        <div className="card">
          <p className="about-name">Raj Kumar</p>
          <p className="about-role">Founder &amp; Civil Engineer, Karthikeya Constructions</p>
          <p>Raj Kumar leads Karthikeya Constructions — residential, commercial and industrial construction in Hyderabad, delivered with quality, safety, and on-time completion. He is the main contact person for all project enquiries.</p>
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
