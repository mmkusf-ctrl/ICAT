import bgImg from '../assets/cricket_action.png';
import logoSrc from '../assets/logo.svg';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function BroadcastStudio() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  
  // React State (For UI if needed)
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0.0);
  
  // The crucial Canvas Sync State (Solves the stale closure bug)
  const matchStateRef = useRef({
    score: 0, wickets: 0, overs: 0.0, battingTeam: 'ICAT', bowlingTeam: 'OPP'
  });

  const logoImgRef = useRef(new Image());

  // Request Animation Frame reference for drawing
  const requestRef = useRef();

  // Load the logo for the canvas once
  useEffect(() => {
    logoImgRef.current.src = logoSrc;
  }, []);

  // Initialize Socket sync
  useEffect(() => {
    socketRef.current = io(serverUrl);
    
    socketRef.current.on('sync-state', (payload) => {
      // Update our synchronized Canvas sync ref
      const ms = matchStateRef.current;
      if (payload.score !== undefined) ms.score = payload.score;
      if (payload.wickets !== undefined) ms.wickets = payload.wickets;
      if (payload.overs !== undefined) ms.overs = payload.overs;
      if (payload.battingTeam !== undefined) ms.battingTeam = payload.battingTeam;
      if (payload.bowlingTeam !== undefined) ms.bowlingTeam = payload.bowlingTeam;

      // Update React state for local UI preview
      setScore(ms.score);
      setWickets(ms.wickets);
      setOvers(ms.overs);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [serverUrl]);

  // Animation Loop (Compositing Video + Stats to Canvas)
  const drawFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Draw the actual camera feed (1080p)
    ctx.drawImage(videoRef.current, 0, 0, 1920, 1080);
    
    // Draw the Premium TV Bug Overlay
    drawScoreOverlay(ctx);
    
    requestRef.current = requestAnimationFrame(drawFrame);
  };

  const drawScoreOverlay = (ctx) => {
    const ms = matchStateRef.current;
    
    const startX = 80;
    const startY = 900;
    const boxHeight = 110;
    const boxWidth = 900;

    // 1. Drop shadow for the entire TV bug
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    // 2. Main Box (Premium Deep Blue)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(startX, startY, boxWidth, boxHeight);
    
    // Reset shadow for internal elements
    ctx.shadowColor = 'transparent';

    // 3. Vibrant Orange Accent Bar
    ctx.fillStyle = '#f97316';
    ctx.fillRect(startX, startY, 15, boxHeight);

    // 4. ICAT Logo (if loaded)
    if (logoImgRef.current.complete && logoImgRef.current.naturalHeight !== 0) {
      // Create a specific white box for the logo to sit in so it's visible (since logo is dark svg)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + 15, startY, 140, boxHeight);
      
      // Draw Logo
      ctx.drawImage(logoImgRef.current, startX + 35, startY + 15, 100, 80);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + 15, startY, 140, boxHeight);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px "Outfit", sans-serif';
      ctx.fillText('ICAT', startX + 50, startY + 65);
    }

    // 5. Text configurations
    ctx.textBaseline = 'middle';
    
    // Team Names
    ctx.fillStyle = '#94a3b8'; // Muted Slate
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText(`${ms.battingTeam} v ${ms.bowlingTeam}`.toUpperCase(), startX + 180, startY + 35);

    // Live Batch Segment
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('• LIVE', startX + boxWidth - 100, startY + 35);

    // Score Segment
    ctx.fillStyle = '#ffffff'; 
    ctx.font = 'bold 64px "Outfit", sans-serif';
    ctx.fillText(`${ms.score}-${ms.wickets}`, startX + 180, startY + 80);

    // Overs Divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(startX + 400, startY + 60, 2, 40);

    // Overs Segment
    ctx.fillStyle = '#f8fafc'; 
    ctx.font = '400 40px "Inter", sans-serif';
    ctx.fillText(`OVR ${Number(ms.overs).toFixed(1)}`, startX + 430, startY + 80);
  };

  // Initialize Camera exactly once
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Crucial fix: The closure relies on useRefs, so we only need to bind this once!
          videoRef.current.onplay = () => {
            requestRef.current = requestAnimationFrame(drawFrame);
          };
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
      <section className="match-center-hero" style={{ padding: '32px', marginBottom: '24px' , backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.7)), url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'}}>
        <h1 style={{ color: '#fff', fontSize: '36px', marginBottom: '8px' }}>Captain's Broadcast Studio</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Streams live at 1080p@30fps. Full automatic overlay enabled.</p>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#000', marginBottom: '24px', borderRadius: '12px' }}>
          <video ref={videoRef} autoPlay muted style={{ display: 'none' }}></video>
          
          <canvas 
            ref={canvasRef} 
            width="1920" 
            height="1080" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Stream Configuration</h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <input 
              type="text" 
              value={serverUrl} 
              onChange={(e) => setServerUrl(e.target.value)} 
              style={{ flex: 1, padding: '12px', background: 'var(--bg-page)', border: '1px solid var(--border-light)', color: 'var(--text-main)', borderRadius: '4px' }}
              placeholder="Ingest Backend Server URL"
            />
          </div>
          {!streamActive ? (
            <button className="app-btn" onClick={startStream} style={{ width: '100%', justifyContent: 'center' }}>
              <i className="fa-solid fa-play"></i> GO LIVE (WITH OVERLAY)
            </button>
          ) : (
            <button className="app-btn" onClick={stopStream} style={{ width: '100%', justifyContent: 'center', borderColor: '#e63946', color: '#e63946', background: 'rgba(230,57,70,0.1)' }}>
              <i className="fa-solid fa-stop"></i> END BROADCAST
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
