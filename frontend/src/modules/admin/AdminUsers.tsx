import { useEffect, useState } from "react";
import api from "../../api/axios";
import {createUserByAdmin} from "../../api/admin.api";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

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

  // ---------------- CREATE USER ----------------
  const handleCreateUser = async () => {
 if (!newUser.name || !newUser.email || !newUser.password) {
    alert("Please fill all fields");
    return;
  }

  try {
    setCreating(true);

    await createUserByAdmin({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
    });

    setShowAddModal(false);

    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "user",
    });

    fetchUsers();
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to create user");
  } finally {
    setCreating(false);
  }
  };

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

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Users</h1>

        <Button onClick={() => setShowAddModal(true)}>
          + Add User
        </Button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
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
                  <tr key={user._id} className="border-t hover:bg-gray-50">

                    <td className="p-4 font-medium">
                      {user.name}
                    </td>

                    <td className="p-4">
                      {user.email}
                    </td>

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

                    <td className="p-4">
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

      {/* ================= VIEW USER MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

          <div className="bg-white rounded-2xl w-full max-w-md p-8 space-y-4">

            <h2 className="text-2xl font-semibold text-center">
              User Details
            </h2>

            <div className="space-y-2 text-sm">

              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.accountStatus}</p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>

            </div>

            <div className="flex justify-end gap-3 pt-4">

              {selectedUser.accountStatus !== "suspended" ? (
                <Button
                  variant="danger"
                  onClick={() => suspendUser(selectedUser.email)}
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  onClick={() => activateUser(selectedUser.email)}
                >
                  Activate
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

      {/* ================= ADD USER MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

          <div className="bg-white rounded-2xl w-full max-w-md p-8 space-y-4">

            <h2 className="text-2xl font-semibold text-center">
              Create New User
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 rounded"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-3 rounded"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">

              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreateUser}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
