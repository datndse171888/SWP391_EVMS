import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
type ReportStage = 'before-service' | 'intermediate' | 'after-service';

interface TechnicianUser { id: string; name: string; role: 'technician-member' | 'technician-leader'; }
interface AppointmentInfo {
  id: string;
  customer: { name: string; phone: string };
  vehicle: { plate: string; model: string };
  service: { name: string; durationMin: number };
  time: string; // ISO
  team: TechnicianUser[];
}
interface ChecklistItem {
  id: string;
  taskName: string;
  technicianId: string;
  status: ChecklistStatus;
  startedAt?: string;
  completedAt?: string;
}
interface ReportItem { id: string; stage: ReportStage; details: string; image?: string; createdAt: string; }

const statusLabel: Record<ChecklistStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
};
const statusBg: Record<ChecklistStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-purple-50 text-purple-700',
  completed: 'bg-green-50 text-green-700',
  skipped: 'bg-gray-50 text-gray-600',
};

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

const AppointmentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mock current user (allow override via ?role=leader)
  const roleOverride = searchParams.get('role');
  const currentUser: TechnicianUser = useMemo(() => ({ id: 'tech-2', name: 'Member B', role: roleOverride === 'leader' ? 'technician-leader' : 'technician-member' }), [roleOverride]);

  // Mock appointment info
  const info: AppointmentInfo = useMemo(() => ({
    id: id || 'appt-1',
    customer: { name: 'Nguyễn Văn A', phone: '0901 234 567' },
    vehicle: { plate: '51A-123.45', model: 'Toyota Vios 2020' },
    service: { name: 'Bảo dưỡng định kỳ', durationMin: 90 },
    time: new Date().toISOString(),
    team: [
      { id: 'tech-1', name: 'Leader L', role: 'technician-leader' },
      { id: 'tech-2', name: 'Member B', role: 'technician-member' },
      { id: 'tech-3', name: 'Member C', role: 'technician-member' },
    ],
  }), [id]);

  // Mock tasks and reports state
  const [tasks, setTasks] = useState<ChecklistItem[]>([
    { id: 't1', taskName: 'Kiểm tra dầu động cơ', technicianId: 'tech-2', status: 'pending' },
    { id: 't2', taskName: 'Vệ sinh lọc gió', technicianId: 'tech-3', status: 'in_progress', startedAt: new Date().toISOString() },
    { id: 't3', taskName: 'Kiểm tra phanh', technicianId: 'tech-2', status: 'completed', startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date().toISOString() },
  ]);
  const [reports, setReports] = useState<ReportItem[]>([
    { id: 'r1', stage: 'before-service', details: 'Ảnh và mô tả tình trạng ban đầu', createdAt: new Date().toISOString() },
  ]);

  // UI state
  const [leaderTab, setLeaderTab] = useState<'info' | 'tasks' | 'reports'>('info');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState<null | ReportStage>(null);
  const [statusFilter, setStatusFilter] = useState<ChecklistStatus | 'all'>('all');

  const isLeader = currentUser.role === 'technician-leader';

  function onQuickStatus(taskId: string, target: ChecklistStatus) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const now = new Date().toISOString();
      if (t.status === target) return t; // idempotent
      if (t.status === 'completed') return t; // block downgrade for demo
      const next: ChecklistItem = { ...t, status: target };
      if (target === 'in_progress' && !t.startedAt) next.startedAt = now;
      if (target === 'completed') {
        if (!t.startedAt) next.startedAt = now;
        next.completedAt = now;
      }
      return next;
    }));
  }

  function onAssign(taskId: string, technicianId: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, technicianId } : t));
  }

  function handleCreateTask(taskName: string, technicianId: string) {
    const newTask: ChecklistItem = { id: 't' + (tasks.length + 1), taskName, technicianId, status: 'pending' };
    setTasks(prev => [newTask, ...prev]);
  }

  function handleCreateReport(stage: ReportStage, details: string) {
    const newReport: ReportItem = { id: 'r' + (reports.length + 1), stage, details, createdAt: new Date().toISOString() };
    setReports(prev => [newReport, ...prev]);
  }

  const visibleTasks = useMemo(() => {
    const source = isLeader ? tasks : tasks.filter(t => t.technicianId === currentUser.id);
    return statusFilter === 'all' ? source : source.filter(t => t.status === statusFilter);
  }, [tasks, isLeader, currentUser.id, statusFilter]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Appointment</div>
          <h1 className="text-xl font-semibold" style={{ color: '#014091' }}>{info.service.name}</h1>
          <div className="text-xs text-gray-400">#{info.id} • {formatTime(info.time)}</div>
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
                <div className="font-medium" style={{ color: '#014091' }}>{info.customer.name}</div>
                <div className="text-sm text-gray-500">{info.customer.phone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Xe</div>
                <div className="font-medium" style={{ color: '#014091' }}>{info.vehicle.model}</div>
                <div className="text-sm text-gray-500">Biển số: {info.vehicle.plate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Dịch vụ</div>
                <div className="font-medium" style={{ color: '#014091' }}>{info.service.name}</div>
                <div className="text-sm text-gray-500">Thời lượng ~ {info.service.durationMin} phút</div>
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as ChecklistStatus | 'all')}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
            <div className="space-y-2">
              {visibleTasks.length === 0 ? (
                <div className="text-sm text-gray-400 border border-dashed rounded-xl p-4 text-center">Không có task</div>
              ) : visibleTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <div>
                    <div className="font-medium" style={{ color: '#014091' }}>{t.taskName}</div>
                    <div className="text-xs text-gray-400">{t.startedAt && `Start: ${formatTime(t.startedAt)}`} {t.completedAt && ` • Done: ${formatTime(t.completedAt)}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusBg[t.status]}`}>{statusLabel[t.status]}</span>
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
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Leader Tabs */}
          <div className="bg-white rounded-2xl p-2 flex gap-2 w-full">
            {(['info','tasks','reports'] as const).map((key) => (
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
                  <div className="font-medium" style={{ color: '#014091' }}>{info.customer.name}</div>
                  <div className="text-sm text-gray-500">{info.customer.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Xe</div>
                  <div className="font-medium" style={{ color: '#014091' }}>{info.vehicle.model}</div>
                  <div className="text-sm text-gray-500">Biển số: {info.vehicle.plate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Dịch vụ</div>
                  <div className="font-medium" style={{ color: '#014091' }}>{info.service.name}</div>
                  <div className="text-sm text-gray-500">~ {info.service.durationMin} phút</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Team</div>
                  <div className="text-sm text-gray-600">{info.team.map(t => t.name).join(', ')}</div>
                </div>
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as ChecklistStatus | 'all')}
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
                {visibleTasks.length === 0 ? (
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
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBg[t.status]}`}>{statusLabel[t.status]}</span>
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
                ))}
              </div>

              {/* Create Task Modal */}
              {showCreateTask && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCreateTask(false)}>
                  <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="text-lg font-semibold mb-3" style={{ color: '#014091' }}>Add Checklist</div>
                    <TaskCreateForm team={info.team} onCancel={() => setShowCreateTask(false)} onSubmit={(name, tech) => { handleCreateTask(name, tech); setShowCreateTask(false); }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {leaderTab === 'reports' && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => setShowCreateReport('before-service')}>+ Before-Service</button>
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => setShowCreateReport('intermediate')}>+ During-Service</button>
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => setShowCreateReport('after-service')}>+ After-Service</button>
              </div>

              <div className="space-y-2">
                {reports.length === 0 ? (
                  <div className="text-sm text-gray-400 border border-dashed rounded-xl p-4 text-center">Chưa có report</div>
                ) : reports.map(r => (
                  <div key={r.id} className="border rounded-2xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium" style={{ color: '#014091' }}>{r.stage}</div>
                      <div className="text-xs text-gray-400">{formatTime(r.createdAt)}</div>
                    </div>
                    <div className="text-sm text-gray-600">{r.details}</div>
                  </div>
                ))}
              </div>

              {showCreateReport && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCreateReport(null)}>
                  <div className="bg-white rounded-2xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="text-lg font-semibold mb-3" style={{ color: '#014091' }}>Create Report</div>
                    <ReportCreateForm stage={showCreateReport} onCancel={() => setShowCreateReport(null)} onSubmit={(details) => { handleCreateReport(showCreateReport, details); setShowCreateReport(null); }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCreateForm: React.FC<{ team: TechnicianUser[]; onCancel: () => void; onSubmit: (taskName: string, technicianId: string) => void; }> = ({ team, onCancel, onSubmit }) => {
  const [taskName, setTaskName] = useState('');
  const [tech, setTech] = useState(team[0]?.id || '');
  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm text-gray-500 mb-1">Task name</div>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Nhập tên task" />
      </div>
      <div>
        <div className="text-sm text-gray-500 mb-1">Assign to</div>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={tech} onChange={e => setTech(e.target.value)}>
          {team.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={onCancel}>Hủy</button>
        <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => taskName && onSubmit(taskName, tech)}>Tạo</button>
      </div>
    </div>
  );
};

const ReportCreateForm: React.FC<{ stage: ReportStage; onCancel: () => void; onSubmit: (details: string) => void; }> = ({ stage, onCancel, onSubmit }) => {
  const [details, setDetails] = useState('');
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500">Stage: <span className="font-medium" style={{ color: '#014091' }}>{stage}</span></div>
      <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[120px]" value={details} onChange={e => setDetails(e.target.value)} placeholder="Mô tả/ghi chú" />
      <div className="flex items-center justify-end gap-2">
        <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={onCancel}>Hủy</button>
        <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => details && onSubmit(details)}>Tạo</button>
      </div>
    </div>
  );
};

export default AppointmentWorkspace;


