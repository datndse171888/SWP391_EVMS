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

      // Fetch appointment with populated user, service/package info
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      
      console.log('Fetching appointment with ID:', appointmentId);
      let appointmentData: AppointmentResponse | null = null;
      
      try {
        const appointmentResponse = await AppointmentApi.getAppointmentById(
          appointmentId, 
          'user,service,package'
        );
        console.log('Appointment response:', appointmentResponse);
        
        appointmentData = appointmentResponse.data?.data || appointmentResponse.data;
        if (!appointmentData) {
          console.error('Appointment data is missing in response');
        } else {
          console.log('Appointment data received:', appointmentData);
          setAppointment(appointmentData);
        }
      } catch (error: any) {
        console.error('Failed to fetch appointment:', error);
        // If appointment fetch fails, try to get basic info from technician appointments list
        if (error.response?.status === 404 || error.response?.status === 403) {
          console.log('Trying to fetch appointment from technician list...');
          try {
            const techAppointmentsResponse = await AppointmentApi.getAppointmentByTechnician('confirmed');
            const techAppointments: AppointmentResponse[] = techAppointmentsResponse.data;
            const foundAppointment = techAppointments.find(app => app._id === appointmentId);
            if (foundAppointment) {
              console.log('Found appointment in technician list:', foundAppointment);
              appointmentData = foundAppointment;
              setAppointment(foundAppointment);
            }
          } catch (fallbackError) {
            console.error('Failed to fetch from technician list:', fallbackError);
          }
        }
        
        if (!appointmentData) {
          throw new Error('Appointment not found or access denied');
        }
      }
      
      // Fetch customer data - always fetch to ensure we have the data
      if (appointmentData && appointmentData.userID) {
        try {
          console.log('Appointment userID:', appointmentData.userID, 'Type:', typeof appointmentData.userID);
          
          // Check if already populated
          if (typeof appointmentData.userID === 'object' && appointmentData.userID !== null && 'fullName' in appointmentData.userID) {
            console.log('Using populated customer data:', appointmentData.userID);
            setCustomer(appointmentData.userID as any);
          } else {
            // Fetch customer data - extract ID if it's an object
            let userId: string;
            if (typeof appointmentData.userID === 'object' && appointmentData.userID !== null) {
              // If it's an object with _id property
              userId = (appointmentData.userID as any)._id || (appointmentData.userID as any).id || String(appointmentData.userID);
            } else {
              userId = typeof appointmentData.userID === 'string' ? appointmentData.userID : String(appointmentData.userID);
            }
            console.log('Fetching customer data for userId:', userId);
            const customerResponse = await UserApi.getById(userId);
            console.log('Customer API response:', customerResponse);
            const customerData: UserResponse = customerResponse.data;
            console.log('Customer data received:', customerData);
            if (customerData) {
              console.log('Setting customer state:', customerData);
              setCustomer(customerData);
            } else {
              console.warn('Customer data is empty or null');
            }
          }
        } catch (error: any) {
          console.error('Failed to fetch customer data:', error);
          console.error('Error response:', error.response);
          console.error('Error message:', error.message);
        }
      } else {
        console.warn('No userID in appointment data. AppointmentData:', appointmentData);
      }

      // Fetch vehicle data - always fetch to ensure we have the data
      if (appointmentData.vehicleID) {
        try {
          const vehicleId = typeof appointmentData.vehicleID === 'string' ? appointmentData.vehicleID : String(appointmentData.vehicleID);
          console.log('Fetching vehicle data for vehicleId:', vehicleId);
          const vehicleResponse = await VehicleApi.getVehicleById(vehicleId);
          const vehicleData: VehicleResponse = vehicleResponse.data;
          console.log('Vehicle data received:', vehicleData);
          if (vehicleData) {
            setVehicle(vehicleData);
          } else {
            console.warn('Vehicle data is empty');
          }
        } catch (error) {
          console.error('Failed to fetch vehicle data:', error);
          console.error('Error details:', error);
        }
      } else {
        console.warn('No vehicleID in appointment data');
      }

      // If service/package data is populated, use it directly, otherwise fetch
      if (appointmentData.servicePackageID) {
        if (typeof appointmentData.servicePackageID === 'object' && 'name' in appointmentData.servicePackageID) {
          setInfo(appointmentData.servicePackageID as any);
        } else {
          try {
            const packageId = typeof appointmentData.servicePackageID === 'string' ? appointmentData.servicePackageID : String(appointmentData.servicePackageID);
            const servicePackageResponse = await ServicePackageApi.getServicePackageById(packageId);
            const servicePackageData: ServicePackageResponse = servicePackageResponse.data;
            if (servicePackageData) {
              setInfo(servicePackageData);
            }
          } catch (error) {
            console.error('Failed to fetch service package data:', error);
          }
        }
      } else if (appointmentData.serviceID) {
        if (typeof appointmentData.serviceID === 'object' && 'name' in appointmentData.serviceID) {
          setInfo(appointmentData.serviceID as any);
        } else {
          try {
            const serviceId = typeof appointmentData.serviceID === 'string' ? appointmentData.serviceID : String(appointmentData.serviceID);
            const serviceResponse = await ServiceApi.getServiceById(serviceId);
            const serviceData: ServiceResponse = serviceResponse.data;
            if (serviceData) {
              setInfo(serviceData);
            }
          } catch (error) {
            console.error('Failed to fetch service data:', error);
          }
        }
      }

      // Fetch checklist
      const checklistResponse = await ChecklistApi.getByAppointmentId(appointmentId || '');
      const checklistData: ChecklistResponse[] = checklistResponse.data;
      if (checklistData) {
        setChecklist(checklistData);
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

          {appointment?.servicePackageID && info &&
            <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
              {(info as ServicePackageResponse).name}
            </h1>}
          {appointment?.serviceID && info &&
            <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
              {(info as ServiceResponse).name}
            </h1>}

          {appointment?.servicePackageID && info &&
            <div className="text-xs text-gray-400">
              {(info as ServicePackageResponse).description}
            </div>}
          {appointment?.serviceID && info &&
            <div className="text-xs text-gray-400">
              {(info as ServiceResponse).description}
            </div>}

          {appointment?.servicePackageID && info &&
            <div className="text-xs text-gray-400">
              {(info as ServicePackageResponse).duration} phút
            </div>}
          {appointment?.serviceID && info &&
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
                {customer ? (
                  <>
                    <div className="font-medium" style={{ color: '#014091' }}>{customer.fullName || customer.userName || 'Không có tên'}</div>
                    <div className="text-sm text-gray-500">{customer.phoneNumber || 'Chưa có số điện thoại'}</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">Đang tải...</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400">Xe</div>
                <div className="font-medium" style={{ color: '#014091' }}>{vehicle?.brand}</div>
                <div className="text-sm text-gray-500">Biển số: {vehicle?.plateNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Dịch vụ</div>

                {appointment?.servicePackageID && info &&
                  <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
                    {(info as ServicePackageResponse).name}
                  </h1>}
                {appointment?.serviceID && info &&
                  <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>
                    {(info as ServiceResponse).name}
                  </h1>}

                {appointment?.servicePackageID && info &&
                  <div className="text-xs text-gray-400">
                    {(info as ServicePackageResponse).duration} phút
                  </div>}
                {appointment?.serviceID && info &&
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
                  {customer ? (
                    <>
                      <div className="font-medium" style={{ color: '#014091' }}>{customer.fullName || customer.userName || 'Không có tên'}</div>
                      <div className="text-sm text-gray-500">{customer.phoneNumber || 'Chưa có số điện thoại'}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">Đang tải...</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Xe</div>
                  <div className="font-medium" style={{ color: '#014091' }}>{vehicle?.brand}</div>
                  <div className="text-sm text-gray-500">Biển số: {vehicle?.plateNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Dịch vụ</div>
                  <div className="font-medium" style={{ color: '#014091' }}>
                    {info && (appointment?.servicePackageID ? (info as ServicePackageResponse).name : (info as ServiceResponse).name)}
                  </div>
                  <div className="text-sm text-gray-500">Thời lượng ~
                    {info && (appointment?.servicePackageID ? (info as ServicePackageResponse).duration : (info as ServiceResponse).duration)}
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


