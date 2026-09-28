package com.campusai.repository;

import com.campusai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByRollNumber(String rollNumber);
    List<User> findByRole(User.Role role);
    List<User> findByRoleAndDepartment(User.Role role, String department);
    long countByRole(User.Role role);
}
