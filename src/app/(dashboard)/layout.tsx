import { BottomTabBar } from '@/components/layout/bottom-tab-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen max-w-[430px] mx-auto bg-background">
      <main className="pb-20">{children}</main>
      <BottomTabBar />
    </div>
  )
}
