import { addCSSElements, addPlayerCards, removeCSSElements,showOutlineText,showText,addSearchBar } from './main.js'; // Adjust the path as needed

export function fetchLeagueEvents(league) {
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
            addCSSElements(data);
        })
        .catch(error => console.error('Error:', error));
}

export function fetchSearchResults(query, league) {
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
                addSearchBar();
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
            addSearchBar();
            console.error('There was a problem with the fetch operation:', error);
            // Handle the error (e.g., show an error message)
        });
}
