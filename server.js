require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const MongoStore     = require('connect-mongo');
const methodOverride = require('method-override');
const path           = require('path');
const Database       = require('./config/database');

const app = express();

// T7: Singleton DB connection
const db = Database.getInstance();
db.connect();

// View engine (MVC - View layer)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Make current user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes — /stats MUST come before /topics to prevent /:id catching it
app.use('/',       require('./routes/auth'));
app.use('/stats',  require('./routes/stats'));
app.use('/topics', require('./routes/topics'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));