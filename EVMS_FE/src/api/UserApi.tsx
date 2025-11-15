import type { UserResponse } from "../types/Account";
import { api } from "../utils/Axios";

export const UserApi = {

    // API đúng theo userController.getUserById: trả về object user trực tiếp
    getById: (userId: string) => {
        return api.get<UserResponse>(`/users/${userId}`);
    },

    // Disable user
    disableUser: (userId: string) => {
        return api.patch<{ success: boolean; message: string; data: { user: UserResponse } }>(`/users/${userId}/disable`);
    },

    // Enable user
    enableUser: (userId: string) => {
        return api.patch<{ success: boolean; message: string; data: { user: UserResponse } }>(`/users/${userId}/enable`);
    },

    // Toggle user status (alternative approach)
    toggleUserStatus: (userId: string, isDisabled: boolean) => {
        return api.patch<{ success: boolean; message: string; data: { user: UserResponse } }>(`/users/${userId}/status`, { isDisabled });
    }
}