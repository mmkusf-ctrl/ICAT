import bgImg from '../assets/news_header.png';
import { news } from '../data/mockData'

export default function News() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>News</h1>
      </section>
      <div className="card">
        {news.map((item, idx) => <p key={idx}>• {item}</p>)}
      </div>
    </main>
  )
}
