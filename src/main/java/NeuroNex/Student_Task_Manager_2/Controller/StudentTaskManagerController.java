
package NeuroNex.Student_Task_Manager_2.Controller;

import NeuroNex.Student_Task_Manager_2.Entity.StudentTaskManagerEntry;
import NeuroNex.Student_Task_Manager_2.Repository.StudentTaskManagerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin
public class StudentTaskManagerController {

    private final StudentTaskManagerRepository repository;

    public StudentTaskManagerController(
            StudentTaskManagerRepository repository) {
        this.repository = repository;
    }

    // CREATE TASK
    @PostMapping
    public ResponseEntity<StudentTaskManagerEntry> createTask(
            @RequestBody StudentTaskManagerEntry task,
            Authentication authentication) {

        // Always assign the task to the logged-in student
        task.setUsername(authentication.getName());

        // Do not allow the client to choose the task ID
        task.setId(null);

        StudentTaskManagerEntry savedTask = repository.save(task);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    // GET ALL TASKS BELONGING TO THE LOGGED-IN STUDENT
    @GetMapping
    public List<StudentTaskManagerEntry> getAllTasks(
            Authentication authentication) {

        return repository.findByUsername(authentication.getName());
    }

    // GET ONE TASK BELONGING TO THE LOGGED-IN STUDENT
    @GetMapping("/{id}")
    public ResponseEntity<StudentTaskManagerEntry> getTask(
            @PathVariable String id,
            Authentication authentication) {

        return repository.findById(id)
                .filter(task -> authentication.getName()
                        .equals(task.getUsername()))
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    // UPDATE ONLY THE LOGGED-IN STUDENT'S TASK
    @PutMapping("/{id}")
    public ResponseEntity<StudentTaskManagerEntry> updateTask(
            @PathVariable String id,
            @RequestBody StudentTaskManagerEntry updatedTask,
            Authentication authentication) {

        return repository.findById(id)
                .filter(task -> authentication.getName()
                        .equals(task.getUsername()))
                .map(task -> {

                    task.setTitle(updatedTask.getTitle());
                    task.setDeadline(updatedTask.getDeadline());
                    task.setPriority(updatedTask.getPriority());
                    task.setCompleted(updatedTask.isCompleted());

                    // Keep the original owner unchanged
                    StudentTaskManagerEntry savedTask =
                            repository.save(task);

                    return ResponseEntity.ok(savedTask);
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    // DELETE ONLY THE LOGGED-IN STUDENT'S TASK
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(
            @PathVariable String id,
            Authentication authentication) {

        return repository.findById(id)
                .filter(task -> authentication.getName()
                        .equals(task.getUsername()))
                .map(task -> {
                    repository.delete(task);
                    return ResponseEntity.ok(
                            "Task deleted successfully");
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }
}

