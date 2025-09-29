export interface AccountLogin{
    email: string;
    password: string;
}

export interface AccountRegister{
    email: string;
    userName: string;
    fullName: string;
    password: string;
    phoneNumber: string;
    gender: string;
    photoURL: string;
    role: ' admin' | 'staff' | 'technician' | 'customer';


}