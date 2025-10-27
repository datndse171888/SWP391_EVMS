export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

export const formatDuration = (duration: number) => {
    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
};