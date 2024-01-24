function openLiveData(league) {
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

function openPlayersData(league) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    liveDataBlock = document.getElementById(league + "-players");
    liveDataBlock.style.display = "block";  
}

function openTeamsData(league) {
    var i;
    var x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    liveDataBlock = document.getElementById(league + "-teams");
    liveDataBlock.style.display = "block";  
}