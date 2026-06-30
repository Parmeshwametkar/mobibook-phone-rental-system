package com.phonebooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "phones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Phone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "spec_processor", length = 100)
    private String specProcessor;

    @Column(name = "spec_screen", length = 150)
    private String specScreen;

    @Column(name = "spec_camera", length = 150)
    private String specCamera;

    @Column(name = "spec_battery", length = 100)
    private String specBattery;

    @Column(name = "spec_storage", length = 100)
    private String specStorage;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, OUT_OF_STOCK

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
