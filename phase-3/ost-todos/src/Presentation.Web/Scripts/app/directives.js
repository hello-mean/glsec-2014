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
                'source': '=',
                'metric': '@',
                'color': '@'
            },
            template: '<div></div>',
            link: function (scope, element, attrs) {
                var tv = 5000;

                element[0].innerHTML = '';

                var graph = new Rickshaw.Graph({
                    element: element[0],
                    width: attrs.width,
                    height: attrs.height,
                    renderer: 'line',
                    interpolation: 'linear',
                    series: new Rickshaw.Series.FixedDuration([{ name: scope.metric, color: scope.color }], undefined, {
                        timeInterval: tv,
                        maxDataPoints: 20,
                        timeBase: new Date().getTime() / 1000,
                    })
                });
                var hoverDetail = new Rickshaw.Graph.HoverDetail({
                    graph: graph
                });
                graph.render();

                scope.$watchCollection('source', function (data) {
                    if (!graph != null) {
                        var latest = data[data.length - 1];

                        var graphingData = {};
                        graphingData[scope.metric] = latest[scope.metric];

                        graph.series.addData(graphingData);
                        graph.update();
                    }                   
                });
            }
        };
    }).
    directive('rickshawstats', function () {
        return {
            restrict: 'E',
            scope: {
                'source': '=',
                'metric': '@',
                'title': '@'
            },
            template: '<div>Total {{title}}: {{value}}</div>',
            link: function (scope, element, attrs) {
                scope.value = 0;

                scope.$watchCollection('source', function (data) {
                    var latest = data[data.length - 1];

                    scope.value = latest[scope.metric].toLocaleString();
                });
            }
        };
    }).
    directive('scrollItem', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                if (scope.$last) {
                    scope.$emit('finished');
                }
            }
        }
    }).
    directive('scrollIf', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                scope.$on('finished', function () {
                    element.scrollTop(element.scrollHeight);
                });
            }
        }
    })
;