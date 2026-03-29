import { useState, useEffect } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

const STATUS_STYLES = {
  "Waiting Approval": "bg-yellow-50 text-yellow-600 border border-yellow-300",
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-400",
  Rejected: "bg-red-50 text-red-600 border border-red-300",
};

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Waiting Approval");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    image: null,
    expenseId: null,
  });

  // Fetch user profile and expenses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user profile
        const userRes = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(userRes.data);

        // Fetch expenses for this employee
        const expensesRes = await axios.get(
          `http://localhost:5000/api/expenses/employee/${userRes.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Format the dates and set expenses
        const formattedExpenses = expensesRes.data.map((expense) => ({
          ...expense,
          date: new Date(expense.expense_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }));

        setExpenses(formattedExpenses);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReceipt = async (expenseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${expenseId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const imageUrl = URL.createObjectURL(response.data);
      setReceiptModal({ open: true, image: imageUrl, expenseId });
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
      alert("Failed to load receipt. It may not exist for this expense.");
    }
  };

  const waiting = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const approved = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const rejected = expenses
    .filter((e) => e.status === "REJECTED")
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const filteredExpenses = expenses.filter((e) =>
    activeTab === "Waiting Approval"
      ? e.status === "PENDING"
      : activeTab === "Approved"
        ? e.status === "APPROVED"
        : e.status === "REJECTED",
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
          <h1 className="text-base font-bold text-gray-800">Expense History</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Expense History</h1>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs for status */}
        <div className="flex border-b border-gray-100">
          {["Waiting Approval", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="px-6 py-4 text-center">
            <p className="text-sm font-bold text-gray-800">
              {waiting.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-gray-400">₹</span>
            </p>
            <p className="text-xs text-yellow-500 mt-0.5 font-medium">
              Waiting approval
            </p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="text-sm font-bold text-gray-800">
              {approved.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-gray-400">₹</span>
            </p>
            <p className="text-xs text-emerald-500 mt-0.5 font-medium">
              Approved
            </p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="text-sm font-bold text-gray-800">
              {rejected.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-gray-400">₹</span>
            </p>
            <p className="text-xs text-red-500 mt-0.5 font-medium">Rejected</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Description",
                  "Date",
                  "Category",
                  "Amount",
                  "Receipt",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-gray-400 uppercase px-4 py-2.5 tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-300 text-xs"
                  >
                    No expenses found for this status.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <>
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() =>
                        setSelectedRow(selectedRow === e.id ? null : e.id)
                      }
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                        {e.description || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {e.date}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {e.category || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-gray-700 whitespace-nowrap">
                        {parseFloat(e.amount).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="font-normal text-gray-400">
                          {e.currency}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {e.has_receipt ? (
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              fetchReceipt(e.id);
                            }}
                            className="text-emerald-500 hover:text-emerald-700 transition"
                            title="View receipt"
                          >
                            <Eye size={16} />
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            e.status === "PENDING"
                              ? STATUS_STYLES["Waiting Approval"]
                              : e.status === "APPROVED"
                                ? STATUS_STYLES["Approved"]
                                : STATUS_STYLES["Rejected"]
                          }`}
                        >
                          {e.status === "PENDING"
                            ? "Waiting Approval"
                            : e.status === "APPROVED"
                              ? "Approved"
                              : "Rejected"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedRow(selectedRow === e.id ? null : e.id);
                          }}
                          className="text-gray-300 hover:text-emerald-500 transition"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>

                    {selectedRow === e.id && (
                      <tr key={e.id + "-detail"} className="bg-emerald-50">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                Description
                              </p>
                              <p className="text-gray-700">
                                {e.description || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                Category
                              </p>
                              <p className="text-gray-700">
                                {e.category || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                Amount
                              </p>
                              <p className="text-gray-700 font-semibold">
                                {parseFloat(e.amount).toLocaleString("en-IN", {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {e.currency}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                Status
                              </p>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  e.status === "PENDING"
                                    ? STATUS_STYLES["Waiting Approval"]
                                    : e.status === "APPROVED"
                                      ? STATUS_STYLES["Approved"]
                                      : STATUS_STYLES["Rejected"]
                                }`}
                              >
                                {e.status === "PENDING"
                                  ? "Waiting Approval"
                                  : e.status === "APPROVED"
                                    ? "Approved"
                                    : "Rejected"}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                Date
                              </p>
                              <p className="text-gray-700">{e.date}</p>
                            </div>
                            {e.paid_by && (
                              <div>
                                <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                                  Paid By
                                </p>
                                <p className="text-gray-700">{e.paid_by}</p>
                              </div>
                            )}
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
          <span className="text-xs text-gray-400">
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? "s" : ""} total
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />{" "}
              Waiting: {expenses.filter((e) => e.status === "PENDING").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{" "}
              Approved: {expenses.filter((e) => e.status === "APPROVED").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{" "}
              Rejected: {expenses.filter((e) => e.status === "REJECTED").length}
            </span>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Expense Receipt
              </h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(receiptModal.image);
                  setReceiptModal({
                    open: false,
                    image: null,
                    expenseId: null,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <img
                src={receiptModal.image}
                alt="Expense receipt"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  URL.revokeObjectURL(receiptModal.image);
                  setReceiptModal({
                    open: false,
                    image: null,
                    expenseId: null,
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
