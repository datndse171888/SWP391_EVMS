import { Car, Wrench, Zap, Shield, Clock, Settings, Cog, DollarSign, AlertTriangle, Heart} from 'lucide-react';
import type { Reason } from '../../types/Service';

// export const services: Service[] = [
//     {
//         id: 1,
//         name: "Car Service",
//         description: "Comprehensive car maintenance and repair services",
//         price: 99.99,
//         duration: "1 hour",
//         image: "car_service.jpg"
//     },
//     {
//         id: 2,
//         name: "Moto Service",
//         description: "Expert motorcycle maintenance and repair services",
//         price: 79.99,
//         duration: "45 minutes",
//         image: "moto_service.jpg"
//     },
//     {
//         id: 3,
//         name: "Bike Service",
//         description: "Professional bike maintenance and repair services",
//         price: 49.99,
//         duration: "30 minutes",
//         image: "bike_service.jpg"
//     }
// ];
export const reasons: Reason[] = [
     {
        id: 1,
            icon: Shield,
            title: 'An toàn là trên hết',
            description: 'Bảo trì định kỳ đảm bảo tất cả các hệ thống an toàn hoạt động đúng cách, bảo vệ bạn và hành khách.',
            color: 'bg-red-500'
        },
        {
            id: 2,  
            icon: DollarSign,
            title: 'Tiết kiệm chi phí',
            description: 'Bảo trì phòng ngừa tốn ít chi phí hơn nhiều so với sửa chữa lớn và kéo dài tuổi thọ của xe.',
            color: 'bg-green-500'
        },
        {
            id: 3,
            icon: Clock,
            title: 'Độ tin cậy',
            description: 'Những chiếc xe được bảo trì tốt ít có khả năng hỏng hóc hơn, đảm bảo bạn đến nơi đúng giờ.',
            color: 'bg-blue-500'
        },
        {
            id: 4,
            icon: Zap,
            title: 'Hiệu suất',
            description: 'Bảo trì định kỳ giúp xe của bạn hoạt động với hiệu suất tối ưu và tiết kiệm nhiên liệu.',
            color: 'bg-yellow-500'
        },
        {
            id: 5,
            icon: AlertTriangle,
            title: 'Phát hiện sớm',
            description: 'Kiểm tra định kỳ giúp phát hiện sớm các vấn đề nhỏ trước khi chúng trở thành những vấn đề lớn tốn kém.',
            color: 'bg-orange-500'
        },
        {
            id: 6,
            icon: Heart,
            title: 'Tuổi thọ',
            description: 'Bảo trì đúng cách giúp kéo dài đáng kể tuổi thọ của xe và duy trì giá trị của nó.',
            color: 'bg-purple-500'
        }
    ]