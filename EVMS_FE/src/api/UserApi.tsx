import type { UserResponse } from "../types/Account";
import { api } from "../utils/Axios";

export const UserApi = {

    // API đúng theo userController.getUserById: trả về object user trực tiếp
    getById: (userId: string) => {
        return api.get<UserResponse>(`/users/${userId}`);
    }
}