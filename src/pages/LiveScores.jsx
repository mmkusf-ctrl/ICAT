import MatchCard from '../components/MatchCard'
import { liveMatches } from '../data/mockData'

export default function LiveScores() {
  return (
    <main className="container">
      <h1 className="section-title">Live Scores</h1>
      {liveMatches.map(match => <MatchCard key={match.id} match={match} />)}
    </main>
  )
}
