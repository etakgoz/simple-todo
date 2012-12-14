(function(w, undefined){
    var MVC = w.MVC,
        App = w.App || {},
        document = w.document,
        createMessageInitial = "Go Ahead! Click Here to create your first todo item!",
        createMessageDefault = "What needs to be done? Click Here to Note Down.";
    
    /**
     * Creates a new User item, stores permanently, and returns the User Model
     * The User has the following attributes with the following valid values: 
     * todos Array An array holding the guids of the todo models user owns
     * createMessage string Message to display to the user while creating a todo item, changes depending on the number of todos. We need this because our template engine lacks if-conditions 
     *
     * settings Object Setting Object
     * todoController Controller Application Controller
     * doNotSave boolean Optional Flag to avoid saving
     * 
     * returns User Model 
     */
    App.createUserModel = function (settings, todoController, doNotSave) {
        var user = new MVC.Model({
            guid: settings.guid, 
            attributes: settings.attributes
        }, todoController);
               
        
        // A small hack because our extremely simple template engine does not support if-conditions yet!        
        if (user.get("todos").length === 0) {
            user.set("createMessage", createMessageInitial);
        } else {
            user.set("createMessage", createMessageDefault);
        }
        
        // Subscribe to the new-todo event, and update attribute todos accordingly.
        todoController.subscribe("new-todo", function(todo) {
            user.get("todos").push(todo.guid);
            user.set("createMessage", createMessageDefault);
            user.save();
        });
        
         // Subscribe to the delete-todo event, and update attribute todos accordingly.   
        todoController.subscribe("delete-todo", function(todo) {
            var todos = user.get("todos");
            for (var i = 0, len = todos.length; i < len; i += 1) {
                if (todos[i] === todo.guid) {
                    todos.splice(i, 1);
                    break;
                }
            }
            
            if (todos.length === 0) {
                user.set("createMessage", createMessageInitial);                
            } else {
                user.set("createMessage", createMessageDefault);               
            }
            
            if (doNotSave === undefined || doNotSave !== false) {
                user.save();               
            }

        });
  
        // Subscribe to the dragged-todo event, and update attribute todos accordingly. 
        // This event only fires when drag and drop completes sucessfully.  
        todoController.subscribe("dragged-todo", function(data){
           
            var todos = user.get("todos"),
                droppedPos = -1,
                draggedPos = -1;
            
            // Find the position of the Todo item that is dragged and the Todo item that is dropped on
            for (var i = 0, len = todos.length; i < len; i += 1) {
                if (todos[i] == data.droppedGuid) {
                    droppedPos = i;
                } else if (todos[i] == data.draggedGuid) {
                    draggedPos = i;
                }  
            }
            
            // Adjust the array accordingly, so when we reload the todos from MVC.Store the array has the correct order
            droppedPos -= 1;          
            if (droppedPos > -1 && draggedPos > -1) {
                todos.splice(draggedPos, 1);
                if (droppedPos > draggedPos) {
                    todos.splice(droppedPos, 0, data.draggedGuid);                   
                } else {
                    todos.splice(droppedPos + 1, 0, data.draggedGuid);                    
                }
            }
            
            // Case: moving to the front of the list
            if (droppedPos == -1 && draggedPos > -1) {
                todos.splice(draggedPos, 1);
                todos.unshift(data.draggedGuid);                 
            }
            
            user.save();
          
        });
        
        user.getTodos = function(filter) { 
            var todos = user.get("todos"),
                filteredTodos = [],
                todo = null,
                toPush = true;
            
            for (var i = 0, len = todos.length; i < len; i += 1) {
                todo = MVC.objectCache.get(todos[i]);
                
                toPush = true;
                for (var prop in filter) {
                    if (filter.hasOwnProperty(prop)) {
                        if (todo.get(prop) !== filter[prop]) {
                            toPush = false;
                        }
                    }
                }  
                
                if (toPush) {
                    filteredTodos.push(todo.guid);                   
                }

            }
            
            return filteredTodos;
            
        };
        
        return user;
          
    };
    
    App.getUserFromDataStore = function (guid, todoController) {
        var userData = MVC.Store.get(guid);   
        if (userData === null) {
            userData = {};
            userData.guid = "user";
            userData.attributes = {todos: []};
        }        
        
        return App.createUserModel(userData, todoController);
    };
        
    w.App = App;
})(window);


