const express = require('express');
const app = express();
const port = 3000;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var shortid = require('shortid');

const adapter = new FileSync('db.json')
const db = low(adapter)

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

db.defaults({ todos: []})
  .write()

app.get('/todos', function(req, res) {
	res.render('todos/index', {
		todos: db.get('todos').value()
	});
});

var listTodo = db.get('todos').value();
app.get('/todos/search', function(req, res)  {
	var q = req.query.q;
	var matchedTodos = listTodo;
	if (q) {
		matchedTodos = listTodo.filter(function(todo) {
			return todo.content.toLowerCase().indexOf(q.toLowerCase()) !== -1;
		});
	}
	
	res.render('todos/index', {
		todos: matchedTodos,
		q: q
	});
});

app.get('/todos/create', function(req, res) {
	res.render('todos/create');
});

app.get('/todos/:id/delete', function(req, res) {
	var id = req.params.id;
	var todo = db.get('todos').find({ id: id}).value();
	
	db.get('todos').remove(todo).write();

	res.render('todos/delete', {
		todo: todo
	});
});

app.post('/todos/create', function(req, res) {
	req.body.id = shortid.generate();
	db.get('todos').push(req.body).write();
	res.redirect('/todos');
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
