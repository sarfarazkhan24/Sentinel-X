import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Download, Search } from 'lucide-react';
import { fetchAllIncidents } from '../services/api';
import { Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SourceBadge, sourceLabel } from '../components/common/SourceBadge';

export const IncidentHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await fetchAllIncidents({
        workerId: selectedWorker || undefined,
        severity: selectedSeverity || undefined,
        status: selectedStatus || undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [selectedWorker, selectedSeverity, selectedStatus]);

  const filtered = incidents.filter((i) =>
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.workerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['IncidentID', 'WorkerID', 'HelmetID', 'Type', 'Source', 'Severity', 'Status', 'DetectedAt', 'AcknowledgedBy', 'ResolvedAt'];
    const rows = filtered.map(i => [
      i.incidentId,
      i.workerId,
      i.helmetId,
      i.incidentType,
      sourceLabel(i.isSimulated),
      i.severity,
      i.status,
      i.detectedAt,
      i.acknowledgedBy || '',
      i.resolvedAt || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinelx_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Industrial Incident &amp; Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all environmental spikes, biometrics hazards, and triage actions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={loadIncidents}
            className="flex items-center space-x-1.5 bg-[#18191B] hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-xs p-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident type, description, worker..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
          />
        </div>

        {/* Worker Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Worker:</span>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="">All Workers</option>
            <option value="W-101">W-101 (Alex Carter)</option>
            <option value="W-102">W-102 (Marcus Vance)</option>
            <option value="W-103">W-103 (Sarah Chen)</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH_RISK">HIGH RISK</option>
            <option value="WARNING">WARNING</option>
            <option value="NORMAL">NORMAL</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-mono">
              <tr>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Incident Type</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Worker / Helmet</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Detected</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                    No incident records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.incidentId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <SeverityBadge severity={item.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.incidentType}
                    </td>
                    <td className="py-3 px-4">
                      <SourceBadge isSimulated={item.isSimulated} />
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-800">{item.workerId}</span>{' '}
                      <span className="text-slate-400">({item.helmetId})</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={item.description}>
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.detectedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-2xs ${
                          item.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.resolvedAt ? (
                        <span className="text-emerald-700 font-medium">
                          Resolved {new Date(item.resolvedAt).toLocaleTimeString()}
                        </span>
                      ) : item.acknowledgedAt ? (
                        <span className="text-amber-700 font-medium">
                          Ack by {item.acknowledgedBy}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">Pending action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
