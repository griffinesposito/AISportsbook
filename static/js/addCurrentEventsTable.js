function formatHumanReadableDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}



function addCurrentEventsTable(eventObject,container) {
    // Define image source variables
    var imageSrcHomeTeam = eventObject.hometeamdata.logos[0].href;
    var imageSrcAwayTeam = eventObject.awayteamdata.logos[0].href;
    var dateStr = formatHumanReadableDate(eventObject.date);
    var name    = eventObject.name;
    var homeTeamScore = eventObject.hometeamscore.displayValue;
    var awayTeamScore = eventObject.awayteamscore.displayValue;

    // Define the table HTML using template literals and the image source variables
    var tableHTML = `
        <table>
            <tr>
                <th colspan="4">${dateStr}</th>
            </tr>
            <tr>
                <th colspan="4">${name}</th>
            </tr>
            <tr>
                <td><img src="${imageSrcHomeTeam}" alt="Image Home" class="game-image"></td>
                <td>${homeTeamScore}</td>
                <td>${awayTeamScore}</td>
                <td><img src="${imageSrcAwayTeam}" alt="Image 2" class="game-image"></td>
            </tr>
        </table>
    `;

    // Add the table HTML to the container
    container.innerHTML = tableHTML;
}