// reportController.js
const Report = require('../models/Report');
const Product = require('../models/Product');
const User = require('../models/User');

// Submit a new report
const submitReport = async (req, res) => {
  const { productId, reportType, otherReason, priority } = req.body;
  const userId = req.user.id;

  try {
    // Create a new report
    const report = new Report({
      productId,
      userId,
      reportType,
      otherReason,
      priority,
    });
    await report.save();

    // Increase reported count for the product
    const product = await Product.findById(productId);
    product.reportedCount += 1;

    // Hide the product if reported count exceeds 5
    if (product.reportedCount > 5) {
      product.isHidden = true;
    }
    await product.save();

    // Notify admin (this is a placeholder for your notification logic)
    console.log('Admin notified about the new report');

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Admin action on a report
const handleAdminAction = async (req, res) => {
  const { reportId } = req.params;
  const { action, comment, reply } = req.body;

  try {
    const report = await Report.findById(reportId).populate('userId');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update the admin action and status of the report
    report.adminAction = { comment, reply };
    report.status = 'Reviewed';
    await report.save();

    // Handle product based on admin action
    const product = await Product.findById(report.productId);
    if (action === 'Move to Trash') {
      product.isHidden = true;
    } else if (action === 'Dismiss Report') {
      product.isHidden = false;
    }
    await product.save();

    // Send auto-reply to user
    const user = await User.findById(report.userId);
    if (user) {
      console.log(`Notification sent to user ${user.email}: ${reply}`); // Replace with actual notification logic
    }

    res.status(200).json({ message: 'Admin action completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  submitReport,
  handleAdminAction,
};
