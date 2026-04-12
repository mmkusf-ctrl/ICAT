export default function MatchCard({ match }) {
  const isLive = match.status.toLowerCase() === 'live';
  const isResult = match.status.toLowerCase() === 'result';
  const badgeClass = isLive ? 'live' : isResult ? 'result' : 'upcoming';

  return (
    <div className="card match-card">
      <div className="match-header">
        <span className={`badge ${badgeClass}`}>{match.status}</span>
        <span className="match-venue">{match.venue}</span>
      </div>
      
      <div className="match-teams">
        <div className="team-row">
          <div className="team-info">
            <div className="team-circle"></div>
            {match.team1}
          </div>
          <div className="team-score">{match.score1}</div>
        </div>
        
        <div className="team-row">
          <div className="team-info">
            <div className="team-circle"></div>
            {match.team2}
          </div>
          <div className="team-score">{match.score2}</div>
        </div>
      </div>
      
      <div className="match-footer highlight">
        {match.result}
      </div>
    </div>
  )
}
