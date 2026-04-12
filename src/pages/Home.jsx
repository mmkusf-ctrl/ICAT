import MatchCard from '../components/MatchCard'
import PointsTable from '../components/PointsTable'
import StatLeaders from '../components/StatLeaders'
import { liveMatches, pointsTable, topBatters, topBowlers, news } from '../data/mockData'

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>ICAT Premium Portal</h1>
        <p>Live scores, fixtures, standings, player stats, and league news.</p>
        
        <div className="hero-app-promo" style={{ marginTop: '24px' }}>
          <a href="https://play.google.com/store/apps/details?id=com.cricheroes.icat&hl=en_US" target="_blank" rel="noopener noreferrer" className="app-btn">
            <i className="fa-brands fa-google-play"></i> Get the Official ICAT App
          </a>
        </div>
      </section>

      <section className="grid two">
        <div>
          <h2 className="section-title">Featured Matches</h2>
          {liveMatches.map((match, idx) => <MatchCard key={idx} match={match} />)}
        </div>
        <div className="side-stack">
          <PointsTable table={pointsTable} />
          <StatLeaders title="Top Batters" items={topBatters} />
          <StatLeaders title="Top Bowlers" items={topBowlers} />
          <div className="card">
            <h2 className="section-title">Latest News</h2>
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
