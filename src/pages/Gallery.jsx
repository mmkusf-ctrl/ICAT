import bgImg from '../assets/clubhouse.png';
export default function Gallery() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Media Gallery</h1>
      </section>
      <div className="card fade-in">
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Game photos, event highlights, and ceremonies will be updated here soon.
        </p>
      </div>
    </main>
  );
}
