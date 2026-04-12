export default function StreamCard({ stream }) {
  const isLive = stream.status === 'LIVE';

  return (
    <a href={stream.url} target="_blank" rel="noopener noreferrer" className="stream-card">
      <div className="stream-thumbnail">
        <img src={stream.thumbnail} alt={stream.title} />
        <div className="stream-overlay">
          <i className="fa-brands fa-youtube play-icon"></i>
        </div>
        <span className={`stream-badge ${isLive ? 'live-badge' : ''}`}>{stream.status}</span>
      </div>
      <div className="stream-info">
        <h4>{stream.title}</h4>
        <p>ICAT-FT20 Official Broadcasting</p>
      </div>
    </a>
  );
}
