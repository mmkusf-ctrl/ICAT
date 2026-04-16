import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function BroadcastStudio() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  
  // Scoring State (Synced from Server)
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0.0);
  const [battingTeam, setBattingTeam] = useState('ICAT');
  const [bowlingTeam, setBowlingTeam] = useState('OPP');

  // Request Animation Frame reference for drawing
  const requestRef = useRef();

  // Initialize Socket sync
  useEffect(() => {
    socketRef.current = io(serverUrl);
    
    socketRef.current.on('sync-state', (payload) => {
      if (payload.score !== undefined) setScore(payload.score);
      if (payload.wickets !== undefined) setWickets(payload.wickets);
      if (payload.overs !== undefined) setOvers(payload.overs);
      if (payload.battingTeam !== undefined) setBattingTeam(payload.battingTeam);
      if (payload.bowlingTeam !== undefined) setBowlingTeam(payload.bowlingTeam);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [serverUrl]);

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
    ctx.fillText(`OVERS: ${Number(overs).toFixed(1)}`, 740, 955);
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
    if (!socketRef.current) return;
    
    socketRef.current.emit('start-stream');

    // Capture canvas stream at 30fps
    const canvasStream = canvasRef.current.captureStream(30);
    
    // Merge audio from camera
    const audioTracks = videoRef.current.srcObject ? videoRef.current.srcObject.getAudioTracks() : [];
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
  };

  const stopStream = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.emit('stop-stream');
    }
    setStreamActive(false);
  };

  return (
    <main className="container fade-in">
      <section className="match-center-hero" style={{ padding: '32px', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '36px', marginBottom: '8px' }}>Captain's Broadcast Studio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Streams live at 1080p@30fps. Scoring is controlled remotely via the Match Center.</p>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#000', marginBottom: '24px' }}>
          <video ref={videoRef} autoPlay muted style={{ display: 'none' }}></video>
          
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
    </main>
  );
}
