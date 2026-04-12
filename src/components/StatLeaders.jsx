export default function StatLeaders({ title, items }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {items.map((item, index) => (
        <div key={index} className="leader-row">
          <div>
            <strong>{item.name}</strong>
            <div className="muted">{item.team}</div>
          </div>
          <div className="highlight">{item.stat}</div>
        </div>
      ))}
    </div>
  )
}
