import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

// Mock exchange rates to INR
const EXCHANGE_RATES = {
  USD: 83.5,
  EUR: 90.2,
  GBP: 105.4,
  JPY: 0.56,
  CNY: 11.5,
  INR: 1,
  CAD: 61.8,
  AUD: 54.3,
  BRL: 16.9,
  RUB: 0.92,
  KRW: 0.063,
  MXN: 4.9,
  IDR: 0.0053,
  SAR: 22.3,
  TRY: 2.6,
  ZAR: 4.5,
  ARS: 0.096,
  CHF: 94.1,
};

const toINR = (amount, currency) => {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(amount * rate).toLocaleString("en-IN");
};

export default function PendingApprovals() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [actionLog, setActionLog] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);

  // Fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/approvals/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch pending approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const handleAction = (id, action) => {
    setCurrentExpenseId(id);
    setShowCommentModal(true);
  };

  const submitAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const time = new Date().toLocaleString();

      await axios.post(
        "http://localhost:5000/api/approvals/action",
        {
          expenseId: currentExpenseId,
          action: actionLog[currentExpenseId]?.status || "APPROVED",
          comment: comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setActionLog((prev) => ({
        ...prev,
        [currentExpenseId]: {
          status: actionLog[currentExpenseId]?.status || "APPROVED",
          time,
          comment,
        },
      }));

      setRequests((prev) => prev.filter((r) => r.id !== currentExpenseId));
      setShowCommentModal(false);
      setComment("");
    } catch (err) {
      console.error("Failed to process approval:", err);
    }
  };

  const filtered = requests.filter(
    (r) =>
      r.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = requests.length;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h1 className="text-base font-bold text-gray-800">
            Approvals to Review
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-4">
      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">
          Approvals to Review
        </h1>
        {pendingCount > 0 && (
          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by employee, subject or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Approval Subject",
                  "Request Owner",
                  "Category",
                  "Date",
                  "Request Status",
                  "Total Amount (in company's currency)",
                  "",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const log = actionLog[r.id];
                  const isActedOn = r.status !== "PENDING";

                  return (
                    <tr
                      key={r.id}
                      className={`transition ${isActedOn ? "bg-gray-50 opacity-75" : "hover:bg-gray-50"}`}
                    >
                      {/* Subject */}
                      <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {r.description || (
                          <span className="text-gray-300 italic">none</span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {r.owner_name[0]}
                          </div>
                          {r.owner_name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {r.category}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(r.expense_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Request Status */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-300">
                          Waiting Approval
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-400 font-medium line-through">
                            {r.amount} {r.currency}
                          </span>
                          <span className="text-gray-400 text-xs">=</span>
                          <span className="font-semibold text-gray-800 text-sm">
                            ₹{toINR(r.amount, r.currency)}
                          </span>
                          <span className="text-xs text-gray-400">(INR)</span>
                        </div>
                      </td>

                      {/* Approve button */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActionLog((prev) => ({
                              ...prev,
                              [r.id]: { status: "APPROVED" },
                            }));
                            handleAction(r.id, "APPROVED");
                          }}
                          className="border border-emerald-500 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-emerald-50 transition flex items-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                      </td>

                      {/* Reject button */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActionLog((prev) => ({
                              ...prev,
                              [r.id]: { status: "REJECTED" },
                            }));
                            handleAction(r.id, "REJECTED");
                          }}
                          className="border border-red-400 text-red-500 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {requests.length} request{requests.length !== 1 ? "s" : ""} total
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
              Pending: {requests.length}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionLog[currentExpenseId]?.status === "REJECTED"
                  ? "Rejection Reason"
                  : "Additional Comments"}
              </h3>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comments (optional)"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
