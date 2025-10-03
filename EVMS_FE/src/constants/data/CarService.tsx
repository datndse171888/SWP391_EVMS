import { Wrench } from 'lucide-react';
import type { CarService } from '../../types/vehicle/Car';

export const carService : CarService[] = [
    {
        icon: Wrench,
        title: 'Maintenance Services',
        description: 'Regular maintenance services to keep your car running smoothly and efficiently.',
        features: ['Oil Changes', 'Filter Replacements', 'Fluid Checks', 'Tire Rotations', 'Battery Testing', 'Belts & Hoses'],
        image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
];