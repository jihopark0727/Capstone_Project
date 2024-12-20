import { Button } from "@/components/ui/button"
import { List, Home, LayoutDashboard } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    path: "/home",
    icon: <Home className="w-4 h-4 mr-2" />,
    label: "홈페이지"
  },
  {
    path: "/my-counsel",
    icon: <List className="w-4 h-4 mr-2" />,
    label: "나의 내담자"
  },
  {
    path: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
    label: "감정 대시보드"
  }
]

function Navbar() {
  const { pathname } = useLocation()

  const logout = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <nav className="bg-blue-500 px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-3 items-center">
          <div />
          <h1 className="text-center text-white text-xl font-medium">마음읽기</h1>
          <div className="justify-self-end">
            <Button onClick={logout} variant="secondary" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 w-full sm:gap-x-8 gap-x-0">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "w-full sm:text-base text-xs",
                pathname === item.path
                  ? "bg-white text-blue-500 hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              )}
            >
              <Link to={item.path} className="flex items-center justify-center">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
