import { Link } from 'react-router-dom'
import StreamCard from '../components/StreamCard'
import { news } from '../data/mockData'
import { streams } from '../data/youtubeStreams'

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>ICAT</h1>
        <p>INTERNATIONAL CRICKET ASSOCIATION OF TAMPA</p>
        
        <div className="hero-app-promo" style={{ marginTop: '24px' }}>
          <a href="https://play.google.com/store/apps/details?id=com.cricheroes.icat&hl=en_US" target="_blank" rel="noopener noreferrer" className="app-btn">
            <i className="fa-brands fa-google-play"></i> Get the Official ICAT App
          </a>
        </div>
      </section>

      {/* Featured Tournaments Row */}
      <section className="tournaments-row">
        <Link to="/schedule" className="tourney-card interactive" style={{ display: 'block', textDecoration: 'none' }}>
          <h3>FWCWL 25-26</h3>
          <p>The premier winter league showcasing top-tier local talent.</p>
        </Link>
        <Link to="/tournament/ft20-2026" className="tourney-card interactive" style={{ display: 'block', textDecoration: 'none' }}>
          <h3>FRIENDSHIP CUP T20 26</h3>
          <p>Annual community championship gathering the finest squads in Florida.</p>
        </Link>
      </section>

      {/* Official YouTube Broadcasting */}
      <section className="live-streams">
        <div className="streams-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <h2 className="section-title" style={{ borderBottom: 'none', marginBottom: 0 }}>
            <i className="fa-brands fa-youtube" style={{ color: '#ff0000', marginRight: '12px' }}></i>
            Official Channel Streams
          </h2>
          <a href="https://www.youtube.com/@ICAT-FT20" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Subscribe &rarr;</a>
        </div>
        <div className="streams-grid">
          {streams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
        </div>
      </section>

      <section style={{ marginTop: '64px', maxWidth: '800px', margin: '64px auto 0' }}>
        <div className="card">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Latest News</h2>
          <div className="news-list">
            {news.map((item, idx) => (
              <div key={idx} className="news-item">
                  <div className="news-dot"></div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
