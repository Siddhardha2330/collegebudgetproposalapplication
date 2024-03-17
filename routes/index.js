var express = require('express');
const session = require('express-session');
var router = express.Router();
var path=require("path");

router.get("/", (req, res) => {
   
   
    res.render("login",{message:'login here'});
  });
  
  
router.get('/index', (req, res) => {
    if (req.session.user) {
      res.render('index', { branchh: req.session.user.branch });
    } else {
      res.redirect('/login'); 
    }
  });
  
router.get('/budgetform', function(req, res) {

    res.render('index');
 });
 router.get('/dashboard', function(req, res) {
   
    res.render('dashboard',{email:req.session.email});
 });
 router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error("Error destroying session:", err);
        } else {
            res.render('login', { message: 'Logged out successfully' });
        }
    });
});

module.exports = router;
