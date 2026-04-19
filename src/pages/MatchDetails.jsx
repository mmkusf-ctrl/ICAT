import bgImg from '../assets/cricket_action.png';
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
  const [activeAction, setActiveAction] = useState(null); // 'Wd', 'B', 'LB', 'NB', 'Wicket', 'Penalty', 'Custom'
  const [subAction, setSubAction] = useState(null); // specific wicket type
  const [fielder, setFielder] = useState('');
  const [recentBalls, setRecentBalls] = useState([]);

  // Helper Functions
  const addTimelineBall = (val, type='run') => setRecentBalls(prev => [...prev.slice(-15), {val, type}]);

  const addRuns = (r) => {
    updateGlobal({ score: globalState.score + r });
    if(r > 0) addTimelineBall(r, 'run');
    else addTimelineBall('0', 'dot');
  };

  const addBall = () => updateGlobal({ 
    overs: (() => {
      const o = globalState.overs;
      const balls = Math.round((o - Math.floor(o)) * 10);
      return balls >= 5 ? Math.floor(o) + 1.0 : o + 0.1;
    })()
  });

  const handleSimpleExtra = (runs, displayStr, type='extra', countsAsBall=false) => {
    updateGlobal({ score: globalState.score + runs });
    addTimelineBall(displayStr, type);
    if(countsAsBall) addBall();
    setActiveAction(null);
  };

  const handleWicket = () => {
    updateGlobal({ wickets: globalState.wickets + 1 });
    addTimelineBall('W', 'wicket');
    addBall();
    setActiveAction(null);
    setSubAction(null);
    setFielder('');
  };

  const undoLastAction = () => {
    // simplified undo visual
    setRecentBalls(prev => prev.slice(0, -1));
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
                <h4 style={{ color: '#fff', marginBottom: '16px' }}>{globalState.bowlingTeam} (Fielding)</h4>
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

            {/* Recent Balls Timeline */}
            <div className="recent-balls">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '8px' }}>Recent:</span>
              {recentBalls.length === 0 ? <span style={{color: '#555', fontSize: '13px'}}>No actions yet</span> : recentBalls.map((b, i) => (
                <div key={i} className={`timeline-ball ${b.type === 'wicket' ? 'w' : (b.type === 'extra' || b.val >= 4 ? 'b' : '')}`} title={`${b.type}`}>
                  {b.val}
                </div>
              ))}
            </div>

            {/* Main Scoring Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px', marginBottom: '24px' }}>
               {/* 0 and Custom Runs */}
               <button className="scoring-grid-btn" onClick={() => { addRuns(0); addBall(); }}>0<span>Dot</span></button>
               <button className="scoring-grid-btn" onClick={() => { addRuns(1); addBall(); }}>1<span>Run</span></button>
               <button className="scoring-grid-btn" onClick={() => { addRuns(2); addBall(); }}>2<span>Runs</span></button>
               <button className="scoring-grid-btn" onClick={() => { addRuns(3); addBall(); }}>3<span>Runs</span></button>
               
               <button className="scoring-grid-btn" onClick={() => { addRuns(4); addBall(); }}>4<span>Boundary</span></button>
               <button className="scoring-grid-btn" onClick={() => { addRuns(6); addBall(); }}>6<span>Sixer</span></button>
               <button className="scoring-grid-btn" onClick={() => { setActiveAction(activeAction === 'Custom' ? null : 'Custom'); setSubAction(null); }} style={{ background: activeAction === 'Custom' ? 'var(--accent-primary)' : '', color: activeAction === 'Custom' ? '#000' : '' }}><span>Custom</span>Runs</button>
               
               {/* Extras Primary Nav */}
               <button className="scoring-grid-btn" onClick={() => { setActiveAction(activeAction === 'Extras' ? null : 'Extras'); setSubAction(null); }} style={{ background: activeAction === 'Extras' ? 'var(--accent-primary)' : '', color: activeAction === 'Extras' ? '#000' : '' }}><span>Extra</span>Options</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              <button className={`scoring-grid-btn ${activeAction === 'Wicket' ? 'active-danger' : ''}`} onClick={() => { setActiveAction(activeAction === 'Wicket' ? null : 'Wicket'); setSubAction(null); }} style={{ border: '1px solid rgba(230,57,70,0.4)', color: activeAction === 'Wicket' ? '#fff' : 'var(--accent-danger)' }}>
                 DISMISSAL (WICKET)
              </button>
            </div>

            {/* Custom Runs Panel */}
            {activeAction === 'Custom' && (
              <div className="slide-down" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: '#fff', fontWeight: 400 }}>Select Custom Runs (Overthrows/Penalties)</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[5, 7, 8].map(runs => (
                    <button key={runs} className="app-btn" onClick={() => { addRuns(runs); addBall(); setActiveAction(null); }}>
                      +{runs} Runs
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras Panel */}
            {activeAction === 'Extras' && (
              <div className="slide-down" style={{ padding: '24px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--accent-primary)', fontWeight: 400 }}>Extras Sub-Menu</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  <button className="app-btn" onClick={() => setSubAction(subAction === 'Wd' ? null : 'Wd')} style={{ background: subAction === 'Wd' ? '#fff' : '', color: subAction === 'Wd' ? '#000' : '' }}>Wide</button>
                  <button className="app-btn" onClick={() => setSubAction(subAction === 'NB' ? null : 'NB')} style={{ background: subAction === 'NB' ? '#fff' : '', color: subAction === 'NB' ? '#000' : '' }}>No Ball</button>
                  <button className="app-btn" onClick={() => setSubAction(subAction === 'B' ? null : 'B')} style={{ background: subAction === 'B' ? '#fff' : '', color: subAction === 'B' ? '#000' : '' }}>Byes</button>
                  <button className="app-btn" onClick={() => setSubAction(subAction === 'LB' ? null : 'LB')} style={{ background: subAction === 'LB' ? '#fff' : '', color: subAction === 'LB' ? '#000' : '' }}>Leg Byes</button>
                  <button className="app-btn" onClick={() => setSubAction(subAction === 'Pen' ? null : 'Pen')} style={{ borderColor: 'var(--accent-danger)', background: subAction === 'Pen' ? 'var(--accent-danger)' : '', color: subAction === 'Pen' ? '#fff' : '' }}>Penalty</button>
                </div>

                {subAction === 'Wd' && (
                  <div className="slide-down" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(v => (
                       <button key={`wd-${v}`} className="app-btn" onClick={() => handleSimpleExtra(v, `Wd${v>1?'+'+(v-1):''}`, 'extra', false)} style={{ background: '#111' }}>Wd+{v-1}</button>
                    ))}
                  </div>
                )}

                {subAction === 'NB' && (
                  <div className="slide-down" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 7].map(v => (
                       <button key={`nb-${v}`} className="app-btn" onClick={() => handleSimpleExtra(v, `NB${v>1?'+'+(v-1):''}`, 'extra', false)} style={{ background: '#111' }}>NB+{v-1}</button>
                    ))}
                  </div>
                )}

                {subAction === 'B' && (
                  <div className="slide-down" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(v => (
                       <button key={`b-${v}`} className="app-btn" onClick={() => handleSimpleExtra(v, `${v}B`, 'extra', true)} style={{ background: '#111' }}>{v} Bye</button>
                    ))}
                  </div>
                )}

                {subAction === 'LB' && (
                  <div className="slide-down" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(v => (
                       <button key={`lb-${v}`} className="app-btn" onClick={() => handleSimpleExtra(v, `${v}LB`, 'extra', true)} style={{ background: '#111' }}>{v} Leg Bye</button>
                    ))}
                  </div>
                )}

                {subAction === 'Pen' && (
                  <div className="slide-down" style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                    <button className="app-btn" onClick={() => handleSimpleExtra(5, 'Pen', 'extra', false)} style={{ borderColor: 'var(--accent-danger)' }}>+5 Penalty Runs</button>
                  </div>
                )}
              </div>
            )}

            {/* Wicket Panel */}
            {activeAction === 'Wicket' && (
              <div className="slide-down" style={{ padding: '24px', background: 'rgba(230, 57, 70, 0.05)', borderRadius: '8px', border: '1px solid rgba(230, 57, 70, 0.3)', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--accent-danger)' }}>Select Dismissal Type</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {['Caught', 'Bowled', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Caught & Bowled', 'Ret Hurt', 'Obstruct Field', 'Mankad'].map(type => (
                    <button 
                      key={type} 
                      className="app-btn" 
                      onClick={() => setSubAction(type)}
                      style={{ background: subAction === type ? 'var(--accent-danger)' : '#111', color: subAction === type ? '#fff' : '', borderColor: subAction === type ? 'var(--accent-danger)' : '' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {['Caught', 'Stumped'].includes(subAction) && (
                  <div className="slide-down" style={{ paddingTop: '16px', borderTop: '1px solid rgba(230,57,70,0.2)' }}>
                    <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Fielder / Keeper Involved:</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select value={fielder} onChange={e => setFielder(e.target.value)} style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-light)', color: '#fff', flex: 1, borderRadius: '4px' }}>
                        <option value="">Select Fielder...</option>
                        {currentFieldingSquad.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                      </select>
                      <button className="app-btn" onClick={handleWicket} disabled={!fielder} style={{ borderColor: 'var(--accent-danger)' }}>Confirm {subAction}</button>
                    </div>
                  </div>
                )}

                {subAction === 'Run Out' && (
                  <div className="slide-down" style={{ paddingTop: '16px', borderTop: '1px solid rgba(230,57,70,0.2)' }}>
                     <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Runs Completed Before Runout:</p>
                     <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                       {['W', 'W+1', 'W+2', 'W+3'].map((wType, i) => (
                         <button key={wType} className="app-btn" onClick={() => updateGlobal({ score: globalState.score + i })}>
                           {wType}
                         </button>
                       ))}
                     </div>
                     <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Fielder Involved:</p>
                     <div style={{ display: 'flex', gap: '16px' }}>
                       <select value={fielder} onChange={e => setFielder(e.target.value)} style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-light)', color: '#fff', flex: 1, borderRadius: '4px' }}>
                         <option value="">Select Fielder...</option>
                         {currentFieldingSquad.map((p, i) => p && <option key={i} value={p}>{p}</option>)}
                       </select>
                       <button className="app-btn" onClick={handleWicket} disabled={!fielder} style={{ borderColor: 'var(--accent-danger)' }}>Confirm Run Out</button>
                     </div>
                  </div>
                )}

                {['Bowled', 'LBW', 'Hit Wicket', 'Caught & Bowled', 'Ret Hurt', 'Obstruct Field', 'Mankad'].includes(subAction) && (
                  <div className="slide-down" style={{ paddingTop: '16px', borderTop: '1px solid rgba(230,57,70,0.2)' }}>
                    <button className="app-btn" onClick={handleWicket} style={{ background: 'var(--accent-danger)', color: '#fff' }}>Confirm {subAction}</button>
                  </div>
                )}
              </div>
            )}
            
            {/* Manual Edit Failsafe */}
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px dashed var(--border-light)' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase' }}>Manual Overrides</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="app-btn" onClick={() => { updateGlobal({ score: Math.max(0, globalState.score - 1) }); undoLastAction(); }} style={{ padding: '8px 16px', fontSize: '11px' }}>Undo Last Run</button>
                <button className="app-btn" onClick={() => { updateGlobal({ wickets: Math.max(0, globalState.wickets - 1) }); undoLastAction(); }} style={{ padding: '8px 16px', fontSize: '11px' }}>Undo Wicket</button>
                <button className="app-btn" onClick={() => { updateGlobal({ score: 0, wickets: 0, overs: 0.0 }); setRecentBalls([]); }} style={{ padding: '8px 16px', fontSize: '11px', borderColor: '#555', color: '#888' }}>Reset Match</button>
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
