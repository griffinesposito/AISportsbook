function checkAndMoveGamecard(eventId,statusId){

    let desiredEventType;
    // Assuming eventValue is the value you're looking for in 'data-event'
    if (statusId === '1'){
        desiredEventType = "upcoming"; // The event type you want to match
    }
    else if (statusId === '3'){
        desiredEventType = "recent"; // The event type you want to match
    }
    else {
        desiredEventType = "live"; // The event type you want to match
    }

    // Find the div with the matching 'data-event' value
    var matchingDiv = document.querySelector(`div[data-event='${eventId}']`);

    if (matchingDiv) {
        // Access the current parent element
        var currentParent = matchingDiv.parentElement;

        // Get the 'data-event-type' attribute from the current parent
        var currentEventType = currentParent.getAttribute('data-event-type');

        if (currentEventType !== desiredEventType) {
            // Find the target parent div where you want to move matchingDiv
            var targetParentDiv = document.querySelector(`div[data-event-type='${desiredEventType}']`);

            if (targetParentDiv) {
                // Move matchingDiv to the new parent
                targetParentDiv.appendChild(matchingDiv);
                console.log(`Div moved to new parent with data-event-type: ${desiredEventType}`);
            } else {
                console.log(`No parent div found with data-event-type: ${desiredEventType}`);
            }
        } else {
            console.log(`Current parent's data-event-type matches the desired type: ${desiredEventType}`);
        }
    } else {
        console.log(`No div found with data-event value: ${eventId}`);
    }
}


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
        const eventObject = data.data;
        // Attempt to find the element with the specified ID
        var homeTeamScore       = eventObject.hometeamscore.displayValue;
        var awayTeamScore       = eventObject.awayteamscore.displayValue;
        var gameStatus          = eventObject.status.type.description;
        var gamePeriod          = eventObject.status.period;
        var gameClock           = eventObject.status.displayClock;
        var eventId             = data.game_id;
        var statusId            = eventObject.status.type.id;
        checkAndMoveGamecard(eventId,statusId);


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