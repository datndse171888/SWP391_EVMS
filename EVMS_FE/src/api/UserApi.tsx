import type { UserResponse } from "../types/Account";
import { api } from "../utils/Axios";

export const UserApi = {
    getById: (userId: string) => {
        return api.get<UserResponse>(`/users/${userId}`);
    }
}