import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Interfaces
interface Phone {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  pricePerDay: number;
  description: string;
  specs: {
    processor: string;
    screen: string;
    camera: string;
    battery: string;
    storage: string;
  };
  stock: number;
  status: "AVAILABLE" | "OUT_OF_STOCK";
}

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN";
}

interface Booking {
  id: number;
  userId: number;
  username: string;
  phoneId: number;
  phoneDetails: {
    brand: string;
    model: string;
    imageUrl: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  bookingDate: string;
}

// In-memory Database
let users: User[] = [
  { id: 1, username: "admin", email: "admin@phonebooking.com", password: "adminpassword", role: "ADMIN" },
  { id: 2, username: "john_doe", email: "john@example.com", password: "password123", role: "USER" }
];

let phones: Phone[] = [
  {
    id: 1,
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    pricePerDay: 45,
    description: "Experience the pinnacle of Apple's smartphone tech with the iPhone 15 Pro Max. Powered by the A17 Pro chip and housed in light yet durable aerospace-grade titanium.",
    specs: {
      processor: "Apple A17 Pro (3nm)",
      screen: "6.7-inch Super Retina XDR OLED, 120Hz",
      camera: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto",
      battery: "4441 mAh with 25W fast charging",
      storage: "256GB / 512GB / 1TB"
    },
    stock: 5,
    status: "AVAILABLE"
  },
  {
    id: 2,
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600",
    pricePerDay: 42,
    description: "Unleash ultimate power with the Galaxy S24 Ultra, featuring Galaxy AI capabilities, a built-in S Pen, and an industry-leading 200MP camera system.",
    specs: {
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      screen: "6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz",
      camera: "200MP Main + 50MP Telephoto + 10MP Telephoto + 12MP Ultra Wide",
      battery: "5000 mAh with 45W fast charging",
      storage: "256GB / 512GB / 1TB"
    },
    stock: 4,
    status: "AVAILABLE"
  },
  {
    id: 3,
    brand: "Google",
    model: "Pixel 8 Pro",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600",
    pricePerDay: 35,
    description: "The all-pro phone engineered by Google. It has the custom Google Tensor G3 chip, a sophisticated triple-camera system, and cutting-edge artificial intelligence features.",
    specs: {
      processor: "Google Tensor G3",
      screen: "6.7-inch Super Actua LTPO OLED, 120Hz",
      camera: "50MP Main + 48MP Ultra Wide + 48MP 5x Zoom",
      battery: "5050 mAh with 30W charging",
      storage: "128GB / 256GB / 512GB"
    },
    stock: 3,
    status: "AVAILABLE"
  },
  {
    id: 4,
    brand: "OnePlus",
    model: "OnePlus 12",
    imageUrl: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=600",
    pricePerDay: 30,
    description: "The OnePlus 12 redefines flagship performance with the dual-vapor chamber cooling, Hasselblad camera tuning, and hyper-fast 100W SuperVOOC wired charging.",
    specs: {
      processor: "Snapdragon 8 Gen 3",
      screen: "6.82-inch LTPO AMOLED, 2K, 120Hz, 4500 nits",
      camera: "50MP Main + 64MP Periscope + 48MP Ultra Wide",
      battery: "5400 mAh with 100W fast charging",
      storage: "256GB / 512GB"
    },
    stock: 0,
    status: "OUT_OF_STOCK"
  }
];

let bookings: Booking[] = [
  {
    id: 1,
    userId: 2,
    username: "john_doe",
    phoneId: 2,
    phoneDetails: {
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600"
    },
    startDate: "2026-07-05",
    endDate: "2026-07-08",
    totalPrice: 126,
    status: "CONFIRMED",
    bookingDate: "2026-06-29"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. Token missing." });
    }

    try {
      // Decode token (simulated token contains user-id: "user-ID-role")
      const parts = token.split("-");
      const userId = parseInt(parts[0], 10);
      const user = users.find(u => u.id === userId);

      if (!user) {
        return res.status(403).json({ message: "Invalid session." });
      }

      req.user = user;
      next();
    } catch (e) {
      res.status(403).json({ message: "Token expired or invalid." });
    }
  };

  // ==========================================
  // AUTH API
  // ==========================================

  // Register
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (users.some(u => u.username === username || u.email === email)) {
      return res.status(400).json({ message: "Username or Email already exists." });
    }

    const newUser: User = {
      id: users.length + 1,
      username,
      email,
      password,
      role: role === "ADMIN" ? "ADMIN" : "USER"
    };

    users.push(newUser);

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;
    const token = `${newUser.id}-${newUser.username}-${newUser.role}`;

    res.status(201).json({
      ...userWithoutPassword,
      token
    });
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/Email and password are required." });
    }

    const user = users.find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = `${user.id}-${user.username}-${user.role}`;

    res.json({
      ...userWithoutPassword,
      token
    });
  });

  // ==========================================
  // PHONES API
  // ==========================================

  // Get all phones
  app.get("/api/phones", (req, res) => {
    const { search, brand } = req.query;
    let filteredPhones = [...phones];

    if (search) {
      const searchStr = (search as string).toLowerCase();
      filteredPhones = filteredPhones.filter(
        p => p.brand.toLowerCase().includes(searchStr) || p.model.toLowerCase().includes(searchStr)
      );
    }

    if (brand && brand !== "All") {
      filteredPhones = filteredPhones.filter(
        p => p.brand.toLowerCase() === (brand as string).toLowerCase()
      );
    }

    res.json(filteredPhones);
  });

  // Get phone details
  app.get("/api/phones/:id", (req, res) => {
    const phoneId = parseInt(req.params.id, 10);
    const phone = phones.find(p => p.id === phoneId);

    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    res.json(phone);
  });

  // Create Phone (Admin only)
  app.post("/api/phones", authenticateToken, (req: any, res) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin role required." });
    }

    const { brand, model, imageUrl, pricePerDay, description, specs, stock } = req.body;

    if (!brand || !model || !pricePerDay || stock === undefined) {
      return res.status(400).json({ message: "Missing required phone parameters." });
    }

    const newPhone: Phone = {
      id: phones.length > 0 ? Math.max(...phones.map(p => p.id)) + 1 : 1,
      brand,
      model,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
      pricePerDay: parseFloat(pricePerDay),
      description: description || "",
      specs: specs || {
        processor: "N/A",
        screen: "N/A",
        camera: "N/A",
        battery: "N/A",
        storage: "N/A"
      },
      stock: parseInt(stock, 10),
      status: parseInt(stock, 10) > 0 ? "AVAILABLE" : "OUT_OF_STOCK"
    };

    phones.push(newPhone);
    res.status(201).json(newPhone);
  });

  // Update Phone (Admin only)
  app.put("/api/phones/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin role required." });
    }

    const phoneId = parseInt(req.params.id, 10);
    const index = phones.findIndex(p => p.id === phoneId);

    if (index === -1) {
      return res.status(404).json({ message: "Phone not found." });
    }

    const { brand, model, imageUrl, pricePerDay, description, specs, stock } = req.body;

    const currentPhone = phones[index];
    const updatedStock = stock !== undefined ? parseInt(stock, 10) : currentPhone.stock;

    phones[index] = {
      ...currentPhone,
      brand: brand || currentPhone.brand,
      model: model || currentPhone.model,
      imageUrl: imageUrl || currentPhone.imageUrl,
      pricePerDay: pricePerDay !== undefined ? parseFloat(pricePerDay) : currentPhone.pricePerDay,
      description: description || currentPhone.description,
      specs: specs || currentPhone.specs,
      stock: updatedStock,
      status: updatedStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK"
    };

    res.json(phones[index]);
  });

  // Delete Phone (Admin only)
  app.delete("/api/phones/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin role required." });
    }

    const phoneId = parseInt(req.params.id, 10);
    const index = phones.findIndex(p => p.id === phoneId);

    if (index === -1) {
      return res.status(404).json({ message: "Phone not found." });
    }

    phones.splice(index, 1);
    res.json({ message: "Phone deleted successfully." });
  });

  // ==========================================
  // BOOKINGS API
  // ==========================================

  // Get user booking history / All bookings for Admin
  app.get("/api/bookings", authenticateToken, (req: any, res) => {
    if (req.user.role === "ADMIN") {
      res.json(bookings);
    } else {
      const userBookings = bookings.filter(b => b.userId === req.user.id);
      res.json(userBookings);
    }
  });

  // Book a phone
  app.post("/api/bookings", authenticateToken, (req: any, res) => {
    const { phoneId, startDate, endDate, remarks } = req.body;

    if (!phoneId || !startDate || !endDate) {
      return res.status(400).json({ message: "Phone, start date, and end date are required." });
    }

    const targetPhoneId = parseInt(phoneId, 10);
    const phone = phones.find(p => p.id === targetPhoneId);

    if (!phone) {
      return res.status(404).json({ message: "Phone not found." });
    }

    if (phone.stock <= 0) {
      return res.status(400).json({ message: "Phone is currently out of stock." });
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      return res.status(400).json({ message: "End date must be after start date." });
    }

    const totalPrice = daysDiff * phone.pricePerDay;

    // Decrement phone stock
    phone.stock -= 1;
    if (phone.stock === 0) {
      phone.status = "OUT_OF_STOCK";
    }

    const newBooking: Booking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
      userId: req.user.id,
      username: req.user.username,
      phoneId: phone.id,
      phoneDetails: {
        brand: phone.brand,
        model: phone.model,
        imageUrl: phone.imageUrl
      },
      startDate,
      endDate,
      totalPrice,
      status: "CONFIRMED",
      bookingDate: new Date().toISOString().split("T")[0]
    };

    bookings.unshift(newBooking); // Add to beginning of history
    res.status(201).json(newBooking);
  });

  // Cancel a booking
  app.delete("/api/bookings/:id", authenticateToken, (req: any, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = bookings[bookingIndex];

    // Ensure user cancels their own booking, or is admin
    if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking." });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    // Update booking status
    booking.status = "CANCELLED";

    // Restore stock of phone
    const phone = phones.find(p => p.id === booking.phoneId);
    if (phone) {
      phone.stock += 1;
      phone.status = "AVAILABLE";
    }

    res.json({ message: "Booking cancelled successfully.", booking });
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite middleware in dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
