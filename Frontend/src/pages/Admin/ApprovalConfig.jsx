import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GitBranch,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const ROLES = ["MANAGER", "FINANCE", "DIRECTOR", "CFO", "HR", "CEO"];

const RULE_TYPES = [
  {
    value: "ALL",
    label: "ALL",
    description: "Every approver in the chain must approve",
  },
  {
    value: "PERCENTAGE",
    label: "PERCENTAGE",
    description: "A minimum % of approvers must approve",
  },
  {
    value: "SPECIFIC",
    label: "SPECIFIC",
    description: "A specific role must give final approval",
  },
];

const ROLE_COLORS = {
  MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
  FINANCE: "bg-amber-50 text-amber-700 border-amber-200",
  DIRECTOR: "bg-purple-50 text-purple-700 border-purple-200",
  CFO: "bg-green-50 text-green-700 border-green-200",
  HR: "bg-pink-50 text-pink-700 border-pink-200",
  CEO: "bg-red-50 text-red-700 border-red-200",
};

export default function ApprovalConfig() {
  const [steps, setSteps] = useState([{ id: 1, stepOrder: 1, role: "MANAGER" }]);
  const [ruleType, setRuleType] = useState("ALL");
  const [threshold, setThreshold] = useState(60);
  const [specialRole, setSpecialRole] = useState("CFO");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  // Fetch existing config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchConfig = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/approval-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.steps?.length > 0) {
        setSteps(
          res.data.steps.map((s, i) => ({ id: i + 1, stepOrder: s.stepOrder, role: s.role }))
        );
      }
      if (res.data?.rule) {
        setRuleType(res.data.rule.type || "ALL");
        setThreshold(res.data.rule.threshold || 60);
        setSpecialRole(res.data.rule.specialRole || "CFO");
      }
    } catch {
      // No existing config — fine, use defaults
    } finally {
      setFetchLoading(false);
    }
  };

  // ── Step helpers ────────────────────────────────────────────────────────────
  const addStep = () => {
    const newId = Date.now();
    setSteps((prev) => [
      ...prev,
      { id: newId, stepOrder: prev.length + 1, role: "FINANCE" },
    ]);
  };

  const removeStep = (id) => {
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    });
  };

  const updateRole = (id, role) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
  };

  const moveStep = (index, direction) => {
    setSteps((prev) => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateError = (() => {
    if (steps.length === 0) return "Add at least one approval step.";
    if (ruleType === "PERCENTAGE") {
      if (!threshold || threshold < 1 || threshold > 100)
        return "Percentage threshold must be between 1 and 100.";
    }
    return null;
  })();

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (validateError) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        steps: steps.map(({ stepOrder, role }) => ({ stepOrder, role })),
        rule: {
          type: ruleType,
          threshold: ruleType === "PERCENTAGE" ? Number(threshold) : null,
          specialRole: ruleType === "SPECIFIC" ? specialRole : null,
        },
      };
      await axios.post("http://localhost:5000/api/approval-config", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: "success", message: "Approval configuration saved successfully!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Failed to save configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Preview summary ──────────────────────────────────────────────────────────
  const previewSummary = (() => {
    const flow = steps.map((s) => s.role).join(" → ");
    if (!flow) return null;
    let rule = ruleType;
    if (ruleType === "PERCENTAGE") rule = `${threshold}% approval`;
    if (ruleType === "SPECIFIC") rule = `${specialRole} required`;
    return `${flow} | Rule: ${rule}`;
  })();

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading configuration…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
        <h1 className="text-base font-bold text-gray-800">Approval Workflow Configuration</h1>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Section 1: Flow Builder ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Card header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <GitBranch size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-700">Approval Flow</h2>
          <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 space-y-2">
          {steps.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">
              No steps yet. Click "Add Step" to begin.
            </p>
          )}

          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 group"
            >
              {/* Step badge */}
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold flex-shrink-0">
                {step.stepOrder}
              </span>

              {/* Role selector */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-400 block mb-0.5">Role</label>
                <select
                  value={step.role}
                  onChange={(e) => updateRole(step.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role chip */}
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border hidden sm:inline-flex ${
                  ROLE_COLORS[step.role] || "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {step.role}
              </span>

              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 transition"
                  title="Move up"
                >
                  <ChevronUp size={14} className="text-gray-500" />
                </button>
                <button
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 transition"
                  title="Move down"
                >
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeStep(step.id)}
                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition flex-shrink-0"
                title="Remove step"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={addStep}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-dashed border-amber-300 hover:border-amber-400 rounded-lg px-3 py-2 w-full justify-center transition"
          >
            <Plus size={14} />
            Add Step
          </button>
        </div>
      </div>

      {/* ── Section 2: Rule Config ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Shield size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-700">Approval Rule</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Rule type selection */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Rule Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RULE_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setRuleType(rt.value)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs transition ${
                    ruleType === rt.value
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold mb-0.5">{rt.label}</div>
                  <div className="text-gray-400 leading-snug">{rt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional inputs */}
          {ruleType === "PERCENTAGE" && (
            <div className="flex items-end gap-3">
              <div className="w-48">
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Minimum Approval %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    %
                  </span>
                </div>
                {threshold && (threshold < 1 || threshold > 100) && (
                  <p className="text-red-500 text-xs mt-1">Must be between 1 – 100</p>
                )}
              </div>
              <p className="text-xs text-gray-400 pb-2">
                At least{" "}
                <span className="font-semibold text-gray-600">{threshold || "?"}%</span> of
                approvers must approve.
              </p>
            </div>
          )}

          {ruleType === "SPECIFIC" && (
            <div className="w-48">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Required Role
              </label>
              <select
                value={specialRole}
                onChange={(e) => setSpecialRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white font-medium text-gray-700"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                <span className="font-semibold text-gray-600">{specialRole}</span> must give
                final approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Summary ── */}
      {previewSummary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <ArrowRight size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">
              Preview
            </p>
            <p className="text-xs text-gray-700 font-medium">{previewSummary}</p>
          </div>
        </div>
      )}

      {/* ── Validation error ── */}
      {validateError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={13} />
          {validateError}
        </p>
      )}

      {/* ── Save button ── */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading || !!validateError}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {loading ? "Saving…" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
