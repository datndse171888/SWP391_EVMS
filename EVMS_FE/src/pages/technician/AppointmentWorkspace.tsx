import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { technicianApi } from '../../api/TechnicianApi';
import type { ChecklistResponse, Task, TaskStatus } from '../../types/Checklist';
import type { TechnicianResponse } from '../../types/Technician';
import type { CheckingResponse } from '../../types/DataResponse';
import { AppointmentApi } from '../../api/AppointmentApi';
import type { AppointmentResponse } from '../../types/Appoitment';
import { ChecklistApi } from '../../api/ChecklistApi';
import type { ServiceResponse } from '../../types/Service';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import { ServiceApi } from '../../api/ServiceApi';
import { UserApi } from '../../api/UserApi';
import type { UserResponse } from '../../types/Account';
import type { VehicleResponse } from '../../types/Vehicle';
import { VehicleApi } from '../../api/VehicleApi';
import type { ReportRequest } from '../../types/Report';

type ReportStage = 'before-service' | 'after-service';

const AppointmentWorkspace: React.FC = () => {

  // ===================================
  // States & Variables
  // ===================================

  const { appointmentId } = useParams<{ appointmentId: string }>();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  // search & filter
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const { user } = useAuth();

  const [techInfo, setTechInfo] = useState<TechnicianResponse>();
  const [appointment, setAppointment] = useState<AppointmentResponse>();
  const [checklist, setChecklist] = useState<ChecklistResponse[]>([]);
  const [info, setInfo] = useState<ServiceResponse | ServicePackageResponse>();
  const [customer, setCustomer] = useState<UserResponse>();
  const [vehicle, setVehicle] = useState<VehicleResponse>();

  // UI state
  const [leaderTab, setLeaderTab] = useState<'info' | 'tasks' | 'reports'>('info');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState<null | ReportStage>(null);

  // data
  const [task, setTask] = useState<Task[]>([]);
  const [report, setReport] = useState<ReportRequest>();


  // ==================================
  // useEffect
  // ==================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const techInfoResponse = await technicianApi.getTechnicianInfo(user?.id || '');
      const techInfoData: CheckingResponse<TechnicianResponse> = techInfoResponse.data;
      if (techInfoData.data) {
        setTechInfo(techInfoData.data);
      }

      const appointmentResponse = await AppointmentApi.getAppointmentById(appointmentId || '');
      const appointmentData: AppointmentResponse = appointmentResponse.data;
      if (appointmentData) {
        setAppointment(appointmentData);
      }

      const checklistResponse = await ChecklistApi.getByAppointmentId(appointmentId || '');
      const checklistData: ChecklistResponse[] = checklistResponse.data;
      if (checklistData) {
        setChecklist(checklistData);
      }

      const customerResponse = await UserApi.getById(appointmentData.userID);
      const customerData: UserResponse = customerResponse.data;
      if (customerData) {
        setCustomer(customerData);
      }

      const vehicleResponse = await VehicleApi.getVehicleById(appointmentData.vehicleID);
      const vehicleData: VehicleResponse = vehicleResponse.data;
      if (vehicleData) {
        setVehicle(vehicleData);
      }

      if (appointmentData.servicePackageID) {
        const servicePackageResponse = await ServicePackageApi.getServicePackageById(appointmentData.servicePackageID);
        const servicePackageData: ServicePackageResponse = servicePackageResponse.data;
        if (servicePackageData) {
          setInfo(servicePackageData);
        }
      } else if (appointmentData.serviceID) {
        const serviceResponse = await ServiceApi.getServiceById(appointmentData.serviceID);
        const serviceData: ServiceResponse = serviceResponse.data;
        if (serviceData) {
          setInfo(serviceData);
        }
      }

    } catch (error) {
      console.error('Failed to fetch appointment data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // const taskToTech = async (taskId: string, technicianId: string) => {
  //   // API call to assign task to technician
  // }

  // const changeTaskStatus = async (taskId: string, status: TaskStatus) => {
  //   // API call to change task status
  // }

  // const handleCreateTask = async (taskName: string, technicianId: string) => {
  //   // API call to create task
  // }

  const isLeader = techInfo?.role === 'leader';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Appointment</div>

          {appointment?.servicePackageID &&
            <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
              {(info as ServicePackageResponse).name}
            </h1>}
          {appointment?.serviceID &&
            <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
              {(info as ServiceResponse).name}
            </h1>}

          {appointment?.servicePackageID &&
            <div className="text-xs text-gray-400">
              {(info as ServicePackageResponse).description}
            </div>}
          {appointment?.serviceID &&
            <div className="text-xs text-gray-400">
              {(info as ServiceResponse).description}
            </div>}

          {appointment?.servicePackageID &&
            <div className="text-xs text-gray-400">
              {(info as ServicePackageResponse).duration} phút
            </div>}
          {appointment?.serviceID &&
            <div className="text-xs text-gray-400">
              {(info as ServiceResponse).duration} phút
            </div>}
        </div>
        <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => navigate(-1)}>Quay lại</button>
      </div>

      {/* Role-aware layout */}
      {!(isLeader) ? (
        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-400">Khách hàng</div>
                <div className="font-medium" style={{ color: '#014091' }}>{customer?.fullName}</div>
                <div className="text-sm text-gray-500">{customer?.phoneNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Xe</div>
                <div className="font-medium" style={{ color: '#014091' }}>{vehicle?.brand}</div>
                <div className="text-sm text-gray-500">Biển số: {vehicle?.plateNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Dịch vụ</div>

                {appointment?.servicePackageID &&
                  <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
                    {(info as ServicePackageResponse).name}
                  </h1>}
                {appointment?.serviceID &&
                  <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
                    {(info as ServiceResponse).name}
                  </h1>}

                {appointment?.servicePackageID &&
                  <div className="text-xs text-gray-400">
                    {(info as ServicePackageResponse).duration} phút
                  </div>}
                {appointment?.serviceID &&
                  <div className="text-xs text-gray-400">
                    {(info as ServiceResponse).duration} phút
                  </div>}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold" style={{ color: '#014091' }}>Tasks của bạn</div>
              <select
                className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
            <div className="space-y-2">
              Chỗ này show những task có thể thấy
              {/* {visibleTasks.length === 0 ? (
                <div className="text-sm text-gray-400 border border-dashed rounded-xl p-4 text-center">Không có task</div>
              ) : visibleTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <div>
                    <div className="font-medium" style={{ color: '#014091' }}>{t.taskName}</div>
                    <div className="text-xs text-gray-400">{t.startedAt && `Start: ${formatTime(t.startedAt)}`} {t.completedAt && ` • Done: ${formatTime(t.completedAt)}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span>
                    {t.status === 'pending' && (
                      <button className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white" onClick={() => onQuickStatus(t.id, 'in_progress')}>Start</button>
                    )}
                    {t.status === 'in_progress' && (
                      <button className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white" onClick={() => onQuickStatus(t.id, 'completed')}>Complete</button>
                    )}
                    {t.status !== 'completed' && (
                      <button className="text-xs px-3 py-1 rounded-lg bg-gray-100" onClick={() => onQuickStatus(t.id, 'skipped')}>Skip</button>
                    )}
                  </div>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Leader Tabs */}
          <div className="bg-white rounded-2xl p-2 flex gap-2 w-full">
            {(['info', 'tasks', 'reports'] as const).map((key) => (
              <button key={key} className={`px-4 py-2 rounded-lg text-sm ${leaderTab === key ? 'bg-blue-100' : 'bg-gray-100'}`} style={{ color: leaderTab === key ? '#3b82f6' : '#014091' }} onClick={() => setLeaderTab(key)}>
                {key === 'info' ? 'Info' : key === 'tasks' ? 'Tasks' : 'Reports'}
              </button>
            ))}
          </div>

          {leaderTab === 'info' && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Khách hàng</div>
                  <div className="font-medium" style={{ color: '#014091' }}>{customer?.fullName}</div>
                  <div className="text-sm text-gray-500">{customer?.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Xe</div>
                  <div className="font-medium" style={{ color: '#014091' }}>{vehicle?.brand}</div>
                  <div className="text-sm text-gray-500">Biển số: {vehicle?.plateNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Dịch vụ</div>
                  <div className="font-medium" style={{ color: '#014091' }}>
                    {appointment?.servicePackageID ? (info as ServicePackageResponse).name : (info as ServiceResponse).name}
                  </div>
                  <div className="text-sm text-gray-500">Thời lượng ~
                    {appointment?.servicePackageID ? (info as ServicePackageResponse).duration : (info as ServiceResponse).duration}
                    phút</div>
                </div>
                {/* <div>
                  <div className="text-xs text-gray-400">Team</div>
                  <div className="text-sm text-gray-600">{info.team.map(t => t.name).join(', ')}</div>
                </div> */}
              </div>
            </div>
          )}

          {leaderTab === 'tasks' && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: '#014091' }}>Tasks của team</div>
                <div className="flex items-center gap-2">
                  <select
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                  <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => setShowCreateTask(true)}>+ Add Checklist</button>
                </div>
              </div>
              <div className="space-y-2">
                Chỗ này show những task có thể thấy
                {/* {visibleTasks.length === 0 ? (
                  <div className="text-sm text-gray-400 border border-dashed rounded-xl p-4 text-center">Không có task</div>
                ) : visibleTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                    <div>
                      <div className="font-medium" style={{ color: '#014091' }}>{t.taskName}</div>
                      <div className="text-xs text-gray-400">{t.startedAt && `Start: ${formatTime(t.startedAt)}`} {t.completedAt && ` • Done: ${formatTime(t.completedAt)}`}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="text-xs border border-gray-200 rounded-lg px-2 py-1" value={t.technicianId} onChange={e => onAssign(t.id, e.target.value)}>
                        {info.team.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span>
                      {t.status === 'pending' && (
                        <button className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white" onClick={() => onQuickStatus(t.id, 'in_progress')}>Start</button>
                      )}
                      {t.status === 'in_progress' && (
                        <button className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white" onClick={() => onQuickStatus(t.id, 'completed')}>Complete</button>
                      )}
                      {t.status !== 'completed' && (
                        <button className="text-xs px-3 py-1 rounded-lg bg-gray-100" onClick={() => onQuickStatus(t.id, 'skipped')}>Skip</button>
                      )}
                    </div>
                  </div>
                ))} */}
              </div>

              {/* Create Task Modal */}
              Chỗ này show task create modal
              {/* {showCreateTask && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCreateTask(false)}>
                  <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="text-lg font-semibold mb-3" style={{ color: '#014091' }}>Add Checklist</div>
                    <TaskCreateForm team={info.team} onCancel={() => setShowCreateTask(false)} onSubmit={(name, tech) => { handleCreateTask(name, tech); setShowCreateTask(false); }} />
                  </div>
                </div>
              )} */}
            </div>
          )}

          {leaderTab === 'reports' && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => setShowCreateReport('before-service')}>+ Before-Service</button>
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => setShowCreateReport('after-service')}>+ After-Service</button>
              </div>

              <div className="space-y-2">
                Chỗ này show reports
                {/* {reports.length === 0 ? (
                  <div className="text-sm text-gray-400 border border-dashed rounded-xl p-4 text-center">Chưa có report</div>
                ) : reports.map(r => (
                  <div key={r.id} className="border rounded-2xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium" style={{ color: '#014091' }}>{r.stage}</div>
                      <div className="text-xs text-gray-400">{formatTime(r.createdAt)}</div>
                    </div>
                    <div className="text-sm text-gray-600">{r.details}</div>
                  </div>
                ))} */}
              </div>

              Chỗ này show task create modal
              {/* {showCreateReport && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCreateReport(null)}>
                  <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="text-lg font-semibold mb-3" style={{ color: '#014091' }}>Create Report</div>
                    <ReportCreateForm stage={showCreateReport} onCancel={() => setShowCreateReport(null)} onSubmit={(details) => { handleCreateReport(showCreateReport, details); setShowCreateReport(null); }} />
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// const TaskCreateForm: React.FC<{ team: TechnicianResponse[]; onCancel: () => void; onSubmit: (taskName: string, technicianId: string) => void; }> = ({ team, onCancel, onSubmit }) => {
//   const [taskName, setTaskName] = useState('');
//   const [tech, setTech] = useState(team[0]?.id || '');
//   return (
//     <div className="space-y-3">
//       <div>
//         <div className="text-sm text-gray-500 mb-1">Task name</div>
//         <input className="w-full border border-gray-200 rounded-lg px-3 py-2" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Nhập tên task" />
//       </div>
//       <div>
//         <div className="text-sm text-gray-500 mb-1">Assign to</div>
//         <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={tech} onChange={e => setTech(e.target.value)}>
//           {team.map(t => (
//             <option key={t.id} value={t.id}>{t.name}</option>
//           ))}
//         </select>
//       </div>
//       <div className="flex items-center justify-end gap-2">
//         <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={onCancel}>Hủy</button>
//         <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => taskName && onSubmit(taskName, tech)}>Tạo</button>
//       </div>
//     </div>
//   );
// };

// const ReportCreateForm: React.FC<{ stage: ReportStage; onCancel: () => void; onSubmit: (details: string) => void; }> = ({ stage, onCancel, onSubmit }) => {
//   const [details, setDetails] = useState('');
//   return (
//     <div className="space-y-3">
//       <div className="text-sm text-gray-500">Stage: <span className="font-medium" style={{ color: '#014091' }}>{stage}</span></div>
//       <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[120px]" value={details} onChange={e => setDetails(e.target.value)} placeholder="Mô tả/ghi chú" />
//       <div className="flex items-center justify-end gap-2">
//         <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={onCancel}>Hủy</button>
//         <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => details && onSubmit(details)}>Tạo</button>
//       </div>
//     </div>
//   );
// };

export default AppointmentWorkspace;


