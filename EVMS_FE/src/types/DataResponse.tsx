export interface DataResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
}

export interface CheckingResponse<T> {
    success: boolean;
    message: string;
    data: T;
}