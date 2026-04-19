import bgImg from '../assets/clubhouse.png';
export default function About() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>About ICAT</h1>
      </section>
      <div className="card fade-in">
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          The International Cricket Association of Tampa (ICAT) is dedicated to fostering the growth and development of cricket in Florida.
          More information coming soon.
        </p>
      </div>
    </main>
  );
}
