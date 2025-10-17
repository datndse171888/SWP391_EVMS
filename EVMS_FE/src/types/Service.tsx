export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    image: string;
    vehicleType?: 'electric_bike' | 'electric_motorcycle' | 'electric_car';
    pricing?: { category: 'CAR' | 'BICYCLE' | 'MOTOBIKE'; price: number }[];
}

// dùng để làm giao diện không lấy từ database
export interface Reason {
    id: number;
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
}

export interface Package {
  id: number;
  service_type_id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  display_order: number;
  created_at: string;
}

export interface IndividualService {
  id: number;
  service_type_id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  display_order: number;
  created_at: string;
}

