import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserCheck,
  AlertTriangle,
  GitBranch,
  Mail,
  User,
  Calendar,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { TicketItem } from '../types';

interface TicketDetailsModalProps {
  ticket: TicketItem | null;
  onClose: () => void;
  onOpenAssign: (ticket: TicketItem) => void;
  onOpenEscalate: (ticket: TicketItem) => void;
  onResolveTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketItem['status']) => void;
  onViewInGraph: (ticketId: string) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  onClose,
  onOpenAssign,
  onOpenEscalate,
  onResolveTicket,
  onUpdateStatus,
  onViewInGraph,
}) => {
  if (!ticket) return null;

  const isEscalated = ticket.status === 'Escalated' || ticket.escalations.length > 0;
  const isResolved = ticket.status === 'Resolved';
  const isInProgressOrLater =
    ticket.status === 'In Progress' || ticket.status === 'Escalated' || ticket.status === 'Resolved';

  const timelineSteps = [
    {
      label: 'Ticket Created',
      detail: `Logged by ${ticket.customer_name} on ${ticket.created_date}`,
      done: true,
    },
    {
      label: 'Classified',
      detail: `Rule-based classifier detected "${ticket.category_name}"`,
      done: true,
    },
    {
      label: 'Assigned',
      detail: `Routed to ${ticket.assigned_team} · ${ticket.agent_name}`,
      done: true,
    },
    {
      label: 'In Progress',
      detail: isInProgressOrLater
        ? `Active investigation by ${ticket.agent_name}`
        : 'Awaiting agent triage',
      done: isInProgressOrLater,
    },
    {
      label: 'Escalated if required',
      detail: isEscalated
        ? `Escalated (${ticket.escalations.length} hop${ticket.escalations.length === 1 ? '' : 's'}) · Current Level: ${ticket.current_escalation_level}`
        : 'No escalation required so far',
      done: isEscalated,
      optional: !isEscalated,
    },
    {
      label: 'Resolved',
      detail: isResolved
        ? `Resolved on ${ticket.updated_date}`
        : 'Pending final resolution',
      done: isResolved,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-semibold text-indigo-300">
                {ticket.ticket_id}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-medium text-slate-300">
                {ticket.category_name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-medium text-amber-300">
                {ticket.priority} Priority
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-1 leading-snug">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close ticket details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Status & Actions Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Current Ticket Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    ticket.status === 'Resolved'
                      ? 'text-emerald-700'
                      : ticket.status === 'Escalated'
                      ? 'text-rose-700'
                      : ticket.status === 'In Progress'
                      ? 'text-amber-700'
                      : 'text-indigo-700'
                  }`}
                >
                  {ticket.status}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 font-mono">
                  {ticket.current_escalation_level}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onViewInGraph(ticket.ticket_id)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                View Graph
              </button>
              <button
                onClick={() => onOpenAssign(ticket)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                Assign Agent
              </button>
              {ticket.status !== 'Resolved' && (
                <>
                  <button
                    onClick={() => onOpenEscalate(ticket)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Escalate
                  </button>
                  <button
                    onClick={() => onResolveTicket(ticket.ticket_id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve Ticket
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer Information
              </div>
              <div className="mt-1.5 font-semibold text-slate-900">
                {ticket.customer_name}{' '}
                <span className="font-mono text-xs text-slate-500 font-normal">
                  ({ticket.customer_id})
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {ticket.customer_email}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Routing & Assignment
              </div>
              <div className="mt-1.5 font-semibold text-slate-900">
                {ticket.assigned_team}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Agent: <span className="font-medium text-slate-800">{ticket.agent_name}</span> ·{' '}
                <span className="font-mono">{ticket.current_escalation_level}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                Classification & Priority
              </div>
              <div className="mt-1.5 text-sm font-semibold text-slate-900">
                Category: {ticket.category_name} · Priority: {ticket.priority}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Matched Keywords:{' '}
                {ticket.matched_keywords && ticket.matched_keywords.length > 0
                  ? ticket.matched_keywords.join(', ')
                  : 'Default general routing rule'}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Timestamps
              </div>
              <div className="mt-1.5 text-xs text-slate-700 font-mono">
                Created: {ticket.created_date}
              </div>
              <div className="mt-1 text-xs text-slate-700 font-mono">
                Updated: {ticket.updated_date}
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-xs font-semibold text-slate-500">Problem Description</h3>
            <p className="mt-2 text-sm text-slate-800 leading-relaxed">{ticket.description}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Rule Evaluation:</span>{' '}
              {ticket.rule_explanation}
            </div>
          </div>

          {/* Direct Status Switcher */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="text-xs font-semibold text-slate-500 mb-2.5">
              Update Ticket Status
            </div>
            <div className="flex flex-wrap gap-2">
              {(['Open', 'In Progress', 'Escalated', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(ticket.ticket_id, st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    ticket.status === st
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Lifecycle Timeline */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Ticket Lifecycle Timeline
            </h3>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        step.done
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {step.done ? '✓' : index + 1}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-6 mt-1 ${
                          step.done ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <div
                      className={`text-sm font-semibold ${
                        step.done ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Escalation History */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Complete Escalation History ({ticket.escalations.length})
              </h3>
              {ticket.status !== 'Resolved' && (
                <button
                  onClick={() => onOpenEscalate(ticket)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  + Add Escalation Step
                </button>
              )}
            </div>

            {ticket.escalations.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                This ticket has not been escalated. It is currently handled at{' '}
                {ticket.current_escalation_level}.
              </div>
            ) : (
              <div className="space-y-3">
                {ticket.escalations.map((esc) => (
                  <div
                    key={esc.escalation_id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-indigo-700">
                        {esc.escalation_id}
                      </span>
                      <span className="font-mono text-slate-500">{esc.date}</span>
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-slate-900">
                      {esc.previous_level} → {esc.level}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      From <span className="font-medium">{esc.from_agent}</span> to{' '}
                      <span className="font-medium">{esc.to_agent}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-700 bg-white p-2 rounded border border-slate-200">
                      Reason: {esc.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
