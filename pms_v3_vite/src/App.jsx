import { createHashRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireRole from './components/RequireRole'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Kanban from './pages/Kanban'
import Personnel from './pages/Personnel'
import UserManagement from './pages/UserManagement'
import NotFound from './pages/NotFound'

// 使用 Hash 路由（createHashRouter），无需服务端额外配置 history fallback，
// 适合部署在 IIS / 静态资源托管等环境。
const router = createHashRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/projects', element: <Projects /> },
          { path: '/projects/:id', element: <ProjectDetail /> },
          { path: '/kanban', element: <Kanban /> },
          {
            // 人员管理界面：Visitor 完全不可见（对应后端 PersonnelController 的角色限制）
            element: <RequireRole roles={['Admin', 'Manager', 'Member']} />,
            children: [{ path: '/personnel', element: <Personnel /> }]
          },
          {
            // 账户与角色管理：仅 Admin 可见
            element: <RequireRole roles={['Admin']} />,
            children: [{ path: '/users', element: <UserManagement /> }]
          }
        ]
      }
    ]
  },
  { path: '*', element: <NotFound /> }
])

export default function App() {
  return <RouterProvider router={router} />
}
