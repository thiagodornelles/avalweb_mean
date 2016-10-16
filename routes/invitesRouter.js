var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var isLoggedIn = require('./baseMiddlewares');
var studentModel = require('../models/studentsModel');
var userModel = require('../models/usersModel');

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
            var password = Math.random().toString(36).slice(-8);
            var student = new studentModel();
            student.name = contacts[i].name;
            student.email = contacts[i].email;
            student.birthDate = new Date();
            student.save();
            var user = new userModel();
            user.userName = contacts[i].email;
            user.password = password;
            user.type = 2;
            user.save();

			var to = contacts[i].name + ' <' + contacts[i].email + '>';			
            smtpTransport.sendMail({  //email options
            from: "AvalWeb <avalwebmailer@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
            to: to, // receiver
            subject: "Convite para acesso ao AvalWeb", // subject
            text: "Olá, " + contacts[i].name + "!\n\n" + 
                  "Você recebeu um convite para acesso ao AvalWeb.\n\n" +
                  "Acesse o link ... e utilize os dados abaixo para acessar o sistema:\n\n" +
                  "Usuário: " + contacts[i].email + "\n" +
                  "Senha: " + password
            }, function(error, response){  //callback
                if(error){
                    console.log(error);

                }
                else{                    
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