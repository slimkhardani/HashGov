const express = require('express');
const router = express.Router();
const Message = require('../models/messagemodel');

// Contact form submission route
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newMessage = new Message({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error sending message', error: error.message });
  }
});

// Get all messages (admin view) - sorted by date descending
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching messages', error: error.message });
  }
});

// Delete a message by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;
