function formatHumanReadableDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

function toggleContent(element, eventObject) {
    const hiddenContent = element.querySelector('.hidden-content');
    var homeTeamName    = eventObject.hometeamdata.displayName;
    var awayTeamName    = eventObject.awayteamdata.displayName;
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


    /*        <h2>Predictions:</h2> */
    if (typeof eventObject.predictor !== 'undefined') {
        innerHTML = innerHTML + `
            <h2>Predictions:</h2>
            <table>
                <tr colspan="4">Predictions</tr>
                <tr>
                    <th>Name</th>
                    <th>${awayTeamName}</th>
                    <th>${homeTeamName}</th>
                    <th>Description</th>
                </tr>
                <tr>
        `;
        for (let i = 0; i < eventObject.predictor.homeTeam.statistics.length; i++) {
            var statHome = eventObject.predictor.homeTeam.statistics[i]; // Access array elements
            var statAway = eventObject.predictor.awayTeam.statistics[i]; // Access array elements
            innerHTML = innerHTML + `
                    <td>${statHome.displayName}</td>
                    <td>${statAway.displayValue}</td>
                    <td>${statHome.displayValue}</td>
                    <td>${statHome.description}</td>
            `;
        }
        innerHTML = innerHTML + `
                </tr>
            </table>
        `;
    }


    /*        <h2>Game Leaders:</h2> */

    hiddenContent.innerHTML = innerHTML;
    hiddenContent.classList.toggle('show-content');
}

function addCurrentEventsContent(eventObject,container) {
    // Define image source variables
    var imageSrcHomeTeam    = eventObject.hometeamdata.logos[0].href;
    var imageSrcAwayTeam    = eventObject.awayteamdata.logos[0].href;
    var dateStr             = formatHumanReadableDate(eventObject.date);
    var name                = eventObject.name;
    var homeTeamScore       = eventObject.hometeamscore.displayValue;
    var awayTeamScore       = eventObject.awayteamscore.displayValue;
    // Define the table HTML using template literals and the image source variables
    var innerHTML = `
        <table>
            <tr>
                <th colspan="4">${dateStr}</th>
            </tr>
            <tr>
                <th colspan="4">${name}</th>
            </tr>
            <tr>
                <td><img src="${imageSrcAwayTeam}" alt="Image Away" class="game-image"></td>
                <td>${awayTeamScore}</td>
                <td>${homeTeamScore}</td>
                <td><img src="${imageSrcHomeTeam}" alt="Image Home" class="game-image"></td>
            </tr>
        </table>
        <div class="hidden-content" style="display: block;"></div>
            
    `;

    // Add the table HTML to the container
    container.innerHTML = innerHTML;
}