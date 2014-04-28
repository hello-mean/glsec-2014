angular.module("todos.controllers", ["todos.services", "angularFileUpload" ]).
    controller("LoginCtrl", ["$scope", "$http", "$location", function ($scope, $http, $location) {

        $scope.login = function () {
            $http.post("/user/login", { Email: $scope.Email, Password: $scope.Password }).success(function () {
                $location.path('/lists');
            });
        };

    }]).
    controller("RegisterCtrl", ["$scope", "$http", "$location", function ($scope, $http, $location) {

        $scope.register = function () {
            $http.post('/user/register', { Email: $scope.Email, Name: $scope.Name, Password: $scope.Password }).success(function () {
                $location.path('/lists');
            });
        };

    }]).
    controller("ListsCtrl", ["$scope", "TodoList", "Attachments", function ($scope, TodoList, Attachments) {

        var self = this;

        $scope.$on('list:deleted', function () {
            self.setLists();
        });

        this.setLists = function () {
            TodoList.query(function (lists) {
                var items = [], buffer = [];
                lists.forEach(function (l, i) {
                    l.Todos.forEach(function (t, j) {
                        Attachments.getAttachments(t.Id).then(function (data) {
                            t.Attachments = data;
                        });
                    });

                    buffer.push(l);
                    if ((i + 1) % 2 == 0 && i != 0 || i == lists.length - 1) {
                        items.push({ row: buffer });
                        buffer = [];
                    }
                });
                $scope.lists = items;
            });
        };

        this.setLists();

        $scope.addList = function () {
            var todo = new TodoList({ Name: $scope.Name });
            todo.$save(function () {
                $scope.$broadcast('list:added');
                self.setLists();
            });
        };

    }]).
    controller("ListCtrl", ["$scope", "ListTodo", "Todo", function ($scope, ListTodo, Todo) {

        $scope.$on('todo:deleted', function () {
            ListTodo.query({ listId: $scope.list.Id }, function (todos) {
                $scope.list.Todos = todos;
            });
        });

        $scope.$on('todo:attached', function (e, args) {
            angular.forEach($scope.list.Todos, function (todo) {
                if (todo.Id === args.id && args.success) {
                    $scope.$apply(function () {
                        todo.Attachments.push(args.filename);
                    });                    
                }
            });
        });

        $scope.addTodo = function (title) {
            var todo = new ListTodo({ Title: title });
            todo.$save({ listId: $scope.list.Id }, function () {
                todo.Attachments = [];
                $scope.list.Todos.push(todo);
                $scope.showAddForm = 0;
                $scope.Title = "";
            });
        };

        $scope.completed = function () {
            var count = 0;
            angular.forEach($scope.list.Todos, function (todo) {
                count += todo.Completed ? 1 : 0;
            });
            return count;
        };
    }]).
    controller("TodoCtrl", ["$scope", "Todo", function ($scope, Todo) {

        $scope.showAttachments = false;

        $scope.toggleAttachments = function () {
            $scope.showAttachments = !$scope.showAttachments;
        };

        $scope.deleteTodo = function (todo) {
            todo.deleting = true;
            Todo['delete']({ id: todo.Id }, {}, function () {
                $scope.$emit('todo:deleted');
            }, function () {
                todo.deleting = false;
            });
        };

        $scope.markDone = function (todo) {
            if (todo.deleting) return;
            todo.Completed = true;
            if (!todo.hasOwnProperty('$update'))
                todo = new Todo(todo);
            todo.$update();
        };

        $scope.markNotDone = function (todo) {
            if (todo.deleting) return;
            todo.Completed = false;
            if (!todo.hasOwnProperty('$update'))
                todo = new Todo(todo);
            todo.$update();
        };

    }]).
    controller('AttachmentCtrl', ['$scope', 'Attachments', function ($scope, Attachments) {
        $scope.deleteAttachment = function (todo, attachmentIdx) {
            var removedAttachments = todo.Attachments.splice(attachmentIdx, 1);
            if (removedAttachments.length === 1) {
                Attachments.deleteAttachment(todo.Id, removedAttachments[0]);
            }
        };
    }]).
    controller('UploadCtrl', ['$scope', '$rootScope', '$fileUploader', 'Attachments', function ($scope, $rootScope, $fileUploader, Attachments) {
        

        // create a uploader with options
        var uploader = $fileUploader.create({
            scope: $scope,     // to automatically update the html. Default: $rootScope
            url: 'donttazemebro.php',
            removeAfterUpload: true
        });

        uploader.bind('complete', function (event, xhr, item) {
            var todoId = Attachments.currentTodoId;

            console.log('Upload completed with status: ' + xhr.status + ' for file: ' + item.file.name + ' for todo: ' + todoId);
            $rootScope.$broadcast('todo:attached', {
                success: xhr.status === 200,
                id: todoId,
                filename: item.file.name
            });
        });

        $scope.upload = function () {
            var todoId = Attachments.currentTodoId;

            var item = uploader.queue[0];
            item.url = 'http://api.foofactory.net/api/todo/' + todoId + '/files';
            var name = item.file.name;

            console.log('uploading: ' + name + ' for ' + todoId);
            uploader.uploadAll();           
        };
    }]).
    controller('AdminCtrl', ['$scope', 'Admin', function ($scope, Admin) {
        $scope.logs = Admin.logs;
        $scope.requests = Admin.requests;
        $scope.stats = Admin.stats;
    }]);