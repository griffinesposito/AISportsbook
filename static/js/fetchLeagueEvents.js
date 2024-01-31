let eventData = null;
import { addCSSElements } from './main.js'; // Adjust the path as needed

export function fetchLeagueEvents(sport, league) {
    // Calculate dates for one week ago and one week in the future
    var interval = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    if (sport === 'football')
    {
        interval = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    }
    else
    {
        interval = 3 * 24 * 60 * 60 * 1000; // One week in milliseconds
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight
    const intervalAgo = new Date(today.getTime() - interval);
    const intervalFuture = new Date(today.getTime() + interval);
  
    // Format dates as 'YYYYMMDD'
    function formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }
  
    const dates = `${formatDate(intervalAgo)}-${formatDate(intervalFuture)}`;
    console.log(dates);
    // Construct the URL with query parameters
    const url = `/sports/leagueevents?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}&dates=${dates}`;

    // Fetch data from the server
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            addCSSElements(data);
        })
        .catch(error => console.error('Error:', error));
}