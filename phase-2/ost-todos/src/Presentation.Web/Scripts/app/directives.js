angular.module('todos.directives', []).
    directive('deleteList', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs, ctrl) {
                elem.on('click', function() {
                    if (confirm('Are you sure?')) {
                        scope.list.$delete(function() {
                            scope.$emit('list:deleted');
                        });
                    }
                });
            }
        };
    }).
    directive('showAddList', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var modal = angular.element('#addListModal');
                modal.on('shown', function() {
                    $(this).find('input').focus();
                });
                elem.on('click', function(e) {
                    modal.modal('show');
                });
                elem.scope().$on('list:added', function() {
                    modal.modal('hide');
                    modal.find('input').val('');
                });
            }
        };
    }).
    directive('showAttachFile', ['$parse', 'Attachments', function ($parse, Attachments) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var modal = angular.element('#attachModal');

                elem.on('click', function (e) {
                    var value = $parse(attrs.todoid)(scope);
                    Attachments.setCurrentTodo(value);
                    modal.modal('show');
                });

                elem.scope().$on('todo:attached', function () {
                    modal.modal('hide');
                });
            }
        };
    }]).
    directive('giveFocus', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                scope.$watch('list.Todos.length', function(newVal, oldVal) {
                    if (newVal > oldVal)
                        elem.focus();
                });
                elem.focus();
            }
        };
    }).
    directive('brandLink', function() {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                scope.$watch('isLoggedIn()', function(newVal, oldVal) {
                    if (newVal) {
                        elem.attr('href', '/#lists');
                    } else {
                        elem.attr('href', '/#login');
                    } 
                });
            }
        };
    }).
    directive('rickshaw', function () {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            template: '<div></div>',
            link: function (scope, element, attrs) {
                scope.$watch('data', function (newVal, oldVal) {
                    if (!newVal) {
                        return;
                    }
                    var tv = 200;
                    element[0].innerHTML = '';
                    var graph = new Rickshaw.Graph({
                        element: element[0],
                        width: attrs.width,
                        height: attrs.height,
                        renderer: 'line',
                        series: new Rickshaw.Series.FixedDuration([{ name: 'one' }], undefined, {
                            timeInterval: tv,
                            maxDataPoints: 100,
                            timeBase: new Date().getTime() / 1000
                        })
                    });
                    var hoverDetail = new Rickshaw.Graph.HoverDetail({
                        graph: graph
                    });
                    graph.render();

                    var i = 0;
                    var iv = setInterval(function () {

                        var data = { one: Math.floor(Math.random() * 40) + 120 };

                        var randInt = Math.floor(Math.random() * 100);
                        data.two = (Math.sin(i++ / 40) + 4) * (randInt + 400);
                        data.three = randInt + 300;

                        graph.series.addData(data);
                        graph.render();

                    }, tv);
                });
            }
        };
    })
;