import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  Circle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSeasons } from "@/entities/season";
import { useTasksBySeason, type Task as ApiTask } from "@/entities/task";
import { usePlots } from "@/entities/plot";
import { useIncidentsBySeason } from "@/entities/incident";
import { useFieldLogsBySeason } from "@/entities/field-log";
import {
  Task,
  Plot,
  InventoryItem,
  Incident,
  Activity,
  UpcomingTaskDay,
  IncidentSeverity,
  TaskStatus,
} from "../types";
import {
  HEALTH_COLORS,
  SEVERITY_STYLES,
  SEVERITY_ICON_COLORS,
  ACTIVITY_ICON_COLORS,
  STATUS_BADGE_STYLES,
  STATUS_BADGE_LABELS,
} from "../constants";

/**
 * Return type for the useFarmerDashboard hook
 */
export interface UseFarmerDashboardReturn {
  // State
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  seasonOptions: { value: string; label: string }[];
  tasksToday: Task[];

  // Data
  plots: Plot[];
  inventory: InventoryItem[];
  incidents: Incident[];
  activities: Activity[];
  upcomingTasks: UpcomingTaskDay[];

  // Loading/Error - Separated into critical and non-critical
  isCriticalLoading: boolean; // Blocks entire UI
  isDataLoading: boolean; // Shows partial UI with skeletons
  hasNoSeasons: boolean;
  seasonsError: Error | null;
  plotsError: Error | null;
  tasksError: Error | null;
  incidentsError: Error | null;
  logsError: Error | null;

  // Handlers
  toggleTask: (taskId: string) => void;

  // Utility functions
  getHealthColor: (health: string) => string;
  getSeverityColor: (severity: string) => string;
  getSeverityIcon: (severity: string) => JSX.Element | null;
  getActivityIcon: (type: string) => JSX.Element;
  getStatusBadge: (status: string) => JSX.Element | null;
}

export const useFarmerDashboard = (): UseFarmerDashboardReturn => {
  // 1. Fetch Seasons (Critical - blocks UI)
  const { data: seasonsData, isLoading: seasonsLoading, error: seasonsError } = useSeasons();

  const seasonOptions = useMemo(() => {
    return seasonsData?.items?.map(s => ({
      value: String(s.id),
      label: s.seasonName
    })) ?? [];
  }, [seasonsData]);

  // Default to first season if available
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only run initialization once when seasons are loaded
    if (!hasInitialized && !seasonsLoading) {
      if (seasonOptions.length > 0) {
        setSelectedSeason(seasonOptions[0].value);
      }
      setHasInitialized(true);
    }
  }, [seasonOptions, seasonsLoading, hasInitialized]);

  const seasonId = parseInt(selectedSeason, 10);
  const hasSeason = !isNaN(seasonId) && seasonId > 0;

  // 2. Fetch Data based on Season (Non-critical - show partial UI)
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasksBySeason(seasonId, undefined, { enabled: hasSeason });
  const { data: plotsData, isLoading: plotsLoading, error: plotsError } = usePlots();
  const { data: incidentsData, isLoading: incidentsLoading, error: incidentsError } = useIncidentsBySeason(seasonId, { enabled: hasSeason });
  const { data: fieldLogsData, isLoading: logsLoading, error: logsError } = useFieldLogsBySeason(seasonId, undefined, { enabled: hasSeason });

  // 3. Transform Data

  // Tasks Today & Upcoming
  const { tasksToday, upcomingTasks } = useMemo(() => {
    const items: ApiTask[] = tasksData?.items ?? [];
    if (items.length === 0) return { tasksToday: [], upcomingTasks: [] };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayTasks = items
      .filter(t => String(t.dueDate).startsWith(todayStr) || !t.dueDate)
      .map(t => ({
        id: String(t.id),
        title: t.title,
        plot: "Plot A", // Placeholder
        type: "scouting", // Placeholder
        assignee: "User", // Placeholder
        due: t.dueDate ? String(t.dueDate) : "Today",
        status: (t.status === 'DONE' ? 'completed' : t.status === 'IN_PROGRESS' ? 'in-progress' : 'not-started') as TaskStatus,
        checked: t.status === 'DONE'
      }));

    const upcoming: UpcomingTaskDay[] = [];

    return { tasksToday: todayTasks, upcomingTasks: upcoming };
  }, [tasksData]);

  // Plots
  const plots = useMemo(() => {
    return plotsData?.map(p => ({
      id: String(p.id),
      name: p.plotName,
      crop: "Mixed", // Placeholder
      stage: "Growing", // Placeholder
      health: "healthy", // Placeholder
      area: p.area ?? 0
    } as Plot)) ?? [];
  }, [plotsData]);

  // Incidents
  const incidents = useMemo(() => {
    // incidentsData is Incident[] directly
    return incidentsData?.map(i => ({
      id: String(i.id),
      title: `${i.incidentType} - ${i.description.substring(0, 20)}...`,
      severity: i.severity.toLowerCase() as IncidentSeverity,
      plot: "Plot A", // Placeholder
      time: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "Unknown"
    } as Incident)) ?? [];
  }, [incidentsData]);

  // Activities
  const activities = useMemo(() => {
    return fieldLogsData?.items?.map(l => ({
      id: String(l.id),
      action: `${l.logType}: ${l.notes?.substring(0, 30)}...`,
      user: "User",
      time: String(l.logDate),
      type: "task"
    } as Activity)) ?? [];
  }, [fieldLogsData]);

  // Handlers
  const toggleTask = (taskId: string) => {
    console.log("Toggle task", taskId);
  };

  // Helpers
  const getHealthColor = (health: string): string => {
    return HEALTH_COLORS[health as keyof typeof HEALTH_COLORS] ?? HEALTH_COLORS.default;
  };

  const getSeverityColor = (severity: string): string => {
    return SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES] ?? SEVERITY_STYLES.default;
  };

  const getSeverityIcon = (severity: string): JSX.Element | null => {
    const colorClass = SEVERITY_ICON_COLORS[severity as keyof typeof SEVERITY_ICON_COLORS];
    if (!colorClass) return null;

    switch (severity) {
      case "high": return <XCircle className={`w-4 h-4 ${colorClass}`} />;
      case "medium": return <AlertTriangle className={`w-4 h-4 ${colorClass}`} />;
      case "low": return <AlertCircle className={`w-4 h-4 ${colorClass}`} />;
      default: return null;
    }
  };

  const getActivityIcon = (type: string): JSX.Element => {
    const colorClass = ACTIVITY_ICON_COLORS[type as keyof typeof ACTIVITY_ICON_COLORS] ?? ACTIVITY_ICON_COLORS.default;
    switch (type) {
      case "task": return <CheckCircle2 className={`w-4 h-4 ${colorClass}`} />;
      case "expense": return <DollarSign className={`w-4 h-4 ${colorClass}`} />;
      case "incident": return <AlertTriangle className={`w-4 h-4 ${colorClass}`} />;
      case "season": return <Calendar className={`w-4 h-4 ${colorClass}`} />;
      default: return <Circle className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  const getStatusBadge = (status: string): JSX.Element | null => {
    const styleClass = STATUS_BADGE_STYLES[status as keyof typeof STATUS_BADGE_STYLES];
    const label = STATUS_BADGE_LABELS[status as keyof typeof STATUS_BADGE_LABELS];
    if (!styleClass || !label) return null;
    return <Badge className={styleClass}>{label}</Badge>;
  };

  // Separate loading states: Critical vs Non-critical
  // Critical loading: Blocks entire UI until seasons are loaded
  const isCriticalLoading = !hasInitialized || seasonsLoading;
  
  // Non-critical loading: Allow partial UI rendering
  const isDataLoading = tasksLoading || plotsLoading || incidentsLoading || logsLoading;
  
  // Check if we have no seasons after initialization
  const hasNoSeasons = hasInitialized && !seasonsLoading && seasonOptions.length === 0;

  // Debug logging to track state changes
  useEffect(() => {
    console.log('[Dashboard] State Update:', {
      hasInitialized,
      seasonsLoading,
      seasonOptionsCount: seasonOptions.length,
      selectedSeason,
      hasSeason,
      isCriticalLoading,
      isDataLoading,
      hasNoSeasons,
      errors: {
        seasons: seasonsError?.message,
        plots: plotsError?.message,
        tasks: tasksError?.message,
        incidents: incidentsError?.message,
        logs: logsError?.message,
      }
    });
  }, [hasInitialized, seasonsLoading, seasonOptions.length, selectedSeason, hasSeason, 
      isCriticalLoading, isDataLoading, hasNoSeasons, seasonsError, plotsError, 
      tasksError, incidentsError, logsError]);

  return {
    selectedSeason,
    setSelectedSeason,
    seasonOptions,
    tasksToday,
    plots,
    inventory: [],
    incidents,
    activities,
    upcomingTasks,
    isCriticalLoading,
    isDataLoading,
    hasNoSeasons,
    seasonsError: seasonsError ?? null,
    plotsError: plotsError ?? null,
    tasksError: tasksError ?? null,
    incidentsError: incidentsError ?? null,
    logsError: logsError ?? null,
    toggleTask,
    getHealthColor,
    getSeverityColor,
    getSeverityIcon,
    getActivityIcon,
    getStatusBadge,
  };
};
