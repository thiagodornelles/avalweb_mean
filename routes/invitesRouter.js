var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var isLoggedIn = require('./baseMiddlewares');


router.get('/', isLoggedIn, function(req, res, next){
	return next();
});

router.post('/', function(req, res, next) {
	var contacts = req.body.contacts; 	
	if (contacts){		
        var smtpTransport = nodemailer.createTransport("SMTP",
        {
            service: "Gmail",  // sets automatically host, port and connection security settings
            auth: {
                user: "avalwebmailer@gmail.com",
                pass: req.body.password
            }
        });
        for (i = 0; i < contacts.length; i++){
			var to = contacts[i].name + ' <' + contacts[i].email + '>';
			console.log(to);
            smtpTransport.sendMail({  //email options
            from: "AvalWeb <avalwebmailer@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
            to: to, // receiver
            subject: "Convite para acesso ao AvalWeb", // subject
            text: "Olá você recebeu um convite para acesso ao AvalWeb.\nClique no link abaixo para prosseguir com o seu cadastro." // body
            }, function(error, response){  //callback
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
            
            });
        }
        smtpTransport.close();
		res.send('emails sent');
	}
	else{
		res.send('emails error');
	}	
});
module.exports = router;