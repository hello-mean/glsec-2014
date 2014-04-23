var socket = io.connect('http://localhost:3001');

socket.on('log', function (data) {
    console.log(data);
});

socket.on('stats', function (data) {
    console.log(data);
});

socket.on('api', function (data) {
    console.log(data);
});