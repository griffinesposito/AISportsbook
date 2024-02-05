import { wrappedFetchLeagueEvents, wrappedFetchTeams } from './fetchLeagueEvents.js'; // Adjust the path as needed
import { addTeamCards, addSearchBar, showOutlineText, showText } from './main.js'; // Adjust the path as needed




export function openLiveData(league) {
    wrappedFetchLeagueEvents(league.toLowerCase());
}

export function openPlayersData(league) {
    addSearchBar(league);
}

export function openTeamsData(league) {
    // Call this function with the desired league as a string
    wrappedFetchTeams(league);
}