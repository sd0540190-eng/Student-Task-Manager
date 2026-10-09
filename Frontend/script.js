const API_URL = "https://student-task-manager-2op8.onrender.com/api/tasks";


const form = document.querySelector(".task-form form");
const taskList = document.querySelector(".task-list");


// Load all tasks
async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();

        taskList.innerHTML = "";

        tasks.forEach(task => {
            displayTask(task);
        });

    } catch (error) {

        console.error(error);
        alert("Could not connect to the backend.");

    }
}


// Add new task
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const taskName = document.getElementById("taskName").value.trim();
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;

    if (taskName === "" || deadline === "") {

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

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(task)

        });

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


// Display task
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
        task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1) +
        " Priority";

    taskInfo.appendChild(title);
    taskInfo.appendChild(date);
    taskInfo.appendChild(priorityText);


    const taskButtons = document.createElement("div");
    taskButtons.classList.add("task-buttons");


    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.textContent =
        task.completed ? "Completed" : "Complete";


    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";


    if (task.completed) {

        title.style.textDecoration = "line-through";
        title.style.opacity = "0.5";

    }


    // Complete task
    completeButton.addEventListener("click", async function() {

        const updatedTask = {

            title: task.title,
            deadline: task.deadline,
            priority: task.priority,
            completed: !task.completed

        };

        try {

            const response = await fetch(
                API_URL + "/" + task.id,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(updatedTask)

                }
            );

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const result = await response.json();

            task.completed = result.completed;

            if (task.completed) {

                title.style.textDecoration = "line-through";
                title.style.opacity = "0.5";
                completeButton.textContent = "Completed";

            } else {

                title.style.textDecoration = "none";
                title.style.opacity = "1";
                completeButton.textContent = "Complete";

            }

        } catch (error) {

            console.error(error);
            alert("Could not update the task.");

        }

    });


    // Delete task
    deleteButton.addEventListener("click", async function() {

        try {

            const response = await fetch(
                API_URL + "/" + task.id,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

            taskElement.remove();

        } catch (error) {

            console.error(error);
            alert("Could not delete the task.");

        }

    });


    taskButtons.appendChild(completeButton);
    taskButtons.appendChild(deleteButton);

    taskElement.appendChild(taskInfo);
    taskElement.appendChild(taskButtons);

    taskList.appendChild(taskElement);

}


// Load tasks when page opens
loadTasks();