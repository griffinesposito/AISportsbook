export function formatHumanReadableDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

export function toggleContent(element, eventObject, eventId) {
    const hiddenContent = element.querySelector('.hidden-content');
    var imageSrcHomeTeam    = eventObject.hometeamdata.logos[0].href;
    var imageSrcAwayTeam    = eventObject.awayteamdata.logos[0].href;
    var gameLink            = eventObject.link.href;
    var gameLinkTxt         = eventObject.link.text;
    if (typeof eventObject.weather !== 'undefined') {
        var weatherDisplay      = eventObject.weather.displayValue;
        var weatherSpeed        = eventObject.weather.windSpeed;
        var weatherDirection    = eventObject.weather.windDirection;
        var weatherTemp         = eventObject.weather.temperature;
        var weatherGust         = eventObject.weather.gust;
        var weatherPrec         = eventObject.weather.precipitation;
    }
    var venue               = eventObject.venue.fullName;
    var venueImage          = eventObject.venue.image;
    /*--------------  Link and Venue: ---------------*/
    innerHTML = `
        <div class="flex-container">
            <div class="flex-item">
            <h2>Game Link</h2>
            <a href="${gameLink}">${gameLinkTxt}</a>
            </div>
            <div class="flex-item">
            <h2>Venue: ${venue}</h2>
            <img src="${venueImage}" alt="Image Venue" class="venue-image">
            </div>
        </div>
    `;

    /*--------------  Weather: ---------------*/
    if (typeof eventObject.weather !== 'undefined') {
        innerHTML = innerHTML + `
            <h2>Weather Forecast</h2>
            <table>
                <tr>
                    <th>Description</th>
                    <th>Wind Speed</th>
                    <th>Wind Direction</th>
                    <th>Temperature</th>
                    <th>Gust</th>
                    <th>Precipitation</th>
                </tr>
                <tr>
                    <td>${weatherDisplay}</td>
                    <td>${weatherSpeed}</td>
                    <td>${weatherDirection}</td>
                    <td>${weatherTemp}</td>
                    <td>${weatherGust}</td>
                    <td>${weatherPrec}</td>
                </tr>
            </table>
            `;
    }


    /*--------------  Predictions: ---------------*/
    if (typeof eventObject.predictor !== 'undefined') {
        if ((typeof eventObject.predictor.awayTeam !== 'undefined') && (typeof eventObject.predictor.homeTeam !== 'undefined')
            && (typeof eventObject.predictor.awayTeam.statistics !== 'undefined') && (typeof eventObject.predictor.homeTeam.statistics !== 'undefined')
            && (eventObject.predictor.awayTeam.statistics.length === eventObject.predictor.homeTeam.statistics.length))
        {
            innerHTML = innerHTML + `
                <h2>Predictions:</h2>
                <table>
                    <tr>
                        <th colspan="4">Predictions</th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th><img src="${imageSrcAwayTeam}" alt="Image Away" class="game-image"></th>
                        <th><img src="${imageSrcHomeTeam}" alt="Image Away" class="game-image"></th>
                        <th>Description</th>
                    </tr>
            `;
            for (let i = 0; i < eventObject.predictor.awayTeam.statistics.length; i++) {
                var statAway = eventObject.predictor.awayTeam.statistics[i]; // Access array elements
                var statHome = eventObject.predictor.homeTeam.statistics[i]; // Access array elements
                if (statAway.description.length === 0)
                {var description = statAway.displayName;}
                else
                {var description = statAway.description;}
                innerHTML = innerHTML + `
                    <tr>
                        <td>${statAway.abbreviation}</td>
                        <td>${statAway.displayValue}</td>
                        <td>${statHome.displayValue}</td>
                        <td>${description}</td>
                    </tr>
                `;
            }
            innerHTML = innerHTML + `
                </table>
            `;
        }else if ((typeof eventObject.predictor.awayTeam !== 'undefined')
        && (typeof eventObject.predictor.awayTeam.statistics !== 'undefined')){
            innerHTML = innerHTML + `
                <h2>Predictions:</h2>
                <table>
                    <tr>
                        <th colspan="3">Predictions</th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th><img src="${imageSrcAwayTeam}" alt="Image Away" class="game-image"></th>
                        <th>Description</th>
                    </tr>
            `;
            for (let i = 0; i < eventObject.predictor.awayTeam.statistics.length; i++) {
                var statAway = eventObject.predictor.awayTeam.statistics[i]; // Access array elements
                if (statAway.description.length === 0)
                {var description = statAway.displayName;}
                else
                {var description = statAway.description;}
                innerHTML = innerHTML + `
                    <tr>
                        <td>${statAway.abbreviation}</td>
                        <td>${statAway.displayValue}</td>
                        <td>${description}</td>
                    </tr>
                `;
            }
            innerHTML = innerHTML + `
                </table>
            `;

        }
    }

    /*--------------  Game Leaders: ---------------*/

    hiddenContent.innerHTML = innerHTML;
    hiddenContent.classList.toggle('show-content');
}

export function addCurrentEventsContent(eventObject,eventId,container) {
    // Define image source variables
    var imageSrcHomeTeam    = eventObject.hometeamdata;
    var imageSrcAwayTeam    = eventObject.awayteamdata;
    var dateStr             = formatHumanReadableDate(eventObject.date);
    var name                = eventObject.name;
    var homeTeamScore       = eventObject.hometeamscore.displayValue;
    var awayTeamScore       = eventObject.awayteamscore.displayValue;
    var gameStatus          = eventObject.status.type.description;
    var gamePeriod          = eventObject.status.period;
    var gameClock           = eventObject.status.displayClock;
    var classStr            = 'th';
    if (eventObject.status.type.id === '2')
    {
        classStr = 'th-game-status';
    }
    // Define the table HTML using template literals and the image source variables
    var innerHTML = `
        <table>
            <tr>
                <th colspan="4">${dateStr}</th>
            </tr>
            <tr>
                <th id="${eventId}-status" class="${classStr}" colspan="4">${gameStatus} -- Period: ${gamePeriod} -- Clock: ${gameClock}</th>
            </tr>
            <tr>
                <th colspan="4">${name}</th>
            </tr>
            <tr>
                <td><img src="${imageSrcAwayTeam}" alt="Image Away" class="game-image"></td>
                <td id="${eventId}-awayTeamScore">${awayTeamScore}</td>
                <td id="${eventId}-homeTeamScore">${homeTeamScore}</td>
                <td><img src="${imageSrcHomeTeam}" alt="Image Home" class="game-image"></td>
            </tr>
        </table>
        <div class="hidden-content" style="display: block;"></div>
            
    `;

    // Add the table HTML to the container
    container.innerHTML = innerHTML;
}

export function addRecentPlayContent(eventObject,eventId,container) {
    // Define image source variables
    var lastPlayText        = eventObject.details.items[0].text;
    var lastPlayType        = eventObject.details.items[0].type.text;
    var gamePeriod          = eventObject.details.items[0].period.displayValue;
    var gameClock           = eventObject.details.items[0].clock.displayValue;
    var awayTeamScore       = eventObject.awayteamscore.displayValue;
    var gameStatus          = eventObject.status.type.description;
    var classStr            = 'th';
    // Define the table HTML using template literals and the image source variables
    var innerHTML = `
        <table>
            <tr>
                <th id="${eventId}-play-status" class="${classStr}" colspan="4">${gameStatus} -- Period: ${gamePeriod} -- Clock: ${gameClock}</th>
            </tr>
            <tr>
                <td colspan="1" id="${eventId}-detailPlayType">${lastPlayType}</td>
                <td colspan="3" id="${eventId}-detailPlayText">${lastPlayText}</td>
            </tr>
        </table>
        <div class="hidden-content" style="display: block;"></div>
            
    `;

    // Add the table HTML to the container
    container.innerHTML = innerHTML;
}