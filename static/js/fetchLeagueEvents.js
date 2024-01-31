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
            // Handle the data here
            // Get the container element
            /*const liveContainer = document.getElementById("live-" + league.toUpperCase() + "-events");
            const upcomingContainer = document.getElementById("upcoming-" + league.toUpperCase() + "-events");
            const recentContainer = document.getElementById("recent-" + league.toUpperCase() + "-events");

            // Clear the container
            liveContainer.innerHTML = `<h2>${league.toUpperCase()} Live Events</h2>`;
            upcomingContainer.innerHTML = `<h2>${league.toUpperCase()} Upcoming Events</h2>`;
            recentContainer.innerHTML = `<h2>${league.toUpperCase()} Recent Events</h2>`;
            let dateArray = [];
            // Loop through the elements and add new divs
            for (const key in data.events) {
                if (data.events.hasOwnProperty(key)) {
                    const item = data.events[key];
                    const newDiv = document.createElement('div');
                    newDiv.setAttribute('data-date', item.date);
                    newDiv.setAttribute('data-event', key);
                    dateArray.push(item.date);
                    newDiv.className = 'interactive-div'; // Set the class
                    // Set the onclick event handler using an arrow function
                    newDiv.onclick = () => {
                        toggleContent(newDiv, item, key);
                    };
                    addCurrentEventsContent(item,key,newDiv);
                    if (item.status.type.id === '1') // scheduled, upcoming
                    {
                        upcomingContainer.appendChild(newDiv); // Append the new div to the container
                    }
                    else if (item.status.type.id === '2') // current, live
                    {
                        liveContainer.appendChild(newDiv); // Append the new div to the container

                    }
                    else if (item.status.type.id === '3') //final, over
                    {
                        recentContainer.appendChild(newDiv); // Append the new div to the container
                    }
                    else
                    {
                        console.log("WARNING: game status undetermined: ", item.status.type.id)
                    }
                }
            }
            dateArray.sort((a, b) => new Date(b) - new Date(a));
            // Sort the divs based on the sorted date strings
            dateArray.forEach(date => {
                // Find the div that has the matching data-date attribute
                let livedivs = Array.from(liveContainer.children).filter(div => div.getAttribute('data-date') === date);
                livedivs.forEach(div => {
                    // Append the div to the container
                    liveContainer.appendChild(div);
                });
                let upcomingdivs = Array.from(upcomingContainer.children).filter(div => div.getAttribute('data-date') === date);
                upcomingdivs.forEach(div => {
                    // Append the div to the container
                    upcomingContainer.appendChild(div);
                });
                let recentdivs = Array.from(recentContainer.children).filter(div => div.getAttribute('data-date') === date);
                recentdivs.forEach(div => {
                    // Append the div to the container
                    recentContainer.appendChild(div);
                });
            });*/
        })
        .catch(error => console.error('Error:', error));
}