import bgImg from '../assets/tournament_banner.png';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import PointsTable from '../components/PointsTable';
import StatLeaders from '../components/StatLeaders';
import { ft20Schedule } from '../data/ft20Schedule';
import { ft20GroupA, ft20GroupB } from '../data/ft20Points';
import { liveMatches, topBatters, topBowlers } from '../data/mockData';
import { ft20Teams } from '../data/ft20Teams';
import { ft20Results } from '../data/ft20Results';

export default function TournamentHub() {
  const { tournamentId } = useParams();
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = ['LIVE', 'RESULTS', 'Upcoming', 'Schedule', 'Points Table', 'Stats', 'Teams'];

  // Data Selectors
  const upcomingMatches = ft20Schedule.slice(0, 6);
  
  return (
    <main className="container match-center">
      {/* Cinematic Tournament Header */}
      <section className="match-center-hero" style={{ padding: '64px', marginBottom: '48px' , backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'}}>
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
        
        {/* LIVE */}
        {activeTab === 'live' && (
          <div className="fade-in">
            <h3 className="pane-title">Currently Live</h3>
            {liveMatches && liveMatches.length > 0 ? (
              <div className="schedule-grid">
                {liveMatches.map((match, idx) => <MatchCard key={idx} match={match} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No live matches are happening right now.</p>
            )}
          </div>
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <div className="fade-in">
            <h3 className="pane-title">Past Results</h3>
            <div className="schedule-grid">
               {ft20Results.map((match) => (
                 <MatchCard key={match.id} match={match} />
               ))}
            </div>
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

        {/* POINTS TABLE N0.4 */}
        {activeTab === 'points-table' && (
          <div className="fade-in">
            <h3 className="pane-title">Tournament Standings</h3>
            <div className="points-grid">
              <PointsTable title="Group A (League Matches)" table={ft20GroupA} />
              <PointsTable title="Group B (League Matches)" table={ft20GroupB} />
            </div>
          </div>
        )}

        {/* STATS NO.5 */}
        {activeTab === 'stats' && (
          <div className="fade-in">
            <h3 className="pane-title">Player Leaderboards</h3>
            <div className="grid two">
              <StatLeaders title="Top Batters" items={topBatters} />
              <StatLeaders title="Top Bowlers" items={topBowlers} />
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
                  <h4 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>{team.name}</h4>
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
