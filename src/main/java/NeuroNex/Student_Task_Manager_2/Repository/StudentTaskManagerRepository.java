package NeuroNex.Student_Task_Manager_2.Repository;

import NeuroNex.Student_Task_Manager_2.Entity.StudentTaskManagerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentTaskManagerRepository
        extends MongoRepository<StudentTaskManagerEntry, String> {
}