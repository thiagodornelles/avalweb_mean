var path = require('path');

function isLoggedIn(req, res, next) {
	// console.log(req.session.passport.user.type);
    if (req.isAuthenticated()){
      	if (req.session.passport.user.type == 'professor'){
			res.sendFile(path.resolve('public/dashboard.html'));
		}
		else {
			console.log('aluno');
			res.sendFile(path.resolve('public/studentDashboard.html'));
		}
	}
	else {
		res.redirect('/');
	}	    
}

module.exports = isLoggedIn;
