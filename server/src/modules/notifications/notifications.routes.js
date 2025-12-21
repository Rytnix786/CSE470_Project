const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { requireAuth } = require('../../middlewares/auth');

// All routes protected
router.use(requireAuth);

// GET /api/notifications - Get notifications for current user
router.get('/', notificationsController.getMyNotifications);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', notificationsController.markAsRead);

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', notificationsController.markAllAsRead);

module.exports = router;