document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('https://' + document.domain + ':' + location.port);

    socket.on('live_game_data', function(data) {
        console.log('Received live data:', data);
        /*desiredDataPointCount = 25;
        // Assuming data is a single numerical value
        // Update chart here. You might need to adjust depending on your data structure
        liveChart.data.labels.push('New Data Point'); // Adjust this label as needed
        liveChart.data.datasets[0].data.push(data.data);

        // Assuming 'myChart' is your Chart.js instance
        var data = liveChart.data.datasets[0].data;
        if (data.length > desiredDataPointCount) {
            data.shift(); // This removes the first (oldest) element
            liveChart.data.labels.shift(); //from the data array
        }
        liveChart.update('none');*/
    });
}); 