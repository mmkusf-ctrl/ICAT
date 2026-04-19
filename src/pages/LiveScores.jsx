import bgImg from '../assets/cricket_action.png';
import MatchCard from '../components/MatchCard'
import { liveMatches } from '../data/mockData'

export default function LiveScores() {
  return (
    <main className="container">
      <section className="hero" style={{ 
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', 
        padding: '64px 32px', borderRadius: '12px', marginBottom: '32px', boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Live Scores</h1>
      </section>
      {liveMatches.map(match => <MatchCard key={match.id} match={match} />)}
    </main>
  )
}
