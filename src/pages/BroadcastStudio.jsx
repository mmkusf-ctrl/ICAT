import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function BroadcastStudio() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  
  // Scoring State
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0.0);
  const [battingTeam, setBattingTeam] = useState('ICAT');
  const [bowlingTeam, setBowlingTeam] = useState('OPP');

  // Request Animation Frame reference for drawing
  const requestRef = useRef();

  // Initialize Camera
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
      }
    }
    initCamera();

    return () => {
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Animation Loop (Compositing Video + Stats to Canvas)
  const drawFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Draw the actual camera feed
    ctx.drawImage(videoRef.current, 0, 0, 1920, 1080);
    
    // Draw the Score Overlay (The "TV Bug")
    drawScoreOverlay(ctx);
    
    requestRef.current = requestAnimationFrame(drawFrame);
  };

  const drawScoreOverlay = (ctx) => {
    // Semi-transparent dark background for the score bug
    ctx.fillStyle = 'rgba(10, 20, 45, 0.85)';
    ctx.fillRect(100, 900, 800, 100);

    // Red highlight accent stripe
    ctx.fillStyle = '#E63946';
    ctx.fillRect(100, 900, 10, 100);

    // Text configuration
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px "Outfit", sans-serif';
    ctx.textBaseline = 'middle';

    // Teams
    ctx.fillText(`${battingTeam} vs ${bowlingTeam}`, 140, 950);

    // Score & Wickets
    ctx.fillStyle = '#c5a059'; // Gold accent
    ctx.font = 'bold 64px "Outfit", sans-serif';
    ctx.fillText(`${score}-${wickets}`, 550, 950);

    // Overs
    ctx.fillStyle = '#a1a1aa'; // Muted text
    ctx.font = '400 36px "Inter", sans-serif';
    ctx.fillText(`OVERS: ${overs.toFixed(1)}`, 740, 955);
  };

  useEffect(() => {
    // Start drawing loop only when video is playing
    const video = videoRef.current;
    if (video) {
      video.onplay = () => {
        requestRef.current = requestAnimationFrame(drawFrame);
      };
    }
  }, [score, wickets, overs, battingTeam, bowlingTeam]); // Re-bind if dependencies change so drawFrame uses latest state

  // RTMP Streaming Logic
  const startStream = () => {
    socketRef.current = io(serverUrl);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to Ingest Server');
      socketRef.current.emit('start-stream');

      // Capture canvas stream at 30fps
      const canvasStream = canvasRef.current.captureStream(30);
      
      // Merge audio from camera
      const audioTracks = videoRef.current.srcObject.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }

      mediaRecorderRef.current = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 4000000 // 4 Mbps
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && socketRef.current.connected) {
          socketRef.current.emit('binary-stream', e.data);
        }
      };

      // Send chunks every 250ms
      mediaRecorderRef.current.start(250);
      setStreamActive(true);
    });
  };

  const stopStream = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.emit('stop-stream');
      socketRef.current.disconnect();
    }
    setStreamActive(false);
  };

  // Helper Score Update Functions
  const addRuns = (runs) => setScore(s => s + runs);
  const addWicket = () => setWickets(w => w + 1);
  const addBall = () => setOvers(o => {
    const balls = Math.round((o - Math.floor(o)) * 10);
    if (balls >= 5) return Math.floor(o) + 1.0;
    return o + 0.1;
  });

  return (
    <main className="container fade-in">
      <section className="match-center-hero" style={{ padding: '32px', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '36px', marginBottom: '8px' }}>Captain's Broadcast Studio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Streams live at 1080p@30fps to ICAT YouTube Channel</p>
      </section>

      <div className="grid two">
        {/* Stream Preview Column */}
        <div className="side-stack">
          <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} autoPlay muted style={{ display: 'none' }}></video>
            
            {/* The Composited Canvas which is actually streamed */}
            <canvas 
              ref={canvasRef} 
              width="1920" 
              height="1080" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--accent-red)' }}>Stream Controls</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <input 
                type="text" 
                value={serverUrl} 
                onChange={(e) => setServerUrl(e.target.value)} 
                style={{ flex: 1, padding: '12px', background: 'var(--bg-page)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '4px' }}
                placeholder="Ingest Backend Server URL"
              />
            </div>
            {!streamActive ? (
              <button className="app-btn" onClick={startStream} style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fa-solid fa-play"></i> GO LIVE
              </button>
            ) : (
              <button className="app-btn" onClick={stopStream} style={{ width: '100%', justifyContent: 'center', borderColor: '#a1a1aa', color: '#a1a1aa' }}>
                <i className="fa-solid fa-stop"></i> END STREAM
              </button>
            )}
          </div>
        </div>

        {/* Live Scorer Column */}
        <div className="side-stack">
          <div className="card">
            <h2 className="section-title">Live Scorer Action</h2>
            
            <div style={{ background: 'var(--bg-page)', padding: '24px', borderRadius: '4px', marginBottom: '32px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '8px' }}>{battingTeam} vs {bowlingTeam}</div>
              <div style={{ fontSize: '64px', fontFamily: 'var(--font-heading)', color: 'var(--accent-red)' }}>{score}/{wickets}</div>
              <div style={{ fontSize: '20px', color: 'var(--text-muted)' }}>Overs: {overs.toFixed(1)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <button className="app-btn" onClick={() => addRuns(1)} style={{ justifyContent: 'center' }}>+1 Run</button>
              <button className="app-btn" onClick={() => addRuns(4)} style={{ justifyContent: 'center' }}>+4 Runs</button>
              <button className="app-btn" onClick={() => addRuns(6)} style={{ justifyContent: 'center' }}>+6 Runs</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button className="app-btn" onClick={addWicket} style={{ justifyContent: 'center', background: 'rgba(230, 57, 70, 0.1)' }}>+1 Wicket</button>
              <button className="app-btn" onClick={addBall} style={{ justifyContent: 'center' }}>Ball Done</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
