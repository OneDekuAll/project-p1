const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database._instance) return Database._instance;
    this._connection = null;
    Database._instance = this;
  }

  static getInstance() {
    if (!Database._instance) new Database();
    return Database._instance;
  }

  async connect() {
    if (this._connection) {
      console.log('[Singleton] Reusing existing DB connection.');
      return this._connection;
    }
    try {
      this._connection = await mongoose.connect(process.env.MONGODB_URI);
      console.log('[Singleton] MongoDB connected.');
      return this._connection;
    } catch (err) {
      console.error('[Singleton] DB connection failed:', err.message);
      process.exit(1);
    }
  }
}

module.exports = Database;