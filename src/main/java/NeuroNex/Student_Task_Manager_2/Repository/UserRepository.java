package NeuroNex.Student_Task_Manager_2.Repository;

import NeuroNex.Student_Task_Manager_2.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {


    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);


}

