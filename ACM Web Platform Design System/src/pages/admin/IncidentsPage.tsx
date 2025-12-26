import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, AlertCircle, X, Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { adminIncidentApi } from '@/services/api.admin';

interface Incident {
  id: number;
  incidentType: string;
  description: string;
  severity: string;
  status: string;
  deadline: string | null;
  createdAt: string;
  resolvedAt: string | null;
  seasonId: number | null;
  seasonName: string | null;
  assigneeId: number | null;
  assigneeUsername: string | null;
  resolutionNote: string | null;
  cancellationReason: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

// ═══════════════════════════════════════════════════════════════
// TRIAGE MODAL
// ═══════════════════════════════════════════════════════════════

interface TriageModalProps {
  incident: Incident;
  onClose: () => void;
  onSuccess: () => void;
}

function TriageModal({ incident, onClose, onSuccess }: TriageModalProps) {
  const [severity, setSeverity] = useState(incident.severity || 'LOW');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminIncidentApi.triage(incident.id, {
        severity,
        deadline: deadline || undefined,
      });
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Incident was modified by another user. Please reload.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to triage incident');
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Triage Incident</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Assign severity and deadline to start working on this incident.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Severity *</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline (Optional)</label>
            <input
              type="date"
              value={deadline}
              min={today}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Start Triage'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESOLVE MODAL
// ═══════════════════════════════════════════════════════════════

interface ResolveModalProps {
  incident: Incident;
  onClose: () => void;
  onSuccess: () => void;
}

function ResolveModal({ incident, onClose, onSuccess }: ResolveModalProps) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!resolutionNote.trim()) {
      setError('Resolution note is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminIncidentApi.resolve(incident.id, { resolutionNote });
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Incident was modified by another user. Please reload.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to resolve incident');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Resolve Incident</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Provide a resolution note to close this incident.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Resolution Note *</label>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe how the incident was resolved..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !resolutionNote.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CANCEL MODAL
// ═══════════════════════════════════════════════════════════════

interface CancelModalProps {
  incident: Incident;
  onClose: () => void;
  onSuccess: () => void;
}

function CancelModal({ incident, onClose, onSuccess }: CancelModalProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      setError('Cancellation reason is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminIncidentApi.cancel(incident.id, { cancellationReason });
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Incident was modified by another user. Please reload.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to cancel incident');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Cancel Incident</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Provide a reason for cancelling this incident (e.g., duplicate, invalid).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Cancellation Reason *</label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Why is this incident being cancelled?"
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !cancellationReason.trim()}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  // Modal states
  const [triageIncident, setTriageIncident] = useState<Incident | null>(null);
  const [resolveIncident, setResolveIncident] = useState<Incident | null>(null);
  const [cancelIncident, setCancelIncident] = useState<Incident | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminIncidentApi.list({
        page,
        size: 20,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      });
      if (response?.result?.items) {
        setIncidents(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, statusFilter, severityFilter]);

  const handleModalSuccess = () => {
    setTriageIncident(null);
    setResolveIncident(null);
    setCancelIncident(null);
    fetchIncidents();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Incidents (Dispatch Center)</h1>
        <p className="text-muted-foreground">Triage, resolve, and manage incidents across all operations</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Severity</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="flex-1" />
        <button
          onClick={fetchIncidents}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Severity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deadline</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Season</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                    <button onClick={fetchIncidents} className="text-sm text-primary hover:underline">
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No incidents found
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{incident.incidentType || '-'}</div>
                    {incident.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {incident.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${SEVERITY_COLORS[incident.severity] || 'bg-gray-100 text-gray-800'
                      }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${STATUS_COLORS[incident.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {incident.deadline ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(incident.deadline).toLocaleDateString()}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{incident.seasonName || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* OPEN incidents: Triage or Cancel */}
                      {incident.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => setTriageIncident(incident)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            Triage
                          </button>
                          <button
                            onClick={() => setCancelIncident(incident)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {/* IN_PROGRESS incidents: Resolve or Cancel */}
                      {incident.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={() => setResolveIncident(incident)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => setCancelIncident(incident)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {/* RESOLVED/CANCELLED: Read-only */}
                      {(incident.status === 'RESOLVED' || incident.status === 'CANCELLED') && (
                        <span className="text-xs text-muted-foreground italic">Read-only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
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

      {/* Modals */}
      {triageIncident && (
        <TriageModal
          incident={triageIncident}
          onClose={() => setTriageIncident(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {resolveIncident && (
        <ResolveModal
          incident={resolveIncident}
          onClose={() => setResolveIncident(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {cancelIncident && (
        <CancelModal
          incident={cancelIncident}
          onClose={() => setCancelIncident(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
