export default function StatLeaders({ title, items }) {
  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      <div>
        {items.map((item, i) => (
          <div key={i} className="leader-row">
            <div className="leader-info">
              <h4>{item.name}</h4>
              <p>{item.team}</p>
            </div>
            <div className="leader-stat">
              {item.stat}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
