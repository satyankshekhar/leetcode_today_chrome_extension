document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("fetchBtn");
    const loadingDiv = document.getElementById("loading");
    const statsContainer = document.getElementById("stats-container");
    const errorDiv = document.getElementById("error");
    const usernameInput = document.getElementById("username");
    const todayCountEl = document.getElementById("todayCount");
    const streakEl = document.getElementById("streak");
    const totalActiveDaysEl = document.getElementById("totalActiveDays");
    const activeYearsEl = document.getElementById("activeYears");
    const recentActivityEl = document.getElementById("recentActivity");

    btn.addEventListener("click", fetchStats);
    usernameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            fetchStats();
        }
    });

    async function fetchStats() {
        const username = usernameInput.value.trim();

        if (!username) {
            showError("Please enter a LeetCode username.");
            return;
        }

        setLoading(true);
        hideError();
        hideStats();

        const query = `
        query userProfileCalendar($username: String!) {
            matchedUser(username: $username) {
                userCalendar {
                    submissionCalendar
                }
            }
        }
    `;

        try {
            const response = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        username
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();
            const matchedUser = result && result.data && result.data.matchedUser;
            const calendarString = matchedUser && matchedUser.userCalendar && matchedUser.userCalendar.submissionCalendar;

            if (!calendarString) {
                throw new Error("User not found or no activity available.");
            }

            let calendar;
            try {
                calendar = JSON.parse(calendarString);
            } catch (parseError) {
                throw new Error("Invalid calendar data received from LeetCode.");
            }

            const todayTimestamp = getUTCDayTimestamp(new Date());

            const solvedToday = Number(calendar[todayTimestamp] || 0);
            const streak = calculateCurrentStreak(calendar, todayTimestamp);
            const totalActiveDays = countActiveDays(calendar);
            const activeYears = countActiveYears(calendar);
            const recentDays = buildRecentActivity(calendar, todayTimestamp, 42);

            todayCountEl.innerText = solvedToday;
            streakEl.innerText = streak;
            totalActiveDaysEl.innerText = totalActiveDays;
            activeYearsEl.innerText = activeYears;

            renderRecentActivity(recentActivityEl, recentDays);
            showStats();
        } catch (error) {
            console.error(error);
            showError(error.message || "Unable to fetch LeetCode stats.");
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        loadingDiv.classList.toggle("hidden", !isLoading);
        btn.disabled = isLoading;
        usernameInput.disabled = isLoading;
    }

    function showStats() {
        statsContainer.classList.remove("hidden");
    }

    function hideStats() {
        statsContainer.classList.add("hidden");
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }

    function hideError() {
        errorDiv.textContent = "";
        errorDiv.classList.add("hidden");
    }

    function renderRecentActivity(container, days) {
        container.innerHTML = "";

        days.forEach((day) => {
            const cell = document.createElement("div");
            cell.className = "activity-day";

            if (day.count > 0) {
                cell.dataset.count = String(Math.min(day.count, 20));
                cell.classList.add("active");
                cell.textContent = day.count > 9 ? "9+" : String(day.count);
                cell.title = `${day.date.toLocaleDateString()}: ${day.count} submission(s)`;
            } else {
                cell.textContent = "";
                cell.title = `${day.date.toLocaleDateString()}: no submissions`;
            }

            container.appendChild(cell);
        });
    }
});
function getUTCDayTimestamp(date) {
    return Math.floor(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ) / 1000);
}

function calculateCurrentStreak(calendar, startTimestamp) {
    let streak = 0;

    for (let ts = startTimestamp; ; ts -= 86400) {
        if (Number(calendar[ts] || 0) > 0) {
            streak += 1;
            continue;
        }
        break;
    }

    return streak;
}

function countActiveDays(calendar) {
    return Object.values(calendar).reduce((total, count) => total + (Number(count) > 0 ? 1 : 0), 0);
}

function countActiveYears(calendar) {
    const years = new Set();

    for (const timestamp of Object.keys(calendar)) {
        if (Number(calendar[timestamp]) > 0) {
            years.add(new Date(Number(timestamp) * 1000).getUTCFullYear());
        }
    }

    return years.size;
}

function buildRecentActivity(calendar, todayTimestamp, daysCount) {
    const days = [];

    for (let i = daysCount - 1; i >= 0; i--) {
        const timestamp = todayTimestamp - (i * 86400);
        const count = Number(calendar[timestamp] || 0);
        days.push({
            timestamp,
            count,
            date: new Date(timestamp * 1000)
        });
    }

    return days;
}