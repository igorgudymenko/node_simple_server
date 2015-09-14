/**
 * Created by Igor Gudymenko on 9/14/2015.
 */

/* GET home page. */
exports.getIndex = function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Express', user: req.user });
};