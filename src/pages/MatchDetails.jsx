import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scorecard');

  const tabs = ['Squads', 'Live', 'Scorecard', 'Commentary'];

  return (
    <main className="container match-center">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 0 }}>
          &larr; Back to Dashboard
        </button>
        <button onClick={() => navigate('/broadcast')} className="app-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <i className="fa-solid fa-tower-broadcast"></i> BROADCAST MATCH
        </button>
      </div>

      {/* Hero Header for the Match */}
      <section className="match-center-hero">
        <div className="match-center-status">
          <span className="badge live">LIVE</span>
          <span className="center-venue">FT20-2026 • Match {matchId}</span>
        </div>
        
        <div className="match-center-teams">
          <div className="center-team">
            <h2>Tampa Titans</h2>
            <div className="center-score">156/4 <span>(18.2 OV)</span></div>
          </div>
          <div className="center-vs">VS</div>
          <div className="center-team">
            <h2>Florida Kings</h2>
            <div className="center-score highlight">Yet to bat</div>
          </div>
        </div>
        
        <div className="match-center-footer">
          <p>Titans won the toss and elected to bat first.</p>
        </div>
      </section>

      {/* Tabbed Navigation */}
      <nav className="tab-nav">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab Content Areas */}
      <section className="tab-content">
        {activeTab === 'scorecard' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Tampa Titans Innings</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Batter</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A. Jain</td>
                    <td className="highlight">64</td>
                    <td>42</td>
                    <td>6</td>
                    <td>2</td>
                    <td>152.3</td>
                  </tr>
                  <tr>
                    <td>L. Sachdeva</td>
                    <td className="highlight">41*</td>
                    <td>30</td>
                    <td>4</td>
                    <td>1</td>
                    <td>136.6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Playing XI</h3>
            <div className="grid two">
              <div>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '16px' }}>Tampa Titans</h4>
                <ul className="squad-list">
                  <li>Aviral Jain (c)</li>
                  <li>Luvv Sachdeva</li>
                  <li>Nick Panwar (wk)</li>
                  <li>Ali Akbar</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-silver)', marginBottom: '16px' }}>Florida Kings</h4>
                <ul className="squad-list">
                  <li>Vamshi Krishna</li>
                  <li>Advait Varadharajan</li>
                  <li>Leslie Daniel</li>
                  <li>Moeen Sunasra (c)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Live Tracker</h3>
            <div className="live-tracker">
               <div className="over-box">
                 <span className="over-num">Over 18.2</span>
                 <div className="balls">
                   <span className="ball run">1</span>
                   <span className="ball dot">0</span>
                   <span className="ball boundary">4</span>
                   <span className="ball wicket">W</span>
                   <span className="ball run">1</span>
                   <span className="ball run">2</span>
                 </div>
               </div>
               <p style={{marginTop: '24px', color: 'var(--text-muted)'}}>Current Run Rate: 8.54 • Required Run Rate: N/A</p>
            </div>
          </div>
        )}

        {activeTab === 'commentary' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Ball by Ball</h3>
            <div className="comm-list">
               <div className="comm-item">
                 <div className="comm-over">18.2</div>
                 <div className="comm-text"><strong>WICKET!</strong> Caught and bowled. A stunning return catch stops the onslaught.</div>
               </div>
               <div className="comm-item">
                 <div className="comm-over">18.1</div>
                 <div className="comm-text"><strong>FOUR!</strong> Smashed through the covers, excellent timing.</div>
               </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
