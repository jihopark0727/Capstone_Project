import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Layout from "./components/layout"
import Dashboard from "./pages/dashboard"
import Home from "./pages/home"
import MyCounsel from "./pages/my-counsel"
import Login from "./pages/login"
import Register from "./pages/register"

const routes = [
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/my-counsel",
    element: <MyCounsel />
  }
]

function App() {
  const isLogin = !!localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        {!isLogin ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
