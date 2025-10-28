import type { ServiceResponse } from "../../types/Service";
import type { ServicePackageResponse } from "../../types/ServicePackage";

export const samplePackages: ServicePackageResponse[] = [
        {
            _id: "1",
            vehicleCategory: "BICYCLE",
            discount: 5,
            status: "active",
            createAt: "2024-01-01T00:00:00Z",
            updateAt: "2024-01-01T00:00:00Z",
            name: "Gói bảo dưỡng cơ bản",
            description: "Kiểm tra và bảo dưỡng tổng thể cho xe đạp điện",
            price: 150000,
            duration: 90,
            services: [
                {
                    _id: "1",
                    name: "Kiểm tra phanh và điều chỉnh",
                    description: "Đảm bảo hệ thống phanh hoạt động hiệu quả",
                    price: 50000,
                    duration: 30,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "2",
                    name: "Bôi trơn xích và bánh răng",
                    description: "Giúp xích và bánh răng hoạt động mượt mà",
                    price: 40000,
                    duration: 20,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "3",
                    name: "Kiểm tra lốp và bơm hơi",
                    description: "Đảm bảo lốp xe luôn trong tình trạng tốt nhất",
                    price: 30000,
                    duration: 20,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "4",
                    name: "Vệ sinh xe cơ bản",
                    description: "Làm sạch bề mặt xe và các bộ phận chính",
                    price: 30000,
                    duration: 20,
                    image: "",
                    vehicleCategory: "BICYCLE"
                }
            ]
        },
        {
            _id: "2",
            vehicleCategory: "BICYCLE",
            discount: 10,
            status: "active",
            createAt: "2024-01-01T00:00:00Z",
            updateAt: "2024-01-01T00:00:00Z",
            name: "Gói bảo dưỡng nâng cao",
            description: "Bảo dưỡng toàn diện với kiểm tra điện và thay thế linh kiện",
            price: 250000,
            duration: 120,
            services: [
                {
                    _id: "5",
                    name: "Kiểm tra hệ thống điện",
                    description: "Đảm bảo hệ thống điện hoạt động ổn định",
                    price: 80000,
                    duration: 40,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "6",
                    name: "Thay thế má phanh",
                    description: "Lắp đặt má phanh mới cho hiệu suất tối ưu",
                    price: 70000,
                    duration: 30,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "7",
                    name: "Cân chỉnh bánh xe",
                    description: "Đảm bảo bánh xe quay trơn tru và không bị lệch",
                    price: 50000,
                    duration: 25,
                    image: "",
                    vehicleCategory: "BICYCLE"
                }
            ]
        },
        {
            _id: "3",
            vehicleCategory: "BICYCLE",
            discount: 15,
            status: "active",
            createAt: "2024-01-01T00:00:00Z",
            updateAt: "2024-01-01T00:00:00Z",
            name: "Gói bảo dưỡng cao cấp",
            description: "Dịch vụ bảo dưỡng premium với thay thế và nâng cấp toàn bộ",
            price: 400000,
            duration: 180,
            services: [
                {
                    _id: "8",
                    name: "Thay pin mới",
                    description: "Lắp đặt pin mới chính hãng",
                    price: 150000,
                    duration: 60,
                    image: "",
                    vehicleCategory: "BICYCLE"
                },
                {
                    _id: "9",
                    name: "Nâng cấp hệ thống đèn LED",
                    description: "Cải thiện độ sáng và hiệu suất năng lượng",
                    price: 100000,
                    duration: 40,
                    image: "",
                    vehicleCategory: "BICYCLE"
                }
            ]
        }
    ];

export const sampleServices: ServiceResponse[] = [
        {
            _id: "1",
            name: "Kiểm tra phanh và điều chỉnh",
            description: "Đảm bảo hệ thống phanh hoạt động hiệu quả",
            price: 50000,
            duration: 30,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "2",
            name: "Bôi trơn xích và bánh răng",
            description: "Giúp xích và bánh răng hoạt động mượt mà",
            price: 40000,
            duration: 20,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "3",
            name: "Kiểm tra lốp và bơm hơi",
            description: "Đảm bảo lốp xe luôn trong tình trạng tốt nhất",
            price: 30000,
            duration: 20,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "4",
            name: "Vệ sinh xe cơ bản",
            description: "Làm sạch bề mặt xe và các bộ phận chính",
            price: 30000,
            duration: 20,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "5",
            name: "Kiểm tra hệ thống điện",
            description: "Đảm bảo hệ thống điện hoạt động ổn định",
            price: 80000,
            duration: 40,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "6",
            name: "Thay thế má phanh",
            description: "Lắp đặt má phanh mới cho hiệu suất tối ưu",
            price: 70000,
            duration: 30,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "7",
            name: "Cân chỉnh bánh xe",
            description: "Đảm bảo bánh xe quay trơn tru và không bị lệch",
            price: 50000,
            duration: 25,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "8",
            name: "Thay pin mới",
            description: "Lắp đặt pin mới chính hãng",
            price: 150000,
            duration: 60,
            image: "",
            vehicleCategory: "BICYCLE"
        },
        {
            _id: "9",
            name: "Nâng cấp hệ thống đèn LED",
            description: "Cải thiện độ sáng và hiệu suất năng lượng",
            price: 100000,
            duration: 40,
            image: "",
            vehicleCategory: "BICYCLE"
        }
    ];