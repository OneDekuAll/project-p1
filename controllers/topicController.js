const Topic   = require('../models/Topic');
const Message = require('../models/Message');
const User    = require('../models/User');
const { TopicEventSubject } = require('../patterns/observer');

const topicEvents = TopicEventSubject.getInstance();

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate('subscribedTopics');
    const topicsWithMessages = await Promise.all(
      user.subscribedTopics.map(async (topic) => {
        const messages = await Message.find({ topic: topic._id })
          .populate('author', 'username')
          .sort({ createdAt: -1 })
          .limit(2);
        return { topic, messages };
      })
    );
    res.render('dashboard', { topicsWithMessages, error: null });
  } catch (err) {
    res.render('dashboard', { topicsWithMessages: [], error: err.message });
  }
};

exports.getBrowse = async (req, res) => {
  try {
    const user      = await User.findById(req.session.user.id);
    const allTopics = await Topic.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    const subIds    = user.subscribedTopics.map(id => id.toString());
    res.render('browse', { allTopics, subIds, error: null });
  } catch (err) {
    res.render('browse', { allTopics: [], subIds: [], error: err.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, {
      $addToSet: { subscribedTopics: req.params.id }
    });
    res.redirect('/topics/browse');
  } catch (err) {
    res.redirect('/topics/browse');
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, {
      $pull: { subscribedTopics: req.params.id }
    });
    const referer = req.headers.referer || '/topics/dashboard';
    res.redirect(referer);
  } catch (err) {
    res.redirect('/topics/dashboard');
  }
};

exports.getNewTopic = (req, res) => {
  res.render('newTopic', { error: null });
};

exports.postNewTopic = async (req, res) => {
  const { title, description } = req.body;
  try {
    const topic = new Topic({ title, description, createdBy: req.session.user.id });
    await topic.save();
    await User.findByIdAndUpdate(req.session.user.id, {
      $addToSet: { subscribedTopics: topic._id }
    });
    res.redirect('/topics/dashboard');
  } catch (err) {
    res.render('newTopic', { error: 'Could not create topic.' });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('createdBy', 'username');
    if (!topic) return res.redirect('/topics/dashboard');
    const messages = await Message.find({ topic: topic._id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });
    const user = await User.findById(req.session.user.id);
    const isSubscribed = user.subscribedTopics
      .map(id => id.toString())
      .includes(topic._id.toString());
    topicEvents.notify('TOPIC_ACCESSED', { topicId: topic._id, topicTitle: topic.title });
    res.render('topic', { topic, messages, isSubscribed, error: null });
  } catch (err) {
    res.redirect('/topics/dashboard');
  }
};

exports.postMessage = async (req, res) => {
  const { content } = req.body;
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.redirect('/topics/dashboard');
    const user = await User.findById(req.session.user.id);
    const isSubscribed = user.subscribedTopics
      .map(id => id.toString())
      .includes(topic._id.toString());
    if (!isSubscribed) return res.redirect(`/topics/${req.params.id}`);
    const msg = new Message({ topic: topic._id, author: user._id, content });
    await msg.save();
    topicEvents.notify('MESSAGE_POSTED', {
      topicTitle: topic.title,
      author: req.session.user.username
    });
    res.redirect(`/topics/${req.params.id}`);
  } catch (err) {
    res.redirect(`/topics/${req.params.id}`);
  }
};