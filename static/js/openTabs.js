import { fetchLeagueEvents } from './fetchLeagueEvents.js'; // Adjust the path as needed
import { addTeamCards, addSearchBar, showOutlineText, showText } from './main.js'; // Adjust the path as needed
function fetchTeams(league) {
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
        return data; // This is the team_dict
    })
    .catch(error => {
        // Handle any errors
        console.error('There has been a problem with your fetch operation:', error);
    });
}



export function openLiveData(league) {
    fetchLeagueEvents(league.toLowerCase());
}

export function openPlayersData(league) {
    addSearchBar(league) ;
}

export function openTeamsData(league) {
    // Example usage:
    showOutlineText();
    showText();
    // Call this function with the desired league as a string
    fetchTeams(league).then(teamDict => {
        // Do something with the teamDict here
        console.log(teamDict);
        addTeamCards(teamDict);
    });
}