const mongoose = require('mongoose');

// Define nested schemas for structured data
const personalInfoSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    phoneNumber: { type: String, default: null },
  },
  { _id: false },
);

const addressInfoSchema = new mongoose.Schema(
  {
    homeAddress: { type: String, default: null },
    workAddress: { type: String, default: null },
    city: { type: String, default: null },
    postalCode: { type: String, default: null },
    country: { type: String, default: null },
  },
  { _id: false },
);

const socialInfoSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: null },
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    website: { type: String, default: null },
  },
  { _id: false },
);

const updateRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // New fields for the enhanced form
  profileImage: {
    type: String,
    default: null,
  },
  personalInfo: {
    type: personalInfoSchema,
    default: null,
  },
  addressInfo: {
    type: addressInfoSchema,
    default: null,
  },
  socialInfo: {
    type: socialInfoSchema,
    default: null,
  },
});

const UpdateRequest = mongoose.model('UpdateRequest', updateRequestSchema);

module.exports = UpdateRequest;
