import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "activate" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ---------------- FETCH USERS ----------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- ACTIONS ----------------
  const suspendUser = async (email: string) => {
    await api.patch(`/admin/users/${email}`);
    fetchUsers();
    setSelectedUser(null);
  };

  const activateUser = async (email: string) => {
    await api.patch(`/admin/users/active/${email}`);
    fetchUsers();
    setSelectedUser(null);
  };

  // ---------------- FILTER ----------------
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Manage Users</h1>

      {/* ================= SEARCH BAR ================= */}
      <input
        type="text"
        placeholder="Search by name or email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= USERS TABLE ================= */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{user.name}</td>

                    <td className="p-4">{user.email}</td>

                    <td className="p-4">
                      <Badge
                        className={
                          user.accountStatus === "suspended"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {user.accountStatus}
                      </Badge>
                    </td>

                    <td className="p-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= USER DETAILS MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedUser.name}
                </h2>
                <p className="text-gray-500">
                  {selectedUser.email}
                </p>
              </div>

            </div>

            {/* Info Section */}
            <div className="space-y-3 text-sm">

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">
                  {selectedUser.role}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Account Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.accountStatus === "suspended"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {selectedUser.accountStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">

              {selectedUser.accountStatus !== "suspended" ? (
                <Button
                  variant="danger"
                  onClick={() => setConfirmAction("suspend")}
                >
                  Suspend Account
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setConfirmAction("activate")}
                >
                  Activate Account
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>

            </div>

          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {confirmAction && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">

            <h3 className="text-lg font-semibold text-center">
              Confirm Action
            </h3>

            <p className="text-center text-gray-600 text-sm">
              {confirmAction === "suspend"
                ? "This user will be suspended and cannot access the system."
                : "This user account will be reactivated."}
            </p>

            <div className="flex justify-center gap-4 pt-4">

              <Button
                variant="ghost"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>

              <Button
                variant={confirmAction === "suspend" ? "danger" : "primary"}
                onClick={async () => {
                  if (confirmAction === "suspend") {
                    await suspendUser(selectedUser.email);
                  } else {
                    await activateUser(selectedUser.email);
                  }
                  setConfirmAction(null);
                }}
              >
                Confirm
              </Button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
