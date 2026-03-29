import { useState } from "react";

// Mock exchange rates to INR (company base currency)
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

const DEMO_REQUESTS = [
  {
    id: 1,
    subject: "Restaurant bill",
    owner: "Sarah",
    category: "Meals & Entertainment",
    status: "Waiting Approval",
    originalAmount: 567,
    currency: "USD",
    date: "4th Oct, 2025",
    remarks: "Team lunch",
  },
  {
    id: 2,
    subject: "Flight to Mumbai",
    owner: "Karan Singh",
    category: "Travel & Transport",
    status: "Waiting Approval",
    originalAmount: 12000,
    currency: "INR",
    date: "10th Oct, 2025",
    remarks: "Client visit",
  },
  {
    id: 3,
    subject: "AWS subscription",
    owner: "Neha Joshi",
    category: "Software & Subscriptions",
    status: "Waiting Approval",
    originalAmount: 199,
    currency: "USD",
    date: "1st Oct, 2025",
    remarks: "Monthly renewal",
  },
];

const toINR = (amount, currency) => {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(amount * rate).toLocaleString("en-IN");
};

export default function PendingApprovals() {
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [search, setSearch] = useState("");
  const [actionLog, setActionLog] = useState({}); // id -> { status, time }

  const filtered = requests.filter(
    (r) =>
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (id, action) => {
    const time = new Date().toLocaleString();
    setActionLog((prev) => ({ ...prev, [id]: { status: action, time } }));
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
  };

  const pendingCount = requests.filter((r) => r.status === "Waiting Approval").length;

  return (
    <div className="w-full h-full p-6 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Approvals to Review</h1>
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
                  <td colSpan={8} className="text-center py-12 text-gray-300 text-sm">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const log = actionLog[r.id];
                  const isActedOn = r.status === "Approved" || r.status === "Rejected";

                  return (
                    <tr
                      key={r.id}
                      className={`transition ${isActedOn ? "bg-gray-50 opacity-75" : "hover:bg-gray-50"}`}
                    >
                      {/* Subject */}
                      <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {r.subject || <span className="text-gray-300 italic">none</span>}
                      </td>

                      {/* Owner */}
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {r.owner[0]}
                          </div>
                          {r.owner}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.category}</td>

                      {/* Date */}
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{r.date}</td>

                      {/* Request Status */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        {isActedOn ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            r.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-300"
                              : "bg-red-50 text-red-500 border border-red-300"
                          }`}>
                            {r.status}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-300">
                            Waiting Approval
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-400 font-medium line-through">
                            {r.originalAmount} {r.currency}
                          </span>
                          <span className="text-gray-400 text-xs">=</span>
                          <span className="font-semibold text-gray-800 text-sm">
                            ₹{toINR(r.originalAmount, r.currency)}
                          </span>
                          <span className="text-xs text-gray-400">(INR)</span>
                        </div>
                      </td>

                      {/* Approve button */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {!isActedOn ? (
                          <button
                            onClick={() => handleAction(r.id, "Approved")}
                            className="border border-emerald-500 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 italic">
                            {log?.time}
                          </span>
                        )}
                      </td>

                      {/* Reject button */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {!isActedOn && (
                          <button
                            onClick={() => handleAction(r.id, "Rejected")}
                            className="border border-red-400 text-red-500 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition"
                          >
                            Reject
                          </button>
                        )}
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
              Pending: {requests.filter((r) => r.status === "Waiting Approval").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Approved: {requests.filter((r) => r.status === "Approved").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Rejected: {requests.filter((r) => r.status === "Rejected").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}