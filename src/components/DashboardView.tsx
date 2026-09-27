import React from 'react';
import {
  PlusCircle,
  GitBranch,
  ArrowUpRight,
  Eye,
  Activity,
} from 'lucide-react';
import { OverviewData, PageId, TicketItem } from '../types';

interface DashboardViewProps {
  data: OverviewData;
  onNavigate: (page: PageId) => void;
  onSelectTicket: (ticket: TicketItem) => void;
  onOpenEscalateModal: (ticket: TicketItem | null) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onSelectTicket,
  onOpenEscalateModal,
}) => {
  const { metrics, tickets, escalations, categories } = data;

  // Category distribution count
  const categoryCounts = categories.map((cat) => {
    const count = tickets.filter(
      (t) => t.category_name.toLowerCase() === cat.category_name.toLowerCase()
    ).length;
    const pct = metrics.totalTickets > 0 ? Math.round((count / metrics.totalTickets) * 100) : 0;
    return { name: cat.category_name, team: cat.default_team, count, pct };
  });

  // Status breakdown
  const statusCounts = [
    { label: 'Open', count: metrics.openTickets, color: 'bg-indigo-600' },
    { label: 'In Progress', count: metrics.inProgressTickets, color: 'bg-amber-500' },
    { label: 'Escalated', count: metrics.escalatedTickets, color: 'bg-rose-600' },
    { label: 'Resolved', count: metrics.resolvedTickets, color: 'bg-emerald-600' },
  ];

  // Priority breakdown
  const priorityCounts = (['Critical', 'High', 'Medium', 'Low'] as const).map((p) => ({
    label: p,
    count: tickets.filter((t) => t.priority === p).length,
  }));

  const kpiCards = [
    {
      label: 'Total Tickets',
      value: metrics.totalTickets,
      sub: 'Across 6 support categories',
      tone: 'text-slate-900',
    },
    {
      label: 'Open Tickets',
      value: metrics.openTickets,
      sub: 'Awaiting initial triage',
      tone: 'text-indigo-700',
    },
    {
      label: 'In Progress',
      value: metrics.inProgressTickets,
      sub: 'Assigned to active agents',
      tone: 'text-amber-700',
    },
    {
      label: 'Resolved',
      value: metrics.resolvedTickets,
      sub: 'Verified closure',
      tone: 'text-emerald-700',
    },
    {
      label: 'Escalated',
      value: metrics.escalatedTickets,
      sub: 'Multi-level graph routing',
      tone: 'text-rose-700',
    },
    {
      label: 'Average Resolution Time',
      value: metrics.avgResolutionTime,
      sub: 'Mean time to resolution',
      tone: 'text-slate-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Quick Actions Strip */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Helpdesk Operations & Escalation Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based ticket classification, automated team routing, and directed graph escalation tracking
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('create-ticket')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Ticket
          </button>
          <button
            onClick={() => onNavigate('escalation-graph')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            Escalation Graph
          </button>
          <button
            onClick={() => onNavigate('graph-analysis')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            BFS / DFS Analysis
          </button>
          <button
            onClick={() => onOpenEscalateModal(null)}
            className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Escalate Ticket
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between"
          >
            <div className="text-xs font-medium text-slate-500">{card.label}</div>
            <div className={`text-2xl font-bold font-mono tabular-nums mt-2 ${card.tone}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 3 Charts Grid: Category Distribution, Ticket Status, Priority Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Category Distribution</h3>
            <span className="text-xs text-slate-500 font-mono">Rule Classifier</span>
          </div>
          <div className="space-y-3">
            {categoryCounts.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    {item.name}{' '}
                    <span className="text-slate-400 font-normal">· {item.team}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(item.pct, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Status Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Ticket Status Breakdown</h3>
            <span className="text-xs text-slate-500 font-mono">
              Total: {metrics.totalTickets}
            </span>
          </div>
          <div className="space-y-3.5">
            {statusCounts.map((st) => {
              const pct =
                metrics.totalTickets > 0
                  ? Math.round((st.count / metrics.totalTickets) * 100)
                  : 0;
              return (
                <div key={st.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{st.label}</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {st.count} tickets · {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Tickets by Priority</h3>
            <span className="text-xs text-slate-500 font-mono">SLA Severity</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {priorityCounts.map((p) => {
              const pct =
                metrics.totalTickets > 0
                  ? Math.round((p.count / metrics.totalTickets) * 100)
                  : 0;
              return (
                <div
                  key={p.label}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div className="text-xs font-medium text-slate-600">{p.label}</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {p.count}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{pct}% of queue</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Split: Recent Tickets Table & Recent Escalation Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Tickets Table */}
        <div className="xl:col-span-2 rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Support Tickets</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any ticket to inspect classification rules, timeline, and escalation path
              </p>
            </div>
            <button
              onClick={() => onNavigate('all-tickets')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All ({tickets.length}) →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Category · Team</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {tickets.slice(0, 6).map((t) => (
                  <tr
                    key={t.ticket_id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelectTicket(t)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {t.ticket_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {t.customer_name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{t.title}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{t.category_name}</span> ·{' '}
                      <span className="text-slate-500">{t.assigned_team}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          t.status === 'Resolved'
                            ? 'text-emerald-700'
                            : t.status === 'Escalated'
                            ? 'text-rose-700'
                            : t.status === 'In Progress'
                            ? 'text-amber-700'
                            : 'text-indigo-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectTicket(t)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Escalation Activity */}
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Escalation Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tier escalation hops
              </p>
            </div>
            <button
              onClick={() => onNavigate('escalations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All Escalations →
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {escalations.slice(0, 5).map((esc) => (
              <div
                key={esc.escalation_id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-rose-700">
                    {esc.ticket_id} · {esc.escalation_id}
                  </span>
                  <span className="font-mono text-slate-400">{esc.date.split(' ')[0]}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {esc.previous_level} → {esc.level}
                </div>
                <div className="text-xs text-slate-600">
                  Customer: <span className="font-medium">{esc.customer_name}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{esc.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
