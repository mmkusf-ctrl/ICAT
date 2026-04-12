export default function PointsTable({ table }) {
  return (
    <div className="card">
      <h2>Points Table</h2>
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
              <td>{row.pts}</td>
              <td>{row.nrr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
