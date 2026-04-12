export default function MatchCard({ match }) {
  // Determine badge styling based on Status
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
            {/* Using a placeholder circle for a clean look assuming no logos */}
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            {match.team1}
          </div>
          <div className="team-score">{match.score1}</div>
        </div>
        
        <div className="team-row">
          <div className="team-info">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
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
