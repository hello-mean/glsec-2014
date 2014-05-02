//
// Imports
//

// controllers
var homeController = require('./controllers/home');
var todoController = require('./controllers/todo');
var todoListController = require('./controllers/todoList');
var adminController = require('./controllers/admin');

// misc
var logger = require('./logger').prefix('HTTP Routes');

/**
 * Sets up routes for the app
 *
 * @param app Express application
 * @param {function(err)} callback Callback
 */
function setup(app, callback) {
    logger.info('Setting up routes');

    //
    // API
    //

    // Home routes
    app.get('/', homeController.get);

    // Todo file routes
    app.get('/api/todo/:id/files', todoController.getFiles);
    app.get('/api/todo/:id/file/:name', todoController.getFile);
    app.del('/api/todo/:id/file/:name', todoController.deleteFile);
    app.post('/api/todo/:id/files', todoController.postFile);
    app.put('/api/todo/:id', todoController.updateTodo);
    app.delete('/api/todo/:id', todoController.deleteTodo);

    // TodoList Routes
    app.post('/api/todolist/:id/todos', todoListController.addTodo);
    app.get('/api/todolist/:id/todos', todoListController.getTodos);
    app.get('/api/todolists/:id', todoListController.getTodoList);
    app.delete('/api/todolist/:id', todoListController.deleteTodoList);
    app.get('/api/todolists', todoListController.getTodoLists);
    app.post('/api/todolist', todoListController.addTodoList);

	  // Admin routes
	  app.post('/api/admin/instances/increase', adminController.postInstanceIncrease);
	  app.post('/api/admin/instances/decrease', adminController.postInstanceDecrease);

    callback && callback();
}

//
// Exports
//
exports.setup = setup;
