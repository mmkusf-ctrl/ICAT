import bgImg from '../assets/team_huddle.png';
export default function Teams() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Teams</h1>
      </section>
      <div className="card">ICAT, Toons CC, Falcons CC, Floridians CC, and more.</div>
    </main>
  )
}
