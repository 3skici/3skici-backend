// reportRoutes.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/isAuthenticated');
const { submitReport, handleAdminAction } = require('../controllers/reportController');

// // Submit a report (authenticated users only)
// router.post('/', isAuthenticated, submitReport);

// // Handle admin action on a report
// router.put('/:reportId/admin-action', isAuthenticated, handleAdminAction);

module.exports = router;
