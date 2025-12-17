const AvailabilitySlot = require('../../models/AvailabilitySlot');

// Doctor creates a slot
const createSlot = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date, startTime, endTime } = req.body;

    // Check for overlapping slots
    const existingSlot = await AvailabilitySlot.findOne({
      doctorId,
      date,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Slot overlaps with existing slot',
      });
    }

    const slot = await AvailabilitySlot.create({
      doctorId,
      date,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: { slot },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Doctor gets their slots
const getMySlots = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date } = req.query;

    let query = { doctorId };
    if (date) {
      query.date = date;
    }

    const slots = await AvailabilitySlot.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: { slots },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Doctor updates a slot
const updateSlot = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { slotId } = req.params;
    const { date, startTime, endTime } = req.body;

    const slot = await AvailabilitySlot.findOne({ _id: slotId, doctorId });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booked slot',
      });
    }

    if (date) slot.date = date;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    await slot.save();

    res.json({
      success: true,
      message: 'Slot updated successfully',
      data: { slot },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Doctor deletes a slot
const deleteSlot = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { slotId } = req.params;

    const slot = await AvailabilitySlot.findOne({ _id: slotId, doctorId });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete booked slot',
      });
    }

    await slot.deleteOne();

    res.json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get available slots for a doctor
const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    let query = { 
      doctorId,
      isBooked: false,
    };

    if (date) {
      query.date = date;
    }

    const slots = await AvailabilitySlot.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: { slots },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSlot,
  getMySlots,
  updateSlot,
  deleteSlot,
  getDoctorSlots,
};
