import React, { useState, useEffect } from 'react';
import { X, UserCheck, ArrowUpRight, AlertCircle } from 'lucide-react';
import { AgentItem, TicketItem } from '../types';

interface AssignModalProps {
  ticket: TicketItem | null;
  agents: AgentItem[];
  onClose: () => void;
  onConfirmAssign: (ticketId: string, agentId: string, status: TicketItem['status']) => Promise<void>;
}

export const AssignAgentModal: React.FC<AssignModalProps> = ({
  ticket,
  agents,
  onClose,
  onConfirmAssign,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketItem['status']>('In Progress');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setSelectedAgentId(ticket.agent_id);
      setSelectedStatus(ticket.status === 'Open' ? 'In Progress' : ticket.status);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    setSubmitting(true);
    try {
      await onConfirmAssign(ticket.ticket_id, selectedAgentId, selectedStatus);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-300" />
            <h3 className="text-sm font-semibold">Assign Support Agent · {ticket.ticket_id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800">{ticket.title}</div>
            <div className="text-slate-500 mt-1">
              Customer: {ticket.customer_name} · Category: {ticket.category_name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Support Agent & Team
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {agents.map((a) => (
                <option key={a.agent_id} value={a.agent_id}>
                  {a.name} — {a.team} ({a.escalation_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Updated Ticket Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TicketItem['status'])}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EscalateModalProps {
  ticket: TicketItem | null;
  tickets?: TicketItem[];
  onClose: () => void;
  onConfirmEscalate: (ticketId: string, reason: string, targetLevel?: string) => Promise<void>;
}

export const EscalateTicketModal: React.FC<EscalateModalProps> = ({
  ticket,
  tickets = [],
  onClose,
  onConfirmEscalate,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeTicket =
    ticket || tickets.find((t) => t.ticket_id === selectedTicketId) || null;

  useEffect(() => {
    if (ticket) {
      setSelectedTicketId(ticket.ticket_id);
    } else if (tickets.length > 0 && !selectedTicketId) {
      const firstOpen = tickets.find((t) => t.status !== 'Resolved') || tickets[0];
      setSelectedTicketId(firstOpen.ticket_id);
    }
  }, [ticket, tickets]);

  useEffect(() => {
    if (activeTicket) {
      const levels = ['Level 1 Agent', 'Level 2 Agent', 'Senior Agent', 'Manager'];
      const idx = levels.indexOf(activeTicket.current_escalation_level);
      const next = idx < levels.length - 1 ? levels[idx + 1] : 'Manager';
      setTargetLevel(next);
    }
  }, [activeTicket]);

  if (!ticket && tickets.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeTicket) {
      setError('Please select a ticket to escalate.');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter an escalation reason.');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirmEscalate(activeTicket.ticket_id, reason.trim(), targetLevel);
      setReason('');
      onClose();
    } catch {
      setError('Unable to escalate ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold">
              Escalate Support Ticket {activeTicket ? `· ${activeTicket.ticket_id}` : ''}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!ticket && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Ticket to Escalate
              </label>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {tickets
                  .filter((t) => t.status !== 'Resolved')
                  .map((t) => (
                    <option key={t.ticket_id} value={t.ticket_id}>
                      {t.ticket_id} — {t.customer_name} ({t.current_escalation_level})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {activeTicket && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900">{activeTicket.title}</div>
              <div className="text-slate-600">
                Customer: <span className="font-medium">{activeTicket.customer_name}</span> ·
                Current Level:{' '}
                <span className="font-mono font-semibold text-indigo-700">
                  {activeTicket.current_escalation_level}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Escalation Tier
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="Level 2 Agent">Level 2 Agent (Specialist Tier)</option>
              <option value="Senior Agent">Senior Agent (Senior Resolution Lead)</option>
              <option value="Manager">Manager (Support Operations Manager)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Escalation Reason
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this ticket requires higher-tier intervention..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? 'Escalating...' : 'Escalate Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
