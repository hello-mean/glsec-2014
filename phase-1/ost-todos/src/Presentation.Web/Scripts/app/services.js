angular.module("todos.services", ['ngResource']).
    factory("TodoList", ['$resource', function($resource) {
        return $resource('/api/todolists/:id', { id: '@Id' });
    }]).
    factory("ListTodo", ['$resource', function($resource) {
        return $resource('/api/todolists/:listId/todos');
    }]).
    factory("Todo", ['$resource', function($resource) {
        return $resource('/api/todos/:id', {id:'@Id'}, {
            update: {method:'PUT'}
        });
    }]).
    factory("Attachments", ['$http', function ($http) {
        var service = {
            currentTodoId: 0,
            values: [
                    'payroll.xls',
                    'contacts.xls',
                    'info.txt',
                    'contact.data'
            ],
            getAttachments: function (id) {
                return $http.get('http://api.foofactory.net/api/todo/' + id + '/files')
                    .then(function (response) {
                        return response.data;
                    });
            },
            deleteAttachment: function (todoId, filename) {
                return $http.delete('http://api.foofactory.net/api/todo/' + todoId + '/file/' + filename)
                    .then(function (response) {
                        console.log('Deleted "' + filename + '" from todo ' + todoId);
                        return response.data;
                    }, function () {
                        console.log('Failed to Delete "' + filename + '" from todo ' + todoId);
                    });
            },
            setCurrentTodo: function (todoId) {
                service.currentTodoId = todoId;
            }
        };

        return service;
    }]);