/* ============================================================
   DISCIPLINE TRACKER
   ============================================================ */

const STORAGE_KEY = "discipline_tracker_v1";

let state = {
    habits: [
        {
            id: crypto.randomUUID(),
            name: "Workout",
            icon: "🏋",
            category: "Fitness",
            daily: true
        },
        {
            id: crypto.randomUUID(),
            name: "Coding",
            icon: "💻",
            category: "Growth",
            daily: true
        },
        {
            id: crypto.randomUUID(),
            name: "Study",
            icon: "📚",
            category: "College",
            daily: true
        },
        {
            id: crypto.randomUUID(),
            name: "Reading",
            icon: "📖",
            category: "Mind",
            daily: true
        }
    ],

    completions: {},

    tasks: [],

    schedule: [],

    settings: {
        scheduleDate: getToday()
    }
};


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    setupNavigation();
    setupForms();
    setupFilters();
    setupScheduleNavigation();
    setupMobileMenu();
    setupDataButtons();

    renderEverything();

});


/* ============================================================
   DATE FUNCTIONS
   ============================================================ */

function getToday() {

    const date = new Date();

    return formatDate(date);

}


function formatDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function parseDate(dateString) {

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);

}


function dateLabel(dateString) {

    return parseDate(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

}


function fullDateLabel(dateString) {

    return parseDate(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

}


/* ============================================================
   STORAGE
   ============================================================ */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

        const parsed = JSON.parse(saved);

        state = {
            ...state,
            ...parsed
        };

    } catch (error) {

        console.error("Could not load data:", error);

    }

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const sectionId = button.dataset.section;

            document.querySelectorAll(".nav-item")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            document.querySelectorAll(".section")
                .forEach(section => section.classList.remove("active"));

            document.getElementById(sectionId)
                .classList.add("active");

            if (sectionId === "statistics") {
                renderStatistics();
            }

            if (window.innerWidth <= 750) {
                document.querySelector(".sidebar")
                    .classList.remove("mobile-open");
            }

        });

    });

}


function setupMobileMenu() {

    document.getElementById("mobileMenu")
        .addEventListener("click", () => {

            document.querySelector(".sidebar")
                .classList.toggle("mobile-open");

        });

}


/* ============================================================
   RENDER EVERYTHING
   ============================================================ */

function renderEverything() {

    updateTodayDate();

    renderDashboardHabits();
    renderHabitManagement();

    renderDashboardTasks();
    renderTaskManagement();

    renderDashboardSchedule();
    renderScheduleManagement();

    renderHeatmap();

    updateScore();

    updateStreaks();

    renderStatistics();

    updateScheduleHeader();

}


/* ============================================================
   TODAY
   ============================================================ */

function updateTodayDate() {

    const today = new Date();

    document.getElementById("todayDate")
        .textContent = today
        .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        })
        .toUpperCase();

}


/* ============================================================
   HABITS
   ============================================================ */

function isHabitCompleted(habitId, date = getToday()) {

    return !!(
        state.completions[date] &&
        state.completions[date].habits &&
        state.completions[date].habits[habitId]
    );

}


function toggleHabit(habitId, date = getToday()) {

    if (!state.completions[date]) {

        state.completions[date] = {
            habits: {},
            tasks: {}
        };

    }

    if (!state.completions[date].habits) {
        state.completions[date].habits = {};
    }

    const current =
        !!state.completions[date].habits[habitId];

    state.completions[date].habits[habitId] = !current;

    saveData();

    renderEverything();

    showToast(
        !current
            ? "Habit completed ✓"
            : "Habit unchecked"
    );

}


function renderDashboardHabits() {

    const container =
        document.getElementById("dashboardHabits");

    if (state.habits.length === 0) {

        container.innerHTML = `
            <div class="card">
                <p class="muted">No habits yet. Create your first one.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = state.habits.map(habit => {

        const completed =
            isHabitCompleted(habit.id);

        return `
            <div class="habit-item ${completed ? "completed" : ""}">

                <div class="habit-icon">
                    ${habit.icon}
                </div>

                <div class="habit-info">

                    <div class="habit-name">
                        ${escapeHtml(habit.name)}
                    </div>

                    <div class="habit-category">
                        ${escapeHtml(habit.category || "Personal")}
                    </div>

                </div>

                <button
                    class="habit-check"
                    onclick="toggleHabit('${habit.id}')"
                    title="Complete habit"
                >
                    ✓
                </button>

            </div>
        `;

    }).join("");

}


function renderHabitManagement() {

    const container =
        document.getElementById("habitManagement");

    if (state.habits.length === 0) {

        container.innerHTML = `
            <div class="card">
                <p class="muted">No habits created yet.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = state.habits.map(habit => {

        return `
            <div class="management-item">

                <div class="habit-icon">
                    ${habit.icon}
                </div>

                <div class="management-content">

                    <h4>
                        ${escapeHtml(habit.name)}
                    </h4>

                    <p>
                        ${escapeHtml(habit.category || "Personal")}
                        · ${habit.daily ? "Every day" : "Custom"}
                    </p>

                </div>

                <div class="management-actions">

                    <button
                        class="outline-btn"
                        onclick="editHabit('${habit.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="outline-btn delete"
                        onclick="deleteHabit('${habit.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


function openHabitModal(habit = null) {

    const modal =
        document.getElementById("habitModal");

    document.getElementById("habitId").value =
        habit ? habit.id : "";

    document.getElementById("habitName").value =
        habit ? habit.name : "";

    document.getElementById("habitIcon").value =
        habit ? habit.icon : "◉";

    document.getElementById("habitCategory").value =
        habit ? habit.category : "";

    document.getElementById("habitDaily").checked =
        habit ? habit.daily : true;

    modal.classList.add("open");

    setTimeout(() => {
        document.getElementById("habitName").focus();
    }, 100);

}


function editHabit(id) {

    const habit =
        state.habits.find(h => h.id === id);

    if (habit) {
        openHabitModal(habit);
    }

}


function deleteHabit(id) {

    const habit =
        state.habits.find(h => h.id === id);

    if (!habit) return;

    if (!confirm(`Delete "${habit.name}"?`)) {
        return;
    }

    state.habits =
        state.habits.filter(h => h.id !== id);

    saveData();

    renderEverything();

    showToast("Habit deleted");

}


function setupForms() {

    document.getElementById("habitForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const id =
                document.getElementById("habitId").value;

            const name =
                document.getElementById("habitName").value.trim();

            const icon =
                document.getElementById("habitIcon").value;

            const category =
                document.getElementById("habitCategory").value.trim();

            const daily =
                document.getElementById("habitDaily").checked;

            if (!name) return;

            if (id) {

                const habit =
                    state.habits.find(h => h.id === id);

                if (habit) {

                    habit.name = name;
                    habit.icon = icon;
                    habit.category = category;
                    habit.daily = daily;

                }

            } else {

                state.habits.push({
                    id: crypto.randomUUID(),
                    name,
                    icon,
                    category,
                    daily
                });

            }

            saveData();

            closeModal("habitModal");

            renderEverything();

            showToast("Habit saved");

        });


    document.getElementById("taskForm")
        .addEventListener("submit", saveTask);


    document.getElementById("scheduleForm")
        .addEventListener("submit", saveSchedule);

}


/* ============================================================
   TASKS
   ============================================================ */

let currentTaskFilter = "all";


function isTaskCompleted(taskId, date = getToday()) {

    return !!(
        state.completions[date] &&
        state.completions[date].tasks &&
        state.completions[date].tasks[taskId]
    );

}


function toggleTask(taskId, date = getToday()) {

    if (!state.completions[date]) {

        state.completions[date] = {
            habits: {},
            tasks: {}
        };

    }

    if (!state.completions[date].tasks) {
        state.completions[date].tasks = {};
    }

    const current =
        !!state.completions[date].tasks[taskId];

    state.completions[date].tasks[taskId] =
        !current;

    saveData();

    renderEverything();

    showToast(
        !current
            ? "Task completed ✓"
            : "Task unchecked"
    );

}


function renderDashboardTasks() {

    const container =
        document.getElementById("dashboardTasks");

    const tasks = state.tasks.filter(
        task => task.date === getToday()
    );

    if (tasks.length === 0) {

        container.innerHTML = `
            <p class="muted" style="padding-top:15px">
                No tasks for today.
            </p>
        `;

        return;
    }

    container.innerHTML =
        tasks.map(task => taskHTML(task)).join("");

}


function taskHTML(task) {

    const completed =
        isTaskCompleted(task.id, task.date);

    return `
        <div class="task-row ${completed ? "completed" : ""}">

            <button
                class="task-check"
                onclick="toggleTask('${task.id}', '${task.date}')"
            >
                ✓
            </button>

            <div class="task-content">

                <div class="task-title">
                    ${escapeHtml(task.name)}
                </div>

                <div class="task-category">
                    ${escapeHtml(task.category || "General")}
                </div>

            </div>

            <div class="priority ${task.priority}"></div>

        </div>
    `;

}


function renderTaskManagement() {

    const container =
        document.getElementById("taskManagement");

    let tasks = [...state.tasks];

    if (currentTaskFilter === "active") {

        tasks = tasks.filter(
            task => !isTaskCompleted(task.id, task.date)
        );

    }

    if (currentTaskFilter === "completed") {

        tasks = tasks.filter(
            task => isTaskCompleted(task.id, task.date)
        );

    }

    tasks.sort((a, b) => {

        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }

        return a.name.localeCompare(b.name);

    });

    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="card">
                <p class="muted">No tasks found.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="management-list">
            ${tasks.map(task => {

                const completed =
                    isTaskCompleted(task.id, task.date);

                return `
                    <div class="management-item">

                        <button
                            class="task-check ${completed ? "completed" : ""}"
                            onclick="toggleTask('${task.id}', '${task.date}')"
                        >
                            ${completed ? "✓" : ""}
                        </button>

                        <div class="management-content">

                            <h4>
                                ${escapeHtml(task.name)}
                            </h4>

                            <p>
                                ${escapeHtml(task.category || "General")}
                                · ${dateLabel(task.date)}
                            </p>

                        </div>

                        <div class="management-actions">

                            <button
                                class="outline-btn"
                                onclick="editTask('${task.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="outline-btn delete"
                                onclick="deleteTask('${task.id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            }).join("")}
        </div>
    `;

}


function openTaskModal(task = null) {

    document.getElementById("taskId").value =
        task ? task.id : "";

    document.getElementById("taskName").value =
        task ? task.name : "";

    document.getElementById("taskCategory").value =
        task ? task.category : "";

    document.getElementById("taskPriority").value =
        task ? task.priority : "medium";

    document.getElementById("taskModal")
        .classList.add("open");

}


function saveTask(event) {

    event.preventDefault();

    const id =
        document.getElementById("taskId").value;

    const name =
        document.getElementById("taskName").value.trim();

    const category =
        document.getElementById("taskCategory").value.trim();

    const priority =
        document.getElementById("taskPriority").value;

    if (!name) return;

    if (id) {

        const task =
            state.tasks.find(t => t.id === id);

        if (task) {

            task.name = name;
            task.category = category;
            task.priority = priority;

        }

    } else {

        state.tasks.push({

            id: crypto.randomUUID(),

            name,
            category,
            priority,

            date: getToday()

        });

    }

    saveData();

    closeModal("taskModal");

    renderEverything();

    showToast("Task saved");

}


function editTask(id) {

    const task =
        state.tasks.find(t => t.id === id);

    if (task) {
        openTaskModal(task);
    }

}


function deleteTask(id) {

    if (!confirm("Delete this task?")) {
        return;
    }

    state.tasks =
        state.tasks.filter(task => task.id !== id);

    saveData();

    renderEverything();

    showToast("Task deleted");

}


function setupFilters() {

    document.querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                document.querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                currentTaskFilter =
                    button.dataset.filter;

                renderTaskManagement();

            });

        });

}


/* ============================================================
   SCHEDULE
   ============================================================ */

function renderDashboardSchedule() {

    const container =
        document.getElementById("dashboardSchedule");

    const today =
        getToday();

    let events =
        state.schedule.filter(
            item => item.date === today
        );

    events.sort((a, b) =>
        a.start.localeCompare(b.start)
    );

    if (events.length === 0) {

        container.innerHTML = `
            <p class="muted" style="padding-top:15px">
                No events scheduled.
            </p>
        `;

        return;
    }

    container.innerHTML =
        events.map(scheduleHTML).join("");

}


function scheduleHTML(item) {

    return `
        <div class="schedule-row">

            <div class="schedule-time">
                ${item.start}
                <br>
                ${item.end}
            </div>

            <div class="schedule-line"></div>

            <div class="schedule-info">

                <div class="schedule-title">
                    ${escapeHtml(item.title)}
                </div>

                <div class="schedule-category">
                    ${escapeHtml(item.category || "General")}
                </div>

            </div>

        </div>
    `;

}


function renderScheduleManagement() {

    const container =
        document.getElementById("scheduleManagement");

    const date =
        state.settings.scheduleDate;

    let events =
        state.schedule.filter(
            item => item.date === date
        );

    events.sort((a, b) =>
        a.start.localeCompare(b.start)
    );

    if (events.length === 0) {

        container.innerHTML = `
            <div class="card">
                <p class="muted">
                    Nothing scheduled for this day.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = events.map(item => {

        return `
            <div class="management-item">

                <div class="schedule-time">
                    ${item.start}<br>${item.end}
                </div>

                <div class="schedule-line"></div>

                <div class="management-content">

                    <h4>
                        ${escapeHtml(item.title)}
                    </h4>

                    <p>
                        ${escapeHtml(item.category || "General")}
                    </p>

                </div>

                <div class="management-actions">

                    <button
                        class="outline-btn"
                        onclick="editSchedule('${item.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="outline-btn delete"
                        onclick="deleteSchedule('${item.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


function openScheduleModal(item = null) {

    document.getElementById("scheduleId").value =
        item ? item.id : "";

    document.getElementById("scheduleTitle").value =
        item ? item.title : "";

    document.getElementById("scheduleStart").value =
        item ? item.start : "09:00";

    document.getElementById("scheduleEnd").value =
        item ? item.end : "10:00";

    document.getElementById("scheduleCategory").value =
        item ? item.category : "";

    document.getElementById("scheduleModal")
        .classList.add("open");

}


function saveSchedule(event) {

    event.preventDefault();

    const id =
        document.getElementById("scheduleId").value;

    const title =
        document.getElementById("scheduleTitle").value.trim();

    const start =
        document.getElementById("scheduleStart").value;

    const end =
        document.getElementById("scheduleEnd").value;

    const category =
        document.getElementById("scheduleCategory").value.trim();

    if (!title || !start || !end) return;

    const date =
        state.settings.scheduleDate;

    if (id) {

        const item =
            state.schedule.find(s => s.id === id);

        if (item) {

            item.title = title;
            item.start = start;
            item.end = end;
            item.category = category;

        }

    } else {

        state.schedule.push({

            id: crypto.randomUUID(),

            title,
            start,
            end,
            category,

            date

        });

    }

    saveData();

    closeModal("scheduleModal");

    renderEverything();

    showToast("Schedule saved");

}


function editSchedule(id) {

    const item =
        state.schedule.find(s => s.id === id);

    if (item) {
        openScheduleModal(item);
    }

}


function deleteSchedule(id) {

    if (!confirm("Delete this event?")) {
        return;
    }

    state.schedule =
        state.schedule.filter(
            item => item.id !== id
        );

    saveData();

    renderEverything();

    showToast("Event deleted");

}


function setupScheduleNavigation() {

    document.getElementById("previousDay")
        .addEventListener("click", () => {

            const date =
                parseDate(state.settings.scheduleDate);

            date.setDate(date.getDate() - 1);

            state.settings.scheduleDate =
                formatDate(date);

            updateScheduleHeader();

            renderScheduleManagement();

        });


    document.getElementById("nextDay")
        .addEventListener("click", () => {

            const date =
                parseDate(state.settings.scheduleDate);

            date.setDate(date.getDate() + 1);

            state.settings.scheduleDate =
                formatDate(date);

            updateScheduleHeader();

            renderScheduleManagement();

        });

}


function updateScheduleHeader() {

    const date =
        state.settings.scheduleDate;

    const parsed =
        parseDate(date);

    document.getElementById("scheduleDate")
        .textContent =
        parsed.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    document.getElementById("scheduleDayName")
        .textContent =
        parsed.toLocaleDateString("en-US", {
            weekday: "long"
        });

    renderScheduleManagement();

}


/* ============================================================
   DISCIPLINE SCORE
   ============================================================ */

function getDayScore(date) {

    const habitsTotal =
        state.habits.length;

    let habitsDone = 0;

    state.habits.forEach(habit => {

        if (isHabitCompleted(habit.id, date)) {
            habitsDone++;
        }

    });

    const dayTasks =
        state.tasks.filter(
            task => task.date === date
        );

    let tasksDone = 0;

    dayTasks.forEach(task => {

        if (isTaskCompleted(task.id, date)) {
            tasksDone++;
        }

    });

    const total =
        habitsTotal + dayTasks.length;

    const completed =
        habitsDone + tasksDone;

    if (total === 0) {
        return 0;
    }

    return Math.round(
        completed / total * 100
    );

}


function updateScore() {

    const score =
        getDayScore(getToday());

    document.getElementById("scoreText")
        .textContent = `${score}%`;

    document.getElementById("ringValue")
        .textContent = `${score}%`;

    document.getElementById("scoreProgress")
        .style.width = `${score}%`;

    const degrees =
        score * 3.6;

    document.getElementById("scoreRing")
        .style.background = `
            radial-gradient(
                circle at center,
                var(--surface) 57%,
                transparent 58%
            ),
            conic-gradient(
                var(--crimson-bright) ${degrees}deg,
                var(--surface-3) ${degrees}deg
            )
        `;

    const completedHabits =
        state.habits.filter(
            h => isHabitCompleted(h.id)
        ).length;

    const todayTasks =
        state.tasks.filter(
            t => t.date === getToday()
        );

    const completedTasks =
        todayTasks.filter(
            t => isTaskCompleted(t.id, t.date)
        ).length;

    document.getElementById("completedSummary")
        .textContent =
        `${completedHabits}/${state.habits.length} habits`;

    document.getElementById("taskSummary")
        .textContent =
        `${completedTasks}/${todayTasks.length} tasks`;

}


/* ============================================================
   STREAKS
   ============================================================ */

function updateStreaks() {

    let streak = 0;

    let date =
        parseDate(getToday());

    while (true) {

        const dateString =
            formatDate(date);

        if (getDayScore(dateString) > 0) {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

        } else {

            break;

        }

    }

    let best = 0;
    let current = 0;

    const dates =
        Object.keys(state.completions)
            .sort();

    let previous = null;

    dates.forEach(dateString => {

        if (getDayScore(dateString) > 0) {

            if (
                previous &&
                daysBetween(
                    parseDate(previous),
                    parseDate(dateString)
                ) === 1
            ) {

                current++;

            } else {

                current = 1;

            }

            best = Math.max(best, current);

            previous = dateString;

        } else {

            current = 0;
            previous = null;

        }

    });

    const activeDays =
        dates.filter(
            date => getDayScore(date) > 0
        ).length;

    document.getElementById("currentStreak")
        .textContent = streak;

    document.getElementById("bestStreak")
        .textContent = best;

    document.getElementById("activeDays")
        .textContent = activeDays;

}


function daysBetween(a, b) {

    const difference =
        b.getTime() - a.getTime();

    return Math.round(
        difference / 86400000
    );

}


/* ============================================================
   HEATMAP
   ============================================================ */

function renderHeatmap() {

    const container =
        document.getElementById("heatmap");

    const months =
        document.getElementById("heatMonths");

    const today =
        parseDate(getToday());

    const start =
        new Date(today);

    start.setDate(
        start.getDate() - 364
    );

    container.innerHTML = "";

    const monthLabels = [];

    let lastMonth = -1;

    for (
        let i = 0;
        i < 365;
        i++
    ) {

        const date =
            new Date(start);

        date.setDate(
            start.getDate() + i
        );

        const dateString =
            formatDate(date);

        const score =
            getDayScore(dateString);

        const cell =
            document.createElement("div");

        cell.className =
            "heat-cell";

        if (score >= 75) {
            cell.classList.add("l4");
        } else if (score >= 50) {
            cell.classList.add("l3");
        } else if (score >= 25) {
            cell.classList.add("l2");
        } else if (score > 0) {
            cell.classList.add("l1");
        }

        cell.title =
            `${dateLabel(dateString)} — ${score}%`;

        cell.addEventListener(
            "click",
            () => openDayDetails(dateString)
        );

        container.appendChild(cell);

        if (date.getMonth() !== lastMonth) {

            monthLabels.push(
                date.toLocaleDateString(
                    "en-US",
                    { month: "short" }
                )
            );

            lastMonth =
                date.getMonth();

        }

    }

    months.innerHTML =
        monthLabels.map(
            month => `<span>${month}</span>`
        ).join("");

    document.getElementById("yearLabel")
        .textContent =
        `${start.getFullYear()} — ${today.getFullYear()}`;

}


/* ============================================================
   DAY DETAILS
   ============================================================ */

function openDayDetails(date) {

    const score =
        getDayScore(date);

    const completedHabits =
        state.habits.filter(
            habit => isHabitCompleted(habit.id, date)
        );

    const dayTasks =
        state.tasks.filter(
            task => task.date === date
        );

    const completedTasks =
        dayTasks.filter(
            task => isTaskCompleted(task.id, date)
        );

    document.getElementById("dayModalTitle")
        .textContent = dateLabel(date);

    document.getElementById("dayDetails")
        .innerHTML = `

        <div class="detail-score">

            <strong>${score}%</strong>

            <span class="muted">
                Discipline score
            </span>

        </div>

        <div class="detail-section">

            <h4>
                HABITS
            </h4>

            ${state.habits.length === 0
                ? `<p class="muted">No habits.</p>`
                : state.habits.map(habit => `
                    <div class="task-row ${
                        isHabitCompleted(habit.id, date)
                            ? "completed"
                            : ""
                    }">

                        <span>
                            ${habit.icon}
                        </span>

                        <div class="task-content">

                            <div class="task-title">
                                ${escapeHtml(habit.name)}
                            </div>

                        </div>

                        <span>
                            ${
                                isHabitCompleted(
                                    habit.id,
                                    date
                                )
                                ? "✓"
                                : "—"
                            }
                        </span>

                    </div>
                `).join("")
            }

        </div>

        <div class="detail-section">

            <h4>
                TASKS
            </h4>

            ${
                dayTasks.length === 0
                ? `<p class="muted">No tasks.</p>`
                : dayTasks.map(task => `
                    <div class="task-row ${
                        isTaskCompleted(task.id, date)
                            ? "completed"
                            : ""
                    }">

                        <div class="task-content">

                            <div class="task-title">
                                ${escapeHtml(task.name)}
                            </div>

                        </div>

                        <span>
                            ${
                                isTaskCompleted(
                                    task.id,
                                    date
                                )
                                ? "✓"
                                : "—"
                            }
                        </span>

                    </div>
                `).join("")
            }

        </div>
    `;

    document.getElementById("dayModal")
        .classList.add("open");

}


/* ============================================================
   STATISTICS
   ============================================================ */

let selectedRange = 7;


function setupStatistics() {

}


document.querySelectorAll(".range-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".range-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedRange =
                Number(button.dataset.range);

            renderStatistics();

        });

    });


function renderStatistics() {

    const dates =
        getLastDates(selectedRange);

    const scores =
        dates.map(
            date => getDayScore(date)
        );

    const average =
        scores.length
            ? Math.round(
                scores.reduce(
                    (a, b) => a + b,
                    0
                ) / scores.length
            )
            : 0;

    document.getElementById("averageScore")
        .textContent = `${average}%`;

    let habitCompletions = 0;

    dates.forEach(date => {

        state.habits.forEach(habit => {

            if (isHabitCompleted(habit.id, date)) {
                habitCompletions++;
            }

        });

    });

    let taskCompletions = 0;

    dates.forEach(date => {

        state.tasks
            .filter(task => task.date === date)
            .forEach(task => {

                if (
                    isTaskCompleted(
                        task.id,
                        date
                    )
                ) {
                    taskCompletions++;
                }

            });

    });

    const active =
        scores.filter(score => score > 0).length;

    const consistency =
        dates.length
            ? Math.round(
                active / dates.length * 100
            )
            : 0;

    document.getElementById("totalHabitCompletions")
        .textContent = habitCompletions;

    document.getElementById("totalTaskCompletions")
        .textContent = taskCompletions;

    document.getElementById("consistencyScore")
        .textContent = `${consistency}%`;

    drawChart(dates, scores);

    renderHabitStats(dates);

}


/* ============================================================
   CHART
   ============================================================ */

function drawChart(dates, scores) {

    const canvas =
        document.getElementById("disciplineChart");

    const ctx =
        canvas.getContext("2d");

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width =
        rect.width;

    const height =
        rect.height;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const padding = {
        top: 20,
        right: 15,
        bottom: 35,
        left: 35
    };

    const chartWidth =
        width -
        padding.left -
        padding.right;

    const chartHeight =
        height -
        padding.top -
        padding.bottom;

    /* GRID */

    ctx.strokeStyle =
        "#252529";

    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y =
            padding.top +
            chartHeight -
            (chartHeight / 4) * i;

        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();

        ctx.fillStyle =
            "#606067";

        ctx.font =
            "9px Inter";

        ctx.fillText(
            `${i * 25}`,
            5,
            y + 3
        );

    }

    if (scores.length === 0) return;

    /* LINE */

    ctx.beginPath();

    scores.forEach((score, index) => {

        const x =
            padding.left +
            (
                index /
                Math.max(scores.length - 1, 1)
            ) *
            chartWidth;

        const y =
            padding.top +
            chartHeight -
            (score / 100) *
            chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });

    ctx.strokeStyle =
        "#b71938";

    ctx.lineWidth = 2;

    ctx.stroke();

    /* AREA */

    ctx.lineTo(
        padding.left + chartWidth,
        padding.top + chartHeight
    );

    ctx.lineTo(
        padding.left,
        padding.top + chartHeight
    );

    ctx.closePath();

    ctx.fillStyle =
        "rgba(183,25,56,.08)";

    ctx.fill();

    /* POINTS */

    scores.forEach((score, index) => {

        const x =
            padding.left +
            (
                index /
                Math.max(scores.length - 1, 1)
            ) *
            chartWidth;

        const y =
            padding.top +
            chartHeight -
            (score / 100) *
            chartHeight;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            2.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#c51d3e";

        ctx.fill();

    });

    /* DATE LABELS */

    const labelCount =
        Math.min(7, dates.length);

    for (
        let i = 0;
        i < labelCount;
        i++
    ) {

        const index =
            Math.round(
                i *
                (dates.length - 1) /
                Math.max(labelCount - 1, 1)
            );

        const x =
            padding.left +
            (
                index /
                Math.max(dates.length - 1, 1)
            ) *
            chartWidth;

        ctx.fillStyle =
            "#606067";

        ctx.font =
            "9px Inter";

        ctx.textAlign =
            "center";

        ctx.fillText(
            dateLabel(dates[index]),
            x,
            height - 10
        );

    }

}


function renderHabitStats(dates) {

    const container =
        document.getElementById("habitStats");

    if (state.habits.length === 0) {

        container.innerHTML =
            `<p class="muted">No habits.</p>`;

        return;
    }

    container.innerHTML =
        state.habits.map(habit => {

            let completed = 0;

            dates.forEach(date => {

                if (
                    isHabitCompleted(
                        habit.id,
                        date
                    )
                ) {
                    completed++;
                }

            });

            const percentage =
                dates.length
                    ? Math.round(
                        completed /
                        dates.length *
                        100
                    )
                    : 0;

            return `
                <div class="stat-habit">

                    <div class="stat-habit-top">

                        <span>
                            ${habit.icon}
                            ${escapeHtml(habit.name)}
                        </span>

                        <strong>
                            ${percentage}%
                        </strong>

                    </div>

                    <div class="stat-progress">

                        <div style="width:${percentage}%"></div>

                    </div>

                </div>
            `;

        }).join("");

}


function getLastDates(number) {

    const dates = [];

    const today =
        parseDate(getToday());

    for (
        let i = number - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );

        dates.push(
            formatDate(date)
        );

    }

    return dates;

}


/* ============================================================
   QUICK HABIT
   ============================================================ */

document.getElementById("quickHabitBtn")
    .addEventListener("click", () => {

        if (state.habits.length === 0) {

            openHabitModal();

            return;
        }

        const incomplete =
            state.habits.find(
                habit =>
                    !isHabitCompleted(habit.id)
            );

        if (incomplete) {

            toggleHabit(incomplete.id);

        } else {

            showToast(
                "All habits completed today 🔥"
            );

        }

    });


/* ============================================================
   MODALS
   ============================================================ */

function closeModal(id) {

    document.getElementById(id)
        .classList.remove("open");

}


document.querySelectorAll(".modal-overlay")
    .forEach(overlay => {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {
                    overlay.classList.remove("open");
                }

            }
        );

    });


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        document.querySelectorAll(
            ".modal-overlay.open"
        ).forEach(modal => {

            modal.classList.remove("open");

        });

    }

});


/* ============================================================
   EXPORT / IMPORT
   ============================================================ */

function setupDataButtons() {

    document.getElementById("exportBtn")
        .addEventListener("click", exportData);


    document.getElementById("importBtn")
        .addEventListener("click", () => {

            document.getElementById("importFile")
                .click();

        });


    document.getElementById("importFile")
        .addEventListener(
            "change",
            importData
        );


    document.getElementById("resetBtn")
        .addEventListener("click", resetData);

}


function exportData() {

    const data =
        JSON.stringify(
            state,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `discipline-backup-${getToday()}.json`;

    link.click();

    URL.revokeObjectURL(url);

    showToast("Data exported");

}


function importData(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = () => {

        try {

            const imported =
                JSON.parse(reader.result);

            if (
                !imported.habits ||
                !imported.completions
            ) {
                throw new Error("Invalid file");
            }

            state =
                imported;

            saveData();

            renderEverything();

            showToast("Data imported successfully");

        } catch (error) {

            alert(
                "That file does not appear to be a valid Discipline backup."
            );

        }

    };

    reader.readAsText(file);

}


function resetData() {

    const confirmation =
        confirm(
            "This will permanently delete ALL your habits, tasks, schedules and history. Continue?"
        );

    if (!confirmation) return;

    localStorage.removeItem(
        STORAGE_KEY
    );

    location.reload();

}


/* ============================================================
   UTILITIES
   ============================================================ */

function escapeHtml(text) {

    if (text === undefined || text === null) {
        return "";
    }

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


let toastTimer;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2200);

}


/* ============================================================
   WINDOW RESIZE
   ============================================================ */

window.addEventListener(
    "resize",
    () => {

        if (
            document
                .getElementById("statistics")
                .classList.contains("active")
        ) {

            renderStatistics();

        }

    }
);
