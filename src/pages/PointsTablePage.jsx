import bgImg from '../assets/tournament_banner.png';
import PointsTable from '../components/PointsTable'
import { pointsTable } from '../data/mockData'

export default function PointsTablePage() {
  return (
    <main className="container">
      <PointsTable table={pointsTable} />
    </main>
  )
}
