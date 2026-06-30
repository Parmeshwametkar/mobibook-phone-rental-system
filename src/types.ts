export interface Phone {
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

export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  token?: string;
}

export interface Booking {
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
