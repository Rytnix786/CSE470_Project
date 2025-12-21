const Notification = require('../../models/Notification');

// Get notifications for the current user
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role and ID
    let query = {
      $or: [
        { recipientUserId: userId },
        { 
          recipientUserId: null,
          recipientRole: userRole
        },
        {
          recipientUserId: null,
          recipientRole: 'ALL'
        }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;

    // Find the notification
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check if user is authorized to mark this notification as read
    const isAuthorized = 
      (notification.recipientUserId && notification.recipientUserId.toString() === userId.toString()) ||
      (!notification.recipientUserId && notification.recipientRole === userRole) ||
      (!notification.recipientUserId && notification.recipientRole === 'ALL');

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this notification as read',
      });
    }

    // Update notification
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query for notifications this user can mark as read
    const query = {
      read: false,
      $or: [
        { recipientUserId: userId },
        { 
          recipientUserId: null,
          recipientRole: userRole
        },
        {
          recipientUserId: null,
          recipientRole: 'ALL'
        }
      ]
    };

    const result = await Notification.updateMany(query, {
      read: true,
      readAt: new Date(),
    });

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};