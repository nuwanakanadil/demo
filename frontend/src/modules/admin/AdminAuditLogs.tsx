import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { TablePagination } from "../../components/ui/TablePagination";
import { TextSearchInput } from "../../components/ui/TextSearchInput";
import { ShieldCheck } from "lucide-react";

type AuditLog = {
  _id: string;
  action: string;
  targetType: string;
  targetLabel: string;
  createdAt: string;
  actorId?: { name?: string; email?: string };
};

const ITEMS_PER_PAGE = 10;

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/audit-logs", { params: { limit: 200, q } });
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [q]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q]);

  const paginated = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const rows = logs.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
    return { rows, totalPages, safePage };
  }, [logs, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Audit Logs</h1>
          <p className="text-neutral-500 mt-1">Track admin actions for compliance and accountability.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="max-w-md">
            <TextSearchInput
              placeholder="Search action or target..."
              value={q}
              onChange={setQ}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginated.rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  paginated.rows.map((log) => (
                    <tr key={log._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-800">{log.targetType}: {log.targetLabel || "-"}</td>
                      <td className="px-6 py-4 text-neutral-700">{log.actorId?.name || log.actorId?.email || "Admin"}</td>
                      <td className="px-6 py-4 text-neutral-500">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <TablePagination
          currentPage={paginated.safePage}
          totalPages={paginated.totalPages}
          totalItems={logs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
