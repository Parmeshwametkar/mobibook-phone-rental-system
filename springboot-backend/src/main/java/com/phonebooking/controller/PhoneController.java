package com.phonebooking.controller;

import com.phonebooking.model.Phone;
import com.phonebooking.repository.PhoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phones")
@CrossOrigin(origins = "http://localhost:3000")
public class PhoneController {

    @Autowired
    private PhoneRepository phoneRepository;

    // Get all phones (supports search queries and brand filters)
    @GetMapping
    public ResponseEntity<List<Phone>> getAllPhones(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String brand) {
        
        List<Phone> phones;

        if (brand != null && !brand.equalsIgnoreCase("All")) {
            if (search != null && !search.trim().isEmpty()) {
                phones = phoneRepository.searchPhonesByBrand(brand, search);
            } else {
                phones = phoneRepository.findByBrandIgnoreCase(brand);
            }
        } else if (search != null && !search.trim().isEmpty()) {
            phones = phoneRepository.searchPhones(search);
        } else {
            phones = phoneRepository.findAll();
        }

        return ResponseEntity.ok(phones);
    }

    // Get phone by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPhoneById(@PathVariable Long id) {
        Phone phone = phoneRepository.findById(id).orElse(null);
        if (phone == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Phone not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(phone);
    }

    // Create phone (Admin Only logically - checked by security configuration in real apps)
    @PostMapping
    public ResponseEntity<Phone> createPhone(@RequestBody Phone phone) {
        if (phone.getStock() == null) {
            phone.setStock(0);
        }
        phone.setStatus(phone.getStock() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        
        Phone savedPhone = phoneRepository.save(phone);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPhone);
    }

    // Update phone (Admin Only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePhone(@PathVariable Long id, @RequestBody Phone phoneDetails) {
        Phone phone = phoneRepository.findById(id).orElse(null);
        if (phone == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Phone not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        phone.setBrand(phoneDetails.getBrand());
        phone.setModel(phoneDetails.getModel());
        phone.setImageUrl(phoneDetails.getImageUrl());
        phone.setPricePerDay(phoneDetails.getPricePerDay());
        phone.setDescription(phoneDetails.getDescription());
        phone.setSpecProcessor(phoneDetails.getSpecProcessor());
        phone.setSpecScreen(phoneDetails.getSpecScreen());
        phone.setSpecCamera(phoneDetails.getSpecCamera());
        phone.setSpecBattery(phoneDetails.getSpecBattery());
        phone.setSpecStorage(phoneDetails.getSpecStorage());
        phone.setStock(phoneDetails.getStock());
        phone.setStatus(phoneDetails.getStock() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");

        Phone updatedPhone = phoneRepository.save(phone);
        return ResponseEntity.ok(updatedPhone);
    }

    // Delete phone (Admin Only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePhone(@PathVariable Long id) {
        Phone phone = phoneRepository.findById(id).orElse(null);
        if (phone == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Phone not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        phoneRepository.delete(phone);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Phone deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
