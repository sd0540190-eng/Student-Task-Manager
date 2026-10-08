package NeuroNex.Student_Task_Manager_2.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tasks")
public class StudentTaskManagerEntry {

    @Id
    private String id;

    private String title;
    private String deadline;
    private String priority;
    private boolean completed;

    // Default constructor
    public StudentTaskManagerEntry() {
    }

    // Constructor
    public StudentTaskManagerEntry(
            String title,
            String deadline,
            String priority,
            boolean completed) {

        this.title = title;
        this.deadline = deadline;
        this.priority = priority;
        this.completed = completed;
    }

    // ID
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Title
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // Deadline
    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    // Priority
    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    // Completed
    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}


