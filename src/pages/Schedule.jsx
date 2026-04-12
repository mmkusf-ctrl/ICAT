import MatchCard from '../components/MatchCard'
import { ft20Schedule } from '../data/ft20Schedule'

export default function Schedule() {
  return (
    <main className="container">
      <h1 className="section-title">FT20-2026 Schedule</h1>
      <div className="schedule-grid">
        {ft20Schedule.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </main>
  )
}
