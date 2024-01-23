function fetchLeagueEvents(sport, league) {
    // Calculate dates for one week ago and one week in the future
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const today = new Date();
    const oneWeekAgo = new Date(today - oneWeek);
    const oneWeekFuture = new Date(today + oneWeek);

    // Format dates as 'YYYYMMDD'
    function formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    const dates = `${formatDate(oneWeekAgo)}-${formatDate(oneWeekFuture)}`;

    // Construct the URL with query parameters
    const url = `/sports/leagueevents?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}&dates=${dates}`;

    // Fetch data from the server
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            // Handle the data here
        })
        .catch(error => console.error('Error:', error));
}