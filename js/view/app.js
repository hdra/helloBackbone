var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var _ = require('underscore');
var TodoView = require('./todos.js');
var ENTER_KEY = 13;
var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#todoapp',

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template( $('#stats-template').html() ),

    // New
    // Delegated events for creating new items, and clearing completed ones.
    events: {
      'keypress #new-todo': 'createOnEnter',
      'click #clear-completed': 'clearCompleted',
      'click #toggle-all': 'toggleAllComplete'
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed.
    initialize: function(todos, todoFilter) {
      this.allCheckbox = this.$('#toggle-all')[0];
      this.$input = this.$('#new-todo');
      this.$footer = this.$('#footer');
      this.$main = this.$('#main');
      this.todos = todos;
      this.todoFiter = todoFiter;

      this.listenTo(this.todos, 'add', this.addOne);
      this.listenTo(this.todos, 'reset', this.addAll);

      this.listenTo(this.todos, 'change:completed', this.filterOne);
      this.listenTo(this.todos,'filter', this.filterAll);
      this.listenTo(this.todos, 'all', this.render);

      this.todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var completed = this.todos.completed().length;
      var remaining = this.todos.remaining().length;

      if ( this.todos.length ) {
        this.$main.show();
        this.$footer.show();

        this.$footer.html(this.statsTemplate({
          completed: completed,
          remaining: remaining
        }));

        this.$('#filters li a')
          .removeClass('selected')
          .filter('[href="#/' + ( this.todoFilter || '' ) + '"]')
          .addClass('selected');
      } else {
        this.$main.hide();
        this.$footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function( todo ) {
      var view = new TodoView({ model: todo });
      $('#todo-list').append( view.render().el );
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      this.$('#todo-list').html('');
      this.todos.each(this.addOne, this);
    },

    // New
    filterOne : function (todo) {
      todo.trigger('visible');
    },

    // New
    filterAll : function () {
      this.todos.each(this.filterOne, this);
    },


    // New
    // Generate the attributes for a new Todo item.
    newAttributes: function() {
      return {
        title: this.$input.val().trim(),
        order: this.todos.nextOrder(),
        completed: false
      };
    },

    // New
    // If you hit return in the main input field, create new Todo model,
    // persisting it to localStorage.
    createOnEnter: function( event ) {
      if ( event.which !== ENTER_KEY || !this.$input.val().trim() ) {
        return;
      }

      this.todos.create( this.newAttributes() );
      this.$input.val('');
    },

    // New
    // Clear all completed todo items, destroying their models.
    clearCompleted: function() {
      _.invoke(this.todos.completed(), 'destroy');
      return false;
    },

    // New
    toggleAllComplete: function() {
      var completed = this.allCheckbox.checked;

      this.todos.each(function( todo ) {
        todo.save({
          'completed': completed
        });
      });
    }

});

module.exports = AppView;