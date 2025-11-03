export interface DataResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
}

export interface CheckingResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface FilteredDataResponse<T> {
    data: T[];
    filters: Object;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}