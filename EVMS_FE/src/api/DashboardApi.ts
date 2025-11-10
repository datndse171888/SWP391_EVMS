import { api } from "../utils/Axios";

export type TechnicianOverviewItem = {
  _id?: string;
  bookingDate?: string;
  status?: string;
  userID?: { fullName?: string; userName?: string };
  serviceID?: { name?: string };
  servicePackageID?: { name?: string };
};

export type TechnicianOverviewResponse = {
  stats: { totalToday: number; confirmedToday: number; inProgressToday: number };
  inventory: { totalLowStock: number; totalInStock: number };
  progress: { 
    leftTotal: number; // confirmed + awaiting_payment
    leftPercent: number; // awaiting_payment / pending
    rightTotal: number; // checklist pending + appointments awaiting_payment
    rightPercent: number; // awaiting_payment / pending (checklist)
    gaugeProgressRate: number; // completed / pending (checklist) - cho vòng tròn tiến độ
  };
  performance: { label: string; completed: number }[];
  upcoming: TechnicianOverviewItem[];
  range: string;
};

export const DashboardApi = {
  getTechnicianOverview: (range?: "today" | "week" | "month") => {
    const qs = range ? `?range=${range}` : "";
    return api.get<TechnicianOverviewResponse>(`/dashboard/technician/overview${qs}`);
  },
};

export default DashboardApi;


