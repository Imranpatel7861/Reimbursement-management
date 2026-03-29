import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Eye } from "lucide-react";

const STATUS_STYLES = {
  APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-300",
  REJECTED: "bg-red-50 text-red-600 border border-red-300",
  PENDING: "bg-yellow-50 text-yellow-600 border border-yellow-300",
};

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

export default function ManageHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    const fetchApprovalHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/approvals/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch approval history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    // Filter by search term
    const matchesSearch =
      item.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && item.approval_status === "APPROVED") ||
      (activeTab === "rejected" && item.approval_status === "REJECTED");

    return matchesSearch && matchesTab;
  });

  const getStatusCount = (status) => {
    return history.filter((item) => item.approval_status === status).length;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
          <h1 className="text-base font-bold text-gray-800">
            Approval History
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-4">
      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Approval History</h1>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full overflow-hidden">
        {/* Tabs for status */}
        <div className="flex border-b border-gray-100">
          {[
            { id: "all", label: "All" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}{" "}
              {tab.id !== "all" && `(${getStatusCount(tab.id.toUpperCase())})`}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by employee, subject or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Request Subject",
                  "Request Owner",
                  "Category",
                  "Date",
                  "Amount",
                  "Your Action",
                  "Comment",
                  "Action Date",
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
              {filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No approval history found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    {/* Subject */}
                    <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {item.description}
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {item.owner_name[0]}
                        </div>
                        {item.owner_name}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(item.expense_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800 text-sm">
                          ₹{toINR(item.amount, item.currency)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({item.amount} {item.currency})
                        </span>
                      </div>
                    </td>

                    {/* Your Action */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {item.approval_status === "APPROVED" ? (
                        <div className="flex items-center gap-1">Approved</div>
                      ) : (
                        <div className="flex items-center gap-1">Rejected</div>
                      )}
                    </td>

                    {/* Comment */}
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {item.comment || (
                        <span className="text-gray-300 italic">No comment</span>
                      )}
                    </td>

                    {/* Action Date */}
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {item.action_date
                        ? new Date(item.action_date).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* View Details */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          setSelectedExpense(
                            selectedExpense === item.id ? null : item.id,
                          )
                        }
                        className="text-gray-400 hover:text-purple-600 transition"
                      >
                        <Eye size={16} />
                      </button>
                    </td>

                    {selectedExpense === item.id && (
                      <tr className="bg-purple-50">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-1">
                                REQUEST DETAILS
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Description
                                  </p>
                                  <p className="font-medium">
                                    {item.description}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Category
                                  </p>
                                  <p className="font-medium">{item.category}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Date</p>
                                  <p className="font-medium">
                                    {new Date(
                                      item.expense_date,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Amount
                                  </p>
                                  <p className="font-medium">
                                    ₹{toINR(item.amount, item.currency)} (
                                    {item.amount} {item.currency})
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-1">
                                APPROVAL DETAILS
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Your Role
                                  </p>
                                  <p className="font-medium">
                                    {item.approver_role}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Action
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      item.approval_status === "APPROVED"
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {item.approval_status}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Date/Time
                                  </p>
                                  <p className="font-medium">
                                    {item.action_date
                                      ? new Date(
                                          item.action_date,
                                        ).toLocaleString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                      : "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Comment
                                  </p>
                                  <p className="font-medium">
                                    {item.comment || "No comment provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {filteredHistory.length} record
            {filteredHistory.length !== 1 ? "s" : ""} total
          </span>
        </div>
      </div>
    </div>
  );
}
