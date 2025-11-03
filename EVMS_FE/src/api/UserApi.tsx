import type { UserResponse } from "../types/Account";
import type { CheckingResponse } from "../types/DataResponse";
import { api } from "../utils/Axios";

export const UserApi = {
    getById: (userId: string) => {
        return api.get<CheckingResponse<UserResponse>>(`/users/${userId}`);
    }
}