const express = require('express');
const router  = express.Router();
const stats   = require('../controllers/statsController');

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

router.get('/', requireAuth, stats.getStats);

module.exports = router;