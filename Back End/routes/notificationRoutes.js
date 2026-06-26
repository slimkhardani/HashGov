const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
  emptyInbox,
} = require('../controllers/updateRequestController');

// Get notifications for a specific user
router.get('/notifications', getUserNotifications);

// Mark all notifications as read for a user
router.patch('/notifications/mark-all-read', markAllNotificationsRead);

// Delete all notifications for a user (empty inbox)
router.delete('/notifications/empty-inbox', emptyInbox);

// Mark notification as read/unread
router.patch('/notifications/:id', markNotificationRead);

// Delete notification
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
