export default function PointsTable({ title = "Points Table", table }) {
  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <h2 className="section-title" style={{ fontSize: '18px' }}>{title}</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
              <th>NRR</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td>{row.team}</td>
                <td>{row.p}</td>
                <td>{row.w}</td>
                <td>{row.l}</td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{row.pts}</td>
                <td style={{ color: row.nrr.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)' }}>{row.nrr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
