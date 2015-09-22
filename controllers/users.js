/**
 * Created by Igor Gudymenko on 9/14/2015.
 */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var base64url = require('base64url');
var jwt = require("jsonwebtoken");
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');

function randomStringAsBase64Url(size) {
  return crypto.randomBytes(size).toString('base64');
}

/* GET /login */
exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login'
  });
};

/* POST /login */
exports.postLogin = function(req, res, next) {
  req.assert('email', 'wrong email').isEmail();
  req.assert('password', 'password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', {msg: info.message});
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/* GET /logout */
exports.getLogout = function(req, res) {
  req.logout();
  req.flash('success', {msg: 'logout success'});
  res.redirect('/');
};

/* GET /singup */
exports.getSignUp = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Sing up'
  });
};

/* POST /singup */
exports.postSingUp = function(req, res) {
  req.assert('username', 'username is required').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'password must be a least 4 characters').len(4);
  req.assert('confirmPassword', 'password not identical').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    //debugger;
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  });

  User.findOne({email: req.body.email}, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', {msg: 'account already exists'});
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        req.flash('success', {msg: 'registration complete'});
        res.redirect('/');
      });
    });
  });
};


/* post ng-singnup */
exports.postNgSignup = function(req, res, next) {
  debugger;
};


/* post ng-signin */
exports.postNgSignin = function(req, res, next) {
  //debugger;
  User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: false,
          data: "User already exists!"
        });
      } else {
        var userModel = new User();
        userModel.email = req.body.email;
        userModel.password = req.body.password;
        userModel.save(function(err, user) {
          user.token = jwt.sign(user, 'Your Session Secret goes here');
          user.save(function(err, user1) {
            res.json({
              type: true,
              data: user1,
              token: user1.token
            });
          });
        })
      }
    }
  });
};

exports.getRestricted = function(req, res, next) {
  console.log('restricted req: ', req.headers);
  User.findOne({token: req.token}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({
        type: true,
        data: user
      });
    }
  });
};

exports.getApiRestricted = function(req, res, next) {
  console.log('restricted api req: ', req.headers);
  User.findOne({token: req.token}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({
        type: true,
        data: user
      });
    }
  });
};

