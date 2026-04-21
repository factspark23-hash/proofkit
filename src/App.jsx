import React, { useState, useEffect, useCallback } from 'react'

/* ─── Helpers ──────────────────────────────────────── */
const genId = () => Math.random().toString(36).substring(2, 10)
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback }
  catch { return fallback }
}
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

/* ─── Styles (injected once) ──────────────────────── */
const css = `
:root { --accent: #6366f1; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#1a1a2e; background:#fff; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }
input, textarea, select { font-family: inherit; }

.nav { border-bottom:1px solid #f0f0f0; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:rgba(255,255,255,.92); backdrop-filter:blur(12px); z-index:50; }
.nav-brand { display:flex; align-items:center; gap:8px; font-weight:700; font-size:18px; }
.nav-logo { width:32px; height:32px; background:linear-gradient(135deg,#6366f1,#a855f7); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:14px; }
.btn-primary { padding:10px 20px; background:#6366f1; color:#fff; border:none; border-radius:10px; font-weight:600; font-size:14px; transition:background .2s; }
.btn-primary:hover { background:#4f46e5; }
.btn-secondary { padding:10px 20px; background:#fff; color:#374151; border:1px solid #e5e7eb; border-radius:10px; font-weight:500; font-size:14px; transition:background .2s; }
.btn-secondary:hover { background:#f9fafb; }
.btn-small { padding:6px 14px; font-size:13px; border-radius:8px; }
.btn-green { background:#16a34a; } .btn-green:hover { background:#15803d; }
.btn-red { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; } .btn-red:hover { background:#fecaca; }

.container { max-width:1100px; margin:0 auto; padding:0 24px; }
.section { padding:64px 0; }
.section-gray { background:#f9fafb; }
.h1 { font-size:48px; font-weight:700; line-height:1.1; letter-spacing:-1px; }
.h2 { font-size:30px; font-weight:700; text-align:center; }
.h3 { font-size:18px; font-weight:600; }
.subtitle { font-size:18px; color:#6b7280; line-height:1.6; }
.text-center { text-align:center; }

.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:24px; }
.card-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px; }

.badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; font-size:13px; font-weight:500; }
.badge-amber { background:#fffbeb; color:#b45309; }
.badge-indigo { background:#eef2ff; color:#4338ca; }

.stars { color:#f59e0b; }
.star-empty { color:#e5e7eb; }

.input { width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; outline:none; transition:border .2s; }
.input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.1); }
textarea.input { resize:vertical; }

.avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:14px; flex-shrink:0; }

.toast { position:fixed; bottom:24px; left:24px; background:#fff; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,.12); padding:12px 16px; display:flex; align-items:center; gap:12px; max-width:320px; z-index:100; animation:slideUp .4s ease-out; }
@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.cta-section { background:linear-gradient(135deg,#6366f1,#7c3aed); padding:80px 0; text-align:center; color:#fff; }
.cta-section h2 { font-size:36px; font-weight:700; }
.cta-section p { color:#c7d2fe; font-size:18px; margin-top:16px; }
.cta-btn { display:inline-block; margin-top:32px; padding:16px 32px; background:#fff; color:#6366f1; border-radius:12px; font-weight:700; font-size:18px; }

.comparison-table { width:100%; border-collapse:collapse; }
.comparison-table th, .comparison-table td { padding:12px 20px; text-align:left; border-bottom:1px solid #f0f0f0; font-size:14px; }
.comparison-table th { background:#f9fafb; font-weight:600; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:.5px; }
.highlight-row { background:#eef2ff !important; }
.highlight-row td { font-weight:600; color:#4338ca; }

.sidebar { width:220px; flex-shrink:0; }
.sidebar-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; }
.sidebar-item { width:100%; text-align:left; padding:8px 12px; border-radius:8px; border:none; background:none; font-size:13px; color:#4b5563; cursor:pointer; transition:background .15s; display:block; }
.sidebar-item:hover { background:#f3f4f6; }
.sidebar-item.active { background:#eef2ff; color:#4338ca; font-weight:500; }

.tab-bar { display:flex; gap:4px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:4px; margin-bottom:24px; }
.tab { flex:1; padding:8px 16px; border-radius:8px; border:none; background:none; font-size:13px; font-weight:500; color:#4b5563; cursor:pointer; transition:all .15s; }
.tab.active { background:#6366f1; color:#fff; }

.embed-code { background:#111827; border-radius:8px; padding:16px; overflow-x:auto; }
.embed-code code { color:#34d399; font-size:13px; white-space:pre; }

.dashboard-layout { display:flex; gap:24px; }

.testimonial-card { border:1px solid #e5e7eb; border-radius:12px; padding:20px; transition:box-shadow .2s; }
.testimonial-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); }
.testimonial-pending { border-color:#fbbf24; background:#fffbeb; }

.stat-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; text-align:center; }
.stat-number { font-size:28px; font-weight:700; }
.stat-label { font-size:13px; color:#6b7280; }

.footer { border-top:1px solid #f0f0f0; padding:32px 0; }
.footer-inner { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
.footer-links { display:flex; gap:24px; }
.footer-links a { font-size:14px; color:#9ca3af; }
.footer-links a:hover { color:#4b5563; }

@media (max-width:768px) {
  .h1 { font-size:32px; }
  .dashboard-layout { flex-direction:column; }
  .sidebar { width:100%; }
  .card-grid { grid-template-columns:1fr; }
}
`

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

/* ─── Shared Components ───────────────────────────── */
function Nav({ onNavigate }) {
  return (
    <nav className="nav">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
        <div className="nav-logo">P</div>
        ProofKit
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <a href="#pricing" onClick={e => { e.preventDefault(); onNavigate('/#pricing') }} style={{ fontSize: 14, color: '#6b7280' }}>Pricing</a>
        <button className="btn-primary" onClick={() => onNavigate('/dashboard')}>
          Dashboard →
        </button>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span style={{ color: '#9ca3af', fontSize: 14 }}>© 2026 ProofKit — Social proof for everyone.</span>
        <div className="footer-links">
          <a href="https://github.com">GitHub</a>
          <a href="https://twitter.com">Twitter</a>
          <a href="https://producthunt.com">Product Hunt</a>
        </div>
      </div>
    </footer>
  )
}

/* ─── Landing Page ────────────────────────────────── */
function LandingPage({ onNavigate }) {
  const [toastIdx, setToastIdx] = useState(0)
  const notifications = [
    { name: 'Sarah K.', action: 'just purchased Pro Plan', loc: 'New York', time: '2 min ago' },
    { name: 'Mike R.', action: 'just signed up', loc: 'London', time: '5 min ago' },
    { name: 'Anna L.', action: 'left a 5-star review', loc: 'Berlin', time: '8 min ago' },
  ]

  useEffect(() => {
    const t = setInterval(() => setToastIdx(i => (i + 1) % (notifications.length + 2)), 2500)
    return () => clearInterval(t)
  }, [])

  const n = notifications[toastIdx % notifications.length]

  return (
    <div>
      {/* Hero */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: 16 }}>💰 70% cheaper than Proof.com</span>
            <h1 className="h1">
              Social proof that<br />
              <span style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>actually converts</span>
            </h1>
            <p className="subtitle" style={{ marginTop: 20 }}>
              Show "someone just purchased" notifications. Collect testimonials with one link. Embed everything with one line of code. All for $9/mo.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '14px 28px', fontSize: 16 }} onClick={() => onNavigate('/dashboard')}>
                Start Free — No Card Required
              </button>
              <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
                See Live Demo ↓
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>Free tier: 5 testimonials + social proof · Upgrade to $9/mo for unlimited</p>
          </div>

          {/* Live demo */}
          <div style={{ position: 'relative', background: '#111827', borderRadius: 16, padding: 32, minHeight: 280, overflow: 'hidden' }}>
            <div style={{ opacity: .15 }}>
              <div style={{ height: 16, background: '#374151', borderRadius: 4, width: '30%', marginBottom: 12 }} />
              <div style={{ height: 12, background: '#1f2937', borderRadius: 4, width: '60%', marginBottom: 8 }} />
              <div style={{ height: 12, background: '#1f2937', borderRadius: 4, width: '45%', marginBottom: 16 }} />
              <div style={{ height: 80, background: '#1f2937', borderRadius: 8, marginBottom: 16 }} />
              <div style={{ height: 12, background: '#1f2937', borderRadius: 4, width: '70%' }} />
            </div>
            {toastIdx < notifications.length + 1 && (
              <div className="toast" style={{ position: 'absolute', bottom: 24, left: 24 }}>
                <div className="avatar" style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', width: 36, height: 36, fontSize: 13 }}>
                  {n.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.name} <span style={{ fontWeight: 400, color: '#6b7280' }}>{n.action}</span></div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>📍 {n.loc} · {n.time}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 48 }}>Why your conversions suck</h2>
          <div className="card-grid">
            {[
              { icon: '👻', title: 'No social proof', desc: 'Visitors land on your page, see no one else is buying, and bounce. You lose 70% of potential conversions.' },
              { icon: '💸', title: 'Existing tools cost $29+/mo', desc: 'Proof.com, FOMO, Senja — all charge enterprise prices for a simple notification widget.' },
              { icon: '🔧', title: 'DIY is painful', desc: 'Building your own means dealing with webhooks, real-time updates, animations, and cross-browser bugs.' },
            ].map((item, i) => (
              <div className="card" key={i}>
                <div style={{ fontSize: 36 }}>{item.icon}</div>
                <h3 className="h3" style={{ marginTop: 16 }}>{item.title}</h3>
                <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="h2">Two products in one</h2>
          <p className="subtitle text-center" style={{ maxWidth: 600, margin: '12px auto 48px' }}>
            Social proof notifications AND testimonial collection. Others charge separately for both.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div style={{ background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', borderRadius: 16, padding: 32, border: '1px solid #e0e7ff' }}>
              <div style={{ width: 48, height: 48, background: '#6366f1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>🔔</div>
              <h3 className="h3" style={{ fontSize: 22 }}>Social Proof Notifications</h3>
              <p style={{ color: '#4b5563', marginTop: 8, marginBottom: 20, fontSize: 14 }}>Real-time activity popups that build trust instantly.</p>
              {['One-line embed — paste and go', 'Custom messages, avatars, positions', 'Auto-rotate, dismiss, animate', 'Webhook API for any event', 'Purchase, signup, review templates'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#374151' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 16, padding: 32, border: '1px solid #fde68a' }}>
              <div style={{ width: 48, height: 48, background: '#f59e0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>⭐</div>
              <h3 className="h3" style={{ fontSize: 22 }}>Testimonial Collection</h3>
              <p style={{ color: '#4b5563', marginTop: 8, marginBottom: 20, fontSize: 14 }}>Stop chasing testimonials via email. Send one link, collect them all.</p>
              {['Shareable collection link', 'Star ratings + company + role', 'Moderation before display', 'Embeddable testimonial wall', 'Schema markup for SEO'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#374151' }}>
                  <span style={{ color: '#d97706', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="section section-gray" id="pricing">
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 className="h2">The pricing is the point</h2>
          <p className="subtitle text-center" style={{ marginBottom: 48 }}>Same features. A third of the price.</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="comparison-table">
              <thead>
                <tr><th>Tool</th><th>Price</th><th>Features</th></tr>
              </thead>
              <tbody>
                <tr><td>Proof.com</td><td style={{ color: '#6b7280' }}>$29/mo</td><td style={{ color: '#9ca3af' }}>Full suite</td></tr>
                <tr><td>FOMO</td><td style={{ color: '#6b7280' }}>$25/mo</td><td style={{ color: '#9ca3af' }}>Full suite</td></tr>
                <tr><td>Senja</td><td style={{ color: '#6b7280' }}>$29/mo</td><td style={{ color: '#9ca3af' }}>Testimonials</td></tr>
                <tr className="highlight-row"><td>⚡ ProofKit</td><td>$9/mo</td><td>Everything</td></tr>
              </tbody>
            </table>
          </div>
          <div className="text-center" style={{ marginTop: 32 }}>
            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, boxShadow: '0 4px 14px rgba(99,102,241,.3)' }} onClick={() => onNavigate('/dashboard')}>
              Start Free — Upgrade When Ready
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 48 }}>Live in 3 minutes</h2>
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { step: '1', title: 'Create your widget', desc: 'Pick notifications, testimonials, or both. Choose colors and position.' },
              { step: '2', title: 'Add your content', desc: 'Collect testimonials via a shareable link. Or send events via webhook.' },
              { step: '3', title: 'Embed on your site', desc: 'One line of JavaScript. Works on any site. Conversions go up.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div style={{ width: 56, height: 56, background: '#6366f1', color: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto' }}>{item.step}</div>
                <h3 className="h3" style={{ marginTop: 16 }}>{item.title}</h3>
                <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Stop losing conversions to a trust gap.</h2>
          <p>Add social proof to your site in 3 minutes. First 5 testimonials free.</p>
          <a href="#" className="cta-btn" onClick={e => { e.preventDefault(); onNavigate('/dashboard') }}>Get ProofKit Free →</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ─── Dashboard ───────────────────────────────────── */
function Dashboard({ onNavigate }) {
  const [widgets, setWidgets] = useState(() => load('pk_widgets', []))
  const [activeId, setActiveId] = useState(widgets[0]?.id || null)
  const [tab, setTab] = useState('settings')

  const active = widgets.find(w => w.id === activeId) || null

  const updateWidget = useCallback((updated) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === updated.id ? updated : w)
      save('pk_widgets', next)
      return next
    })
  }, [])

  const createWidget = () => {
    const w = {
      id: genId(), name: `Widget ${widgets.length + 1}`, type: 'both',
      testimonials: [], events: [], position: 'bottom-right',
      accentColor: '#6366f1', showAvatar: true, autoRotate: true,
    }
    const next = [...widgets, w]
    setWidgets(next)
    save('pk_widgets', next)
    setActiveId(w.id)
  }

  // Listen for cross-tab updates (testimonial submissions)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'pk_widgets') {
        const updated = load('pk_widgets', [])
        setWidgets(updated)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Poll for same-tab updates
  useEffect(() => {
    const t = setInterval(() => {
      const stored = load('pk_widgets', [])
      if (active && JSON.stringify(stored) !== JSON.stringify(widgets)) {
        setWidgets(stored)
      }
    }, 2000)
    return () => clearInterval(t)
  }, [active, widgets])

  const tabs = [
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'testimonials', label: '⭐ Testimonials' },
    { id: 'events', label: '🔔 Social Proof' },
    { id: 'preview', label: '👁️ Preview' },
  ]

  return (
    <div>
      <Nav onNavigate={onNavigate} />
      <div className="container" style={{ padding: '24px 24px' }}>
        <div className="dashboard-layout">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>Your Widgets</h3>
                <button onClick={createWidget} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 500, fontSize: 13 }}>+ New</button>
              </div>
              {widgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>No widgets yet</p>
                  <button className="btn-primary btn-small" onClick={createWidget}>Create First Widget</button>
                </div>
              ) : (
                widgets.map(w => (
                  <button key={w.id} className={`sidebar-item ${activeId === w.id ? 'active' : ''}`} onClick={() => setActiveId(w.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.accentColor }} />
                      {w.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginLeft: 16 }}>
                      {w.testimonials.filter(t => t.approved).length} reviews · {w.events.length} events
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!active ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 48 }}>👈</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>Create a widget to get started</h2>
                <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>Click "+ New" in the sidebar.</p>
              </div>
            ) : (
              <>
                <div className="tab-bar">
                  {tabs.map(t => (
                    <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                  ))}
                </div>

                {tab === 'settings' && <SettingsTab widget={active} onUpdate={updateWidget} onNavigate={onNavigate} />}
                {tab === 'testimonials' && <TestimonialsTab widget={active} onUpdate={updateWidget} />}
                {tab === 'events' && <EventsTab widget={active} onUpdate={updateWidget} />}
                {tab === 'preview' && <PreviewTab widget={active} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ widget, onUpdate, onNavigate }) {
  const embedCode = `<script src="https://yourdomain.com/widget/${widget.id}.js"></script>`
  const submitUrl = `${window.location.origin}${window.location.pathname}#/submit/${widget.id}`
  const wallUrl = `${window.location.origin}${window.location.pathname}#/wall/${widget.id}`

  const copy = (text) => navigator.clipboard.writeText(text)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Widget Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Widget Name</label>
            <input className="input" value={widget.name} onChange={e => onUpdate({ ...widget, name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Type</label>
            <select className="input" value={widget.type} onChange={e => onUpdate({ ...widget, type: e.target.value })}>
              <option value="both">Testimonials + Social Proof</option>
              <option value="testimonials">Testimonials Only</option>
              <option value="social-proof">Social Proof Only</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Position</label>
            <select className="input" value={widget.position} onChange={e => onUpdate({ ...widget, position: e.target.value })}>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Accent Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={widget.accentColor} onChange={e => onUpdate({ ...widget, accentColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
              <input className="input" value={widget.accentColor} onChange={e => onUpdate({ ...widget, accentColor: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="h3">📋 Embed Code</h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Paste this before the closing <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>&lt;/body&gt;</code> tag on your site.</p>
        <div className="embed-code"><code>{embedCode}</code></div>
        <div><button className="btn-secondary btn-small" onClick={() => copy(embedCode)}>Copy to Clipboard</button></div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="h3">🔗 Testimonial Collection Link</h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Send this to your happy customers to collect testimonials.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" readOnly value={submitUrl} style={{ background: '#f9fafb', color: '#6b7280' }} />
          <button className="btn-primary btn-small" onClick={() => copy(submitUrl)}>Copy</button>
          <button className="btn-secondary btn-small" onClick={() => onNavigate(`/submit/${widget.id}`)}>Open →</button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="h3">🌐 Public Testimonial Wall</h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Share your approved testimonials on a public page.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" readOnly value={wallUrl} style={{ background: '#f9fafb', color: '#6b7280' }} />
          <button className="btn-secondary btn-small" onClick={() => copy(wallUrl)}>Copy</button>
          <button className="btn-primary btn-small" onClick={() => onNavigate(`/wall/${widget.id}`)}>View →</button>
        </div>
      </div>
    </div>
  )
}

function TestimonialsTab({ widget, onUpdate }) {
  const approved = widget.testimonials.filter(t => t.approved)
  const pending = widget.testimonials.filter(t => !t.approved)

  const toggle = id => onUpdate({ ...widget, testimonials: widget.testimonials.map(t => t.id === id ? { ...t, approved: !t.approved } : t) })
  const remove = id => onUpdate({ ...widget, testimonials: widget.testimonials.filter(t => t.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="stat-card"><div className="stat-number">{widget.testimonials.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: '#16a34a' }}>{approved.length}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: '#d97706' }}>{pending.length}</div><div className="stat-label">Pending</div></div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <h3 className="h3" style={{ marginBottom: 16 }}>⏳ Pending Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(t => (
              <div key={t.id} className="testimonial-pimonial testimonial-pending" style={{ borderRadius: 12, padding: 16, border: '1px solid #fbbf24', background: '#fffbeb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ background: `linear-gradient(135deg,${widget.accentColor},${widget.accentColor}88)` }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}{t.company && <span style={{ color: '#6b7280', fontWeight: 400 }}> · {t.company}</span>}</div>
                      <div className="stars" style={{ fontSize: 13 }}>{Array.from({ length: t.rating }).map((_, i) => '★').join('')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary btn-small btn-green" onClick={() => toggle(t.id)}>✓ Approve</button>
                    <button className="btn-red btn-small" onClick={() => remove(t.id)}>✕</button>
                  </div>
                </div>
                <p style={{ marginTop: 12, fontSize: 14, color: '#374151', fontStyle: 'italic' }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="h3" style={{ marginBottom: 16 }}>✅ Approved ({approved.length})</h3>
        {approved.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 14 }}>No approved testimonials yet. Share your collection link to start gathering them!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {approved.map(t => (
              <div key={t.id} className="testimonial-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="avatar" style={{ background: `linear-gradient(135deg,${widget.accentColor},${widget.accentColor}88)` }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{t.name}{t.company && <span style={{ color: '#6b7280', fontWeight: 400 }}> · {t.company}</span>}</div>
                    <div className="stars" style={{ fontSize: 13 }}>{Array.from({ length: t.rating }).map((_, i) => '★').join('')}</div>
                    <p style={{ fontSize: 14, color: '#4b5563', marginTop: 4, fontStyle: 'italic' }}>"{t.text}"</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }} onClick={() => toggle(t.id)}>Unapprove</button>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }} onClick={() => remove(t.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EventsTab({ widget, onUpdate }) {
  const [newEvent, setNewEvent] = useState({ type: 'purchase', message: '', location: '' })

  const add = () => {
    if (!newEvent.message) return
    const event = { id: genId(), widgetId: widget.id, ...newEvent, timestamp: new Date().toISOString() }
    onUpdate({ ...widget, events: [...widget.events, event] })
    setNewEvent({ type: 'purchase', message: '', location: '' })
  }

  const remove = id => onUpdate({ ...widget, events: widget.events.filter(e => e.id !== id) })

  const typeIcon = { purchase: '🛒', signup: '👤', review: '⭐', custom: '📝' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Add Social Proof Event</h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Or send via API: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>POST /api/events</code></p>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="input" style={{ width: 140, flexShrink: 0 }} value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
            <option value="purchase">🛒 Purchase</option>
            <option value="signup">👤 Signup</option>
            <option value="review">⭐ Review</option>
            <option value="custom">📝 Custom</option>
          </select>
          <input className="input" value={newEvent.message} onChange={e => setNewEvent({ ...newEvent, message: e.target.value })} placeholder="Sarah from NYC just purchased Pro Plan" style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="input" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="New York, US" style={{ flex: 1 }} />
          <button className="btn-primary" onClick={add} disabled={!newEvent.message} style={{ opacity: newEvent.message ? 1 : .5 }}>Add Event</button>
        </div>
      </div>

      <div className="card">
        <h3 className="h3" style={{ marginBottom: 16 }}>Events ({widget.events.length})</h3>
        {widget.events.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 14 }}>No events yet. Add some to see them in your widget preview.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...widget.events].reverse().map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{typeIcon[e.type]}</span>
                  <div>
                    <div style={{ fontSize: 14 }}>{e.message}</div>
                    {e.location && <div style={{ fontSize: 12, color: '#9ca3af' }}>📍 {e.location}</div>}
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }} onClick={() => remove(e.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="h3">📡 Webhook API</h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Send events from your backend, Stripe webhooks, or Zapier.</p>
        <div className="embed-code">
          <code>{`curl -X POST https://yourdomain.com/api/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "widgetId": "${widget.id}",
    "type": "purchase",
    "message": "Sarah just bought Pro Plan",
    "location": "New York"
  }'`}</code>
        </div>
      </div>
    </div>
  )
}

function PreviewTab({ widget }) {
  const approved = widget.testimonials.filter(t => t.approved)
  const latest = widget.events[widget.events.length - 1]

  const posStyle = {
    position: 'absolute',
    [widget.position.includes('bottom') ? 'bottom' : 'top']: 16,
    [widget.position.includes('right') ? 'right' : 'left']: 16,
  }

  return (
    <div className="card">
      <h3 className="h3" style={{ marginBottom: 16 }}>Live Preview</h3>
      <div style={{ position: 'relative', background: '#f3f4f6', borderRadius: 12, minHeight: 350, overflow: 'hidden', padding: 16 }}>
        <div style={{ opacity: .25 }}>
          <div style={{ height: 24, background: '#9ca3af', borderRadius: 4, width: '25%', marginBottom: 12 }} />
          <div style={{ height: 12, background: '#d1d5db', borderRadius: 4, width: '75%', marginBottom: 8 }} />
          <div style={{ height: 12, background: '#d1d5db', borderRadius: 4, width: '50%', marginBottom: 16 }} />
          <div style={{ height: 120, background: '#e5e7eb', borderRadius: 8, marginBottom: 16 }} />
          <div style={{ height: 12, background: '#d1d5db', borderRadius: 4, width: '65%' }} />
        </div>

        {/* Social proof toast */}
        {(widget.type === 'social-proof' || widget.type === 'both') && latest && (
          <div className="toast" style={posStyle}>
            {widget.showAvatar && (
              <div className="avatar" style={{ background: widget.accentColor, width: 32, height: 32, fontSize: 12 }}>{latest.message[0]}</div>
            )}
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{latest.message}</div>
              {latest.location && <div style={{ fontSize: 10, color: '#9ca3af' }}>📍 {latest.location}</div>}
            </div>
          </div>
        )}

        {/* Testimonial cards */}
        {(widget.type === 'testimonials' || widget.type === 'both') && approved.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {approved.slice(0, 2).map(t => (
              <div key={t.id} style={{ background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', borderLeft: `4px solid ${widget.accentColor}` }}>
                <div className="stars" style={{ fontSize: 11, marginBottom: 4 }}>{Array.from({ length: t.rating }).map(() => '★').join('')}</div>
                <p style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>"{t.text.substring(0, 80)}..."</p>
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>— {t.name}{t.company && `, ${t.company}`}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Submit Page (testimonial collection) ────────── */
function SubmitPage({ widgetId, onNavigate }) {
  const [widget, setWidget] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', role: '', text: '', rating: 5 })

  useEffect(() => {
    const widgets = load('pk_widgets', [])
    setWidget(widgets.find(w => w.id === widgetId) || null)
  }, [widgetId])

  const handleSubmit = e => {
    e.preventDefault()
    if (!widget || !form.name || !form.text) return
    const testimonial = { id: genId(), widgetId: widget.id, ...form, avatar: '', approved: false, createdAt: new Date().toISOString() }
    const widgets = load('pk_widgets', [])
    const updated = widgets.map(w => w.id === widget.id ? { ...w, testimonials: [...w.testimonials, testimonial] } : w)
    save('pk_widgets', updated)
    setSubmitted(true)
  }

  if (!widget) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Widget not found</h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>This testimonial form doesn't exist or has been removed.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate('/')}>Go Home</button>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 40 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 24 }}>Thank you!</h1>
        <p style={{ color: '#6b7280', marginTop: 16 }}>Your testimonial has been submitted. The {widget.name} team will review it and it may appear on their site soon.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: widget.accentColor, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: 700, fontSize: 18 }}>{widget.name[0]}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Share your experience with {widget.name}</h1>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>Your feedback helps others. It only takes a minute!</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>How would you rate your experience? <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })} style={{ background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', transition: 'transform .15s', color: s <= form.rating ? '#f59e0b' : '#e5e7eb' }}>★</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your testimonial <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea className="input" rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="What did you like? What results did you get?" required />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{form.text.length}/500</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your name <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sarah Kim" required />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>Company</label>
              <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="DesignFlow" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your role</label>
            <input className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Founder, Marketing Lead, etc." />
          </div>

          <button type="submit" disabled={!form.name || !form.text} className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 16, background: form.name && form.text ? widget.accentColor : '#9ca3af' }}>
            Submit Testimonial
          </button>
          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>Your testimonial will be reviewed before being displayed.</p>
        </form>
      </div>
    </div>
  )
}

/* ─── Wall Page (public testimonial display) ──────── */
function WallPage({ widgetId }) {
  const [widget, setWidget] = useState(null)

  useEffect(() => {
    const widgets = load('pk_widgets', [])
    setWidget(widgets.find(w => w.id === widgetId) || null)
  }, [widgetId])

  if (!widget) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div><div style={{ fontSize: 48 }}>🔍</div><h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Wall not found</h1></div>
    </div>
  )

  const approved = widget.testimonials.filter(t => t.approved)
  const avg = approved.length > 0 ? (approved.reduce((s, t) => s + t.rating, 0) / approved.length).toFixed(1) : '0'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, background: widget.accentColor, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: 700, fontSize: 22 }}>{widget.name[0]}</div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>What people say about {widget.name}</h1>
          {approved.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <span className="stars" style={{ fontSize: 20 }}>{Array.from({ length: 5 }).map((_, i) => i < Math.round(parseFloat(avg)) ? '★' : '☆').join('')}</span>
              <span style={{ fontWeight: 500 }}>{avg} out of 5</span>
              <span style={{ color: '#9ca3af' }}>({approved.length} {approved.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        {approved.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48 }}>⭐</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>No testimonials yet</h2>
            <p style={{ color: '#6b7280', marginTop: 8 }}>Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            {approved.map(t => (
              <div key={t.id} className="testimonial-card">
                <div className="stars" style={{ marginBottom: 12 }}>{Array.from({ length: t.rating }).map(() => '★').join('')}</div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <div className="avatar" style={{ background: widget.accentColor }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{[t.role, t.company].filter(Boolean).join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 32, borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Powered by <a href="#" style={{ color: '#6366f1' }}>ProofKit</a></p>
        </div>
      </div>
    </div>
  )
}

/* ─── Router ──────────────────────────────────────── */
export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = (path) => {
    window.location.hash = path
  }

  const hash = route.replace('#', '') || '/'
  const parts = hash.split('/').filter(Boolean)

  // Routes
  if (parts[0] === 'dashboard') {
    return <><StyleTag /><Dashboard onNavigate={navigate} /></>
  }
  if (parts[0] === 'submit' && parts[1]) {
    return <><StyleTag /><SubmitPage widgetId={parts[1]} onNavigate={navigate} /></>
  }
  if (parts[0] === 'wall' && parts[1]) {
    return <><StyleTag /><WallPage widgetId={parts[1]} /></>
  }

  return <><StyleTag /><LandingPage onNavigate={navigate} /></>
}
