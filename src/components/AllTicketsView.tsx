import React, { useState } from 'react';
import {
  Search,
  Eye,
  UserCheck,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { TicketItem } from '../types';

interface AllTicketsViewProps {
  tickets: TicketItem[];
  globalSearch: string;
  onSelectTicket: (ticket: TicketItem) => void;
  onOpenAssign: (ticket: TicketItem) => void;
  onOpenEscalate: (ticket: TicketItem) => void;
  onResolveTicket: (ticketId: string) => void;
}

export const AllTicketsView: React.FC<AllTicketsViewProps> = ({
  tickets,
  globalSearch,
  onSelectTicket,
  onOpenAssign,
  onOpenEscalate,
  onResolveTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const combinedQuery = (searchTerm || globalSearch).toLowerCase().trim();

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !combinedQuery ||
      t.ticket_id.toLowerCase().includes(combinedQuery) ||
      t.customer_name.toLowerCase().includes(combinedQuery) ||
      t.title.toLowerCase().includes(combinedQuery) ||
      t.description.toLowerCase().includes(combinedQuery) ||
      t.agent_name.toLowerCase().includes(combinedQuery) ||
      t.assigned_team.toLowerCase().includes(combinedQuery);

    const matchesCategory =
      categoryFilter === 'All' || t.category_name.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === 'All' || t.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ticket ID, customer name, problem, or assigned agent..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Categories</option>
            <option value="Payment">Payment</option>
            <option value="Technical">Technical</option>
            <option value="Refund">Refund</option>
            <option value="Delivery">Delivery</option>
            <option value="Account">Account</option>
            <option value="General">General</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Escalated">Escalated</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-700">
            Showing <span className="font-mono">{filteredTickets.length}</span> of{' '}
            <span className="font-mono">{tickets.length}</span> total tickets
          </div>
          <div className="text-xs text-slate-500">
            Click any row or action button to inspect, assign, escalate, or resolve
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No tickets match the selected search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => onSelectTicket(t)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {t.ticket_id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{t.customer_name}</div>
                      <div className="text-slate-400 text-[11px]">{t.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="font-medium text-slate-900 truncate">{t.title}</div>
                      <div className="text-slate-500 truncate text-[11px]">{t.description}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {t.category_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          t.priority === 'Critical'
                            ? 'text-rose-700'
                            : t.priority === 'High'
                            ? 'text-amber-700'
                            : t.priority === 'Medium'
                            ? 'text-indigo-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {t.assigned_team}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{t.agent_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {t.current_escalation_level}
                      </div>
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
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {t.created_date.split(' ')[0]}
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectTicket(t)}
                          className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 inline-flex items-center gap-1"
                          title="View Ticket"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => onOpenAssign(t)}
                          className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 inline-flex items-center gap-1"
                          title="Assign Agent"
                        >
                          <UserCheck className="w-3 h-3" />
                          Assign
                        </button>
                        {t.status !== 'Resolved' && (
                          <>
                            <button
                              onClick={() => onOpenEscalate(t)}
                              className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 rounded hover:bg-rose-100 inline-flex items-center gap-1"
                              title="Escalate Ticket"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Escalate
                            </button>
                            <button
                              onClick={() => onResolveTicket(t.ticket_id)}
                              className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100 inline-flex items-center gap-1"
                              title="Resolve Ticket"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
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
