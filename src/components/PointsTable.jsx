import { useState, Fragment } from 'react';
import { ft20Schedule } from '../data/ft20Schedule';
import { ft20Results } from '../data/ft20Results';

export default function PointsTable({ title = "Points Table", table }) {
  const [expandedTeam, setExpandedTeam] = useState(null);

  // Combine both schedules and results to sweep for a team's matches
  const allMatches = [...ft20Results, ...ft20Schedule];

  const getTeamMatches = (teamName) => {
    return allMatches.filter(match => match.team1 === teamName || match.team2 === teamName);
  };

  const handleRowClick = (teamName) => {
    if (expandedTeam === teamName) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamName);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <h2 className="section-title" style={{ fontSize: '18px' }}>{title}</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
              <th>NRR</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => {
              const matches = getTeamMatches(row.team);
              const isExpanded = expandedTeam === row.team;

              return (
                <Fragment key={i}>
                  <tr 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(row.team)}
                    className={isExpanded ? 'expanded-row-active' : 'clickable-row'}
                  >
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="caret-icon" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '10px' }}>▼</span>
                      {row.team}
                    </td>
                    <td>{row.p}</td>
                    <td>{row.w}</td>
                    <td>{row.l}</td>
                    <td style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{row.pts}</td>
                    <td style={{ color: row.nrr.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)' }}>{row.nrr}</td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="accordion-row">
                      <td colSpan="6" style={{ padding: '0' }}>
                        <div className="accordion-content">
                          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '14px' }}>Match History & Fixtures</h4>
                          {matches.length > 0 ? (
                            <div className="accordion-matches-list">
                              {matches.map(m => {
                                const isOpponentTeam1 = m.team2 === row.team;
                                const opponent = isOpponentTeam1 ? m.team1 : m.team2;
                                const isPast = m.status.toLowerCase() === 'past';
                                
                                return (
                                  <div key={m.id} className="accordion-match-item">
                                    <div className="match-mini-details">
                                      <span className={`badge ${isPast ? 'result' : 'upcoming'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{m.status}</span>
                                      <span style={{ fontWeight: '600', fontSize: '13px' }}>vs {opponent}</span>
                                    </div>
                                    <div className="match-mini-meta">
                                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{isPast ? m.result : m.result /* Schedule holds date in result prop */}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No match data found for {row.team}.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
