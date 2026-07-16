import Sidebar from '../components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}