const Topic   = require('../models/Topic');
const Message = require('../models/Message');

exports.getStats = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate('createdBy', 'username')
      .sort({ accessCount: -1 });

    const topicsWithStats = await Promise.all(
      topics.map(async (topic) => {
        const messageCount = await Message.countDocuments({ topic: topic._id });
        return { topic, messageCount };
      })
    );

    res.render('stats', { topicsWithStats, error: null });
  } catch (err) {
    res.render('stats', { topicsWithStats: [], error: err.message });
  }
};