export interface DataResponse<T> {
    items: T;
    page: number;
    limit: number;
    total: number;
}