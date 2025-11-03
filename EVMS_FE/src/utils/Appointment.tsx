import type { AppointmentStatus } from "../types/Appoitment";

export const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-green-100 text-green-800 border-green-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
        completed: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        no_show: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || colors.pending;
};

export const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        in_progress: 'Đang thực hiện',
        awaiting_payment: 'Chờ thanh toán',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        no_show: 'Không đến'
    };
    return labels[status] || status;
};

const cardColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-pink-50 border-pink-200',
    'bg-purple-50 border-purple-200',
    'bg-yellow-50 border-yellow-200',
    'bg-indigo-50 border-indigo-200'
];

export const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];