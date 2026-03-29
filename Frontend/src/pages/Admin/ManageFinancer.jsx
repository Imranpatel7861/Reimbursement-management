import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageFinancer() {
  const [financers, setFinancers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "Finance" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancers();
  }, []);

  const fetchFinancers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/users?role=FINANCE",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setFinancers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (editId !== null) {
        await axios.put(
          `http://localhost:5000/api/users/${editId}`,
          { ...form, role: "FINANCE" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/users",
          { ...form, role: "FINANCE" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      fetchFinancers();
      setForm({ name: "", email: "", role: "Financer" });
      setEditId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (f) => {
    setEditId(f.id);
    setForm({
      name: f.name,
      email: f.email,
      role: f.role,
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchFinancers();
      if (editId === id) {
        setEditId(null);
        setForm({ name: "", email: "", role: "Finance" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewPassword = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/users/${id}/send-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert("New password sent to the financer's email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Page heading */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">
          Financer Management
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editId !== null ? "Edit Financer" : "Add Financer"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Email
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Role
            </label>
            <input
              type="text"
              value="Financer"
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : editId !== null
                ? "Update"
                : "Add Financer"}
          </button>
          {editId !== null && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ name: "", email: "", role: "Financer" });
              }}
              className="border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Financers</h2>
          <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {financers.length} total
          </span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Role", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left font-semibold text-gray-500 uppercase px-4 py-2 tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-gray-400 text-xs"
                >
                  Loading...
                </td>
              </tr>
            ) : financers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-gray-400 text-xs"
                >
                  No financers added yet.
                </td>
              </tr>
            ) : (
              financers.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {f.name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{f.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {f.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(f)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleSendNewPassword(f.id)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        Send New Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
