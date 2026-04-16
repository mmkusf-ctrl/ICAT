import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  // Connection and State
  const [socketUrl, setSocketUrl] = useState('http://localhost:3000');
  const socketRef = useRef(null);
  const [globalState, setGlobalState] = useState({
    score: 0, wickets: 0, overs: 0.0,
    battingTeam: 'ICAT', bowlingTeam: 'OPP',
    squad1: Array(12).fill(''), squad2: Array(12).fill(''),
    keeper1: '', keeper2: '',
    striker: '', nonStriker: '', bowler: ''
  });

  useEffect(() => {
    socketRef.current = io(socketUrl);
    socketRef.current.on('sync-state', (payload) => {
      setGlobalState(prev => ({ ...prev, ...payload }));
    });
    return () => socketRef.current.disconnect();
  }, [socketUrl]);

  const updateGlobal = (updates) => {
    if (socketRef.current) socketRef.current.emit('update-state', updates);
  };

  const [activeTab, setActiveTab] = useState('scoring panel');
  const tabs = ['Settings', 'Scoring Panel', 'Squads', 'Live', 'Scorecard', 'Commentary'];

  // Scoring Modals State
  const [activeAction, setActiveAction] = useState(null); // 'Wd', 'Byes', 'NB', 'Wicket'
  const [subAction, setSubAction] = useState(null); // 'Caught', 'Runout'
  const [fielder, setFielder] = useState('');

  // Helper Functions
  const addRuns = (r) => updateGlobal({ score: globalState.score + r });
  const addBall = () => updateGlobal({ 
    overs: (() => {
      const o = globalState.overs;
      const balls = Math.round((o - Math.floor(o)) * 10);
      return balls >= 5 ? Math.floor(o) + 1.0 : o + 0.1;
    })()
  });

  const handleSimpleExtra = (runs) => {
    updateGlobal({ score: globalState.score + runs });
    setActiveAction(null);
  };

  const handleWicket = () => {
    updateGlobal({ wickets: globalState.wickets + 1 });
    addBall();
    setActiveAction(null);
    setSubAction(null);
    setFielder('');
  };

  const currentFieldingSquad = globalState.bowlingTeam === 'OPP' ? globalState.squad2 : globalState.squad1;

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
          <span className="badge live">LIVE SCORESYNC</span>
          <span className="center-venue">FT20-2026 • Match {matchId}</span>
        </div>
        
        <div className="match-center-teams">
          <div className="center-team">
            <h2>{globalState.battingTeam}</h2>
            <div className="center-score highlight">{globalState.score}/{globalState.wickets} <span>({Number(globalState.overs).toFixed(1)} OV)</span></div>
          </div>
          <div className="center-vs">VS</div>
          <div className="center-team">
            <h2>{globalState.bowlingTeam}</h2>
            <div className="center-score">Fielding</div>
          </div>
        </div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Striker: <strong>{globalState.striker || '-'}</strong> • Non-Striker: <strong>{globalState.nonStriker || '-'}</strong> • Bowler: <strong>{globalState.bowler || '-'}</strong></p>
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
        
        {/* Settings Tab - Squads and Active Roles */}
        {activeTab === 'settings' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Match Configuration & Squads</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Backend Server URL</label>
              <input 
                type="text" 
                value={socketUrl} 
                onChange={(e) => setSocketUrl(e.target.value)} 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-page)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '4px' }}
              />
            </div>

            <div className="grid two" style={{ gap: '24px', marginBottom: '32px' }}>
              {/* Batting Team Configuration */}
              <div>
                <h4 style={{ color: 'var(--accent-red)', marginBottom: '16px' }}>{globalState.battingTeam} (Batting)</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {globalState.squad1.map((player, idx) => (
                    <input 
                      key={`s1-${idx}`}
                      type="text" 
                      placeholder={idx === 11 ? "12th Man" : `Player ${idx + 1}`}
                      value={player}
                      onChange={(e) => {
                        const newSquad = [...globalState.squad1];
                        newSquad[idx] = e.target.value;
                        updateGlobal({ squad1: newSquad });
                      }}
                      style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '2px' }}
                    />
                  ))}
                  <select 
                    value={globalState.keeper1} 
                    onChange={(e) => updateGlobal({ keeper1: e.target.value })}
                    style={{ marginTop: '16px', padding: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  >
                    <option value="">Select Wicket Keeper</option>
                    {globalState.squad1.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Bowling Team Configuration */}
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '16px' }}>{globalState.bowlingTeam} (Fielding)</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {globalState.squad2.map((player, idx) => (
                    <input 
                      key={`s2-${idx}`}
                      type="text" 
                      placeholder={idx === 11 ? "12th Man" : `Player ${idx + 1}`}
                      value={player}
                      onChange={(e) => {
                        const newSquad = [...globalState.squad2];
                        newSquad[idx] = e.target.value;
                        updateGlobal({ squad2: newSquad });
                      }}
                      style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '2px' }}
                    />
                  ))}
                  <select 
                    value={globalState.keeper2} 
                    onChange={(e) => updateGlobal({ keeper2: e.target.value })}
                    style={{ marginTop: '16px', padding: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  >
                    <option value="">Select Wicket Keeper</option>
                    {globalState.squad2.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Players Assignment */}
            <div style={{ padding: '24px', border: '1px solid var(--border-light)', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--accent-red)' }}>Assign Active Play</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <select value={globalState.striker} onChange={(e) => updateGlobal({ striker: e.target.value })} style={{ padding: '8px', background: '#111', color: '#fff' }}>
                  <option value="">Select Striker...</option>
                  {globalState.squad1.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                </select>
                <select value={globalState.nonStriker} onChange={(e) => updateGlobal({ nonStriker: e.target.value })} style={{ padding: '8px', background: '#111', color: '#fff' }}>
                  <option value="">Select Non-Striker...</option>
                  {globalState.squad1.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                </select>
                <select value={globalState.bowler} onChange={(e) => updateGlobal({ bowler: e.target.value })} style={{ padding: '8px', background: '#111', color: '#fff' }}>
                  <option value="">Select Bowler...</option>
                  {globalState.squad2.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Professional Scoring Panel Tab */}
        {activeTab === 'scoring panel' && (
          <div className="card tab-pane fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="pane-title">Professional Score Dashboard</h3>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Batting: <strong>{globalState.battingTeam}</strong>
              </div>
            </div>

            {/* Base Scoring Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <button 
                  key={`run-${runs}`} 
                  className="app-btn" 
                  onClick={() => { addRuns(runs); addBall(); }} 
                  style={{ justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}
                >
                  +{runs}
                </button>
              ))}
            </div>

            {/* Extra Options Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <button className="app-btn" onClick={() => setActiveAction(activeAction === 'Wd' ? null : 'Wd')} style={{ justifyContent: 'center', background: activeAction === 'Wd' ? 'var(--accent-red)' : '' }}>Wide (Wd)</button>
              <button className="app-btn" onClick={() => setActiveAction(activeAction === 'Byes' ? null : 'Byes')} style={{ justifyContent: 'center', background: activeAction === 'Byes' ? 'var(--accent-red)' : '' }}>Byes/LB</button>
              <button className="app-btn" onClick={() => setActiveAction(activeAction === 'NB' ? null : 'NB')} style={{ justifyContent: 'center', background: activeAction === 'NB' ? 'var(--accent-red)' : '' }}>No Ball (NB)</button>
              <button className="app-btn" onClick={() => setActiveAction(activeAction === 'Wicket' ? null : 'Wicket')} style={{ justifyContent: 'center', background: activeAction === 'Wicket' ? 'var(--accent-red)' : 'rgba(230, 57, 70, 0.2)' }}>WICKET!</button>
            </div>

            {/* Render Contextual Sub-Modals Based on Active Action */}
            {activeAction === 'Wd' && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Select Wide Value</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="app-btn" onClick={() => handleSimpleExtra(1)}>Wd</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(2)}>Wd+1</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(3)}>Wd+2</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(4)}>Wd+3</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(5)}>Wd+4</button>
                </div>
              </div>
            )}

            {activeAction === 'Byes' && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Select Byes Value (Ball Counted)</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5, 6].map(val => (
                    <button key={val} className="app-btn" onClick={() => { handleSimpleExtra(val); addBall(); }}>{val}</button>
                  ))}
                </div>
              </div>
            )}

            {activeAction === 'NB' && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Select No Ball Value</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="app-btn" onClick={() => handleSimpleExtra(1)}>NB</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(2)}>Nb+1</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(3)}>Nb+2</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(4)}>Nb+3</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(5)}>Nb+4</button>
                  <button className="app-btn" onClick={() => handleSimpleExtra(7)}>Nb+6</button>
                </div>
              </div>
            )}

            {activeAction === 'Wicket' && (
              <div style={{ padding: '24px', background: 'rgba(230, 57, 70, 0.1)', borderRadius: '4px', marginBottom: '24px', border: '1px solid rgba(230, 57, 70, 0.3)' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--accent-red)' }}>Wicket Type</h4>
                
                {/* Level 1: Wicket Type */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {['Caught', 'Runout', 'Mankad', 'Bowled', 'LBW'].map(type => (
                    <button 
                      key={type} 
                      className="app-btn" 
                      onClick={() => setSubAction(type)}
                      style={{ background: subAction === type ? '#fff' : '', color: subAction === type ? '#000' : '' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Level 2: Wicket Context (Caught/Runout) */}
                {subAction === 'Caught' && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Caught By Fielder:</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select value={fielder} onChange={e => setFielder(e.target.value)} style={{ padding: '8px', background: '#111', color: '#fff', flex: 1 }}>
                        <option value="">Select Fielder...</option>
                        {currentFieldingSquad.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                      </select>
                      <button className="app-btn" onClick={handleWicket} disabled={!fielder}>Confirm Catch</button>
                    </div>
                  </div>
                )}

                {subAction === 'Runout' && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Runs Completed Before Runout:</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {['W', 'W+1', 'W+2', 'W+3', 'W+4'].map((wType, i) => (
                        <button key={wType} className="app-btn" onClick={() => updateGlobal({ score: globalState.score + i })}>
                          {wType}
                        </button>
                      ))}
                    </div>
                    <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Fielder Involved:</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select value={fielder} onChange={e => setFielder(e.target.value)} style={{ padding: '8px', background: '#111', color: '#fff', flex: 1 }}>
                        <option value="">Select Fielder...</option>
                        {currentFieldingSquad.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                      </select>
                      <button className="app-btn" onClick={handleWicket} disabled={!fielder}>Confirm Runout</button>
                    </div>
                  </div>
                )}

                {/* Level 2: Direct Confirm (Mankad, Bowled, LBW) */}
                {['Mankad', 'Bowled', 'LBW'].includes(subAction) && (
                  <div style={{ marginTop: '16px' }}>
                    <button className="app-btn" onClick={handleWicket} style={{ background: 'var(--accent-red)', color: '#fff' }}>Confirm {subAction}</button>
                  </div>
                )}
              </div>
            )}
            
            {/* Manual Edit Failsafe */}
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px dashed var(--border-light)' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase' }}>Manual Overrides</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="app-btn" onClick={() => updateGlobal({ score: Math.max(0, globalState.score - 1) })} style={{ padding: '8px', fontSize: '11px' }}>-1 Run (Undo)</button>
                <button className="app-btn" onClick={() => updateGlobal({ wickets: Math.max(0, globalState. wickets - 1) })} style={{ padding: '8px', fontSize: '11px' }}>-1 Wicket (Undo)</button>
                <button className="app-btn" onClick={() => updateGlobal({ score: 0, wickets: 0, overs: 0.0 })} style={{ padding: '8px', fontSize: '11px', borderColor: '#a1a1aa', color: '#a1a1aa' }}>Reset Match</button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Static Tabs Fallbacks */}
        {activeTab === 'squads' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Syncing with Settings...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Playing XI is dynamic. Configure this in the Settings tab during this match.</p>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="card tab-pane fade-in">
            <h3 className="pane-title">Live Tracker Component Disabled</h3>
            <p style={{ color: 'var(--text-muted)' }}>Live tracker is controlled purely by the main stream overlay for this event.</p>
          </div>
        )}
      </section>
    </main>
  );
}
