import type { ChecklistRequest, ChecklistResponse, TaskStatus } from "../types/Checklist";
import { api } from "../utils/Axios";

export const ChecklistApi = {
    createChecklist: (request: ChecklistRequest) => {
        return api.post<ChecklistResponse[]>('/checklists', request);
    },

    getByAppointmentId: (appointmentId: string) => {
        return api.get<ChecklistResponse[]>(`/checklists/appointment/${appointmentId}`);
    },

    updateStatus: (taskId: string, status: TaskStatus) => {
        return api.patch<{ success: boolean; message: string; data: { checklist: ChecklistResponse } }>(`/checklists/${taskId}/status`, { status });
    },

    assignTechnician: (taskId: string, technicianID: string) => {
        return api.patch<{ success: boolean; message: string; data: { checklist: ChecklistResponse } }>(`/checklists/${taskId}/assign-technician`, { technicianID });
    }
}