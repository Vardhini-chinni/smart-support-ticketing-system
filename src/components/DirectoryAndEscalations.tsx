import React, { useState } from 'react';
import {
  Users,
  Eye,
  ArrowUpRight,
  ArrowDown,
  Shield,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { AgentItem, CustomerItem, EscalationItem, TicketItem } from '../types';

interface CustomersViewProps {
  customers: CustomerItem[];
  onSelectTicket: (ticket: TicketItem) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectTicket,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.customer_id || ''
  );

  const activeCustomer =
    customers.find((c) => c.customer_id === selectedCustomerId) || customers[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Customers Table */}
      <div className="xl:col-span-2 rounded-xl bg-white border border-slate-200 overflow-hidden h-fit">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Registered & Ticket-Submitting Customers ({customers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes pre-configured accounts and all manually created customers from the Create
              Ticket form
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-right">Number of Tickets</th>
                <th className="py-3 px-4 text-right">Open Tickets</th>
                <th className="py-3 px-4 text-right">Resolved Tickets</th>
                <th className="py-3 px-4 text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {customers.map((c) => {
                const isSelected = activeCustomer?.customer_id === c.customer_id;
                return (
                  <tr
                    key={c.customer_id}
                    onClick={() => setSelectedCustomerId(c.customer_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {c.customer_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{c.email}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {c.total_tickets}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-amber-700 tabular-nums">
                      {c.open_tickets}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      {c.resolved_tickets}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(c.customer_id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ticket History Panel */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 h-fit">
        {activeCustomer ? (
          <>
            <div className="border-b border-slate-200 pb-3">
              <div className="text-xs font-mono text-indigo-600 font-semibold">
                Customer Ticket History · {activeCustomer.customer_id}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {activeCustomer.name}
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {activeCustomer.email}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Total</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  {activeCustomer.total_tickets}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Active</div>
                <div className="text-base font-bold font-mono text-amber-700">
                  {activeCustomer.open_tickets}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Resolved</div>
                <div className="text-base font-bold font-mono text-emerald-700">
                  {activeCustomer.resolved_tickets}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">
                Submitted Tickets ({activeCustomer.tickets.length})
              </div>
              {activeCustomer.tickets.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 text-xs text-slate-500">
                  No tickets recorded for this customer yet.
                </div>
              ) : (
                activeCustomer.tickets.map((tk) => (
                  <div
                    key={tk.ticket_id}
                    onClick={() => onSelectTicket(tk)}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-indigo-700">
                        {tk.ticket_id}
                      </span>
                      <span
                        className={`font-semibold ${
                          tk.status === 'Resolved'
                            ? 'text-emerald-700'
                            : tk.status === 'Escalated'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {tk.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{tk.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Category: {tk.category_name} · Team: {tk.assigned_team} · Agent:{' '}
                      {tk.agent_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

interface AgentsTeamsViewProps {
  agents: AgentItem[];
  onSelectTicket: (ticket: TicketItem) => void;
}

export const AgentsTeamsView: React.FC<AgentsTeamsViewProps> = ({
  agents,
  onSelectTicket,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.agent_id || '');
  const activeAgent = agents.find((a) => a.agent_id === selectedAgentId) || agents[0];

  return (
    <div className="space-y-6">
      {/* 6 Support Teams Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.agent_id}
            onClick={() => setSelectedAgentId(agent.agent_id)}
            className={`p-4 rounded-xl bg-white border transition-colors cursor-pointer ${
              activeAgent?.agent_id === agent.agent_id
                ? 'border-indigo-600 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700">{agent.team}</span>
              <span
                className={`text-xs font-semibold ${
                  agent.status === 'Available'
                    ? 'text-emerald-700'
                    : agent.status === 'On Duty'
                    ? 'text-indigo-700'
                    : 'text-amber-700'
                }`}
              >
                {agent.status}
              </span>
            </div>
            <div className="mt-2 text-base font-bold text-slate-900">{agent.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {agent.role} · <span className="font-mono">{agent.escalation_level}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Active Tickets</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {agent.active_tickets} active / {agent.total_assigned} total
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Agents & Teams Table + Selected Agent Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl bg-white border border-slate-200 overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Support Agents & Routing Teams Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Java routing logic automatically maps each classified category to its dedicated
              support team and agent
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Active Tickets</th>
                  <th className="py-3 px-4">Escalation Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {agents.map((a) => (
                  <tr
                    key={a.agent_id}
                    onClick={() => setSelectedAgentId(a.agent_id)}
                    className={`cursor-pointer transition-colors ${
                      activeAgent?.agent_id === a.agent_id
                        ? 'bg-indigo-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {a.name}{' '}
                      <span className="font-mono text-slate-400 font-normal">({a.agent_id})</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-indigo-700 whitespace-nowrap">
                      {a.team}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{a.role}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {a.active_tickets}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {a.escalation_level}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          a.status === 'Available'
                            ? 'text-emerald-700'
                            : a.status === 'On Duty'
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Agent's Assigned Tickets */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 h-fit">
          {activeAgent && (
            <>
              <div className="border-b border-slate-200 pb-3">
                <div className="text-xs font-mono text-indigo-600 font-semibold">
                  Agent Queue · {activeAgent.agent_id}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{activeAgent.name}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeAgent.team} · {activeAgent.escalation_level}
                </div>
              </div>
              <div className="space-y-2.5">
                {activeAgent.tickets.map((tk) => (
                  <div
                    key={tk.ticket_id}
                    onClick={() => onSelectTicket(tk)}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-indigo-700">
                        {tk.ticket_id}
                      </span>
                      <span className="font-semibold text-slate-700">{tk.status}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">{tk.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Customer: {tk.customer_name} · Priority: {tk.priority}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface EscalationsViewProps {
  escalations: EscalationItem[];
  tickets: TicketItem[];
  onOpenEscalateModal: (ticket: TicketItem | null) => void;
  onSelectTicket: (ticket: TicketItem) => void;
}

export const EscalationsView: React.FC<EscalationsViewProps> = ({
  escalations,
  tickets,
  onOpenEscalateModal,
  onSelectTicket,
}) => {
  const hierarchyChain = [
    {
      level: 'Level 1 Agent',
      role: 'Initial Domain Support Team (Payment / Technical / Refund / Delivery)',
      agent: 'Arjun Mehta / Sneha Iyer',
    },
    {
      level: 'Level 2 Agent',
      role: 'Specialized Tier-2 Investigation & Dispute Analyst',
      agent: 'Rohan Verma / Kavya Nair',
    },
    {
      level: 'Senior Agent',
      role: 'Senior Escalation Engineer & Technical Lead',
      agent: 'Priya Sharma',
    },
    {
      level: 'Manager',
      role: 'Support Operations Manager (Executive Override & Final SLA Authority)',
      agent: 'Rajesh Krishnan',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Escalate Action */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Ticket Escalation Management & Hierarchy Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track multi-tier ticket escalations from Level 1 Agent up to Support Operations Manager
          </p>
        </div>
        <button
          onClick={() => onOpenEscalateModal(null)}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" />
          Escalate Ticket
        </button>
      </div>

      {/* 4-Stage Escalation Chain Visual */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <div className="text-xs font-semibold text-slate-500 mb-3">
          Standard 4-Tier Escalation Path
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {hierarchyChain.map((tier, index) => (
            <div key={tier.level} className="relative flex flex-col">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <div className="text-xs font-mono font-semibold text-indigo-700">
                  Tier 0{index + 1}
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{tier.level}</div>
                <div className="text-xs text-slate-600 mt-1">{tier.role}</div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">{tier.agent}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalations Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Escalation Records ({escalations.length})
          </h3>
          <span className="text-xs text-slate-500">
            Click any Ticket ID to open complete ticket details and timeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Current Agent</th>
                <th className="py-3 px-4">Previous Level</th>
                <th className="py-3 px-4">New Level</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {escalations.map((esc) => {
                const matchingTicket = tickets.find((t) => t.ticket_id === esc.ticket_id);
                return (
                  <tr
                    key={esc.escalation_id}
                    onClick={() => matchingTicket && onSelectTicket(matchingTicket)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {esc.ticket_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {esc.customer_name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {esc.to_agent}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {esc.previous_level}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-700 whitespace-nowrap">
                      {esc.level}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{esc.reason}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {esc.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          esc.status === 'Resolved' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {esc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
