import { useEffect, useState } from "react";
import api from "../../api/axios";
import { createUserByAdmin } from "../../api/admin.api";
import { Button } from "../../components/ui/Button";
import { Search, Plus, UserCircle, Mail, KeySquare, CheckCircle2, Ban, X, ShieldAlert, BadgeCheck } from "lucide-react";

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
  const [suspendParams, setSuspendParams] = useState<{email: string} | null>(null);
  const [suspensionDuration, setSuspensionDuration] = useState("7");

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
      const res = await api.get("/admin/users?limit=1000");
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
  const executeSuspendUser = async () => {
    if (!suspendParams) return;
    try {
      await api.patch(`/admin/users/${suspendParams.email}`, { duration: suspensionDuration });
      fetchUsers();
      setSelectedUser(null);
      setSuspendParams(null);
    } catch (e) {
      console.error(e);
      alert("Failed to suspend user.");
    }
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Manage Users</h1>
          <p className="text-neutral-500 mt-1">View, add, and manage user accounts and permissions.</p>
        </div>

        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/20 px-6 py-2.5 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* SEARCH BAR */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="pl-12 pr-4 py-3 w-full bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow shadow-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE LOGIC */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-neutral-400 space-y-2">
                        <UserCircle className="w-12 h-12 stroke-[1.5]" />
                        <p className="text-base font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{user.name}</p>
                            <p className="text-neutral-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          user.accountStatus === "suspended"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {user.accountStatus === "suspended" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
                          {user.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5 text-brand-600" /> : <UserCircle className="w-3.5 h-3.5" />}
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-transparent rounded-lg hover:bg-brand-100 hover:border-brand-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= VIEW USER MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-brand-500" />
                User Profile
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 flex items-center justify-center font-bold text-2xl shadow-inner border border-brand-200">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{selectedUser.name}</h3>
                  <p className="text-neutral-500 flex items-center gap-1 text-sm"><Mail className="w-4 h-4" /> {selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Role</p>
                  <p className="font-medium text-neutral-900 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-brand-500"/>{selectedUser.role.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-medium ${selectedUser.accountStatus === 'suspended' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedUser.accountStatus.charAt(0).toUpperCase() + selectedUser.accountStatus.slice(1)}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-neutral-200/50">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Joined Date</p>
                  <p className="font-medium text-neutral-700">
                    {new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="rounded-xl">
                  Done
                </Button>
                {selectedUser.accountStatus !== "suspended" ? (
                  <Button
                    variant="danger"
                    onClick={() => setSuspendParams({ email: selectedUser.email })}
                    className="rounded-xl flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2"
                  >
                    <Ban className="w-4 h-4" /> Suspend
                  </Button>
                ) : (
                  <Button
                    onClick={() => activateUser(selectedUser.email)}
                    className="rounded-xl flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Activate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD USER MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-brand-500" />
                Create User
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><UserCircle className="w-4 h-4"/> Full Name</label>
                <input
                  type="text"
                  className="w-full border border-neutral-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</label>
                <input
                  type="email"
                  className="w-full border border-neutral-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="name@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><KeySquare className="w-4 h-4"/> Password</label>
                <input
                  type="password"
                  className="w-full border border-neutral-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={creating} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/20">
                  {creating ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUSPEND MODAL ================= */}
      {suspendParams && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setSuspendParams(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-rose-50/30">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Ban className="w-6 h-6 text-rose-500" />
                Suspend User
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-600">Please select the duration for this suspension.</p>
              <select
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500 transition-shadow bg-white"
                value={suspensionDuration}
                onChange={(e) => setSuspensionDuration(e.target.value)}
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="permanent">Permanently / Never join</option>
              </select>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSuspendParams(null)} className="rounded-xl">Cancel</Button>
                <Button onClick={executeSuspendUser} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20">Confirm</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
