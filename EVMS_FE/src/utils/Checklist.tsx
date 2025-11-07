import type { TaskStatus } from "../types/Checklist";

export const getStatusLabel = (status: TaskStatus) => {
    const labels = {
        pending: 'Chờ xác nhận',
        in_progress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        skipped: 'Bỏ qua'
    };
    return labels[status];
};

export const getStatusColor = (status: TaskStatus) => {
    const cardColors = {
        pending: 'bg-yellow-50 text-yellow-700',
        in_progress: 'bg-purple-50 text-purple-700',
        completed: 'bg-green-50 text-green-700',
        skipped: 'bg-gray-50 text-gray-600',
    };
    return cardColors[status];
};