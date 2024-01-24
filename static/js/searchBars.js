document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    const league = searchBox.dataset.league;
    const category = searchBox.dataset.cat;
    const resultsBox = document.getElementById('searchResults-' + league + '-' + category);

    let timeoutId;
    searchBox.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const searchText = searchBox.value;
            if (searchText.trim()) {
                // Make an HTTP request to your server's endpoint
                fetch('/search?query=' + encodeURIComponent(searchText))
                    .then(response => response.json())
                    .then(data => {
                        // Display the results
                        resultsBox.innerHTML = '';
                        //console.log('Received Search Results:', data);
                        data.forEach(item => {
                            const div = document.createElement('div');
                            div.classList.add('result-item');
                            div.textContent = item[3]; // Assuming 'displayName' is the field you want to show
                            div.onclick = function() {
                                searchBox.value = div.textContent;
                                resultsBox.style.display = 'none';
                            };
                            resultsBox.appendChild(div);
                        });
                        resultsBox.style.display = 'block';
                    })
                    .catch(error => console.error('Error:', error));
            } else {
                resultsBox.style.display = 'none';
            }
        }, 500); // Debounce time of 500 milliseconds
    });

    // Hide the result box when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target !== searchBox) {
            resultsBox.style.display = 'none';
        }
    });
});