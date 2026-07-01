import Sidebar from '../components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}