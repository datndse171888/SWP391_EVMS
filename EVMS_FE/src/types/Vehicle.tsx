export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    mileage: number;
    price: number;
    features: string[];
}

export interface VehicleService {
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    image: string;
}

export type VehicleCategory = 'CAR' | 'BICYCLE' | 'MOTOBIKE';

