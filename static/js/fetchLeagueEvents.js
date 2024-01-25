let eventData = null;

function fetchLeagueEvents(sport, league) {
    // Calculate dates for one week ago and one week in the future
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight
    const oneWeekAgo = new Date(today.getTime() - oneWeek);
    const oneWeekFuture = new Date(today.getTime() + oneWeek);
  
    // Format dates as 'YYYYMMDD'
    function formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }
  
    const dates = `${formatDate(oneWeekAgo)}-${formatDate(oneWeekFuture)}`;
    console.log(dates);
    // Construct the URL with query parameters
    const url = `/sports/leagueevents?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}&dates=${dates}`;

    // Fetch data from the server
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            // Handle the data here
            // Get the container element
            const container = document.getElementById("current-" + league.toUpperCase() + "-events");

            // Clear the container
            container.innerHTML = '';

            // Loop through the elements and add new divs
            for (const key in data.events) {
                if (data.events.hasOwnProperty(key)) {
                    const item = data.events[key];
                    const newDiv = document.createElement('div');
                    newDiv.className = 'interactive-div'; // Set the class
                    // Set the onclick event handler using an arrow function
                    newDiv.onclick = () => {
                        toggleContent(newDiv, item);
                    };
                    addCurrentEventsContent(item,newDiv);
                    container.appendChild(newDiv); // Append the new div to the container
                }
            }
        })
        .catch(error => console.error('Error:', error));
}