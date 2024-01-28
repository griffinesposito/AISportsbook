document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('https://' + document.domain + ':' + location.port);
    console.log('Connected to server');
    socket.on('live_game_data', function(data) {
        console.log('Received live data:',data);
    });
}); 