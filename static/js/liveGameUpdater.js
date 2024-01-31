document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('https://' + document.domain + ':' + location.port);
    console.log('Connected to server');
    socket.on('live_game_data', function(data) {
        console.log('Received live data:',data);
        var eventId = data.game_id;
        const eventObject = data.data;
        // Attempt to find the element with the specified ID
        var homeTeamScore       = eventObject.hometeamscore.displayValue;
        var awayTeamScore       = eventObject.awayteamscore.displayValue;
        var gameStatus          = eventObject.status.type.description;
        var gamePeriod          = eventObject.status.period;
        var gameClock           = eventObject.status.displayClock;


        var statusElement = document.getElementById(eventId + "-status");
        var homeScoreElement = document.getElementById(eventId + "-homeTeamScore");
        var awayScoreElement = document.getElementById(eventId + "-awayTeamScore");
        // Check if the element exists
        if (statusElement) {
            statusElement.innerHTML = `${gameStatus} -- Period: ${gamePeriod} -- Clock: ${gameClock}`;
        } 
        if (homeScoreElement) {
            homeScoreElement.innerHTML = `${homeTeamScore}`;
        }
        if (awayScoreElement) {
            awayScoreElement.innerHTML = `${awayTeamScore}`;
        }
    });
}); 