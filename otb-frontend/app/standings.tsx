<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTB Tournament</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <style>
        body {
            background-color: #f8f9fa;
            color: #333;
        }
        .table thead {
            background-color: #007bff;
            color: white;
        }
        .btn-primary {
            background-color: #007bff;
            border: none;
        }
        .btn-primary:hover {
            background-color: #0056b3;
        }
        .card {
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h2 class="text-center mb-4">OTB Tournament - Live Standings</h2>
        <div class="card p-3 mb-4">
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody id="standings">
                    <tr><td>Loading...</td><td></td></tr>
                </tbody>
            </table>
        </div>
        <button class="btn btn-primary" onclick="updateStandings()">Refresh Standings</button>
    </div>

    <script>
        function updateStandings() {
            fetch('/api/get-standings')  // Replace with actual API endpoint
                .then(response => response.json())
                .then(data => {
                    let tableBody = document.getElementById('standings');
                    tableBody.innerHTML = '';
                    data.forEach(player => {
                        let row = `<tr><td>${player.name}</td><td>${player.score}</td></tr>`;
                        tableBody.innerHTML += row;
                    });
                })
                .catch(error => console.error('Error fetching standings:', error));
        }

        // Auto-refresh every 10 seconds
        setInterval(updateStandings, 10000);
    </script>
</body>
</html>

