/**
 * ACADEMIA - Classical Scholar Student Task Manager
 * Frontend Application Controller
 */

// ==========================================================================
// CONFIGURATION & SERVERS
// ==========================================================================
const CLOUD_API_BASE = "https://student-task-manager-2op8.onrender.com";
const LOCAL_API_BASE = "http://localhost:8080";

// Retrieve saved server preference or default to Cloud
let activeApiBase = localStorage.getItem("preferredApiBase") || CLOUD_API_BASE;

function getApiUrl() {
    return `${activeApiBase}/api/tasks`;
}

function getAuthUrl() {
    return `${activeApiBase}/api/auth`;
}

// Session Tokens (Maintained in sessionStorage for security)
let token = sessionStorage.getItem("studentTaskToken") || null;
let username = sessionStorage.getItem("studentTaskUsername") || null;

// Local In-Memory Task Registry
let allTasks = [];

// Filter & Sort State
let currentSearchQuery = "";
let currentStatusFilter = "all"; // 'all', 'pending', 'completed'
let currentPriorityFilter = "all"; // 'all', 'high', 'medium', 'low'
let currentSortOrder = "deadline-asc"; // 'deadline-asc', 'deadline-desc', 'priority', 'title'

// Classical Scholar Quotes
const SCHOLAR_QUOTES = [
    '"Order and discipline are the true architects of profound learning."',
    '"Wisdom begins with diligence; excellence is achieved milestone by milestone."',
    '"Scientia potentia est — Knowledge is the supreme power."',
    '"Divide each difficulty into as many parts as is feasible to resolve them."',
    '"He who labors with precision masters the scrolls of time."'
];

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const toastContainer = document.getElementById("toast-container");
const serverStatusPill = document.getElementById("server-status-pill");
const serverNameLabel = document.getElementById("server-name-label");
const toggleServerBtn = document.getElementById("toggle-server-btn");
const currentDateDisplay = document.getElementById("current-date-display");

// Auth Elements
const openAuthBtn = document.getElementById("open-auth-btn");
const userProfileBar = document.getElementById("user-profile-bar");
const displayUsername = document.getElementById("display-username");
const userAvatar = document.getElementById("user-avatar");
const logoutBtn = document.getElementById("logout-btn");
const authModal = document.getElementById("auth-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const authForm = document.getElementById("auth-form");
const authUsernameInput = document.getElementById("auth-username");
const authPasswordInput = document.getElementById("auth-password");
const togglePasswordVisibility = document.getElementById("toggle-password-visibility");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authErrorMsg = document.getElementById("auth-error-msg");
const authToggleAction = document.getElementById("auth-toggle-action");
const authToggleCaption = document.getElementById("auth-toggle-caption");
const authModalTitle = document.getElementById("auth-modal-title");
const promptLoginBtn = document.getElementById("prompt-login-btn");
const authRequiredHint = document.getElementById("auth-required-hint");

// Task Creation Elements
const createTaskForm = document.getElementById("create-task-form");
const taskNameInput = document.getElementById("taskName");
const deadlineInput = document.getElementById("deadline");
const prioritySelect = document.getElementById("priority");
const addTaskBtn = document.getElementById("add-task-btn");

// Registry Elements
const taskListContainer = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const unauthenticatedState = document.getElementById("unauthenticated-state");
const refreshTasksBtn = document.getElementById("refresh-tasks-btn");
const inspirationalQuoteEl = document.getElementById("inspirational-quote");

// Filter & Sort Controls
const taskSearchInput = document.getElementById("task-search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const statusFilterTabs = document.getElementById("status-filter-tabs");
const priorityFilterSelect = document.getElementById("priority-filter");
const sortOrderSelect = document.getElementById("sort-order");

// Stat Counter Elements
const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statCompleted = document.getElementById("stat-completed");
const statUrgent = document.getElementById("stat-urgent");

// Edit Modal Elements
const editModal = document.getElementById("edit-modal");
const closeEditModal = document.getElementById("close-edit-modal");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editTaskForm = document.getElementById("edit-task-form");
const editTaskId = document.getElementById("edit-task-id");
const editTaskTitle = document.getElementById("edit-task-title");
const editTaskDeadline = document.getElementById("edit-task-deadline");
const editTaskPriority = document.getElementById("edit-task-priority");
const editTaskCompleted = document.getElementById("edit-task-completed");

// Auth Mode Tracker ('login' | 'register')
let authMode = "login";

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = "info") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>`;
    } else if (type === "error") {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 320);
    }, 4000);
}

// Utility: HTML Escaper
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// AUTH HEADERS & HELPERS
// ==========================================================================
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// ==========================================================================
// SERVER TOGGLE & ENVIRONMENT
// ==========================================================================
function updateServerUI() {
    const isCloud = activeApiBase === CLOUD_API_BASE;
    serverNameLabel.textContent = isCloud ? "Render Cloud" : "Local:8080";
    serverStatusPill.setAttribute(
        "title",
        `Active Backend: ${activeApiBase}\nClick the cycle icon to switch between Cloud and Local host.`
    );
}

function toggleServerTarget() {
    if (activeApiBase === CLOUD_API_BASE) {
        activeApiBase = LOCAL_API_BASE;
    } else {
        activeApiBase = CLOUD_API_BASE;
    }
    localStorage.setItem("preferredApiBase", activeApiBase);
    updateServerUI();
    showToast(`Switched API endpoint to: ${activeApiBase}`, "info");

    if (token) {
        loadTasks();
    }
}

// ==========================================================================
// UI SESSION STATE & AUTH MODAL
// ==========================================================================
function updateAuthStateUI() {
    if (token && username) {
        // Logged In
        openAuthBtn.classList.add("hidden");
        userProfileBar.classList.remove("hidden");
        displayUsername.textContent = username;
        userAvatar.textContent = username.charAt(0).toUpperCase();

        authRequiredHint.classList.add("hidden");
        unauthenticatedState.classList.add("hidden");

        enableTaskInputs(true);
    } else {
        // Logged Out
        openAuthBtn.classList.remove("hidden");
        userProfileBar.classList.add("hidden");

        authRequiredHint.classList.remove("hidden");
        unauthenticatedState.classList.remove("hidden");
        emptyState.classList.add("hidden");
        taskListContainer.innerHTML = "";

        enableTaskInputs(false);
        updateStatistics([]);
    }
}

function enableTaskInputs(enabled) {
    taskNameInput.disabled = !enabled;
    deadlineInput.disabled = !enabled;
    prioritySelect.disabled = !enabled;
    addTaskBtn.disabled = !enabled;
}

function openModal(mode = "login") {
    authMode = mode;
    switchAuthMode(mode);
    authErrorMsg.classList.add("hidden");
    authErrorMsg.textContent = "";
    authUsernameInput.value = "";
    authPasswordInput.value = "";
    authModal.classList.remove("hidden");
    setTimeout(() => authUsernameInput.focus(), 100);
}

function closeModal() {
    authModal.classList.add("hidden");
}

function switchAuthMode(mode) {
    authMode = mode;
    authErrorMsg.classList.add("hidden");

    if (mode === "login") {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        authModalTitle.textContent = "Scholar Sign In";
        authSubmitBtn.querySelector("span").textContent = "Authenticate";
        authToggleCaption.textContent = "New scholar in the academy?";
        authToggleAction.textContent = "Enroll for an account";
    } else {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        authModalTitle.textContent = "Scholar Enrollment";
        authSubmitBtn.querySelector("span").textContent = "Register Account";
        authToggleCaption.textContent = "Already have credentials?";
        authToggleAction.textContent = "Sign into existing ledger";
    }
}

// Session Expired Handler
function handleSessionExpired() {
    sessionStorage.removeItem("studentTaskToken");
    sessionStorage.removeItem("studentTaskUsername");
    token = null;
    username = null;
    allTasks = [];

    updateAuthStateUI();
    showToast("Session credentials expired. Please sign in again.", "error");
    openModal("login");
}

// ==========================================================================
// AUTHENTICATION API CALLS
// ==========================================================================
async function handleAuthSubmit(event) {
    event.preventDefault();

    const u = authUsernameInput.value.trim();
    const p = authPasswordInput.value;

    if (!u || !p) {
        showAuthError("Please fill in both username and password.");
        return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.querySelector("span").textContent = "Processing...";

    try {
        if (authMode === "login") {
            const response = await fetch(`${getAuthUrl()}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Authentication rejected.");
            }

            token = data.token;
            username = data.username;

            sessionStorage.setItem("studentTaskToken", token);
            sessionStorage.setItem("studentTaskUsername", username);

            closeModal();
            updateAuthStateUI();
            showToast(`Welcome back, Scholar ${username}!`, "success");
            await loadTasks();

        } else {
            // Register
            const response = await fetch(`${getAuthUrl()}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Enrollment failed.");
            }

            showToast("Enrollment successful! Please sign in with your credentials.", "success");
            switchAuthMode("login");
            authPasswordInput.value = "";
        }
    } catch (err) {
        showAuthError(err.message || "Failed to communicate with server.");
    } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.querySelector("span").textContent = authMode === "login" ? "Authenticate" : "Register Account";
    }
}

function showAuthError(msg) {
    authErrorMsg.textContent = msg;
    authErrorMsg.classList.remove("hidden");
}

function logout() {
    sessionStorage.removeItem("studentTaskToken");
    sessionStorage.removeItem("studentTaskUsername");
    token = null;
    username = null;
    allTasks = [];

    updateAuthStateUI();
    showToast("You have gracefully concluded your session.", "info");
}

// ==========================================================================
// TASK API (CRUD)
// ==========================================================================

// Load Tasks from Spring Boot REST API
async function loadTasks() {
    if (!token) return;

    try {
        refreshTasksBtn.classList.add("spinning");

        const response = await fetch(getApiUrl(), {
            headers: authHeaders()
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load tasks (Status: ${response.status})`);
        }

        allTasks = await response.json();
        renderTasks();
        updateStatistics(allTasks);

    } catch (error) {
        console.error("Error loading tasks:", error);
        showToast("Could not retrieve tasks from server. Check connection.", "error");
    } finally {
        refreshTasksBtn.classList.remove("spinning");
    }
}

// Create Task
async function handleCreateTask(event) {
    event.preventDefault();

    if (!token) {
        openModal("login");
        showToast("Sign in first to commit tasks.", "error");
        return;
    }

    const title = taskNameInput.value.trim();
    const deadline = deadlineInput.value;
    const priority = prioritySelect.value;

    if (!title || !deadline) {
        showToast("Please provide both a task title and deadline.", "error");
        return;
    }

    const newTask = {
        title: title,
        deadline: deadline,
        priority: priority,
        completed: false
    };

    addTaskBtn.disabled = true;

    try {
        const response = await fetch(getApiUrl(), {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(newTask)
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to save task on server.");
        }

        const savedTask = await response.json();
        allTasks.unshift(savedTask); // Add to beginning

        createTaskForm.reset();
        // Set default date back to today
        setDefaultDate();

        renderTasks();
        updateStatistics(allTasks);
        showToast(`Task "${savedTask.title}" inscribed.`, "success");

    } catch (err) {
        console.error("Create task error:", err);
        showToast(err.message || "Failed to commit task.", "error");
    } finally {
        addTaskBtn.disabled = false;
    }
}

// Toggle Task Completion
async function toggleTaskCompletion(taskId) {
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = allTasks[taskIndex];
    const updatedState = !task.completed;

    const payload = {
        title: task.title,
        deadline: task.deadline,
        priority: task.priority,
        completed: updatedState
    };

    try {
        const response = await fetch(`${getApiUrl()}/${taskId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to update status.");
        }

        const updated = await response.json();
        allTasks[taskIndex] = updated;

        renderTasks();
        updateStatistics(allTasks);

        if (updated.completed) {
            showToast(`Milestone completed: "${updated.title}"!`, "success");
        }
    } catch (err) {
        console.error("Toggle error:", err);
        showToast("Failed to update task completion.", "error");
    }
}

// Delete Task
async function deleteTask(taskId, taskTitle) {
    const confirmDelete = window.confirm(`Are you certain you wish to purge "${taskTitle}" from your curriculum ledger?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${getApiUrl()}/${taskId}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to delete task from server.");
        }

        allTasks = allTasks.filter(t => t.id !== taskId);
        renderTasks();
        updateStatistics(allTasks);
        showToast("Task successfully removed from ledger.", "info");

    } catch (err) {
        console.error("Delete error:", err);
        showToast("Could not delete task.", "error");
    }
}

// Open Edit Dialog
function openEditTaskModal(task) {
    editTaskId.value = task.id;
    editTaskTitle.value = task.title;
    editTaskDeadline.value = task.deadline;
    editTaskPriority.value = task.priority || "medium";
    editTaskCompleted.checked = !!task.completed;

    editModal.classList.remove("hidden");
    setTimeout(() => editTaskTitle.focus(), 100);
}

// Save Edited Task
async function handleEditTaskSubmit(event) {
    event.preventDefault();

    const id = editTaskId.value;
    const title = editTaskTitle.value.trim();
    const deadline = editTaskDeadline.value;
    const priority = editTaskPriority.value;
    const completed = editTaskCompleted.checked;

    if (!title || !deadline) {
        showToast("Title and deadline are required.", "error");
        return;
    }

    const payload = {
        title: title,
        deadline: deadline,
        priority: priority,
        completed: completed
    };

    try {
        const response = await fetch(`${getApiUrl()}/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to save revisions.");
        }

        const updated = await response.json();
        const index = allTasks.findIndex(t => t.id === id);
        if (index !== -1) {
            allTasks[index] = updated;
        }

        editModal.classList.add("hidden");
        renderTasks();
        updateStatistics(allTasks);
        showToast("Task revisions saved successfully.", "success");

    } catch (err) {
        console.error("Edit save error:", err);
        showToast("Could not save task revisions.", "error");
    }
}

// ==========================================================================
// FILTER, SORT & RENDER ENGINE
// ==========================================================================
function getProcessedTasks() {
    let list = [...allTasks];

    // Search query filter
    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        list = list.filter(t => (t.title && t.title.toLowerCase().includes(q)));
    }

    // Status filter
    if (currentStatusFilter === "pending") {
        list = list.filter(t => !t.completed);
    } else if (currentStatusFilter === "completed") {
        list = list.filter(t => t.completed);
    }

    // Priority filter
    if (currentPriorityFilter !== "all") {
        list = list.filter(t => (t.priority || "").toLowerCase() === currentPriorityFilter);
    }

    // Sorting
    list.sort((a, b) => {
        if (currentSortOrder === "deadline-asc") {
            return (a.deadline || "").localeCompare(b.deadline || "");
        } else if (currentSortOrder === "deadline-desc") {
            return (b.deadline || "").localeCompare(a.deadline || "");
        } else if (currentSortOrder === "priority") {
            const weights = { high: 3, medium: 2, low: 1 };
            const wA = weights[(a.priority || "low").toLowerCase()] || 0;
            const wB = weights[(b.priority || "low").toLowerCase()] || 0;
            return wB - wA;
        } else if (currentSortOrder === "title") {
            return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
    });

    return list;
}

function renderTasks() {
    if (!token) {
        taskListContainer.innerHTML = "";
        unauthenticatedState.classList.remove("hidden");
        emptyState.classList.add("hidden");
        return;
    }

    unauthenticatedState.classList.add("hidden");

    const tasksToDisplay = getProcessedTasks();

    if (tasksToDisplay.length === 0) {
        taskListContainer.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    taskListContainer.innerHTML = "";

    tasksToDisplay.forEach(task => {
        const itemEl = createTaskItemElement(task);
        taskListContainer.appendChild(itemEl);
    });
}

// Build Individual Task Card Element
function createTaskItemElement(task) {
    const el = document.createElement("div");
    el.className = `task-item priority-${(task.priority || 'medium').toLowerCase()} ${task.completed ? 'completed' : ''}`;
    el.setAttribute("data-id", task.id);

    // Compute deadline format and overdue status
    const deadlineInfo = formatDeadline(task.deadline);

    // Priority Roman Numeral
    const priorityTier = (task.priority || "medium").toLowerCase();
    let priorityLabel = "II - Medium";
    if (priorityTier === "high") priorityLabel = "I - High";
    if (priorityTier === "low") priorityLabel = "III - Low";

    el.innerHTML = `
        <div class="task-status-toggle">
            <button type="button" class="custom-checkbox-btn" aria-label="Toggle completed" title="${task.completed ? 'Mark incomplete' : 'Mark completed'}">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </button>
        </div>

        <div class="task-body">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <div class="task-meta">
                <span class="meta-chip chip-deadline ${deadlineInfo.statusClass}">
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${deadlineInfo.text}</span>
                </span>

                <span class="meta-chip chip-priority ${priorityTier}">
                    ${priorityLabel}
                </span>
            </div>
        </div>

        <div class="task-actions">
            <button type="button" class="action-btn btn-edit" title="Amend / Edit Task" aria-label="Edit task">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>

            <button type="button" class="action-btn btn-delete" title="Purge Task" aria-label="Delete task">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    // Hook listeners
    const checkboxBtn = el.querySelector(".custom-checkbox-btn");
    checkboxBtn.addEventListener("click", () => toggleTaskCompletion(task.id));

    const editBtn = el.querySelector(".btn-edit");
    editBtn.addEventListener("click", () => openEditTaskModal(task));

    const deleteBtn = el.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", () => deleteTask(task.id, task.title));

    return el;
}

// Format Deadline with Smart Relative Description
function formatDeadline(deadlineStr) {
    if (!deadlineStr) return { text: "No deadline", statusClass: "" };

    const parts = deadlineStr.split("-");
    if (parts.length !== 3) return { text: deadlineStr, statusClass: "" };

    const dueYear = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10) - 1;
    const dueDay = parseInt(parts[2], 10);

    const dueDate = new Date(dueYear, dueMonth, dueDay);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = dueDate - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${monthNames[dueMonth]} ${dueDay}, ${dueYear}`;

    if (diffDays < 0) {
        return {
            text: `Overdue (${formattedDate})`,
            statusClass: "overdue"
        };
    } else if (diffDays === 0) {
        return {
            text: "Due Today",
            statusClass: "due-today"
        };
    } else if (diffDays === 1) {
        return {
            text: "Due Tomorrow",
            statusClass: "due-today"
        };
    } else if (diffDays <= 5) {
        return {
            text: `Due in ${diffDays} days (${formattedDate})`,
            statusClass: ""
        };
    } else {
        return {
            text: `Due: ${formattedDate}`,
            statusClass: ""
        };
    }
}

// Update Metric Cards
function updateStatistics(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const urgent = tasks.filter(t => !t.completed && (t.priority || "").toLowerCase() === "high").length;

    animateValue(statTotal, parseInt(statTotal.textContent, 10) || 0, total, 400);
    animateValue(statPending, parseInt(statPending.textContent, 10) || 0, pending, 400);
    animateValue(statCompleted, parseInt(statCompleted.textContent, 10) || 0, completed, 400);
    animateValue(statUrgent, parseInt(statUrgent.textContent, 10) || 0, urgent, 400);
}

// Smooth Number Counter Animation
function animateValue(obj, start, end, duration) {
    if (start === end) {
        obj.textContent = end;
        return;
    }
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1)));
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, Math.max(stepTime, 20));
}

// ==========================================================================
// DATE & INITIALIZATION HELPERS
// ==========================================================================
function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    deadlineInput.value = `${yyyy}-${mm}-${dd}`;
}

function updateDateBanner() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);

    // Set a random classical quote
    const randomQuote = SCHOLAR_QUOTES[Math.floor(Math.random() * SCHOLAR_QUOTES.length)];
    if (inspirationalQuoteEl) {
        inspirationalQuoteEl.textContent = randomQuote;
    }
}

// ==========================================================================
// EVENT LISTENERS BINDINGS
// ==========================================================================
function setupEventListeners() {
    // Server Switcher
    toggleServerBtn.addEventListener("click", toggleServerTarget);
    serverStatusPill.addEventListener("click", (e) => {
        if (e.target !== toggleServerBtn && !toggleServerBtn.contains(e.target)) {
            toggleServerTarget();
        }
    });

    // Auth Open Triggers
    openAuthBtn.addEventListener("click", () => openModal("login"));
    promptLoginBtn.addEventListener("click", () => openModal("login"));
    logoutBtn.addEventListener("click", logout);

    // Modal Close
    closeAuthModal.addEventListener("click", closeModal);
    authModal.addEventListener("click", (e) => {
        if (e.target === authModal) closeModal();
    });

    // Auth Tab Switch
    tabLogin.addEventListener("click", () => switchAuthMode("login"));
    tabRegister.addEventListener("click", () => switchAuthMode("register"));
    authToggleAction.addEventListener("click", () => {
        switchAuthMode(authMode === "login" ? "register" : "login");
    });

    // Password Reveal Toggle
    togglePasswordVisibility.addEventListener("click", () => {
        const isPassword = authPasswordInput.type === "password";
        authPasswordInput.type = isPassword ? "text" : "password";
    });

    // Auth Form Submission
    authForm.addEventListener("submit", handleAuthSubmit);

    // Task Creation Form
    createTaskForm.addEventListener("submit", handleCreateTask);

    // Refresh Sync
    refreshTasksBtn.addEventListener("click", () => {
        showToast("Synchronizing with archive ledger...", "info");
        loadTasks();
    });

    // Search Box
    taskSearchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.trim();
        clearSearchBtn.classList.toggle("hidden", currentSearchQuery.length === 0);
        renderTasks();
    });

    clearSearchBtn.addEventListener("click", () => {
        taskSearchInput.value = "";
        currentSearchQuery = "";
        clearSearchBtn.classList.add("hidden");
        renderTasks();
        taskSearchInput.focus();
    });

    // Status Filter Tabs
    statusFilterTabs.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            statusFilterTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentStatusFilter = btn.getAttribute("data-filter");
            renderTasks();
        });
    });

    // Priority Filter
    priorityFilterSelect.addEventListener("change", (e) => {
        currentPriorityFilter = e.target.value;
        renderTasks();
    });

    // Sort Order
    sortOrderSelect.addEventListener("change", (e) => {
        currentSortOrder = e.target.value;
        renderTasks();
    });

    // Edit Modal Events
    closeEditModal.addEventListener("click", () => editModal.classList.add("hidden"));
    cancelEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));
    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) editModal.classList.add("hidden");
    });
    editTaskForm.addEventListener("submit", handleEditTaskSubmit);

    // Keyboard Shortcuts (Esc to close modals)
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!authModal.classList.contains("hidden")) closeModal();
            if (!editModal.classList.contains("hidden")) editModal.classList.add("hidden");
        }
    });
}

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================
function initApp() {
    updateDateBanner();
    updateServerUI();
    setDefaultDate();
    setupEventListeners();
    updateAuthStateUI();

    if (token) {
        loadTasks();
    }
}

// Launch upon document ready
document.addEventListener("DOMContentLoaded", initApp);