
package NeuroNex.Student_Task_Manager_2.Repository;

import NeuroNex.Student_Task_Manager_2.Entity.StudentTaskManagerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudentTaskManagerRepository
        extends MongoRepository<StudentTaskManagerEntry, String> {

    // Find all tasks belonging to a particular student
    List<StudentTaskManagerEntry> findByUsername(String username);

}