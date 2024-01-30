import { fetchLeagueEvents } from './fetchLeagueEvents.js'; // Adjust the path as needed

export function openLiveData(league) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    liveDataBlock = document.getElementById(league + "-live");
    liveDataBlock.style.display = "block"; 
    const sport = liveDataBlock.dataset.sport;
    fetchLeagueEvents(sport,league.toLowerCase());
}

export function openPlayersData(league) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    liveDataBlock = document.getElementById(league + "-players");
    liveDataBlock.style.display = "block";  
}

export function openTeamsData(league) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    liveDataBlock = document.getElementById(league + "-teams");
    liveDataBlock.style.display = "block";  
}