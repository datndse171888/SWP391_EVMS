import type { UserResponse } from "../types/Account";
import { api } from "../utils/Axios";

export const UserApi = {
    getById: (userId: string) => {
        return api.get<CheckingResponse<UserResponse>>(`/users/${userId}`);
    },

    // API đúng theo userController.getUserById: trả về object user trực tiếp
    getUserById: (userId: string) => {
        return api.get<UserResponse>(`/users/${userId}`);
    }
}