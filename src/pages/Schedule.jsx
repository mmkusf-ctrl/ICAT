import bgImg from '../assets/tournament_banner.png';
import MatchCard from '../components/MatchCard'
import { ft20Schedule } from '../data/ft20Schedule'

export default function Schedule() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>FT20-2026 Schedule</h1>
      </section>
      <div className="schedule-grid">
        {ft20Schedule.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </main>
  )
}
