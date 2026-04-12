import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { createUserByAdmin } from "../../api/admin.api";
import { Button } from "../../components/ui/Button";
import { TablePagination } from "../../components/ui/TablePagination";
import { useToast } from "../../components/ui/ToastProvider";
import { TextSearchInput } from "../../components/ui/TextSearchInput";
import { StateDisplay } from "../../components/ui/StateDisplay";
import { AdminDialog } from "../../components/ui/AdminDialog";
import { Plus, UserCircle, Mail, KeySquare, CheckCircle2, Ban, X, ShieldAlert, BadgeCheck } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;
const CONTROL_CLASS =
  "rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";
const DANGER_CONTROL_CLASS =
  "rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30";

export default function AdminUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [suspendParams, setSuspendParams] = useState<{email: string} | null>(null);
  const [suspensionDuration, setSuspensionDuration] = useState("7");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [savedViews, setSavedViews] = useState<Array<{ name: string; status: string }>>(() => {
    try {
      const raw = localStorage.getItem("adminUsersSavedViews");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const toast = useToast();

  // ---------------- FETCH USERS ----------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: {
          limit: 1000,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      });
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = new URLSearchParams(location.search).get("status") || "";
    setStatusFilter(status);
  }, [location.search]);

  useEffect(() => {
    fetchUsers();
    setSelectedEmails([]);
  }, [statusFilter]);

  // ---------------- CREATE USER ----------------
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.info("Missing details", "Please fill all required fields.");
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
      toast.success("User created", "New account was created successfully.");
    } catch (err: any) {
      toast.error("Failed to create user", err?.response?.data?.message || "Please try again.");
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
      toast.success("User suspended", "Account status updated.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to suspend user", "Please try again.");
    }
  };

  const activateUser = async (email: string) => {
    await api.patch(`/admin/users/active/${email}`);
    fetchUsers();
    setSelectedUser(null);
    toast.success("User activated", "Account is active again.");
  };

  const bulkUpdateUsers = async (action: "suspend" | "activate") => {
    if (selectedEmails.length === 0) return;
    try {
      await api.post("/admin/users/bulk-status", {
        emails: selectedEmails,
        action,
        duration: action === "suspend" ? 7 : undefined,
      });
      await fetchUsers();
      setSelectedEmails([]);
    } catch (err) {
      console.error(err);
      toast.error("Bulk action failed", "Could not update selected users.");
    }
  };

  const saveCurrentView = () => {
    setSaveViewName("");
    setShowSaveViewModal(true);
  };

  const confirmSaveCurrentView = () => {
    const name = saveViewName.trim();
    if (!name) {
      toast.info("View name required", "Please enter a name for this saved view.");
      return;
    }
    const next = [...savedViews, { name, status: statusFilter }];
    setSavedViews(next);
    localStorage.setItem("adminUsersSavedViews", JSON.stringify(next));
    setShowSaveViewModal(false);
  };

  const applySavedView = (name: string) => {
    const found = savedViews.find((v) => v.name === name);
    if (!found) return;
    const nextQuery = found.status ? `?status=${encodeURIComponent(found.status)}` : "";
    navigate(`/admin/users${nextQuery}`);
  };

  // ---------------- FILTER ----------------
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Manage Users</h1>
          <p className="text-neutral-500 mt-1">View, add, and manage user accounts and permissions.</p>
          {statusFilter === "suspended" && (
            <p className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              Filter: Suspended/Banned users
            </p>
          )}
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
          <div className="flex flex-wrap gap-3 items-center">
            <TextSearchInput
              placeholder="Search users by name or email..."
              value={search}
              onChange={setSearch}
            />
            <select
              value={statusFilter}
              onChange={(e) => navigate(`/admin/users${e.target.value ? `?status=${e.target.value}` : ""}`)}
              className={CONTROL_CLASS}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <Button variant="outline" onClick={saveCurrentView}>Save View</Button>
            <select
              defaultValue=""
              onChange={(e) => applySavedView(e.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Saved views</option>
              {savedViews.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
            <Button variant="outline" disabled={selectedEmails.length === 0} onClick={() => bulkUpdateUsers("suspend")}>
              Bulk Suspend
            </Button>
            <Button variant="outline" disabled={selectedEmails.length === 0} onClick={() => bulkUpdateUsers("activate")}>
              Bulk Activate
            </Button>
          </div>
        </div>

        {/* TABLE LOGIC */}
        <div className="overflow-x-auto">
          {loading ? (
            <StateDisplay type="loading" title="Loading users..." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedEmails.includes(u.email))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmails((prev) => Array.from(new Set([...prev, ...paginatedUsers.map((u) => u.email)])));
                        } else {
                          setSelectedEmails((prev) => prev.filter((email) => !paginatedUsers.some((u) => u.email === email)));
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <StateDisplay
                        type="empty"
                        title="No users found"
                        description="Try another search term or clear filters."
                        icon={<UserCircle className="w-12 h-12 stroke-[1.5] text-neutral-300" />}
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(user.email)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmails((prev) => Array.from(new Set([...prev, user.email])));
                            } else {
                              setSelectedEmails((prev) => prev.filter((x) => x !== user.email));
                            }
                          }}
                        />
                      </td>
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

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
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
                  className={`w-full ${CONTROL_CLASS}`}
                  placeholder="e.g. Jane Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</label>
                <input
                  type="email"
                  className={`w-full ${CONTROL_CLASS}`}
                  placeholder="name@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2"><KeySquare className="w-4 h-4"/> Password</label>
                <input
                  type="password"
                  className={`w-full ${CONTROL_CLASS}`}
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
        <AdminDialog
          open={Boolean(suspendParams)}
          onClose={() => setSuspendParams(null)}
          title="Suspend user"
          subtitle="Select how long this user should be suspended."
          tone="danger"
          size="sm"
          showClose={false}
          zIndexClassName="z-[60]"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSuspendParams(null)} className="rounded-xl">Cancel</Button>
              <Button onClick={executeSuspendUser} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20">Confirm</Button>
            </div>
          }
        >
          <select
            className={`w-full ${DANGER_CONTROL_CLASS}`}
            value={suspensionDuration}
            onChange={(e) => setSuspensionDuration(e.target.value)}
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="permanent">Permanently / Never join</option>
          </select>
        </AdminDialog>
      )}

      {/* ================= SAVE VIEW MODAL ================= */}
      {showSaveViewModal && (
        <AdminDialog
          open={showSaveViewModal}
          onClose={() => setShowSaveViewModal(false)}
          title="Save current view"
          subtitle="Save active filters as a reusable preset."
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSaveViewModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={confirmSaveCurrentView} className="rounded-xl">Save View</Button>
            </div>
          }
        >
          <input
            type="text"
            value={saveViewName}
            onChange={(e) => setSaveViewName(e.target.value)}
            placeholder="e.g. Suspended users"
            className={`w-full ${CONTROL_CLASS}`}
            autoFocus
          />
        </AdminDialog>
      )}
    </div>
  );
}
