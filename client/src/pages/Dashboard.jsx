import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {!user ? (
          <p className="mt-3 text-gray-300">Loading user...</p>
        ) : (
          <div className="mt-4 space-y-2 text-gray-200">
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> {user.role}</p>
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
