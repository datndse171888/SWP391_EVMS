import type { TaskStatus } from "../types/Checklist";
import type { ReportRequest, ReportResponse } from "../types/Report";
import { api } from "../utils/Axios";

export const ReportApi = {
    createReport: (reportRequest: ReportRequest) => {
        return api.post<ReportResponse>('/vehicle-condition-reports', reportRequest);
    },

    getReportsByAppointment: (appointmentId: string) => {
        return api.get<{ success: boolean; data: ReportResponse[] }>(`/vehicle-condition-reports/appointment/${appointmentId}`);
    },

    updateStatus: (taskId: string, status: TaskStatus) => {
        return api.patch(`/checklists${taskId}/status`, { status });
    }
}