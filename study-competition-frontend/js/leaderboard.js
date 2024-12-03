document.addEventListener('DOMContentLoaded', function() {
    function updateLeaderboard(data) {
        const leaderboardList = document.getElementById('leaderboard');
        leaderboardList.innerHTML = '';

        // Add header row
        const headerRow = document.createElement('div');
        headerRow.className = 'leaderboard-item leaderboard-header';
        headerRow.innerHTML = `
            <span class="rank">Rank</span>
            <span class="name">Name</span>
            <span class="time">Time</span>
        `;
        leaderboardList.appendChild(headerRow);

        // Add user rows
        data.forEach((user, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'leaderboard-item';
            listItem.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="name">${user.name}</span>
                <span class="time">${formatTime(user.studyTime)}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    }

    function showLeaderboard() {
        const leaderboardType = document.getElementById('leaderboardType').value;
        const filterValue = document.getElementById('filterValue').value;

        fetch(`/study/leaderboard?type=${leaderboardType}&value=${filterValue}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
            alert('Failed to fetch leaderboard. Please try again.');
        });
    }

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    // Add event listener for the leaderboard button
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);

    // Show leaderboard on page load
    showLeaderboard();
});