import { addCSSElements, addDetailedEventData, addPlayerCards, addTeamCards, removeCSSElements, showOutlineText, showText, addSearchBar } from './main.js'; // Adjust the path as needed
import { getCallFuture, getCallHistory, recordCall, recordFuture } from './userHistory.js'

function fetchLeagueEvents(league) {
    removeCSSElements();
    showOutlineText();
    showText();
    // Construct the URL with query parameters
    const url = `/sports/leagueevents?league=${encodeURIComponent(league)}`;

    // Fetch data from the server
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            addCSSElements(data.data,data.sport,data.league);
        })
        .catch(error => console.error('Error:', error));
}
// Wrapper function
export function wrappedFetchLeagueEvents(...args) {
    recordCall('wrappedFetchLeagueEvents', args);
    return fetchLeagueEvents(...args);
}

function fetchSearchResults(query, league) {
    removeCSSElements();
    showOutlineText();
    showText();
    // Encode the parameters to ensure they are safely included in the URL
    const params = new URLSearchParams({ query, league });

    // Construct the full URL with query parameters
    const url = `/search?${params.toString()}`;

    // Use the fetch API to send the GET request
    fetch(url)
        .then(response => {
            if (!response.ok) {
                addSearchBar(league);
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response body
        })
        .then(data => {
            console.log('Search results:', data);
            addPlayerCards(data,league);
            // Handle the data (e.g., update the UI)
        })
        .catch(error => {
            addSearchBar(league);
            console.error('There was a problem with the fetch operation:', error);
            // Handle the error (e.g., show an error message)
        });
}
// Wrapper function
export function wrappedFetchSearchResults(...args) {
    recordCall('wrappedFetchSearchResults', args);
    return fetchSearchResults(...args);
}


function fetchTeams(league) {
    removeCSSElements();
    showOutlineText();
    showText();
    // Construct the URL with the query parameter for the league
    const url = new URL('/get_all_teams', window.location.origin);
    url.searchParams.append('league', league);
  
    // Return the fetch promise
    return fetch(url)
    .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        // Parse the JSON in the response
        return response.json();
    })
    .then(data => {
        // Here you have your data which is the team_dict from Flask
        console.log(data);
        addTeamCards(data);
    })
    .catch(error => {
        // Handle any errors
        console.error('There has been a problem with your fetch operation:', error);
    });
}
// Wrapper function
export function wrappedFetchTeams(...args) {
    recordCall('wrappedFetchTeams', args);
    return fetchTeams(...args);
}

function fetchDetailedEventData(sport, league, eventId) {
    removeCSSElements();
    showOutlineText();
    showText();
    // Construct the URL with query parameters
    const url = `/sports/detailedevent?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}&eventId=${encodeURIComponent(eventId)}`;

    // Fetch data from the server
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            addDetailedEventData(data,sport,league, eventId);
        })
        .catch(error => console.error('Error:', error));
}
// Wrapper function
export function wrappedFetchDetailedEventData(...args) {
    recordCall('wrappedFetchDetailedEventData', args);
    return fetchDetailedEventData(...args);
}