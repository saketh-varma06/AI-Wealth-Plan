const express = require('express');

// Notifications
const notifRouter = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
notifRouter.get('/', protect, getNotifications);
notifRouter.put('/:id/read', protect, markAsRead);
notifRouter.put('/read-all', protect, markAllRead);
notifRouter.delete('/:id', protect, deleteNotification);

// Reports
const reportRouter = express.Router();
const { generateCSV, getReportData } = require('../controllers/reportController');
reportRouter.get('/csv', protect, generateCSV);
reportRouter.get('/data', protect, getReportData);

// Admin
const adminRouter = express.Router();
const { getAdminStats, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { adminOnly } = require('../middleware/auth');
adminRouter.get('/stats', protect, adminOnly, getAdminStats);
adminRouter.get('/users', protect, adminOnly, getAllUsers);
adminRouter.put('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = { notifRouter, reportRouter, adminRouter };
