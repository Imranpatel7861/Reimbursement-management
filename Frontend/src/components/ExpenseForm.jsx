import React, { useState } from "react";
import OCRUpload from "./OCRUpload";

export default function ExpenseForm() {
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
  });
  const [rawText, setRawText] = useState("");

  const handleDataExtracted = (ocrData) => {
    // 1. Autofill missing fields safely
    setFormData((prev) => ({
      amount: prev.amount || ocrData.amount,
      date: prev.date || ocrData.date,
      description: prev.description || ocrData.merchant,
    }));
    // 2. Keep the raw text for UX/Debugging
    setRawText(ocrData.rawText);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Expense Submitted:\nAmount: ${formData.amount}\nDate: ${formData.date}\nDescription: ${formData.description}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl space-y-8 my-8 border border-gray-100">
      
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Submit Expense (OCR Powered)</h2>
        <p className="text-sm text-gray-500">Scan your receipt to automatically fill the details.</p>
      </div>

      {/* Upload Component */}
      <OCRUpload onDataExtracted={handleDataExtracted} />

      {/* The Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              name="date"
              type="text"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="DD/MM/YYYY"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Merchant</label>
          <input 
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Coffee at Starbucks"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-gray-900 text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-800 transition"
        >
          Submit Expense
        </button>
      </form>

      {/* Raw Text Output if available */}
      {rawText && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Extracted Raw Text:</h3>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 whitespace-pre-wrap font-mono h-32 overflow-y-auto border border-gray-200">
            {rawText}
          </div>
        </div>
      )}

    </div>
  );
}
