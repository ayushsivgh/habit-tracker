/* =========================================================
   DISCIPLINE TRACKER
   Everything is stored in localStorage.
========================================================= */


// ================= DATA =================

const STORAGE_KEY = "disciplineTracker";

let data = loadData();

function defaultData() {

    return {
        habits: [],

        todos: [],

        history: {},

        settings: {
            username: "Ayush"
        }
    };
}


function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return defaultData();
    }

    try {
        return JSON.parse(saved);
    } catch {
        return defaultData();
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    renderAll();
}


// ================= DATE =================

function dateKey(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function dateFromKey(key) {

    const parts = key.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


function todayKey() {
    return dateKey();
}


// ================= INITIALIZE TODAY =================

function ensureToday() {

    const today = todayKey();

    if (!data.history[today]) {

        data.history[today] = {
            habits: {},
            todos: {}
        };

        saveSilent();
    }
}


function saveSilent() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


// ================= HABITS =================

function addHabit(name, emoji) {

    const habit = {

        id: crypto.randomUUID(),

        name: name,

        emoji: emoji || "●",

        created: todayKey()
    };

    data.habits.push(habit);

    saveData();
}


function deleteHabit(id) {

    if (!confirm("Delete this habit?")) {
        return;
    }

    data.habits =
        data.habits.filter(
            habit => habit.id !== id
        );

    Object.keys(data.history).forEach(day => {

        if (data.history[day]?.habits) {

            delete data.history[day].habits[id];

        }

    });

    saveData();
}


function toggleHabit(id) {

    ensureToday();

    const today = todayKey();

    const current =
        data.history[today].habits[id] || false;

    data.history[today].habits[id] = !current;

    saveData();
}


// ================= TODOS =================

function addTodo(name, priority) {

    const todo = {

        id: crypto.randomUUID(),

        name: name,

        priority: priority,

        completed: false,

        date: todayKey()
    };

    data.todos.push(todo);

    saveData();
}


function deleteTodo(id) {

    data.todos =
        data.todos.filter(
            todo => todo.id !== id
        );

    saveData();
}


function toggleTodo(id) {

    const todo =
        data.todos.find(
            item => item.id === id
        );

    if (!todo) return;

    todo.completed = !todo.completed;

    saveData();
}


// ================= HABIT RENDER =================

function renderHabits() {

    const container =
        document.getElementById("habitList");

    const empty =
        document.getElementById("emptyHabits");

    container.innerHTML = "";

    if (data.habits.length === 0) {

        empty.style.display = "block";

        return;
    }

    empty.style.display = "none";

    const today =
        data.history[todayKey()]?.habits || {};

    data.habits.forEach(habit => {

        const completed =
            today[habit.id] || false;

        const item =
            document.createElement("div");

        item.className =
            `item ${completed ? "completed" : ""}`;

        item.innerHTML = `

            <button
                class="check ${completed ? "completed" : ""}"
                data-habit="${habit.id}">
            </button>

            <div class="item-icon">
                ${escapeHTML(habit.emoji)}
            </div>

            <div class="item-info">

                <div class="item-name">
                    ${escapeHTML(habit.name)}
                </div>

                <div class="item-meta">
                    ${completed ? "Completed today" : "Not completed"}
                </div>

            </div>

            <button
                class="delete-btn"
                data-delete-habit="${habit.id}">
                ×
            </button>

        `;

        container.appendChild(item);
    });


    container
        .querySelectorAll("[data-habit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => toggleHabit(
                    button.dataset.habit
                )
            );

        });


    container
        .querySelectorAll("[data-delete-habit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteHabit(
                    button.dataset.deleteHabit
                )
            );

        });
}


// ================= TODO RENDER =================

function renderTodos() {

    const container =
        document.getElementById("todoList");

    const empty =
        document.getElementById("emptyTodos");

    container.innerHTML = "";

    const todayTodos =
        data.todos.filter(
            todo => todo.date === todayKey()
        );

    if (todayTodos.length === 0) {

        empty.style.display = "block";

    } else {

        empty.style.display = "none";
    }


    todayTodos.forEach(todo => {

        const item =
            document.createElement("div");

        item.className =
            `item ${todo.completed ? "completed" : ""}`;

        item.innerHTML = `

            <button
                class="check ${todo.completed ? "completed" : ""}"
                data-todo="${todo.id}">
            </button>

            <div class="item-info">

                <div class="item-name">
                    ${escapeHTML(todo.name)}
                </div>

                <div class="item-meta">
                    ${todo.priority.toUpperCase()} PRIORITY
                </div>

            </div>

            <button
                class="delete-btn"
                data-delete-todo="${todo.id}">
                ×
            </button>

        `;

        container.appendChild(item);
    });


    container
        .querySelectorAll("[data-todo]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => toggleTodo(
                    button.dataset.todo
                )
            );

        });


    container
        .querySelectorAll("[data-delete-todo]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteTodo(
                    button.dataset.deleteTodo
                )
            );

        });


    const completed =
        todayTodos.filter(
            todo => todo.completed
        ).length;

    const total =
        todayTodos.length;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                completed / total * 100
            );


    document.getElementById(
        "todoProgressBar"
    ).style.width = `${percentage}%`;


    document.getElementById(
        "todoProgressText"
    ).textContent =
        `${completed} / ${total}`;
}


// ================= SCORE =================

function getTodayScore() {

    const today =
        data.history[todayKey()] || {
            habits: {}
        };


    const habitTotal =
        data.habits.length;

    const habitDone =
        data.habits.filter(
            habit =>
                today.habits?.[habit.id]
        ).length;


    const todos =
        data.todos.filter(
            todo =>
                todo.date === todayKey()
        );

    const todoDone =
        todos.filter(
            todo => todo.completed
        ).length;


    const total =
        habitTotal + todos.length;

    const completed =
        habitDone + todoDone;


    if (total === 0) return 0;


    return Math.round(
        completed / total * 100
    );
}


function renderScore() {

    const score =
        getTodayScore();

    const ring =
        document.querySelector(".score-ring");

    ring.style.setProperty(
        "--score",
        `${score}%`
    );


    document.getElementById(
        "todayScore"
    ).textContent =
        `${score}%`;


    let message =
        "Let's begin.";

    if (score >= 90)
        message = "Exceptional.";

    else if (score >= 75)
        message = "Strong day.";

    else if (score >= 50)
        message = "Keep pushing.";

    else if (score > 0)
        message = "Keep going.";


    document.getElementById(
        "scoreMessage"
    ).textContent =
        message;
}


// ================= HISTORY =================

function getDayScore(key) {

    const history =
        data.history[key];

    if (!history) return 0;


    const habits =
        Object.values(
            history.habits || {}
        );

    const completedHabits =
        habits.filter(Boolean).length;


    const todos =
        data.todos.filter(
            todo => todo.date === key
        );

    const completedTodos =
        todos.filter(
            todo => todo.completed
        ).length;


    const total =
        data.habits.length +
        todos.length;


    const completed =
        completedHabits +
        completedTodos;


    if (total === 0) return 0;


    return Math.round(
        completed / total * 100
    );
}


// ================= HEATMAP =================

function getHeatLevel(score) {

    if (score === 0) return 0;

    if (score < 25) return 1;

    if (score < 50) return 2;

    if (score < 75) return 3;

    return 4;
}


function renderHeatmap() {

    const container =
        document.getElementById("heatmap");

    container.innerHTML = "";


    const today =
        new Date();

    const start =
        new Date(today);

    start.setDate(
        start.getDate() - 364
    );


    let activeDays = 0;


    for (
        let i = 0;
        i < 365;
        i++
    ) {

        const current =
            new Date(start);

        current.setDate(
            start.getDate() + i
        );


        const key =
            dateKey(current);

        const score =
            getDayScore(key);

        if (score > 0) {
            activeDays++;
        }


        const cell =
            document.createElement("div");

        cell.className =
            `heat-cell level-${getHeatLevel(score)}`;

        cell.title =
            `${key}: ${score}%`;


        container.appendChild(cell);
    }


    document.getElementById(
        "heatmapSummary"
    ).textContent =
        `${activeDays} active days in the last year`;
}


// ================= STREAKS =================

function calculateStreaks() {

    const today =
        new Date();

    let currentStreak = 0;

    let bestStreak = 0;

    let running = 0;


    for (
        let i = 0;
        i < 365;
        i++
    ) {

        const day =
            new Date(today);

        day.setDate(
            today.getDate() - i
        );


        const score =
            getDayScore(
                dateKey(day)
            );


        if (score > 0) {

            running++;

        } else {

            bestStreak =
                Math.max(
                    bestStreak,
                    running
                );

            running = 0;
        }


        if (
            i === 0 &&
            score > 0
        ) {

            currentStreak = 1;

            for (
                let j = 1;
                j < 365;
                j++
            ) {

                const previous =
                    new Date(today);

                previous.setDate(
                    today.getDate() - j
                );


                if (
                    getDayScore(
                        dateKey(previous)
                    ) > 0
                ) {

                    currentStreak++;

                } else {

                    break;
                }
            }
        }
    }


    bestStreak =
        Math.max(
            bestStreak,
            running
        );


    return {
        currentStreak,
        bestStreak
    };
}


function renderStreaks() {

    const {
        currentStreak,
        bestStreak
    } = calculateStreaks();


    document.getElementById(
        "currentStreak"
    ).textContent =
        currentStreak;


    document.getElementById(
        "bestStreak"
    ).textContent =
        bestStreak;


    document.getElementById(
        "insightStreak"
    ).textContent =
        `${bestStreak} days`;
}


// ================= WEEKLY CHART =================

function getLastSevenDays() {

    const days = [];

    const today =
        new Date();

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const day =
            new Date(today);

        day.setDate(
            today.getDate() - i
        );

        days.push(day);
    }

    return days;
}


function renderChart() {

    const container =
        document.getElementById(
            "weeklyChart"
        );

    container.innerHTML = "";


    const days =
        getLastSevenDays();


    const scores =
        days.map(
            day =>
                getDayScore(
                    dateKey(day)
                )
        );


    const average =
        Math.round(
            scores.reduce(
                (a, b) => a + b,
                0
            ) / 7
        );


    document.getElementById(
        "weeklyAverage"
    ).textContent =
        `${average}%`;


    document.getElementById(
        "insightAverage"
    ).textContent =
        `${average}%`;


    scores.forEach(score => {

        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";

        bar.style.height =
            `${Math.max(score, 2)}%`;


        const value =
            document.createElement("span");

        value.className =
            "chart-value";

        value.textContent =
            `${score}%`;


        bar.appendChild(value);

        container.appendChild(bar);
    });


    const max =
        Math.max(...scores);

    const index =
        scores.indexOf(max);


    if (max > 0) {

        document.getElementById(
            "bestDay"
        ).textContent =
            days[index].toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                }
            );

    } else {

        document.getElementById(
            "bestDay"
        ).textContent =
            "—";
    }
}


// ================= STATS =================

function renderStats() {

    const completed =
        data.todos.filter(
            todo => todo.completed
        ).length;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed;


    let activeDays = 0;


    Object.keys(data.history)
        .forEach(key => {

            if (
                getDayScore(key) > 0
            ) {

                activeDays++;
            }

        });


    document.getElementById(
        "activeDays"
    ).textContent =
        activeDays;
}


// ================= DATE =================

function renderDate() {

    const now =
        new Date();


    document.getElementById(
        "currentDate"
    ).textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    const hour =
        now.getHours();


    let greeting =
        "Stay disciplined.";


    if (hour < 12)
        greeting = "Good morning.";

    else if (hour < 18)
        greeting = "Good afternoon.";

    else
        greeting = "Good evening.";


    document.getElementById(
        "greeting"
    ).textContent =
        greeting;
}


// ================= SECURITY =================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ================= MODALS =================

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("active");
}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("active");
}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () =>
                closeModal(
                    button.dataset.close
                )
        );

    });


document
    .querySelectorAll(".modal-overlay")
    .forEach(overlay => {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {

                    overlay.classList.remove(
                        "active"
                    );
                }

            }
        );

    });


document
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                document
                    .querySelectorAll(
                        ".modal-overlay.active"
                    )
                    .forEach(modal =>
                        modal.classList.remove(
                            "active"
                        )
                    );

            }

        }
    );


// ================= ADD HABIT =================

document
    .getElementById("addHabitBtn")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "habitNameInput"
            ).value = "";

            document.getElementById(
                "habitEmojiInput"
            ).value = "";

            openModal("habitModal");

            setTimeout(
                () =>
                    document.getElementById(
                        "habitNameInput"
                    ).focus(),
                100
            );
        }
    );


document
    .getElementById("saveHabitBtn")
    .addEventListener(
        "click",
        () => {

            const name =
                document.getElementById(
                    "habitNameInput"
                ).value.trim();


            const emoji =
                document.getElementById(
                    "habitEmojiInput"
                ).value.trim();


            if (!name) {

                alert(
                    "Please enter a habit name."
                );

                return;
            }


            addHabit(
                name,
                emoji
            );

            closeModal("habitModal");
        }
    );


// ================= ADD TODO =================

document
    .getElementById("addTodoBtn")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "todoInput"
            ).value = "";

            openModal("todoModal");

            setTimeout(
                () =>
                    document.getElementById(
                        "todoInput"
                    ).focus(),
                100
            );
        }
    );


document
    .getElementById("saveTodoBtn")
    .addEventListener(
        "click",
        () => {

            const name =
                document.getElementById(
                    "todoInput"
                ).value.trim();


            const priority =
                document.getElementById(
                    "todoPriority"
                ).value;


            if (!name) {

                alert(
                    "Please enter a task."
                );

                return;
            }


            addTodo(
                name,
                priority
            );

            closeModal("todoModal");
        }
    );


document
    .getElementById("todoInput")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                document
                    .getElementById(
                        "saveTodoBtn"
                    )
                    .click();
            }

        }
    );


document
    .getElementById("habitNameInput")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                document
                    .getElementById(
                        "saveHabitBtn"
                    )
                    .click();
            }

        }
    );


// ================= EXPORT =================

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        () => {

            const json =
                JSON.stringify(
                    data,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `discipline-backup-${todayKey()}.json`;

            link.click();

            URL.revokeObjectURL(url);
        }
    );


// ================= IMPORT =================

document
    .getElementById("importBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "importFile"
                )
                .click();
        }
    );


document
    .getElementById("importFile")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const imported =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !imported.habits ||
                            !imported.todos ||
                            !imported.history
                        ) {

                            throw new Error();

                        }


                        if (
                            confirm(
                                "Replace your current data with this backup?"
                            )
                        ) {

                            data =
                                imported;

                            saveData();
                        }


                    } catch {

                        alert(
                            "Invalid backup file."
                        );
                    }

                };


            reader.readAsText(file);

            event.target.value = "";
        }
    );


// ================= RENDER EVERYTHING =================

function renderAll() {

    ensureToday();

    renderDate();

    renderHabits();

    renderTodos();

    renderScore();

    renderHeatmap();

    renderStreaks();

    renderChart();

    renderStats();
}


// ================= START =================

renderAll();
