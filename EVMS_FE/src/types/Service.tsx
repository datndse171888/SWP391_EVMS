export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    image: string;
    vehicleType?: 'electric_bike' | 'electric_motorcycle' | 'electric_car';
    pricing?: { category: 'CAR' | 'BICYCLE' | 'MOTOBIKE'; price: number }[];
}

 
