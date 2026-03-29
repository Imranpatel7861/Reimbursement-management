import React, { useState } from "react";
import axios from "axios";

/**
 * OCRUpload component that handles file selection, calls the OCR API,
 * and passes the extracted structured data up via `onDataExtracted`.
 */
export default function OCRUpload({ onDataExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await axios.post("http://localhost:5001/api/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        // Pass data up to parent
        if (onDataExtracted) {
          onDataExtracted(response.data.data);
        }
      } else {
        setError(response.data.message || "Failed to process receipt");
      }
    } catch (err) {
      console.error(err);
      setError("Error calling the OCR API. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 text-center">
      <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p className="text-sm text-gray-600 mb-4 font-medium">Upload Receipt for OCR Parsing</p>
      
      <div className="flex gap-2 items-center w-full justify-center">
        <input 
          type="file" 
          id="receipt-upload"
          className="hidden" 
          onChange={handleFileChange} 
          accept="image/*"
        />
        <label 
          htmlFor="receipt-upload" 
          className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition whitespace-nowrap"
        >
          {file ? file.name : "Choose File"}
        </label>
        
        <button 
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Scanning..." : "Scan Receipt"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
    </div>
  );
}
