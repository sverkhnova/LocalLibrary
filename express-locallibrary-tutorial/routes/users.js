var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send("Welcome to the Users page!");
});

router.get('/cool', function(req, res, next) {
  res.send('Youre so cool');
});

module.exports = router;
