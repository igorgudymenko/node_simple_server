/**
 * Created by Igor Gudymenko on 9/14/2015.
 */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');

/* GET /secrets */
exports.getSecret = function(req, res) {
  if (!req.user) {
    req.flash('errors', {msg: 'you not have access to this page!!'});
    return res.redirect('/');
  }
  res.render('secrets', {
    title: 'Secrets',
    user: req.user
  });

};

/* POST /secrets */
exports.postSecret = function(req, res) {

};