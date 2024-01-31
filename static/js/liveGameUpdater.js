function applyFlashEffect(element) {
    if (element) {
        element.classList.add('flash-effect');
    
        // Optional: Remove the class after the animation ends
        element.addEventListener('animationend', () => {
            element.classList.remove('flash-effect');
        }, { once: true });
    }
}


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
            const previousStatus = statusElement.innerHTML;
            statusElement.innerHTML = `${gameStatus} -- Period: ${gamePeriod} -- Clock: ${gameClock}`;
            if (previousStatus !== statusElement.innerHTML)
            {
                applyFlashEffect(statusElement);
            }
        } 
        if (homeScoreElement) {
            const previousHomeScore = homeScoreElement.innerHTML;
            homeScoreElement.innerHTML = `${homeTeamScore}`;
            if (previousHomeScore !== homeScoreElement.innerHTML)
            {
                applyFlashEffect(homeScoreElement);
            }
        }
        if (awayScoreElement) {
            const previousAwayScore = awayScoreElement.innerHTML;
            awayScoreElement.innerHTML = `${awayTeamScore}`;
            if (previousAwayScore !== awayScoreElement.innerHTML)
            {
                applyFlashEffect(awayScoreElement);
            }
        }
    });
}); 