import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import PointsTable from '../components/PointsTable';
import StatLeaders from '../components/StatLeaders';
import { ft20Schedule } from '../data/ft20Schedule';
import { ft20GroupA, ft20GroupB } from '../data/ft20Points';
import { liveMatches, topBatters, topBowlers } from '../data/mockData';
import { ft20Teams } from '../data/ft20Teams';

export default function TournamentHub() {
  const { tournamentId } = useParams();
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = ['Live Matches', 'Upcoming', 'Schedule', 'Stats', 'Teams'];

  // Data Selectors
  const upcomingMatches = ft20Schedule.slice(0, 6);
  
  return (
    <main className="container match-center">
      {/* Cinematic Tournament Header */}
      <section className="match-center-hero" style={{ padding: '64px', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', color: 'var(--accent-gold)', marginBottom: '16px', letterSpacing: '2px' }}>
          {tournamentId === 'ft20-2026' ? 'FRIENDSHIP CUP T20 26' : 'TOURNAMENT HUB'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', letterSpacing: '1px' }}>
          Florida's Premier Cricket Championship
        </p>
      </section>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab.toLowerCase().replace(' ', '-') ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab Content Areas */}
      <section className="tab-content" style={{ marginTop: '32px' }}>
        
        {/* LIVE MATCHES */}
        {activeTab === 'live-matches' && (
          <div className="fade-in">
            <h3 className="pane-title">Currently Live</h3>
            {liveMatches.length > 0 ? (
              <div className="schedule-grid">
                {liveMatches.map((match, idx) => <MatchCard key={idx} match={match} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No live matches at the moment.</p>
            )}
          </div>
        )}

        {/* UPCOMING MATCHES NO.2 */}
        {activeTab === 'upcoming' && (
          <div className="fade-in">
            <h3 className="pane-title">Next Week Matches</h3>
            <div className="schedule-grid">
               {upcomingMatches.map((match) => (
                 <MatchCard key={match.id} match={match} />
               ))}
            </div>
          </div>
        )}

        {/* FULL SCHEDULE NO.3 */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            <h3 className="pane-title">Tournament Fixtures</h3>
            <div className="schedule-grid">
               {ft20Schedule.map((match) => (
                 <MatchCard key={match.id} match={match} />
               ))}
            </div>
          </div>
        )}

        {/* STATS NO.4 */}
        {activeTab === 'stats' && (
          <div className="fade-in">
            <h3 className="pane-title">Standings & Insights</h3>
            <div className="grid two">
              <div>
                <PointsTable title="Group A (League Matches)" table={ft20GroupA} />
                <PointsTable title="Group B (League Matches)" table={ft20GroupB} />
              </div>
              <div className="side-stack">
                <StatLeaders title="Top Batters" items={topBatters} />
                <StatLeaders title="Top Bowlers" items={topBowlers} />
              </div>
            </div>
          </div>
        )}

        {/* TEAMS NO.5 */}
        {activeTab === 'teams' && (
          <div className="fade-in">
            <h3 className="pane-title">Participating Squads</h3>
            <div className="teams-grid">
              {ft20Teams.map((team, idx) => (
                <div key={idx} className="card team-card">
                  <h4 style={{ color: 'var(--text-main)', fontSize: '18px', marginBottom: '8px' }}>{team.name}</h4>
                  <span className="badge upcoming" style={{ marginBottom: '16px', display: 'inline-block' }}>{team.group}</span>
                  <ul className="squad-list">
                    {team.squad.map((player, pIdx) => (
                      <li key={pIdx}>{player}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
