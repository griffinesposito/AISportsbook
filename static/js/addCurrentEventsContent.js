function formatHumanReadableDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

function toggleContent(element, eventObject) {
    const hiddenContent = element.querySelector('.hidden-content');
    var imageSrcHomeTeam    = eventObject.hometeamdata.logos[0].href;
    var imageSrcAwayTeam    = eventObject.awayteamdata.logos[0].href;
    var dateStr             = formatHumanReadableDate(eventObject.date);
    var name                = eventObject.name;
    var homeTeamScore       = eventObject.hometeamscore.displayValue;
    var awayTeamScore       = eventObject.awayteamscore.displayValue;
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
        <h2>Game Link</h2>
        <a href="${gameLink}">${gameLinkTxt}</a>
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
    innerHTML = innerHTML + `
            <h2>Venue: ${venue}</h2>
            <img src="${venueImage}" alt="Image Venue" class="venue-image">
    `;


    /*        <h2>Predictions:</h2> */

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