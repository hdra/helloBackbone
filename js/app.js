var AppView = require('./view/app.js');
var ToDoList = require('./collection/todos.js');

global.appView = new AppView(new ToDoList());