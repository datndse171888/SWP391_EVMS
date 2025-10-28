
export type ServicePackageStatus = 'active' | 'inactive' | 'hidden';

export interface ServicePackageResponse {
    _id: string;
    name: string;
    description: string;
    price: number; // using Number for simplicity; can switch to Decimal128 if needed
    duration: number; // minutes or hours depending on business rule
    discount: number; // percentage discount, optional
    services: ServiceInPackage[];
    status: ServicePackageStatus
    createAt: string;
    updateAt: string;
}

export interface ServiceInPackage {
  serviceID: string;
  name: string;
  price: number;
  duration: number;
}