import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { Notifications } from '@/components/admin/Notifications'

export default function App() {
  return <><RouterProvider router={router} /><Notifications /></>
}
