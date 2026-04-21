const User = require('../models/User');

exports.getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/topics/dashboard');
  res.render('login', { error: null });
};

exports.getRegister = (req, res) => {
  if (req.session.user) return res.redirect('/topics/dashboard');
  res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
  const { username, password, confirm } = req.body;
  if (password !== confirm)
    return res.render('register', { error: 'Passwords do not match.' });
  try {
    const existing = await User.findOne({ username });
    if (existing)
      return res.render('register', { error: 'Username already taken.' });
    const user = new User({ username, password });
    await user.save();
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/topics/dashboard');
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.render('register', { error: err.message });
  }
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.render('login', { error: 'Invalid username or password.' });
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/topics/dashboard');
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.render('login', { error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};