
const API_URL = "https://student-task-manager-2op8.onrender.com/api/tasks";
const AUTH_URL = "https://student-task-manager-2op8.onrender.com/api/auth";

const form = document.querySelector(".task-form form");
const taskList = document.querySelector(".task-list");

// Keep the login token for this browser tab's session
let token = sessionStorage.getItem("studentTaskToken");
let username = sessionStorage.getItem("studentTaskUsername");

// Add the token to every protected request
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// Login to an existing account
async function login(usernameInput, passwordInput) {
    const response = await fetch(AUTH_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    token = data.token;
    username = data.username;

    sessionStorage.setItem("studentTaskToken", token);
    sessionStorage.setItem("studentTaskUsername", username);

    showLoggedIn();
    await loadTasks();
}

// Register a new account, then log in
async function register(usernameInput, passwordInput) {
    const response = await fetch(AUTH_URL + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Registration failed");
    }

    alert("Registration successful! Please log in.");
}

// Build a simple login and registration panel
function createAuthPanel() {
    const panel = document.createElement("section");
    panel.id = "auth-panel";
    panel.style.margin = "20px auto";
    panel.style.padding = "20px";
    panel.style.maxWidth = "420px";
    panel.style.background = "#ffffff";
    panel.style.color = "#173b75";
    panel.style.borderRadius = "12px";

    panel.innerHTML = `
        <h2 id="auth-heading">Student Login</h2>

        <label for="auth-username">Username</label>
        <input id="auth-username" type="text"
               autocomplete="username" required
               style="display:block;width:100%;box-sizing:border-box;
                      padding:10px;margin:8px 0 14px;">

        <label for="auth-password">Password</label>
        <input id="auth-password" type="password"
               autocomplete="current-password" required
               style="display:block;width:100%;box-sizing:border-box;
                      padding:10px;margin:8px 0 14px;">

        <button id="login-button" type="button">Login</button>
        <button id="register-button" type="button">Register</button>

        <p id="auth-message" role="status"></p>
    `;

    document.body.prepend(panel);

    const usernameInput = panel.querySelector("#auth-username");
    const passwordInput = panel.querySelector("#auth-password");
    const message = panel.querySelector("#auth-message");

    panel.querySelector("#login-button").addEventListener("click", async () => {
        message.textContent = "";

        if (!usernameInput.value.trim() || !passwordInput.value) {
            message.textContent = "Enter your username and password.";
            return;
        }

        try {
            await login(
                usernameInput.value.trim(),
                passwordInput.value
            );
        } catch (error) {
            message.textContent = error.message;
        }
    });

    panel.querySelector("#register-button").addEventListener("click", async () => {
        message.textContent = "";

        if (!usernameInput.value.trim() || !passwordInput.value) {
            message.textContent = "Enter a username and password.";
            return;
        }

        try {
            await register(
                usernameInput.value.trim(),
                passwordInput.value
            );
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

// Show the current account and logout button
function showLoggedIn() {
    let bar = document.getElementById("student-session");

    if (!bar) {
        bar = document.createElement("div");
        bar.id = "student-session";
        bar.style.textAlign = "center";
        bar.style.padding = "12px";
        document.body.prepend(bar);
    }

    bar.replaceChildren();

    const welcome = document.createElement("span");
    welcome.textContent = "Logged in as " + username + " ";

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = "Logout";

    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("studentTaskToken");
        sessionStorage.removeItem("studentTaskUsername");

        token = null;
        username = null;
        taskList.innerHTML = "";

        bar.remove();

        const panel = document.getElementById("auth-panel");
        if (panel) {
            panel.style.display = "block";
            panel.querySelector("#auth-heading").textContent = "Student Login";
            panel.querySelector("#auth-password").value = "";
            panel.querySelector("#auth-message").textContent =
                "You have logged out.";
        }

        if (form) {
            form.querySelectorAll("input, select, button").forEach(element => {
                element.disabled = true;
            });
        }
    });

    bar.append(welcome, logoutButton);

    const panel = document.getElementById("auth-panel");
    if (panel) {
        panel.style.display = "none";
    }

    if (form) {
        form.querySelectorAll("input, select, button").forEach(element => {
            element.disabled = false;
        });
    }
}

// Load only the logged-in student's tasks
async function loadTasks() {
    if (!token) {
        taskList.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            headers: authHeaders()
        });

        if (response.status === 401) {
            logoutForExpiredSession();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();

        taskList.innerHTML = "";
        tasks.forEach(displayTask);

    } catch (error) {
        console.error(error);
        alert("Could not load tasks. Check your connection.");
    }
}

// Clear an expired or invalid login session
function logoutForExpiredSession() {
    sessionStorage.removeItem("studentTaskToken");
    sessionStorage.removeItem("studentTaskUsername");

    token = null;
    username = null;
    taskList.innerHTML = "";

    const bar = document.getElementById("student-session");
    if (bar) bar.remove();

    const panel = document.getElementById("auth-panel");
    if (panel) {
        panel.style.display = "block";
        panel.querySelector("#auth-message").textContent =
            "Your login has expired. Please log in again.";
    }

    if (form) {
        form.querySelectorAll("input, select, button").forEach(element => {
            element.disabled = true;
        });
    }
}

// Create a new task
if (form) {
    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!token) {
            alert("Please log in first.");
            return;
        }

        const taskName = document.getElementById("taskName").value.trim();
        const deadline = document.getElementById("deadline").value;
        const priority = document.getElementById("priority").value;

        if (!taskName || !deadline) {
            alert("Please enter the task name and deadline.");
            return;
        }

        const task = {
            title: taskName,
            deadline: deadline,
            priority: priority,
            completed: false
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(task)
            });

            if (response.status === 401) {
                logoutForExpiredSession();
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to create task");
            }

            const savedTask = await response.json();

            displayTask(savedTask);
            form.reset();

        } catch (error) {
            console.error(error);
            alert("Could not save the task.");
        }
    });
}

// Display a task with complete and delete buttons
function displayTask(task) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    const taskInfo = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = task.title;

    const date = document.createElement("p");
    date.textContent = "Deadline: " + task.deadline;

    const priorityText = document.createElement("span");
    priorityText.textContent =
        (task.priority || "").charAt(0).toUpperCase() +
        (task.priority || "").slice(1) +
        " Priority";

    taskInfo.append(title, date, priorityText);

    const taskButtons = document.createElement("div");
    taskButtons.classList.add("task-buttons");

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.textContent = task.completed ? "Completed" : "Complete";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    function updateCompletedStyle() {
        title.style.textDecoration = task.completed ? "line-through" : "none";
        title.style.opacity = task.completed ? "0.5" : "1";
        completeButton.textContent = task.completed ? "Completed" : "Complete";
    }

    updateCompletedStyle();

    // Mark a task complete or incomplete
    completeButton.addEventListener("click", async function() {
        const updatedTask = {
            title: task.title,
            deadline: task.deadline,
            priority: task.priority,
            completed: !task.completed
        };

        try {
            const response = await fetch(API_URL + "/" + task.id, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(updatedTask)
            });

            if (response.status === 401) {
                logoutForExpiredSession();
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const result = await response.json();
            task.completed = result.completed;
            updateCompletedStyle();

        } catch (error) {
            console.error(error);
            alert("Could not update the task.");
        }
    });

    // Delete a task
    deleteButton.addEventListener("click", async function() {
        try {
            const response = await fetch(API_URL + "/" + task.id, {
                method: "DELETE",
                headers: authHeaders()
            });

            if (response.status === 401) {
                logoutForExpiredSession();
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

            taskElement.remove();

        } catch (error) {
            console.error(error);
            alert("Could not delete the task.");
        }
    });

    taskButtons.append(completeButton, deleteButton);
    taskElement.append(taskInfo, taskButtons);
    taskList.appendChild(taskElement);
}

// Start the page
if (form) {
    form.querySelectorAll("input, select, button").forEach(element => {
        element.disabled = !token;
    });
}

createAuthPanel();

if (token) {
    showLoggedIn();
    loadTasks();
}