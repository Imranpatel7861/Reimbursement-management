const pool = require("../config/db");

// Get pending approvals for a specific approver (manager/financer/admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const approverId = req.user.id;
    const approverRole = req.user.role;

    // Determine which level of approvals to show based on role
    let query;
    if (approverRole === 'MANAGER') {
      // Managers see requests from their direct reports
      query = `
        SELECT e.*, u.name as owner_name
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE e.status = 'PENDING'
        AND e.employee_id IN (
          SELECT id FROM users WHERE manager_id = $1
        )
        AND NOT EXISTS (
          SELECT 1 FROM approval_workflow
          WHERE expense_id = e.id
        )
        ORDER BY e.created_at DESC
      `;
    } else if (approverRole === 'FINANCE') {
      // Financers see requests approved by managers
      query = `
        SELECT e.*, u.name as owner_name
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE e.status = 'PENDING'
        AND EXISTS (
          SELECT 1 FROM approval_workflow
          WHERE expense_id = e.id
          AND status = 'APPROVED'
          AND role = 'MANAGER'
        )
        AND NOT EXISTS (
          SELECT 1 FROM approval_workflow
          WHERE expense_id = e.id
          AND role = 'FINANCE'
        )
        ORDER BY e.created_at DESC
      `;
    } else if (approverRole === 'ADMIN') {
      // Admins see requests approved by financers
      query = `
        SELECT e.*, u.name as owner_name
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE e.status = 'PENDING'
        AND EXISTS (
          SELECT 1 FROM approval_workflow
          WHERE expense_id = e.id
          AND status = 'APPROVED'
          AND role = 'FINANCE'
        )
        AND NOT EXISTS (
          SELECT 1 FROM approval_workflow
          WHERE expense_id = e.id
          AND role = 'ADMIN'
        )
        ORDER BY e.created_at DESC
      `;
    }

    const { rows } = await pool.query(query, [approverId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending approvals" });
  }
};

// Get approval history for an approver
exports.getApprovalHistory = async (req, res) => {
  try {
    const approverId = req.user.id;

    const { rows } = await pool.query(`
      SELECT e.*, u.name as owner_name, aw.status as approval_status,
             aw.comment, aw.action_date, aw.role as approver_role
      FROM approval_workflow aw
      JOIN expenses e ON aw.expense_id = e.id
      JOIN users u ON e.employee_id = u.id
      WHERE aw.approver_id = $1
      ORDER BY aw.action_date DESC
    `, [approverId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch approval history" });
  }
};

// Handle approval action
exports.handleApproval = async (req, res) => {
  try {
    const { expenseId, action, comment } = req.body;
    const approverId = req.user.id;
    const approverRole = req.user.role;

    await pool.query("BEGIN");

    // Determine the sequence number based on role
    let sequence;
    if (approverRole === 'MANAGER') sequence = 1;
    else if (approverRole === 'FINANCE') sequence = 2;
    else if (approverRole === 'ADMIN') sequence = 3;

    // Insert approval record
    await pool.query(`
      INSERT INTO approval_workflow
      (expense_id, approver_id, role, sequence, status, comment, action_date)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [expenseId, approverId, approverRole, sequence, action, comment]);

    // Update expense status if this is the final approval
    if (approverRole === 'ADMIN' || action === 'REJECTED') {
      const newStatus = action === 'REJECTED' ? 'REJECTED' : 'APPROVED';
      await pool.query(`
        UPDATE expenses
        SET status = $1
        WHERE id = $2
      `, [newStatus, expenseId]);
    }

    await pool.query("COMMIT");

    res.json({ success: true, message: `Expense ${action.toLowerCase()} successfully` });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Failed to process approval" });
  }
};