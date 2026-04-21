const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);