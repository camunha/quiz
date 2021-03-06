var models = require('../models/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
		where: {id: Number(quizId)},
		include: [{model: models.Comment}]
		}).then(
		function(quiz){
			if (quiz){
				req.quiz = quiz;
				next();
			}
			else {
				next(new Error('No existe quizId=' + quizId));
			}
		}
	).catch(function(error){ next(error); });
};

// GET /quizes
exports.index = function(req, res){
	if (req.query.search){
		var filtro = req.query.search;
		filtro = "%" + filtro.replace(" ", "%") + "%";
		models.Quiz.findAll({where: ["lower(pregunta) like ?", filtro.toLowerCase()],order:'pregunta ASC'}).then(function(quizes){
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}).catch(function(error){ next(error); });
	}
	else{
		models.Quiz.findAll().then(function(quizes){
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}).catch(function(error){ next(error); });
	}
};

// GET /quizes/question
exports.show = function(req, res){
	//res.render('quizes/question', {pregunta: 'Capital de Italia'});
	models.Quiz.find(req.params.quizId).then(function(quiz){
		res.render('quizes/show', {quiz: req.quiz, errors: []});
	})
};

// GET /quizes/answer
exports.answer = function(req, res){
	//if (req.query.respuesta === 'Roma'){
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if (req.query.respuesta === req.quiz.respuesta){
			res.render('quizes/answer', {quiz: req.quiz, respuesta: 'Correcto', errors: []});
		}
		else{
			res.render('quizes/answer', {quiz: req.quiz, respuesta: 'Incorrecto', errors: []});
		}
	})
};

// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build( //crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tipo: "Tipo"}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

exports.create = function(req, res){
	var quiz = models.Quiz.build(req.body.quiz);

	// guarda en DB los campos pregunta y respuesta de quiz
	quiz
	.validate()
	.then(
		function(err){
			if (err){
				res.render("quizes/new", {quiz: quiz, errors: err.errors});
			}
			else{
				quiz
				.save({fields: ["pregunta", "respuesta", "tipo"]})
				.then(function(){res.redirect("/quizes")}) // redireccion HTTP (URL relativo) lista de preguntas
			}
		}
	);
};

// GET /quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; //autoload de instancia de quiz

	res.render("quizes/edit", {quiz: quiz, errors: []});
};

exports.update = function(req, res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tipo = req.body.quiz.tipo;

	req.quiz
	.validate()
	.then(
		function(err){
			if (err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			}
			else{
				req.quiz
				.save({fields: ["pregunta", "respuesta", "tipo"]})
				.then(function(){res.redirect("/quizes");});
			}
		}
	);
};

exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect("/quizes");
	}).catch(function(error){next(error)});
};