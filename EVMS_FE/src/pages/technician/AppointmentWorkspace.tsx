/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { technicianApi } from '../../api/TechnicianApi';
import type { ChecklistRequest, ChecklistResponse, Task, TaskStatus } from '../../types/Checklist';
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

const AppointmentWorkspace: React.FC = () => {

  // ===================================
  // States & Variables
  // ===================================

  const { appointmentId } = useParams<{ appointmentId: string }>();

  const navigate = useNavigate();

  const [isInitialLoading, setIsInitialLoading] = useState(true); // Chỉ dùng cho lần load đầu tiên

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

  // Form data for after report
  const [showAfterReportForm, setShowAfterReportForm] = useState(false);
  const [afterReportDetails, setAfterReportDetails] = useState('');
  const [afterReportImage, setAfterReportImage] = useState<string>('');

  // Checklist states - Multiple tasks support
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [draftTasks, setDraftTasks] = useState<Task[]>([]);

  // Current task being edited in form
  const [currentTaskName, setCurrentTaskName] = useState('');
  const [currentTaskDescription, setCurrentTaskDescription] = useState('');
  const [currentTaskNote, setCurrentTaskNote] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(''); // For creating task

  // Team technicians for assignment
  const [teamTechnicians, setTeamTechnicians] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [isRefreshingChecklist, setIsRefreshingChecklist] = useState(false);


  // ==================================
  // useEffect
  // ==================================

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-update currentStep based on progress (only for leader)
  useEffect(() => {
    // Only run if techInfo is loaded and user is leader
    if (!techInfo || techInfo.role !== 'leader') return;

    // Count completed tasks
    const completedTasksCount = checklist.filter(task => task.status === 'completed').length;
    const allTasksCompleted = checklist.length > 0 && completedTasksCount === checklist.length;

    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Auto-updating step:', {
    //     beforeReport: !!beforeReport,
    //     checklistLength: checklist.length,
    //     completedTasksCount,
    //     allTasksCompleted,
    //     afterReport: !!afterReport,
    //     currentStep
    //   });
    // }

    let nextStep: 1 | 2 | 3 = 1;
    if (beforeReport) {
      if (checklist.length > 0) {
        if (allTasksCompleted) {
          // All tasks completed, can move to step 3
          nextStep = 3; // Ready for after report / all done
        } else {
          // Still have tasks to complete, stay at step 2
          nextStep = 2;
        }
      } else {
        nextStep = 2; // Ready for checklist
      }
    } else {
      nextStep = 1; // Need before report
    }
    if (currentStep !== nextStep) setCurrentStep(nextStep);
  }, [techInfo?.role, beforeReport?._id, checklist.length, afterReport?._id, checklist, currentStep, techInfo, beforeReport, afterReport]);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsInitialLoading(true);
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

      // Fetch appointment with populated info
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      console.log('Fetching appointment for technician flow:', { appointmentId });
      let appointmentData: AppointmentResponse | null = null;

      // If current user is technician, prefer list endpoint first to avoid 403 on /:id
      const isTechnician = true; // In this page user is technician; techInfo fetched above
      if (isTechnician) {
        try {
          const techAppointmentsResponse = await AppointmentApi.getAppointmentByTechnician();
          const techAppointments: AppointmentResponse[] = techAppointmentsResponse.data;
          appointmentData = techAppointments.find(app => app._id === appointmentId) || null;
          if (appointmentData) {
            setAppointment(appointmentData);
          }
        } catch (listErr) {
          console.warn('Fallback list appointments failed:', listErr);
        }
      }

      // If still not found, try direct fetch by ID
      if (!appointmentData) {
        try {
          const appointmentResponse = await AppointmentApi.getAppointmentById(
            appointmentId,
            'user,service,package,technicians'
          );
          appointmentData = appointmentResponse.data?.data || appointmentResponse.data;
          if (appointmentData) setAppointment(appointmentData);
        } catch (error: any) {
          // Silence 403/404 logs to avoid noisy console; we have fallback above
          if (!(error.response?.status === 403 || error.response?.status === 404)) {
            console.error('Failed to fetch appointment (by id):', error);
          }
        }
      }

      if (!appointmentData) {
        throw new Error('Appointment not found or access denied');
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

      // Keep a local reference to the latest checklist for step calculation
      let latestChecklist: ChecklistResponse[] = [];

      // Fetch checklist
      try {
        const checklistResponse = await ChecklistApi.getByAppointmentId(appointmentId || '');
        // Backend returns array directly, not wrapped in { data }
        const checklistData: ChecklistResponse[] = Array.isArray(checklistResponse.data)
          ? checklistResponse.data
          : [];
        console.log('Fetched checklist data:', checklistData);
        if (checklistData && checklistData.length > 0) {
          setChecklist(checklistData);
          latestChecklist = checklistData;
        } else {
          setChecklist([]);
          latestChecklist = [];
        }
      } catch (error: any) {
        console.error('Failed to fetch checklist:', error);
        // If 404 or permission error, set empty checklist
        if (error.response?.status === 404 || error.response?.status === 403) {
          console.warn('No checklist found or access denied for appointment:', appointmentId);
          setChecklist([]);
          latestChecklist = [];
        } else {
          // Other errors, still set empty to avoid blocking UI
          setChecklist([]);
          latestChecklist = [];
        }
      }

      // Fetch team technicians from appointment
      if (appointmentData) {
        const teamTechs: Array<{ id: string; name: string; role: string }> = [];

        // Helper function to extract technician info
        // Appointment may have technicians populated or just IDs
        const extractTechnicianInfo = async (technician: any, role: 'leader' | 'member', label: string) => {
          if (!technician) {
            console.log(`No ${label} assigned`);
            return;
          }

          let technicianId: string;
          let userName: string = '';

          // Check if technician is populated (object) or just ID (string)
          if (typeof technician === 'object' && technician !== null) {
            technicianId = String(technician._id || technician.id);
            console.log(`${label} populated:`, { technicianId, hasUserID: !!technician.userID, userIDType: typeof technician.userID });

            // If userID is populated with user object (from include=technicians with populate userID)
            if (technician.userID && typeof technician.userID === 'object') {
              userName = (technician.userID as any).fullName || (technician.userID as any).userName || '';
              console.log(`${label} user name from populated userID:`, userName);
            }
            // If userID is string, fetch user (shouldn't happen if populate worked, but handle it)
            else if (technician.userID && typeof technician.userID === 'string') {
              try {
                const userInfo = await UserApi.getById(technician.userID);
                userName = userInfo.data?.fullName || userInfo.data?.userName || '';
                console.log(`${label} user name from fetched userID:`, userName);
              } catch (error) {
                console.warn(`Failed to fetch user for ${label} (userID=${technician.userID}):`, error);
                userName = technicianId; // Fallback to ID
              }
            } else {
              console.warn(`${label} has no userID, using technician ID as name`);
              userName = technicianId; // Fallback to ID if no user info
            }
          } else {
            // Just ID string, fetch technician info to get user
            technicianId = String(technician);
            try {
              const techInfoResponse = await technicianApi.getTechnicianById(technicianId);
              const techData = techInfoResponse.data?.data?.technician;
              if (techData?.user) {
                userName = (techData.user as any).fullName || (techData.user as any).userName || technicianId;
                console.log(`${label} user name fetched from API:`, userName);
              } else if (techData?.userID && typeof techData.userID === 'object') {
                userName = (techData.userID as any).fullName || (techData.userID as any).userName || technicianId;
                console.log(`${label} user name from userID object:`, userName);
              } else {
                userName = technicianId;
                console.warn(`${label} could not get user name, using ID:`, technicianId);
              }
            } catch (error) {
              console.warn(`Failed to fetch ${label} info by ID:`, error);
              userName = technicianId; // Fallback to ID
            }
          }

          if (technicianId) {
            teamTechs.push({
              id: technicianId,
              name: role === 'leader' ? `Leader: ${userName || technicianId}` : (userName || technicianId),
              role: role
            });
          }
        };

        // Extract technicians from appointment
        await Promise.all([
          extractTechnicianInfo(appointmentData.technicianLeaderID, 'leader', 'Leader'),
          extractTechnicianInfo(appointmentData.technicianSupport1ID, 'member', 'Support1'),
          extractTechnicianInfo(appointmentData.technicianSupport2ID, 'member', 'Support2')
        ]);

        // If technicians weren't populated (just IDs), they're already added with ID as name
        // No need for additional fetch since we don't have API to get technician by ID

        console.log('Team technicians extracted:', teamTechs);
        setTeamTechnicians(teamTechs);

        // Set default selected technician to leader (current user) if available
        if (teamTechs.length > 0) {
          if (techInfo?._id) {
            const leaderTech = teamTechs.find(t => t.id === techInfo._id);
            if (leaderTech) {
              setSelectedTechnicianId(leaderTech.id);
            } else {
              // Default to first technician if current user not found
              setSelectedTechnicianId(teamTechs[0].id);
            }
          } else {
            // Default to first technician
            setSelectedTechnicianId(teamTechs[0].id);
          }
        }
      }

      // Fetch vehicle condition reports (both leader and member can view)
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
              if (latestChecklist && latestChecklist.length > 0) {
                // Check if all tasks are completed
                const completedTasksCount = latestChecklist.filter(task => task.status === 'completed').length;
                const allTasksCompleted = completedTasksCount === latestChecklist.length;

                if (allTasksCompleted) {
                  // All tasks completed, can move to step 3
                  if (after) {
                    setCurrentStep(3); // All done
                  } else {
                    setCurrentStep(3); // Ready for after report
                  }
                } else {
                  // Still have tasks to complete, stay at step 2
                  setCurrentStep(2);
                }
              } else {
                setCurrentStep(2); // Ready for checklist
              }
            } else {
              setCurrentStep(1); // Need before report
            }
          }
          // For member: don't set currentStep (they just view reports and tasks)
        } catch (error) {
          console.error('Failed to fetch reports:', error);
        }
      }

    } catch (error) {
      console.error('Failed to fetch appointment data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }

  // Refresh chỉ checklist (không load lại toàn bộ)
  const refreshChecklist = async () => {
    if (!appointmentId) return;
    try {
      const checklistResponse = await ChecklistApi.getByAppointmentId(appointmentId);
      const checklistData: ChecklistResponse[] = Array.isArray(checklistResponse.data)
        ? checklistResponse.data
        : [];
      setChecklist(checklistData);
    } catch (error: any) {
      console.error('Failed to refresh checklist:', error);
    }
  }

  // Refresh chỉ reports (không load lại toàn bộ)
  const refreshReports = async () => {
    if (!appointmentId) return;
    try {
      const reportsResponse = await ReportApi.getReportsByAppointment(appointmentId);
      const reportsData: ReportResponse[] = reportsResponse.data?.data || [];
      const before = reportsData.find(r => r.stage === 'before-service');
      const after = reportsData.find(r => r.stage === 'after-service');
      if (before) setBeforeReport(before);
      if (after) setAfterReport(after);
    } catch (error) {
      console.error('Failed to refresh reports:', error);
    }
  }

  const handleRefreshChecklist = async () => {
    if (!appointmentId) return;
    setIsRefreshingChecklist(true);
    try {
      await refreshChecklist();
    } catch (e) {
      console.error('Failed to refresh checklist:', e);
    } finally {
      setIsRefreshingChecklist(false);
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

      // Optimistic update - cập nhật ngay lập tức
      setBeforeReport(createdReport);
      setShowBeforeReportForm(false);
      setBeforeReportDetails('');
      setBeforeReportImage('');
      setCurrentStep(2); // Move to next step

      // Chỉ refresh reports, không load lại toàn bộ
      await refreshReports();
    } catch (error: any) {
      console.error('Failed to create report:', error);
      alert(error.response?.data?.message || 'Không thể tạo báo cáo. Vui lòng thử lại.');
      // Rollback nếu lỗi
      await refreshReports();
    } finally {
      setIsSubmittingReport(false);
    }
  }

  // Handle create after report
  const handleCreateAfterReport = async () => {
    if (!appointmentId || !afterReportDetails.trim()) {
      alert('Vui lòng nhập mô tả tình trạng xe');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const reportData: ReportRequest = {
        appointmentID: appointmentId,
        stage: 'after-service',
        details: afterReportDetails.trim(),
        image: afterReportImage || undefined
      };

      const response = await ReportApi.createReport(reportData);
      const createdReport: ReportResponse = response.data;

      // Optimistic update - cập nhật ngay lập tức
      setAfterReport(createdReport);
      setShowAfterReportForm(false);
      setAfterReportDetails('');
      setAfterReportImage('');

      // Cập nhật trạng thái appointment -> awaiting_payment (optimistic)
      setAppointment(prev => prev ? ({ ...prev, status: 'awaiting_payment' } as any) : prev);
      try {
        await AppointmentApi.updateAppointmentStatus(appointmentId, {
          status: 'awaiting_payment'
        });
      } catch (err) {
        console.warn('Không thể cập nhật trạng thái awaiting_payment:', err);
        // Rollback nếu lỗi
        await fetchData(false);
      }

      // Chỉ refresh reports, không load lại toàn bộ
      await refreshReports();
    } catch (error: any) {
      console.error('Failed to create report:', error);
      alert(error.response?.data?.message || 'Không thể tạo báo cáo. Vui lòng thử lại.');
      // Rollback nếu lỗi
      await refreshReports();
    } finally {
      setIsSubmittingReport(false);
    }
  }

  // Handle add task to draft list
  const handleAddTaskToDraft = () => {
    if (!currentTaskName.trim() || !currentTaskDescription.trim()) {
      alert('Vui lòng nhập đầy đủ tên task và mô tả');
      return;
    }

    if (!selectedTechnicianId) {
      alert('Vui lòng chọn technician đảm nhận task');
      return;
    }

    const newTask = {
      taskName: currentTaskName.trim(),
      description: currentTaskDescription.trim(),
      note: currentTaskNote.trim() || '',
      technicianID: selectedTechnicianId
    };

    setDraftTasks([...draftTasks, newTask]);

    // Reset form for next task
    setCurrentTaskName('');
    setCurrentTaskDescription('');
    setCurrentTaskNote('');
    // Keep selectedTechnicianId for next task
  }

  // Handle remove task from draft
  const handleRemoveDraftTask = (index: number) => {
    setDraftTasks(draftTasks.filter((_, i) => i !== index));
  }

  // Handle create all tasks at once
  const handleCreateAllTasks = async () => {
    if (!appointmentId) {
      alert('Appointment ID không hợp lệ');
      return;
    }

    if (draftTasks.length === 0) {
      alert('Vui lòng thêm ít nhất một task');
      return;
    }

    setIsCreatingTasks(true);
    try {
      const request: ChecklistRequest = {
        appointmentID: appointmentId,
        tasks: draftTasks.map(task => ({
          taskName: task.taskName,
          description: task.description,
          note: task.note,
          technicianID: task.technicianID
        }))
      };

      const response = await ChecklistApi.createChecklist(request);
      const createdTasks: ChecklistResponse[] = response.data;

      // Optimistic update - cập nhật ngay lập tức
      setChecklist(createdTasks);
      setAppointment(prev => prev ? ({ ...prev, status: 'in_progress' } as any) : prev);
      
      // Reset form ngay lập tức
      setDraftTasks([]);
      setCurrentTaskName('');
      setCurrentTaskDescription('');
      setCurrentTaskNote('');
      setShowCreateTaskForm(false);

      // Cập nhật trạng thái appointment -> in_progress (background)
      try {
        await AppointmentApi.updateAppointmentStatus(appointmentId, {
          status: 'in_progress'
        });
      } catch (err) {
        console.warn('Không thể cập nhật trạng thái in_progress:', err);
        // Rollback nếu lỗi
        await refreshChecklist();
      }

      // Chỉ refresh checklist để đảm bảo sync, không load lại toàn bộ
      await refreshChecklist();

      alert(`Đã tạo thành công ${createdTasks.length} task(s)!`);
    } catch (error: any) {
      console.error('Failed to create tasks:', error);
      alert(error.response?.data?.message || 'Không thể tạo tasks. Vui lòng thử lại.');
      // Rollback nếu lỗi
      await refreshChecklist();
    } finally {
      setIsCreatingTasks(false);
    }
  }

  // Handle update task status
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // Optimistic update - cập nhật ngay lập tức
    setChecklist(prev => prev.map(task => 
      task._id === taskId ? { ...task, status } : task
    ));

    try {
      await ChecklistApi.updateStatus(taskId, status);
      // Chỉ refresh checklist để đảm bảo sync, không load lại toàn bộ
      await refreshChecklist();
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
      // Rollback nếu lỗi
      await refreshChecklist();
    }
  }

  // const changeTaskStatus = async (taskId: string, status: TaskStatus) => {
  //   // API call to change task status
  // }

  // const handleCreateTask = async (taskName: string, technicianId: string) => {
  //   // API call to create task
  // }

  const isLeader = techInfo?.role === 'leader';

  // Debug logs
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('AppointmentWorkspace Debug:', {
  //     isLeader,
  //     techInfoRole: techInfo?.role,
  //     currentStep,
  //     beforeReport: !!beforeReport,
  //     showBeforeReportForm,
  //     appointmentId,
  //     checklistLength: checklist.length,
  //     checklist: checklist
  //   });
  // }

  if (isInitialLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-500">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>

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

          {/* {appointment?.servicePackageID && info &&
            <div className="text-xs text-gray-400">
              Thời lượng: {(info as ServicePackageResponse).duration} phút
            </div>}
          {appointment?.serviceID && info &&
            <div className="text-xs text-gray-400">
              Thời lượng: {(info as ServiceResponse).duration} phút
            </div>} */}
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
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mb-2">
              Debug: isLeader={String(isLeader)}, currentStep={currentStep}, beforeReport={String(!!beforeReport)}, techInfoRole={techInfo?.role}
            </div>
          )} */}

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

          {/* Step 2: Checklist */}
          {currentStep === 2 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg" style={{ color: '#014091' }}>Bước 2: Tạo Checklist task</h3>
                {checklist.length > 0 && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const completedCount = checklist.filter(t => t.status === 'completed').length;
                      const allCompleted = completedCount === checklist.length;
                      return (
                        <>
                          <span className="text-sm text-gray-500">
                            {completedCount}/{checklist.length} task(s) đã hoàn thành
                          </span>
                          <button
                            className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            onClick={handleRefreshChecklist}
                            disabled={isRefreshingChecklist}
                          >
                            {isRefreshingChecklist ? 'Đang làm mới...' : 'Làm mới'}
                          </button>
                          {allCompleted && (
                            <span className="text-sm text-green-600 font-medium">✓ Tất cả tasks đã hoàn thành - Có thể chuyển sang bước 3</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Create Checklist Form - Multiple Tasks - Only show if no tasks exist */}
              {checklist.length === 0 && (
                <>
                  {!showCreateTaskForm ? (
                    <button
                      className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                      onClick={() => {
                        setShowCreateTaskForm(true);
                        // Set default technician
                        if (teamTechnicians.length > 0 && !selectedTechnicianId) {
                          const defaultTech = teamTechnicians.find(t => t.id === techInfo?._id) || teamTechnicians[0];
                          setSelectedTechnicianId(defaultTech.id);
                        }
                      }}
                    >
                      + Tạo Checklist (nhiều tasks)
                    </button>
                  ) : (
                    <div className="border rounded-xl p-4 space-y-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-md" style={{ color: '#014091' }}>
                          Thêm task vào checklist
                        </h4>
                        {draftTasks.length > 0 && (
                          <span className="text-sm text-gray-500">{draftTasks.length} task(s) đã thêm</span>
                        )}
                      </div>

                      {/* Form to add single task */}
                      <div className="border-t pt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                            Tên task <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: Xịt nước lên xe"
                            value={currentTaskName}
                            onChange={(e) => setCurrentTaskName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                            Mô tả <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mô tả chi tiết về task..."
                            value={currentTaskDescription}
                            onChange={(e) => setCurrentTaskDescription(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                            Ghi chú (tùy chọn)
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập ghi chú..."
                            value={currentTaskNote}
                            onChange={(e) => setCurrentTaskNote(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                            Gán cho technician <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedTechnicianId}
                            onChange={(e) => setSelectedTechnicianId(e.target.value)}
                            required
                          >
                            <option value="">-- Chọn technician --</option>
                            {teamTechnicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleAddTaskToDraft}
                          disabled={!currentTaskName.trim() || !currentTaskDescription.trim() || !selectedTechnicianId}
                        >
                          + Thêm task này vào danh sách
                        </button>
                      </div>

                      {/* Draft Tasks List */}
                      {draftTasks.length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                          <h5 className="font-medium text-sm" style={{ color: '#014091' }}>
                            Danh sách tasks đã thêm ({draftTasks.length}):
                          </h5>
                          {draftTasks.map((task, index) => {
                            const assignedTech = teamTechnicians.find(t => t.id === task.technicianID);
                            return (
                              <div key={index} className="flex items-start justify-between bg-white border rounded-lg p-3">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{task.taskName}</div>
                                  <div className="text-xs text-gray-600 mt-1">{task.description}</div>
                                  {task.note && (
                                    <div className="text-xs text-gray-500 mt-1">Ghi chú: {task.note}</div>
                                  )}
                                  {assignedTech && (
                                    <div className="text-xs text-gray-500 mt-1">Gán cho: {assignedTech.name}</div>
                                  )}
                                </div>
                                <button
                                  className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                                  onClick={() => handleRemoveDraftTask(index)}
                                >
                                  ✕ Xóa
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 border-t pt-4">
                        <button
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => {
                            setShowCreateTaskForm(false);
                            setDraftTasks([]);
                            setCurrentTaskName('');
                            setCurrentTaskDescription('');
                            setCurrentTaskNote('');
                          }}
                          disabled={isCreatingTasks}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCreateAllTasks}
                          disabled={isCreatingTasks || draftTasks.length === 0}
                        >
                          {isCreatingTasks ? 'Đang tạo...' : `Tạo tất cả ${draftTasks.length} task(s)`}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Show message if tasks exist - cannot create more */}
              {checklist.length > 0 && (
                <div className="border rounded-xl p-4 bg-blue-50 mb-4">
                  <div className="text-sm text-blue-700">
                    ✓ Checklist tasks đã được tạo. Team đang thực hiện các tasks. Không thể tạo thêm tasks mới.
                  </div>
                </div>
              )}

              {/* Tasks List */}
              {checklist.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-md" style={{ color: '#014091' }}>Danh sách tasks:</h4>
                  {checklist.map((task) => {
                    // Handle technicianID can be object or string
                    const taskTechnicianId = typeof task.technicianID === 'object' && task.technicianID !== null
                      ? String((task.technicianID as any)._id || (task.technicianID as any).id)
                      : String(task.technicianID);

                    const assignedTech = teamTechnicians.find(t => t.id === taskTechnicianId);
                    // Only the assigned technician can mark task as completed (including leader if assigned to them)
                    const isAssignedToMe = taskTechnicianId === techInfo?._id;

                    return (
                      <div key={task._id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-lg" style={{ color: '#014091' }}>
                              {task.taskName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                            {task.note && (
                              <div className="text-xs text-gray-500 mt-1">Ghi chú: {task.note}</div>
                            )}
                          </div>
                          <div className="ml-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {task.status === 'completed' ? 'Hoàn thành' :
                                task.status === 'pending' ? 'Chờ làm' :
                                  task.status === 'skipped' ? 'Bỏ qua' : task.status}
                            </span>
                          </div>
                        </div>

                        {/* Assign Technician - Disabled after tasks are created (only show if tasks exist) */}
                        {/* Note: Once tasks are created, assignment cannot be changed */}

                        {/* Update Status - Only for assigned technician (can be leader or member) */}
                        {isAssignedToMe && task.status !== 'completed' && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                              onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                            >
                              ✓ Đánh dấu hoàn thành
                            </button>
                            {task.status !== 'skipped' && (
                              <button
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
                                onClick={() => handleUpdateTaskStatus(task._id, 'skipped')}
                              >
                                Bỏ qua
                              </button>
                            )}
                          </div>
                        )}

                        {/* Show message if not assigned to me */}
                        {!isAssignedToMe && task.status !== 'completed' && (
                          <div className="mt-2 text-xs text-gray-400">
                            Task này không được gán cho bạn. Chỉ technician được gán mới có thể đánh dấu hoàn thành.
                          </div>
                        )}

                        {/* Show assigned technician */}
                        {assignedTech && (
                          <div className="mt-2 text-xs text-gray-500">
                            Được gán cho: {assignedTech.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: After Service Report */}
          {currentStep === 3 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg" style={{ color: '#014091' }}>Bước 3: Ghi report tình trạng xe sau khi sửa</h3>
                {afterReport && (
                  <span className="text-sm text-green-600">✓ Đã hoàn thành</span>
                )}
              </div>

              {afterReport ? (
                <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#014091' }}>Báo cáo đã được tạo</span>
                    <span className="text-xs text-gray-500">{new Date(afterReport.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{afterReport.details}</div>
                  {afterReport.image && (
                    <div className="mt-3">
                      <img src={afterReport.image} alt="Vehicle condition after service" className="max-w-full h-auto rounded-lg" />
                    </div>
                  )}
                  {/* Completion banner for leader when after-report exists */}
                  <div className="border rounded-xl p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✓</span>
                      <div>
                        <div className="font-semibold text-green-700 text-lg">
                          Đã hoàn thành công việc ở slot này
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          Appointment đã chuyển sang trạng thái chờ thanh toán
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const completedCount = checklist.filter(t => t.status === 'completed').length;
                    const allCompleted = checklist.length > 0 && completedCount === checklist.length;

                    if (!allCompleted && checklist.length > 0) {
                      return (
                        <div className="border rounded-xl p-4 bg-yellow-50">
                          <div className="text-sm text-yellow-700">
                            ⚠️ Vui lòng hoàn thành tất cả tasks trước khi chuyển sang bước này.
                            Hiện tại: {completedCount}/{checklist.length} task(s) đã hoàn thành.
                          </div>
                        </div>
                      );
                    }

                    return !showAfterReportForm ? (
                      <button
                        className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        onClick={() => setShowAfterReportForm(true)}
                      >
                        + Ghi report tình trạng xe sau khi sửa
                      </button>
                    ) : (
                      <div className="border rounded-xl p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#014091' }}>
                            Mô tả tình trạng xe <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mô tả chi tiết về tình trạng xe sau khi sửa..."
                            value={afterReportDetails}
                            onChange={(e) => setAfterReportDetails(e.target.value)}
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
                            value={afterReportImage}
                            onChange={(e) => setAfterReportImage(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh (ví dụ: https://example.com/image.jpg)</p>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => {
                              setShowAfterReportForm(false);
                              setAfterReportDetails('');
                              setAfterReportImage('');
                            }}
                            disabled={isSubmittingReport}
                          >
                            Hủy
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateAfterReport}
                            disabled={isSubmittingReport || !afterReportDetails.trim()}
                          >
                            {isSubmittingReport ? 'Đang tạo...' : 'Tạo báo cáo'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Member view: Show only tasks; can update status if assigned
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {/* Checklist Tasks - Member can view all and update assigned tasks */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: '#014091' }}>Checklist tasks</h3>
              {checklist.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{checklist.length} task(s)</span>
                  <button
                    className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    onClick={handleRefreshChecklist}
                    disabled={isRefreshingChecklist}
                  >
                    {isRefreshingChecklist ? 'Đang làm mới...' : 'Làm mới'}
                  </button>
                </div>
              )}
            </div>

            {checklist.length > 0 ? (
              <>
                <div className="space-y-3">
                  {checklist.map((task) => {
                    // Handle technicianID can be object or string
                    const taskTechnicianId = typeof task.technicianID === 'object' && task.technicianID !== null
                      ? String((task.technicianID as any)._id || (task.technicianID as any).id)
                      : String(task.technicianID);

                    const assignedTech = teamTechnicians.find(t => t.id === taskTechnicianId);
                    const isAssignedToMe = taskTechnicianId === techInfo?._id;

                    return (
                      <div key={task._id} className="border rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-lg" style={{ color: '#014091' }}>
                              {task.taskName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                            {task.note && (
                              <div className="text-xs text-gray-500 mt-1">Ghi chú: {task.note}</div>
                            )}
                          </div>
                          <div className="ml-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {task.status === 'completed' ? 'Hoàn thành' :
                                task.status === 'pending' ? 'Chờ làm' :
                                  task.status === 'skipped' ? 'Bỏ qua' : task.status}
                            </span>
                          </div>
                        </div>

                        {/* Show assigned technician */}
                        {assignedTech && (
                          <div className="mt-2 text-xs text-gray-500">
                            Được gán cho: {assignedTech.name}
                          </div>
                        )}

                        {/* Update Status - Only for assigned member */}
                        {isAssignedToMe && task.status !== 'completed' && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                              onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                            >
                              ✓ Đánh dấu hoàn thành
                            </button>
                            {task.status !== 'skipped' && (
                              <button
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
                                onClick={() => handleUpdateTaskStatus(task._id, 'skipped')}
                              >
                                Bỏ qua
                              </button>
                            )}
                          </div>
                        )}

                        {/* Show message if not assigned to me */}
                        {!isAssignedToMe && (
                          <div className="mt-2 text-xs text-gray-400">
                            Task này không được gán cho bạn
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Completion Status for Member */}
                {(() => {
                  // Get all tasks assigned to current member
                  const myTasks = checklist.filter(task => {
                    const taskTechnicianId = typeof task.technicianID === 'object' && task.technicianID !== null
                      ? String((task.technicianID as any)._id || (task.technicianID as any).id)
                      : String(task.technicianID);
                    return taskTechnicianId === techInfo?._id;
                  });

                  // Check if all my tasks are completed
                  const allMyTasksCompleted = myTasks.length > 0 && myTasks.every(task => task.status === 'completed');
                  const completedCount = myTasks.filter(task => task.status === 'completed').length;

                  if (myTasks.length > 0) {
                    return (
                      <div className="mt-4 pt-4 border-t">
                        {allMyTasksCompleted ? (
                          <div className="border rounded-xl p-4 bg-green-50 border-green-200">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">✓</span>
                              <div>
                                <div className="font-semibold text-green-700 text-lg">
                                  Đã hoàn thành công việc
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                  Bạn đã hoàn thành tất cả {myTasks.length} task(s) được gán cho bạn
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border rounded-xl p-4 bg-gray-50">
                            <div className="text-sm text-gray-600">
                              Tiến độ: {completedCount}/{myTasks.length} task(s) đã hoàn thành
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Leader chưa tạo checklist tasks
                </div>
              </div>
            )}
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


