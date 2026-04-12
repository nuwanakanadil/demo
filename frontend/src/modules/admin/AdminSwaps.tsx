import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { TablePagination } from "../../components/ui/TablePagination";
import { TextSearchInput } from "../../components/ui/TextSearchInput";
import { StateDisplay } from "../../components/ui/StateDisplay";
import { Repeat, ArrowRightLeft, Clock, CheckCircle2, Ban, X, Image as ImageIcon, UserCircle } from "lucide-react";

interface Swap {
  _id: string;
  requester: { name: string; email: string };
  owner: { name: string; email: string };
  requestedItem: {
    title: string;
    description: string;
    images: {
      url: string;
      public_id: string;
    }[];
  };
  offeredItem: {
    title: string;
    description: string;
    images: {
      url: string;
      public_id: string;
    }[];
  };
  status: string;
  message: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminSwaps() {
  const location = useLocation();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- FETCH SWAPS ----------------
  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const status = params.get("status");
      const stage = params.get("stage");

      const res = await api.get("/admin/swaps", {
        params: {
          limit: 1000,
          ...(status ? { status } : {}),
          ...(stage ? { stage } : {}),
        },
      });
      setSwaps(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [location.search]);

  // ---------------- FILTER ----------------
  const filteredSwaps = swaps.filter(
    (swap) =>
      swap.requester?.email?.toLowerCase().includes(search.toLowerCase()) ||
      swap.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredSwaps.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSwaps = filteredSwaps.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const getStatusConfig = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING': return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock };
      case 'ACCEPTED': return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'REJECTED': return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: Ban };
      default: return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Repeat };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Swap Requests</h1>
          <p className="text-neutral-500 mt-1">Review user swap activities and their current status.</p>
          {(new URLSearchParams(location.search).get("status") || new URLSearchParams(location.search).get("stage")) && (
            <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Filter active: {new URLSearchParams(location.search).get("stage") || new URLSearchParams(location.search).get("status")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* SEARCH BAR */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <TextSearchInput
            placeholder="Search swaps by user emails..."
            value={search}
            onChange={setSearch}
            className="max-w-md min-w-0"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <StateDisplay type="loading" title="Loading swaps..." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4 px-0 w-12 text-center text-neutral-300"><ArrowRightLeft className="w-4 h-4 mx-auto" /></th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredSwaps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <StateDisplay
                        type="empty"
                        title="No swaps found"
                        description="Try another search term or clear filters."
                        icon={<Repeat className="w-12 h-12 stroke-[1.5] text-neutral-300" />}
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedSwaps.map((swap) => {
                    const StatusIcon = getStatusConfig(swap.status).icon;
                    const statusConfig = getStatusConfig(swap.status);
                    
                    return (
                    <tr key={swap._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-8 h-8 text-neutral-300" />
                          <div>
                            <p className="font-semibold text-neutral-900">{swap.requester?.name || "Unknown"}</p>
                            <p className="text-neutral-500 text-xs">{swap.requester?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-0 py-4 text-center">
                         <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                           <ArrowRightLeft className="w-3.5 h-3.5" />
                         </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-8 h-8 text-brand-300" />
                          <div>
                            <p className="font-semibold text-neutral-900">{swap.owner?.name || "Unknown"}</p>
                            <p className="text-neutral-500 text-xs">{swap.owner?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {swap.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSwap(swap)}
                          className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-transparent rounded-lg hover:bg-brand-100 hover:border-brand-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          )}
        </div>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredSwaps.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL */}
      {selectedSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSelectedSwap(null)}></div>

          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* HEADER */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Repeat className="w-6 h-6 text-brand-500" />
                Swap Transaction Details
              </h2>
              
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusConfig(selectedSwap.status).bg} ${getStatusConfig(selectedSwap.status).color} ${getStatusConfig(selectedSwap.status).border}`}>
                  {(() => {
                    const Icon = getStatusConfig(selectedSwap.status).icon;
                    return <Icon className="w-4 h-4" />;
                  })()}
                  {selectedSwap.status.toUpperCase()}
                </span>
                <button onClick={() => setSelectedSwap(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-8 overflow-y-auto w-full space-y-8 bg-white">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* VS Badge in Middle */}
                <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
                   <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400 transform -translate-y-4">
                     <ArrowRightLeft className="w-5 h-5" />
                   </div>
                </div>

                {/* Requester Side */}
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center gap-4">
                    <UserCircle className="w-10 h-10 text-neutral-400" />
                    <div>
                      <h3 className="font-semibold text-neutral-900">{selectedSwap.requester?.name || "Requester"}</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">Requested the swap</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedSwap.requester?.email}</p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-2xl p-5 space-y-4 bg-white shadow-sm hover:border-brand-200 transition-colors">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Offered Item</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg">{selectedSwap.offeredItem?.title || "Item Not Available"}</h4>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{selectedSwap.offeredItem?.description}</p>
                    </div>

                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 flex justify-center items-center">
                       {selectedSwap.offeredItem?.images?.length > 0 ? (
                         <img
                           src={selectedSwap.offeredItem.images[0].url}
                           alt="offered"
                           loading="lazy"
                           decoding="async"
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <ImageIcon className="w-8 h-8 text-neutral-300" />
                       )}
                    </div>
                  </div>
                </div>

                {/* Owner Side */}
                <div className="space-y-4">
                  <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{selectedSwap.owner?.name || "Owner"}</h3>
                      <p className="text-xs text-brand-600 font-medium flex items-center gap-1">Owns requested item</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedSwap.owner?.email}</p>
                    </div>
                  </div>

                  <div className="border border-brand-200 rounded-2xl p-5 space-y-4 bg-white shadow-sm ring-1 ring-brand-500/5">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Requested Item</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg">{selectedSwap.requestedItem?.title || "Item Not Available"}</h4>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{selectedSwap.requestedItem?.description}</p>
                    </div>

                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 flex justify-center items-center">
                       {selectedSwap.requestedItem?.images?.length > 0 ? (
                         <img
                           src={selectedSwap.requestedItem.images[0].url}
                           alt="requested"
                           loading="lazy"
                           decoding="async"
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <ImageIcon className="w-8 h-8 text-neutral-300" />
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MESSAGE BOX */}
              {selectedSwap.message && (
                <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 relative">
                  <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Message attached
                  </div>
                  <p className="text-neutral-700 italic">"{selectedSwap.message}"</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end shrink-0">
              <Button onClick={() => setSelectedSwap(null)} className="rounded-xl px-8">
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
