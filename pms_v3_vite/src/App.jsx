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

// Using Hash routing (createHashRouter), no server-side history fallback configuration needed,
// suitable for deployment in IIS / static hosting environments.
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
            // Personnel management: completely hidden from Visitor (matches backend PersonnelController role restriction)
            element: <RequireRole roles={['Admin', 'Manager', 'Member']} />,
            children: [{ path: '/personnel', element: <Personnel /> }]
          },
          {
            // Account & role management: visible to Admin only
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
