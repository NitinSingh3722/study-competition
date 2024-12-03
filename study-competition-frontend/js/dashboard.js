document.addEventListener('DOMContentLoaded', function() {
    const userNameElement = document.getElementById('user-name');
    const profileBtn = document.getElementById('profile-btn');
    const reportBtn = document.getElementById('report-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileModal = document.getElementById('profile-modal');
    const reportModal = document.getElementById('report-modal');
    const closeButtons = document.querySelectorAll('.close');

    // Fetch user data when the page loads
    fetchUserData();

    // Event listeners for navbar buttons
    profileBtn.addEventListener('click', showProfileModal);
    reportBtn.addEventListener('click', showReportModal);
    logoutBtn.addEventListener('click', handleLogout);

    // Close button for modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            profileModal.style.display = 'none';
            reportModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == profileModal) {
            profileModal.style.display = 'none';
        }
        if (event.target == reportModal) {
            reportModal.style.display = 'none';
        }
    }

    function fetchUserData() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetch('/auth/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                userNameElement.textContent = ` ${data.name}`;
            } else {
                userNameElement.textContent = 'Welcome, User';
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            userNameElement.textContent = 'Welcome, User';
        });
    }

    function updateProfileModal(userData) {
        document.getElementById('profile-name').textContent = userData.name || 'Not specified';
        document.getElementById('profile-email').textContent = userData.email || 'Not specified';
        document.getElementById('profile-city').textContent = userData.city || 'Not specified';
        document.getElementById('profile-college').textContent = userData.college || 'Not specified';
    }

    function showProfileModal() {
        profileModal.style.display = 'block';
        fetchUserProfile();
    }

    function fetchUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        fetch('/auth/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            updateProfileModal(data);
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
    }

    function showReportModal() {
        reportModal.style.display = 'block';
        updateReport();
    }

    function updateReport() {
        const reportContent = document.getElementById('report-content');
        if (!reportContent) {
            console.error('Report content element not found');
            return;
        }

        fetch('/study/report', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            reportContent.innerHTML = `
                <p><strong>Total Study Time:</strong> ${data.totalStudyTime} minutes</p>
                <p><strong>Sessions Completed:</strong> ${data.sessionsCompleted}</p>
                <p><strong>Average Session Duration:</strong> ${data.averageSessionDuration} minutes</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching study report:', error);
            reportContent.textContent = 'Error loading report. Please try again.';
        });
    }

    function handleLogout() {
        // Clear any stored user data or tokens (if you're using them)
        localStorage.removeItem('userToken'); // Adjust this based on how you're storing user session
        
        // Redirect to the index page
        window.location.href = 'index.html';
    }

    const studyForm = document.getElementById('study-form');
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const workBtn = document.getElementById('work-btn');
    const breakBtn = document.getElementById('break-btn');

    let timer;
    let isRunning = false;
    let isWorkMode = true;
    let workDuration = 25 * 60; // Default 25 minutes
    let breakDuration = 5 * 60; // Default 5 minutes
    let timeRemaining = workDuration;

    studyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const duration = parseInt(document.getElementById('duration').value) * 60;
        const breakTime = parseInt(document.getElementById('break-time').value) * 60;
        
        workDuration = duration;
        breakDuration = breakTime;
        timeRemaining = workDuration;
        updateTimerDisplay();
        
        // Don't start the timer automatically
        // if (!isRunning) {
        //     startTimer();
        // }
    });

    startTimerBtn.addEventListener('click', function() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    workBtn.addEventListener('click', function() {
        if (!isWorkMode) {
            isWorkMode = true;
            timeRemaining = workDuration;
            updateTimerDisplay();
            updateModeButtons();
        }
    });

    breakBtn.addEventListener('click', function() {
        if (isWorkMode) {
            isWorkMode = false;
            timeRemaining = breakDuration;
            updateTimerDisplay();
            updateModeButtons();
        }
    });

    function startTimer() {
        isRunning = true;
        startTimerBtn.innerHTML = '<i class="fas fa-pause"></i>';
        timer = setInterval(updateTimer, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(timer);
    }

    function updateTimer() {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            if (isWorkMode) {
                completeStudySession();
                showBreakNotification();
            } else {
                switchMode();
            }
        }
    }

    function completeStudySession() {
        const topic = document.getElementById('topic').value;
        const duration = Math.floor(workDuration / 60); // Convert seconds to minutes

        fetch('/study/complete-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ topic, duration })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // Refresh the leaderboard after completing a session
            showLeaderboard();
            // Update the user's profile if needed
            fetchUserData();
        })
        .catch(error => {
            console.error('Error completing study session:', error);
        });
    }

    function showBreakNotification() {
        clearInterval(timer);
        isRunning = false;
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        if ("Notification" in window) {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification("Work Time Complete!", {
                        body: "Time to take a break. Click OK to start your break timer.",
                        icon: "/path/to/icon.png" // Add a path to an icon if you have one
                    });
                    
                    notification.onclick = function() {
                        switchMode();
                        startTimer();
                    };
                } else {
                    alert("Work Time Complete! Click OK to start your break timer.");
                    switchMode();
                }
            });
        } else {
            alert("Work Time Complete! Click OK to start your break timer.");
            switchMode();
        }
    }

    function switchMode() {
        isWorkMode = !isWorkMode;
        timeRemaining = isWorkMode ? workDuration : breakDuration;
        updateTimerDisplay();
        updateModeButtons();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateModeButtons() {
        workBtn.classList.toggle('active', isWorkMode);
        breakBtn.classList.toggle('active', !isWorkMode);
    }

    // Initialize timer display
    updateTimerDisplay();

    // ... rest of your existing dashboard.js code ...

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

    // Make sure this event listener is properly set
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    // Fetch initial leaderboard data
    fetch('/study/leaderboard')
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
        });

    showLeaderboard();
});
