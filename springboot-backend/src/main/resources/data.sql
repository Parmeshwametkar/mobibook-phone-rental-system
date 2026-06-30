-- Insert initial users (plain passwords for testing)
INSERT INTO users (id, username, email, password, role) VALUES 
(1, 'admin', 'admin@phonebooking.com', 'adminpassword', 'ADMIN'),
(2, 'john_doe', 'john@example.com', 'password123', 'USER')
ON DUPLICATE KEY UPDATE username=username;

-- Insert premium phone stock catalog
INSERT INTO phones (id, brand, model, image_url, price_per_day, description, spec_processor, spec_screen, spec_camera, spec_battery, spec_storage, stock, status) VALUES
(1, 'Apple', 'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600', 45.00, 'Experience the pinnacle of Apples smartphone tech with the iPhone 15 Pro Max. Powered by the A17 Pro chip.', 'Apple A17 Pro (3nm)', '6.7-inch Super Retina XDR OLED, 120Hz', '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto', '4441 mAh with 25W fast charging', '256GB / 512GB / 1TB', 5, 'AVAILABLE'),
(2, 'Samsung', 'Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600', 42.00, 'Unleash ultimate power with the Galaxy S24 Ultra, featuring Galaxy AI capabilities, a built-in S Pen, and a 200MP camera.', 'Snapdragon 8 Gen 3 for Galaxy', '6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz', '200MP Main + 50MP Telephoto + 10MP Telephoto + 12MP Ultra Wide', '5000 mAh with 45W fast charging', '256GB / 512GB / 1TB', 4, 'AVAILABLE'),
(3, 'Google', 'Pixel 8 Pro', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600', 35.00, 'The all-pro phone engineered by Google. It has the custom Google Tensor G3 chip and a triple-camera system.', 'Google Tensor G3', '6.7-inch Super Actua LTPO OLED, 120Hz', '50MP Main + 48MP Ultra Wide + 48MP 5x Zoom', '5050 mAh with 30W charging', '128GB / 256GB / 512GB', 3, 'AVAILABLE'),
(4, 'OnePlus', 'OnePlus 12', 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=600', 30.00, 'The OnePlus 12 redefines flagship performance with dual-vapor chamber cooling and Hasselblad camera tuning.', 'Snapdragon 8 Gen 3', '6.82-inch LTPO AMOLED, 2K, 120Hz, 4500 nits', '50MP Main + 64MP Periscope + 48MP Ultra Wide', '5400 mAh with 100W fast charging', '256GB / 512GB', 0, 'OUT_OF_STOCK')
ON DUPLICATE KEY UPDATE model=model;

-- Insert sample reservation booking
INSERT INTO bookings (id, user_id, phone_id, start_date, end_date, total_price, status, booking_date) VALUES
(1, 2, 2, '2026-07-05', '2026-07-08', 126.00, 'CONFIRMED', '2026-06-29')
ON DUPLICATE KEY UPDATE status=status;
