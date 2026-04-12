import { news } from '../data/mockData'

export default function News() {
  return (
    <main className="container">
      <h1 className="section-title">News</h1>
      <div className="card">
        {news.map((item, idx) => <p key={idx}>• {item}</p>)}
      </div>
    </main>
  )
}
