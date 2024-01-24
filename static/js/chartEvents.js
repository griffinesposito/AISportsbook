document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('https://' + document.domain + ':' + location.port);
    var ctx = document.getElementById('liveChart').getContext('2d');
    var liveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time or other labels for x-axis
            datasets: [{
                label: 'Live Data',
                data: [], // Your data array
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    socket.on('live_data', function(data) {
        //console.log('Received live data:', data);
        desiredDataPointCount = 25;
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
        liveChart.update('none');
    });
});