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
import type { ReportRequest, ReportResponse } from '../../types/Report';
import { ReportApi } from '../../api/ReportApi';

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

  const { user } = useAuth();

  const [techInfo, setTechInfo] = useState<TechnicianResponse>();
  const [appointment, setAppointment] = useState<AppointmentResponse>();
  const [checklist, setChecklist] = useState<ChecklistResponse[]>([]);
  const [info, setInfo] = useState<ServiceResponse | ServicePackageResponse>();
  const [customer, setCustomer] = useState<UserResponse>();
  const [vehicle, setVehicle] = useState<VehicleResponse>();

  // UI state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1: Before report, 2: Checklist, 3: After report
  
  // Report states
  const [beforeReport, setBeforeReport] = useState<ReportResponse | null>(null);
  const [afterReport, setAfterReport] = useState<ReportResponse | null>(null);
  const [showBeforeReportForm, setShowBeforeReportForm] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Form data for before report
  const [beforeReportDetails, setBeforeReportDetails] = useState('');
  const [beforeReportImage, setBeforeReportImage] = useState<string>('');


  // ==================================
  // useEffect
  // ==================================

  useEffect(() => {
    fetchData();
  }, []);

  // Set initial step when techInfo is loaded and user is leader
  useEffect(() => {
    if (techInfo?.role === 'leader' && currentStep === 1 && !beforeReport) {
      // If techInfo just loaded and is leader, and no before report exists, stay at step 1
      // This ensures the form is visible
      console.log('TechInfo loaded, isLeader, setting step to 1 if needed');
    }
  }, [techInfo, currentStep, beforeReport]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const techInfoResponse = await technicianApi.getTechnicianInfo(user?.id || '');
      const techInfoData: CheckingResponse<any> = techInfoResponse.data;
      console.log('TechInfo response:', techInfoData);
      
      // Backend returns: { success: true, data: { technician: { id, role, ... } } }
      if (techInfoData.data && techInfoData.data.technician) {
        const technicianData = techInfoData.data.technician;
        // Map to TechnicianResponse format
        const mappedTechInfo: TechnicianResponse = {
          _id: technicianData.id,
          userID: user?.id || '',
          role: technicianData.role, // 'leader' | 'member'
          description: technicianData.introduction
        };
        console.log('Mapped techInfo:', mappedTechInfo);
        setTechInfo(mappedTechInfo);
      } else {
        console.warn('TechInfo data structure unexpected:', techInfoData);
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

      // Fetch vehicle condition reports (only for leader)
      if (appointmentId) {
        try {
          const reportsResponse = await ReportApi.getReportsByAppointment(appointmentId);
          const reportsData: ReportResponse[] = reportsResponse.data?.data || [];
          
          const before = reportsData.find(r => r.stage === 'before-service');
          const after = reportsData.find(r => r.stage === 'after-service');
          
          if (before) setBeforeReport(before);
          if (after) setAfterReport(after);
          
          // Determine current step based on reports (only for leader)
          // Note: isLeader is calculated from techInfo, so we need to check techInfo here
          const isLeaderCheck = techInfo?.role === 'leader';
          if (isLeaderCheck) {
            if (before) {
              if (checklistData && checklistData.length > 0) {
                if (after) {
                  setCurrentStep(3); // All done
                } else {
                  setCurrentStep(3); // Ready for after report
                }
              } else {
                setCurrentStep(2); // Ready for checklist
              }
            } else {
              setCurrentStep(1); // Need before report
            }
          } else if (isLeaderCheck === false) {
            // Not a leader, don't show steps
          } else {
            // techInfo not loaded yet, default to step 1 for leader
            if (techInfo && techInfo.role === 'leader') {
              setCurrentStep(1);
            }
          }
        } catch (error) {
          console.error('Failed to fetch reports:', error);
        }
      }

    } catch (error) {
      console.error('Failed to fetch appointment data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle create before report
  const handleCreateBeforeReport = async () => {
    if (!appointmentId || !beforeReportDetails.trim()) {
      alert('Vui lòng nhập mô tả tình trạng xe');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const reportData: ReportRequest = {
        appointmentID: appointmentId,
        stage: 'before-service',
        details: beforeReportDetails.trim(),
        image: beforeReportImage || undefined
      };

      const response = await ReportApi.createReport(reportData);
      const createdReport: ReportResponse = response.data;
      
      setBeforeReport(createdReport);
      setShowBeforeReportForm(false);
      setBeforeReportDetails('');
      setBeforeReportImage('');
      setCurrentStep(2); // Move to next step
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Failed to create report:', error);
      alert(error.response?.data?.message || 'Không thể tạo báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmittingReport(false);
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

  // Debug logs
  console.log('AppointmentWorkspace Debug:', {
    isLeader,
    techInfoRole: techInfo?.role,
    currentStep,
    beforeReport: !!beforeReport,
    showBeforeReportForm,
    appointmentId
  });

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

      {/* Info Card - Common for both leader and member */}
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
            <div className="font-medium" style={{ color: '#014091' }}>
              {info && (appointment?.servicePackageID ? (info as ServicePackageResponse).name : (info as ServiceResponse).name)}
            </div>
            <div className="text-sm text-gray-500">Thời lượng ~
              {info && (appointment?.servicePackageID ? (info as ServicePackageResponse).duration : (info as ServiceResponse).duration)}
              phút</div>
          </div>
        </div>
      </div>

      {/* 3-Step Process - Only for Leader */}
      {techInfo === undefined ? (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-sm text-gray-500">Đang tải thông tin...</div>
        </div>
      ) : isLeader ? (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mb-2">
              Debug: isLeader={String(isLeader)}, currentStep={currentStep}, beforeReport={String(!!beforeReport)}, techInfoRole={techInfo?.role}
            </div>
          )}
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {beforeReport ? '✓' : '1'}
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className={`h-full ${beforeReport ? 'bg-blue-600' : ''}`} style={{ width: beforeReport ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 && beforeReport ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className={`h-full ${checklist.length > 0 ? 'bg-blue-600' : ''}`} style={{ width: checklist.length > 0 ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 && afterReport ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {afterReport ? '✓' : '3'}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className={`text-center flex-1 ${currentStep === 1 ? 'font-semibold' : ''}`} style={{ color: currentStep === 1 ? '#014091' : '#6b7280' }}>
              Ghi report trước khi sửa
            </div>
            <div className={`text-center flex-1 ${currentStep === 2 ? 'font-semibold' : ''}`} style={{ color: currentStep === 2 ? '#014091' : '#6b7280' }}>
              Tạo Checklist task
            </div>
            <div className={`text-center flex-1 ${currentStep === 3 ? 'font-semibold' : ''}`} style={{ color: currentStep === 3 ? '#014091' : '#6b7280' }}>
              Ghi report sau khi sửa
            </div>
          </div>

          {/* Step 1: Before Service Report */}
          {currentStep === 1 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg" style={{ color: '#014091' }}>Bước 1: Ghi report tình trạng xe trước khi sửa</h3>
                {beforeReport && (
                  <span className="text-sm text-green-600">✓ Đã hoàn thành</span>
                )}
              </div>
              
              {beforeReport ? (
                <div className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#014091' }}>Báo cáo đã được tạo</span>
                    <span className="text-xs text-gray-500">{new Date(beforeReport.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{beforeReport.details}</div>
                  {beforeReport.image && (
                    <div className="mt-3">
                      <img src={beforeReport.image} alt="Vehicle condition" className="max-w-full h-auto rounded-lg" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!showBeforeReportForm ? (
                    <button
                      className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                      onClick={() => setShowBeforeReportForm(true)}
                    >
                      + Ghi report tình trạng xe trước khi sửa
                    </button>
                  ) : (
                    <div className="border rounded-xl p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                          Mô tả tình trạng xe <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập mô tả chi tiết về tình trạng xe trước khi sửa..."
                          value={beforeReportDetails}
                          onChange={(e) => setBeforeReportDetails(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                          Hình ảnh (tùy chọn)
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập URL hình ảnh..."
                          value={beforeReportImage}
                          onChange={(e) => setBeforeReportImage(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh (ví dụ: https://example.com/image.jpg)</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => {
                            setShowBeforeReportForm(false);
                            setBeforeReportDetails('');
                            setBeforeReportImage('');
                          }}
                          disabled={isSubmittingReport}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCreateBeforeReport}
                          disabled={isSubmittingReport || !beforeReportDetails.trim()}
                        >
                          {isSubmittingReport ? 'Đang tạo...' : 'Tạo báo cáo'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Checklist (Placeholder) */}
          {currentStep === 2 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#014091' }}>Bước 2: Tạo Checklist task</h3>
              <div className="text-sm text-gray-500">Bước này sẽ được triển khai tiếp theo...</div>
            </div>
          )}

          {/* Step 3: After Service Report (Placeholder) */}
          {currentStep === 3 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#014091' }}>Bước 3: Ghi report tình trạng xe sau khi sửa</h3>
              <div className="text-sm text-gray-500">Bước này sẽ được triển khai tiếp theo...</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-sm text-gray-500">
            Bạn không có quyền truy cập tính năng này. (Role: {techInfo?.role || 'unknown'})
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Chỉ technician leader mới có thể tạo vehicle condition reports và quản lý checklist.
          </div>
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


