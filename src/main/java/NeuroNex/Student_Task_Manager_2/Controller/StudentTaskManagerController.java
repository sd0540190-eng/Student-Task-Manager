package NeuroNex.Student_Task_Manager_2.Controller;

import NeuroNex.Student_Task_Manager_2.Entity.StudentTaskManagerEntry;
import NeuroNex.Student_Task_Manager_2.Repository.StudentTaskManagerRepository;

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
    public StudentTaskManagerEntry createTask(
            @RequestBody StudentTaskManagerEntry task) {

        return repository.save(task);
    }


    // GET ALL TASKS
    @GetMapping
    public List<StudentTaskManagerEntry> getAllTasks() {

        return repository.findAll();
    }


    // GET ONE TASK
    @GetMapping("/{id}")
    public StudentTaskManagerEntry getTask(
            @PathVariable String id) {

        return repository.findById(id).orElse(null);
    }


    // UPDATE TASK
    @PutMapping("/{id}")
    public StudentTaskManagerEntry updateTask(
            @PathVariable String id,
            @RequestBody StudentTaskManagerEntry updatedTask) {

        return repository.findById(id)
                .map(task -> {

                    task.setTitle(updatedTask.getTitle());

                    task.setDeadline(updatedTask.getDeadline());

                    task.setPriority(updatedTask.getPriority());

                    task.setCompleted(updatedTask.isCompleted());

                    return repository.save(task);
                })
                .orElse(null);
    }


    // DELETE TASK
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable String id) {

        repository.deleteById(id);

        return "Task deleted successfully";
    }
}

