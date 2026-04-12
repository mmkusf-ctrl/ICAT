import MatchCard from '../components/MatchCard'
import PointsTable from '../components/PointsTable'
import StatLeaders from '../components/StatLeaders'
import { liveMatches, pointsTable, topBatters, topBowlers, news } from '../data/mockData'

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>ICAT Cricbuzz-Style Portal</h1>
        <p>Live scores, fixtures, standings, player stats, and league news.</p>
      </section>

      <section className="grid two">
        <div>
          <h2 className="section-title">Featured Matches</h2>
          {liveMatches.map(match => <MatchCard key={match.id} match={match} />)}
        </div>
        <div className="side-stack">
          <PointsTable table={pointsTable} />
          <StatLeaders title="Top Batters" items={topBatters} />
          <StatLeaders title="Top Bowlers" items={topBowlers} />
          <div className="card">
            <h2>Latest News</h2>
            {news.map((item, idx) => <p key={idx}>• {item}</p>)}
          </div>
        </div>
      </section>
    </main>
  )
}
