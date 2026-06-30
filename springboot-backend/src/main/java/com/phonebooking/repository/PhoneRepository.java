package com.phonebooking.repository;

import com.phonebooking.model.Phone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhoneRepository extends JpaRepository<Phone, Long> {
    List<Phone> findByBrandIgnoreCase(String brand);
    
    @Query("SELECT p FROM Phone p WHERE " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.model) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Phone> searchPhones(@Param("query") String query);
    
    @Query("SELECT p FROM Phone p WHERE " +
           "LOWER(p.brand) = LOWER(:brand) AND " +
           "(LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.model) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Phone> searchPhonesByBrand(@Param("brand") String brand, @Param("query") String query);
}
