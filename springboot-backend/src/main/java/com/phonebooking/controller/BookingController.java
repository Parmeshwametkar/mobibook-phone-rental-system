package com.phonebooking.controller;

import com.phonebooking.dto.BookingRequest;
import com.phonebooking.model.Booking;
import com.phonebooking.model.Phone;
import com.phonebooking.model.Role;
import com.phonebooking.model.User;
import com.phonebooking.repository.BookingRepository;
import com.phonebooking.repository.PhoneRepository;
import com.phonebooking.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PhoneRepository phoneRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to simulate user extraction from standard custom token header
    private User extractUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        try {
            String[] parts = token.split("-");
            Long userId = Long.parseLong(parts[0]);
            return userRepository.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // Get bookings (Admins get all logs, standard users get their own logs)
    @GetMapping
    public ResponseEntity<?> getBookingHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = extractUserFromToken(authHeader);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Unauthorized! Token is missing or invalid.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (user.getRole() == Role.ADMIN) {
            // Admins get system-wide booking registers
            List<Booking> allBookings = bookingRepository.findAllByOrderByBookingDateDesc();
            return ResponseEntity.ok(allBookings);
        } else {
            // Users get personal logs
            List<Booking> userBookings = bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId());
            return ResponseEntity.ok(userBookings);
        }
    }

    // Book a phone
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody BookingRequest bookingRequest) {

        User user = extractUserFromToken(authHeader);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Unauthorized! Token is missing or invalid.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Phone phone = phoneRepository.findById(bookingRequest.getPhoneId()).orElse(null);
        if (phone == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Phone not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (phone.getStock() <= 0) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Phone is currently out of stock!");
            return ResponseEntity.badRequest().body(response);
        }

        // Validate date ranges
        long daysDiff = ChronoUnit.DAYS.between(bookingRequest.getStartDate(), bookingRequest.getEndDate());
        if (daysDiff <= 0) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: End date must be at least 1 day after start date.");
            return ResponseEntity.badRequest().body(response);
        }

        // Calculate pricing
        BigDecimal totalPrice = phone.getPricePerDay().multiply(BigDecimal.valueOf(daysDiff));

        // Decrement phone stock
        phone.setStock(phone.getStock() - 1);
        if (phone.getStock() == 0) {
            phone.setStatus("OUT_OF_STOCK");
        }
        phoneRepository.save(phone);

        // Record reservation booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPhone(phone);
        booking.setStartDate(bookingRequest.getStartDate());
        booking.setEndDate(bookingRequest.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus("CONFIRMED");
        booking.setBookingDate(LocalDate.now());

        Booking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBooking);
    }

    // Cancel a booking
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {

        User user = extractUserFromToken(authHeader);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Unauthorized! Token is missing or invalid.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Booking record not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Security check: Only Admins or the owner can cancel
        if (user.getRole() != Role.ADMIN && !booking.getUser().getId().equals(user.getId())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Unauthorized to cancel this booking!");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (booking.getStatus().equalsIgnoreCase("CANCELLED")) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Booking is already cancelled!");
            return ResponseEntity.badRequest().body(response);
        }

        // Cancel booking
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // Restore stock
        Phone phone = booking.getPhone();
        phone.setStock(phone.getStock() + 1);
        phone.setStatus("AVAILABLE");
        phoneRepository.save(phone);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully.");
        return ResponseEntity.ok(response);
    }
}
