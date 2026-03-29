import { useState } from "react";
import { Eye } from "lucide-react";

const DEMO_EXPENSES = [
  {
    id: 1,
    employee: "Sarah",
    description: "Restaurant bill",
    date: "4th Oct, 2025",
    category: "Meals & Entertainment",
    paidBy: "Sarah",
    remarks: "None",
    amount: 5000,
    currency: "INR",
    status: "Draft",
  },
  {
    id: 2,
    employee: "Karan Singh",
    description: "Flight to Mumbai",
    date: "10th Oct, 2025",
    category: "Travel & Transport",
    paidBy: "Credit Card",
    remarks: "Client visit",
    amount: 33674,
    currency: "INR",
    status: "Waiting Approval",
  },
  {
    id: 3,
    employee: "Neha Joshi",
    description: "AWS subscription",
    date: "1st Oct, 2025",
    category: "Software & Subscriptions",
    paidBy: "Debit Card",
    remarks: "Monthly",
    amount: 500,
    currency: "INR",
    status: "Approved",
  },
];

const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-500 border border-gray-300",
  "Waiting Approval": "bg-yellow-50 text-yellow-600 border border-yellow-300",
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-400",
  Rejected: "bg-red-50 text-red-600 border border-red-300",
};

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [selectedRow, setSelectedRow] = useState(null);

  const toSubmit = expenses.filter((e) => e.status === "Draft").reduce((s, e) => s + e.amount, 0);
  const waiting = expenses.filter((e) => e.status === "Waiting Approval").reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter((e) => e.status === "Approved").reduce((s, e) => s + e.amount, 0);



  return (
    <div className="p-4 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Expense History</h1>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">



        {/* Summary strip — no arrows, no lines */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="px-6 py-4">
            <p className="text-sm font-bold text-gray-800">
              {toSubmit.toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-400">rs</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">To submit</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm font-bold text-gray-800">
              {waiting.toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-400">rs</span>
            </p>
            <p className="text-xs text-yellow-500 mt-0.5 font-medium">Waiting approval</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm font-bold text-gray-800">
              {approved.toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-400">rs</span>
            </p>
            <p className="text-xs text-emerald-500 mt-0.5 font-medium">Approved</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Employee", "Description", "Date", "Category", "Paid By", "Remarks", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="text-left font-semibold text-gray-400 uppercase px-4 py-2.5 tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-300 text-xs">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <>
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedRow(selectedRow === e.id ? null : e.id)}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{e.employee}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{e.description || <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{e.date}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{e.category || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{e.paidBy || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{e.remarks || "None"}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-700 whitespace-nowrap">
                        {e.amount.toLocaleString("en-IN")} <span className="font-normal text-gray-400">{e.currency}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[e.status] || "bg-gray-100 text-gray-400"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setSelectedRow(selectedRow === e.id ? null : e.id); }}
                          className="text-gray-300 hover:text-emerald-500 transition"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>

                    {selectedRow === e.id && (
                      <tr key={e.id + "-detail"} className="bg-emerald-50">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Description</p>
                              <p className="text-gray-700">{e.description || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Category</p>
                              <p className="text-gray-700">{e.category || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Paid By</p>
                              <p className="text-gray-700">{e.paidBy || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Remarks</p>
                              <p className="text-gray-700">{e.remarks || "None"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Amount</p>
                              <p className="text-gray-700 font-semibold">{e.amount.toLocaleString("en-IN")} {e.currency}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Status</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[e.status]}`}>
                                {e.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Date</p>
                              <p className="text-gray-700">{e.date}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">{expenses.length} expense{expenses.length !== 1 ? "s" : ""} total</span>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Draft: {expenses.filter(e => e.status === "Draft").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" /> Waiting: {expenses.filter(e => e.status === "Waiting Approval").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Approved: {expenses.filter(e => e.status === "Approved").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}