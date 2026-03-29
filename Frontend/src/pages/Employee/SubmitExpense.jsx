import { useState } from "react";
import axios from "axios";

const G20_CURRENCIES = [
  { code: "USD", name: "US Dollar", country: "United States" },
  { code: "EUR", name: "Euro", country: "European Union" },
  { code: "GBP", name: "British Pound", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", country: "Japan" },
  { code: "CNY", name: "Chinese Yuan", country: "China" },
  { code: "INR", name: "Indian Rupee", country: "India" },
  { code: "CAD", name: "Canadian Dollar", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", country: "Australia" },
  { code: "BRL", name: "Brazilian Real", country: "Brazil" },
  { code: "RUB", name: "Russian Ruble", country: "Russia" },
  { code: "KRW", name: "South Korean Won", country: "South Korea" },
  { code: "MXN", name: "Mexican Peso", country: "Mexico" },
  { code: "IDR", name: "Indonesian Rupiah", country: "Indonesia" },
  { code: "SAR", name: "Saudi Riyal", country: "Saudi Arabia" },
  { code: "TRY", name: "Turkish Lira", country: "Turkey" },
  { code: "ZAR", name: "South African Rand", country: "South Africa" },
  { code: "ARS", name: "Argentine Peso", country: "Argentina" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland" },
];

const CATEGORIES = [
  "Travel & Transport",
  "Meals & Entertainment",
  "Office Supplies",
  "Software & Subscriptions",
  "Marketing",
  "Training & Education",
  "Hardware & Equipment",
  "Utilities",
  "Other",
];

const PAID_BY = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "UPI"];

const STATUS_STEPS = ["Draft", "Waiting Approval", "Approved"];

export default function SubmitRequest() {
  const [form, setForm] = useState({
    description: "",
    expenseDate: "",
    category: "",
    paidBy: "",
    currency: "USD",
    amount: "",
    remarks: "",
  });
  const [currentStatus, setCurrentStatus] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [log, setLog] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [errorOCR, setErrorOCR] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [showOcrPreview, setShowOcrPreview] = useState(false);

  const handleSubmit = () => {
    if (!form.description || !form.amount || !form.expenseDate) return;
    setSubmitted(true);
    setCurrentStatus(1);
    setLog([{ approver: "Sarah", status: "Pending", time: new Date().toLocaleString() }]);
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file.name);
      setReceiptFile(file);
      setErrorOCR(null);
    }
  };

  const handleScanReceipt = async () => {
    if (!receiptFile) return;
    setLoadingOCR(true);
    setErrorOCR(null);
    setOcrData(null);
    setShowOcrPreview(false);
    
    const formData = new FormData();
    formData.append("receipt", receiptFile);
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000
      });
      
      if (!data.success) {
        setErrorOCR(data.message || "Failed to scan receipt");
        return;
      }

      const extractedData = data.data;
      setOcrData(extractedData);
      setShowOcrPreview(true);
      console.log("[OCR] Extracted data:", extractedData);
      
    } catch (err) {
      console.error("[OCR Error]", err);
      
      if (err.code === 'ECONNABORTED') {
        setErrorOCR("Request timeout. Server may be down.");
      } else if (err.response?.data?.message) {
        setErrorOCR(err.response.data.message);
      } else {
        setErrorOCR("Failed to scan receipt. Check file and try again.");
      }
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleAcceptOcrData = () => {
    if (!ocrData) return;
    
    setForm((prev) => ({
      ...prev,
      amount: prev.amount || ocrData.amount || "",
      expenseDate: prev.expenseDate || ocrData.date || "",
      description: prev.description || ocrData.merchant || ""
    }));
    
    setShowOcrPreview(false);
  };

  return (
    <div className="w-full h-full p-6 space-y-4">

      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Submit Request</h1>
      </div>

      {/* Main Card — full width */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full">

        {/* Top bar: Attach Receipt + Status trail */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleReceiptChange} />
              <span className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {receipt ? receipt : "Upload Receipt (Optional)"}
              </span>
            </label>

            {receiptFile && !submitted && (
              <button
                type="button"
                onClick={handleScanReceipt}
                disabled={loadingOCR}
                className="border border-emerald-500 text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-50"
              >
                {loadingOCR ? "Scanning..." : "Scan Receipt"}
              </button>
            )}
            {errorOCR && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorOCR}
              </span>
            )}
          </div>

          {/* Status Steps */}
          <div className="flex items-center gap-2 text-xs">
            {STATUS_STEPS.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className={`font-medium ${
                  i === currentStatus
                    ? "text-emerald-600"
                    : i < currentStatus
                    ? "text-gray-300 line-through"
                    : "text-gray-400"
                }`}>
                  {step}
                </span>
                {i < STATUS_STEPS.length - 1 && (
                  <span className="text-gray-300">›</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* OCR Preview Modal */}
        {showOcrPreview && ocrData && (
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-emerald-900">OCR Scan Results</h3>
                <p className="text-xs text-emerald-700 mt-0.5">Review extracted data and confirm</p>
              </div>
              <button
                onClick={() => setShowOcrPreview(false)}
                className="text-emerald-600 hover:text-emerald-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-white rounded-lg p-3 border border-emerald-200">
              <div>
                <p className="text-emerald-600 font-semibold mb-1">Amount</p>
                <p className="text-gray-800 font-medium">{ocrData.amount || "—"}</p>
              </div>
              <div>
                <p className="text-emerald-600 font-semibold mb-1">Date</p>
                <p className="text-gray-800">{ocrData.date || "—"}</p>
              </div>
              <div>
                <p className="text-emerald-600 font-semibold mb-1">Merchant</p>
                <p className="text-gray-800">{ocrData.merchant || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptOcrData}
                className="flex-1 border border-emerald-500 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 transition"
              >
                ✓ Use These Values
              </button>
              <button
                onClick={() => setShowOcrPreview(false)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition"
              >
                Edit Manually
              </button>
            </div>
          </div>
        )}

        {/* Form body */}
        <div className="px-6 py-5 space-y-6">

          {/* Row 1: Description + Expense Date */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Merchant <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Brief description"
                value={form.description}
                disabled={submitted}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Expense Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.expenseDate}
                disabled={submitted}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          {/* Row 2: Category + Paid By */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Category</label>
              <select
                value={form.category}
                disabled={submitted}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">— Select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Paid by</label>
              <select
                value={form.paidBy}
                disabled={submitted}
                onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">— Select —</option>
                {PAID_BY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Total Amount + Remarks */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Total Amount in{" "}
                <select
                  value={form.currency}
                  disabled={submitted}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="text-xs font-semibold text-emerald-600 border-none focus:outline-none bg-transparent underline cursor-pointer disabled:text-gray-400"
                >
                  {G20_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
                <span className="text-gray-400 ml-1">▽</span>
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  disabled={submitted}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="flex-1 text-sm focus:outline-none bg-transparent text-gray-800 disabled:text-gray-400"
                />
                <span className="text-xs text-gray-400 font-medium">{form.currency}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Employee can submit expense in any currency (currency in which they spent the money per receipt)
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Description</label>
              <textarea
                placeholder="Any additional remarks..."
                value={form.remarks}
                disabled={submitted}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 resize-none leading-relaxed disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          {/* Approval Log */}
          {log.length > 0 && (
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 px-4 py-2">
                <span>Approver</span>
                <span>Status</span>
                <span>Time</span>
              </div>
              {log.map((entry, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 text-xs px-4 py-3 border-t border-gray-100">
                  <span className="font-medium text-gray-800">{entry.approver}</span>
                  <span className={`font-medium ${
                    entry.status === "Approved" ? "text-emerald-600"
                    : entry.status === "Rejected" ? "text-red-500"
                    : "text-yellow-500"
                  }`}>
                    {entry.status}
                  </span>
                  <span className="text-gray-400">{entry.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Submit / Status badge */}
          {!submitted ? (
            <div className="pt-1">
              <button
                onClick={handleSubmit}
                disabled={!form.description || !form.amount || !form.expenseDate}
                className="border-2 border-gray-800 text-gray-800 font-semibold text-sm px-8 py-2 rounded-full hover:bg-gray-800 hover:text-white transition disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Pending Approval — record is now read-only
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Info note */}
      {!submitted && (
        <p className="text-xs text-gray-400 px-1">
          Once submitted, the record becomes read-only and the submit button will be hidden. Status will change to{" "}
          <span className="font-medium text-yellow-500">Waiting Approval</span>. A log history will track who approved or rejected your request and at what time.
        </p>
      )}
    </div>
  );
}