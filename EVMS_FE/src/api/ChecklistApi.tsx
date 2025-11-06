import type { ChecklistRequest, ChecklistResponse } from "../types/Checklist";
import { api } from "../utils/Axios";

export const ChecklistApi = {
    createChecklist: (request: ChecklistRequest) => {
        return api.post<ChecklistResponse[]>('/checklists', request);
    },

    getByAppointmentId: (appointmentId: string) => {
        return api.get<ChecklistResponse[]>(`/checklists/appointment/${appointmentId}`);
    }
}