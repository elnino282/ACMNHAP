import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Search, RefreshCw, AlertCircle, Filter, ChevronRight, Play, CheckCircle, Pencil, X } from 'lucide-react';
import { adminSeasonApi, adminTaskApi, adminFarmApi, adminCropApi } from '@/services/api.admin';
import { SeasonEditModal } from './components/SeasonEditModal';
import { TaskEditModal } from './components/TaskEditModal';

interface Season {
  id: number;
  seasonName: string;
  cropName: string | null;
  varietyName: string | null;
  plotName: string | null;
  plotId: number | null;
  farmName: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  expectedYield: number | null;
  actualYieldKg: number | null;
  notes: string | null;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  userName: string | null;
  userId: number | null;
  seasonName: string | null;
  seasonId: number | null;
  farmId: number | null;
  farmName: string | null;
  cropId: number | null;
  cropName: string | null;
  plannedDate: string | null;
  dueDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface SeasonDetail extends Season {
  tasks?: any[];
  expenses?: any[];
  harvests?: any[];
  incidents?: any[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function SeasonsTasksPage() {
  const [activeTab, setActiveTab] = useState<'seasons' | 'tasks'>('seasons');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('');
  const [seasonIdFilter, setSeasonIdFilter] = useState<number | null>(null);
  const [farmFilter, setFarmFilter] = useState<number | null>(null);
  const [cropFilter, setCropFilter] = useState<number | null>(null);

  // Filter options
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);

  // Detail states
  const [selectedSeason, setSelectedSeason] = useState<SeasonDetail | null>(null);
  const [showSeasonDetail, setShowSeasonDetail] = useState(false);

  // Edit modal states
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSeasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminSeasonApi.list({
        page,
        size: 20,
        status: statusFilter || undefined,
        farmId: farmFilter || undefined,
        cropId: cropFilter || undefined
      });
      if (response?.result?.items) {
        setSeasons(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load seasons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminTaskApi.list({
        page,
        size: 20,
        status: taskStatusFilter || undefined,
        seasonId: seasonIdFilter || undefined,
        farmId: farmFilter || undefined,
        cropId: cropFilter || undefined
      });
      if (response?.result?.items) {
        setTasks(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'seasons') {
      fetchSeasons();
    } else {
      fetchTasks();
    }
  }, [activeTab, page, statusFilter, taskStatusFilter, seasonIdFilter, farmFilter, cropFilter]);

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [farmsRes, cropsRes] = await Promise.all([
          adminFarmApi.list({ page: 0, size: 1000 }),
          adminCropApi.list()
        ]);
        if (farmsRes?.result?.items) {
          setFarms(farmsRes.result.items);
        }
        if (cropsRes?.result) {
          setCrops(cropsRes.result);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  const handleViewSeason = async (season: Season) => {
    setSelectedSeason(season);
    setShowSeasonDetail(true);
    setDetailLoading(true);
    try {
      const response = await adminSeasonApi.getById(season.id);
      if (response?.result) {
        setSelectedSeason(response.result);
      }
    } catch (err) {
      console.error('Failed to load season detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await adminTaskApi.update(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const resetSeasonFilters = () => {
    setStatusFilter('');
    setFarmFilter(null);
    setCropFilter(null);
    setPage(0);
  };

  const resetTaskFilters = () => {
    setTaskStatusFilter('');
    setSeasonIdFilter(null);
    setFarmFilter(null);
    setCropFilter(null);
    setPage(0);
  };

  const renderSeasons = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <select
            value={farmFilter || ''}
            onChange={(e) => { setFarmFilter(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Farms</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>

          <select
            value={cropFilter || ''}
            onChange={(e) => { setCropFilter(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Crops</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>{crop.cropName}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {(statusFilter || farmFilter || cropFilter) && (
            <button
              onClick={resetSeasonFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
        <button
          onClick={fetchSeasons}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Season</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Crop</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plot / Farm</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                    <button onClick={fetchSeasons} className="text-sm text-primary hover:underline">
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : seasons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No seasons found
                </td>
              </tr>
            ) : (
              seasons.map((season) => (
                <tr key={season.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{season.seasonName}</td>
                  <td className="px-4 py-3 text-sm">
                    {season.cropName && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {season.cropName}
                      </span>
                    )}
                    {season.varietyName && (
                      <span className="text-xs text-muted-foreground ml-1">({season.varietyName})</span>
                    )}
                    {!season.cropName && '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {season.plotName || '-'}
                    {season.farmName && <span className="text-xs"> ({season.farmName})</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${STATUS_COLORS[season.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                      {season.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(season.startDate).toLocaleDateString()}
                    {season.endDate && ` - ${new Date(season.endDate).toLocaleDateString()}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewSeason(season)}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSeason(season)}
                        className="text-sm text-amber-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <select
            value={farmFilter || ''}
            onChange={(e) => { setFarmFilter(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Farms</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>

          <select
            value={cropFilter || ''}
            onChange={(e) => { setCropFilter(e.target.value ? Number(e.target.value) : null); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Crops</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>{crop.cropName}</option>
            ))}
          </select>

          <select
            value={taskStatusFilter}
            onChange={(e) => { setTaskStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {(taskStatusFilter || farmFilter || cropFilter) && (
            <button
              onClick={resetTaskFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
        <button
          onClick={fetchTasks}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assigned To</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Season</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                    <button onClick={fetchTasks} className="text-sm text-primary hover:underline">
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{task.userName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{task.seasonName || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${TASK_STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 inline-flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 inline-flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 inline-flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Seasons & Tasks</h1>
        <p className="text-muted-foreground">Monitor all seasons and tasks across the system</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => { setActiveTab('seasons'); setPage(0); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'seasons'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Calendar className="inline-block h-4 w-4 mr-2" />
          Seasons
        </button>
        <button
          onClick={() => { setActiveTab('tasks'); setPage(0); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'tasks'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <CheckSquare className="inline-block h-4 w-4 mr-2" />
          Tasks
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'seasons' && renderSeasons()}
      {activeTab === 'tasks' && renderTasks()}

      {/* Season Detail Drawer */}
      {showSeasonDetail && selectedSeason && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-lg overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Season Details</h2>
                <button
                  onClick={() => setShowSeasonDetail(false)}
                  className="p-2 hover:bg-muted rounded"
                >
                  ✕
                </button>
              </div>

              {detailLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading details...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">{selectedSeason.seasonName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${STATUS_COLORS[selectedSeason.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                          {selectedSeason.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Crop</label>
                      <p className="text-sm">{selectedSeason.cropName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Variety</label>
                      <p className="text-sm">{selectedSeason.varietyName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Plot</label>
                      <p className="text-sm">{selectedSeason.plotName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm</label>
                      <p className="text-sm">{selectedSeason.farmName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <p className="text-sm">{new Date(selectedSeason.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      <p className="text-sm">{selectedSeason.endDate ? new Date(selectedSeason.endDate).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  {/* Related data sections */}
                  {selectedSeason.tasks && selectedSeason.tasks.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-sm font-medium mb-2">Tasks ({selectedSeason.tasks.length})</h3>
                      <div className="space-y-1">
                        {selectedSeason.tasks.slice(0, 5).map((task: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-muted/30 rounded">
                            {task.title} - <span className={`${TASK_STATUS_COLORS[task.status] ? 'font-medium' : ''}`}>{task.status}</span>
                          </div>
                        ))}
                        {selectedSeason.tasks.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{selectedSeason.tasks.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSeason.expenses && selectedSeason.expenses.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-sm font-medium mb-2">Expenses ({selectedSeason.expenses.length})</h3>
                      <p className="text-xs text-muted-foreground">{selectedSeason.expenses.length} expense records</p>
                    </div>
                  )}

                  {selectedSeason.harvests && selectedSeason.harvests.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-sm font-medium mb-2">Harvests ({selectedSeason.harvests.length})</h3>
                      <p className="text-xs text-muted-foreground">{selectedSeason.harvests.length} harvest records</p>
                    </div>
                  )}

                  {selectedSeason.incidents && selectedSeason.incidents.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-sm font-medium mb-2">Incidents ({selectedSeason.incidents.length})</h3>
                      <p className="text-xs text-muted-foreground">{selectedSeason.incidents.length} incident records</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Season Edit Modal */}
      {editingSeason && (
        <SeasonEditModal
          season={editingSeason}
          open={!!editingSeason}
          onClose={() => setEditingSeason(null)}
          onSuccess={() => {
            fetchSeasons();
            setEditingSeason(null);
          }}
        />
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            fetchTasks();
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

