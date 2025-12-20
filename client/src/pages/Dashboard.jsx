import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-2xl shadow dark:bg-slate-800">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {!user ? (
          <p className="mt-3 text-gray-300 dark:text-slate-400">Loading user...</p>
        ) : (
          <div className="mt-4 space-y-2 text-gray-200 dark:text-slate-300">
            <p className="dark:text-slate-100"><b>Name:</b> {user.name}</p>
            <p className="dark:text-slate-100"><b>Email:</b> {user.email}</p>
            <p className="dark:text-slate-100"><b>Role:</b> {user.role}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="mt-6 px-4 py-2 rounded bg-red-600 hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
