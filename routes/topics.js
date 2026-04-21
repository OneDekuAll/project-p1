const express = require('express');
const router  = express.Router();
const tc      = require('../controllers/topicController');

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

router.use(requireAuth);

router.get('/dashboard',        tc.getDashboard);
router.get('/browse',           tc.getBrowse);
router.get('/new',              tc.getNewTopic);
router.post('/new',             tc.postNewTopic);
router.post('/:id/subscribe',   tc.subscribe);
router.post('/:id/unsubscribe', tc.unsubscribe);
router.get('/:id',              tc.getTopic);
router.post('/:id/messages',    tc.postMessage);

module.exports = router;