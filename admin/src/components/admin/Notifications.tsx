import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Notifications() {
  return <ToastContainer position="bottom-right" autoClose={4000} limit={3} hideProgressBar closeOnClick theme="light" toastClassName="admin-toast" aria-label="Update notifications" />
}
