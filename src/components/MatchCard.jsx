export default function MatchCard({ match }) {
  return (
    <div className="card">
      <div className="badge">{match.status}</div>
      <h3>{match.team1} vs {match.team2}</h3>
      <p>{match.team1}: {match.score1}</p>
      <p>{match.team2}: {match.score2}</p>
      <p className="muted">{match.venue}</p>
      <p className="highlight">{match.result}</p>
    </div>
  )
}
