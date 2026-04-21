class Subject {
  constructor() {
    this._observers = [];
  }
  addObserver(observer)    { this._observers.push(observer); }
  removeObserver(observer) { this._observers = this._observers.filter(o => o !== observer); }
  notify(event, data)      { this._observers.forEach(o => o.update(event, data)); }
}

class Observer {
  update(event, data) { throw new Error('update() must be implemented'); }
}

class StatsObserver extends Observer {
  async update(event, data) {
    if (event === 'TOPIC_ACCESSED') {
      const Topic = require('../models/Topic');
      await Topic.findByIdAndUpdate(data.topicId, { $inc: { accessCount: 1 } });
      console.log(`[StatsObserver] Topic "${data.topicTitle}" access count incremented.`);
    }
  }
}

class MessageLogger extends Observer {
  update(event, data) {
    if (event === 'MESSAGE_POSTED') {
      console.log(`[MessageLogger] New message in "${data.topicTitle}" by @${data.author}.`);
    }
  }
}

class TopicEventSubject extends Subject {
  constructor() {
    if (TopicEventSubject._instance) return TopicEventSubject._instance;
    super();
    this.addObserver(new StatsObserver());
    this.addObserver(new MessageLogger());
    TopicEventSubject._instance = this;
  }
  static getInstance() {
    if (!TopicEventSubject._instance) new TopicEventSubject();
    return TopicEventSubject._instance;
  }
}

module.exports = { TopicEventSubject };