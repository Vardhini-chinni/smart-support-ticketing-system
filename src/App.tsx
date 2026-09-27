import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  UserCheck,
  ArrowUpRight,
  GitBranch,
  Activity,
  BarChart3,
  Database,
  Workflow,
  BookOpen,
  Search,
  Bell,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { OverviewData, PageId, TicketItem } from './types';
import { DashboardView } from './components/DashboardView';
import { CreateTicketView } from './components/CreateTicketView';
import { AllTicketsView } from './components/AllTicketsView';
import {
  CustomersView,
  AgentsTeamsView,
  EscalationsView,
} from './components/DirectoryAndEscalations';
import {
  EscalationGraphView,
  GraphAnalysisView,
  AnalyticsView,
} from './components/GraphAndAnalytics';
import {
  DatabaseRelationshipsView,
  SystemFlowView,
  AboutProjectView,
} from './components/ArchitectureAndAbout';
import { TicketDetailsModal } from './components/TicketDetailsModal';
import { AssignAgentModal, EscalateTicketModal } from './components/ActionModals';

const SIDEBAR_ITEMS: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create-ticket', label: 'Create Ticket', icon: PlusCircle },
  { id: 'all-tickets', label: 'All Tickets', icon: Ticket },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'agents-teams', label: 'Agents & Teams', icon: UserCheck },
  { id: 'escalations', label: 'Escalations', icon: ArrowUpRight },
  { id: 'escalation-graph', label: 'Escalation Graph', icon: GitBranch },
  { id: 'graph-analysis', label: 'Graph Analysis', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'db-relationships', label: 'Database Relationships', icon: Database },
  { id: 'system-flow', label: 'System Flow', icon: Workflow },
  { id: 'about-project', label: 'About Project', icon: BookOpen },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Selected Ticket for Drawer / Modals / Graph
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [assignModalTicket, setAssignModalTicket] = useState<TicketItem | null>(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState<boolean>(false);
  const [escalateModalTicket, setEscalateModalTicket] = useState<TicketItem | null>(null);
  const [graphTicketId, setGraphTicketId] = useState<string>('T101');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/overview');
      if (res.ok) {
        const data: OverviewData = await res.json();
        setOverview(data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const activeTicketDetails =
    overview?.tickets.find((t) => t.ticket_id === selectedTicketId) || null;

  const handleAssignAgent = async (
    ticketId: string,
    agentId: string,
    status: TicketItem['status']
  ) => {
    const res = await fetch(`/api/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, status }),
    });
    if (res.ok) {
      await fetchOverview();
      showToast(`Ticket ${ticketId} assigned and updated.`);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: TicketItem['status']) => {
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchOverview();
      showToast(`Ticket ${ticketId} marked as ${status}.`);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    await handleUpdateStatus(ticketId, 'Resolved');
  };

  const handleEscalateTicket = async (
    ticketId: string,
    reason: string,
    targetLevel?: string
  ) => {
    const res = await fetch(`/api/tickets/${ticketId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, targetLevel }),
    });
    if (res.ok) {
      await fetchOverview();
      setGraphTicketId(ticketId);
      showToast(`Ticket ${ticketId} escalated successfully.`);
    }
  };

  const currentPageTitle =
    SIDEBAR_ITEMS.find((item) => item.id === activePage)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Fixed Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              ST
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">SmartSupport</div>
              <div className="text-[11px] text-slate-400">Ticketing & Escalation</div>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Summary */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Helpdesk Core Active
          </div>
          <div className="text-[11px] text-slate-400">
            DBMS · DMGT · ADSA · OOPJ · Python
          </div>
        </div>
      </aside>

      {/* Main Content Area (Offset by fixed sidebar on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">{currentPageTitle}</h1>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Smart Customer Support Ticketing & Escalation Management System
              </div>
            </div>
          </div>

          {/* Search, Notifications & Profile */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activePage !== 'all-tickets' && e.target.value.trim().length > 1) {
                    setActivePage('all-tickets');
                  }
                }}
                placeholder="Quick search tickets..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {overview && overview.metrics.escalatedTickets > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-1.5 right-1.5" />
                )}
              </button>

              {notificationsOpen && overview && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Recent Escalation & Queue Alerts
                    </span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {overview.escalations.slice(0, 4).map((esc) => (
                      <div
                        key={esc.escalation_id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          setSelectedTicketId(esc.ticket_id);
                        }}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 cursor-pointer text-xs"
                      >
                        <div className="font-mono font-semibold text-rose-700">
                          {esc.ticket_id} Escalated → {esc.level}
                        </div>
                        <div className="text-slate-600 truncate mt-0.5">{esc.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User / Profile Section */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-none">
                  Support Admin
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Helpdesk Operations</div>
              </div>
            </div>
          </div>
        </header>

        {/* Feedback Toast Banner */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Viewport Body */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
          {loading || !overview ? (
            <div className="p-12 rounded-xl bg-white border border-slate-200 text-center text-sm text-slate-500">
              Initializing Helpdesk Database & Classification Service...
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <DashboardView
                  data={overview}
                  onNavigate={setActivePage}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                  onOpenEscalateModal={(t) => {
                    setEscalateModalTicket(t);
                    setEscalateModalOpen(true);
                  }}
                />
              )}

              {activePage === 'create-ticket' && (
                <CreateTicketView
                  onTicketCreated={fetchOverview}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                  onNavigateAllTickets={() => setActivePage('all-tickets')}
                />
              )}

              {activePage === 'all-tickets' && (
                <AllTicketsView
                  tickets={overview.tickets}
                  globalSearch={globalSearch}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                  onOpenAssign={(t) => setAssignModalTicket(t)}
                  onOpenEscalate={(t) => {
                    setEscalateModalTicket(t);
                    setEscalateModalOpen(true);
                  }}
                  onResolveTicket={handleResolveTicket}
                />
              )}

              {activePage === 'customers' && (
                <CustomersView
                  customers={overview.customers}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                />
              )}

              {activePage === 'agents-teams' && (
                <AgentsTeamsView
                  agents={overview.agents}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                />
              )}

              {activePage === 'escalations' && (
                <EscalationsView
                  escalations={overview.escalations}
                  tickets={overview.tickets}
                  onOpenEscalateModal={(t) => {
                    setEscalateModalTicket(t);
                    setEscalateModalOpen(true);
                  }}
                  onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
                />
              )}

              {activePage === 'escalation-graph' && (
                <EscalationGraphView
                  tickets={overview.tickets}
                  selectedTicketId={graphTicketId}
                  onSelectTicketId={setGraphTicketId}
                  onOpenEscalateModal={(t) => {
                    setEscalateModalTicket(t);
                    setEscalateModalOpen(true);
                  }}
                />
              )}

              {activePage === 'graph-analysis' && (
                <GraphAnalysisView
                  tickets={overview.tickets}
                  selectedTicketId={graphTicketId}
                  onSelectTicketId={setGraphTicketId}
                />
              )}

              {activePage === 'analytics' && <AnalyticsView data={overview} />}

              {activePage === 'db-relationships' && (
                <DatabaseRelationshipsView data={overview} />
              )}

              {activePage === 'system-flow' && <SystemFlowView />}

              {activePage === 'about-project' && <AboutProjectView />}
            </>
          )}
        </main>
      </div>

      {/* Ticket Details Slide-Over Drawer */}
      <TicketDetailsModal
        ticket={activeTicketDetails}
        onClose={() => setSelectedTicketId(null)}
        onOpenAssign={(t) => setAssignModalTicket(t)}
        onOpenEscalate={(t) => {
          setEscalateModalTicket(t);
          setEscalateModalOpen(true);
        }}
        onResolveTicket={handleResolveTicket}
        onUpdateStatus={handleUpdateStatus}
        onViewInGraph={(ticketId) => {
          setGraphTicketId(ticketId);
          setSelectedTicketId(null);
          setActivePage('escalation-graph');
        }}
      />

      {/* Assign Agent Modal */}
      {overview && (
        <AssignAgentModal
          ticket={assignModalTicket}
          agents={overview.agents}
          onClose={() => setAssignModalTicket(null)}
          onConfirmAssign={handleAssignAgent}
        />
      )}

      {/* Escalate Ticket Modal */}
      {overview && escalateModalOpen && (
        <EscalateTicketModal
          ticket={escalateModalTicket}
          tickets={overview.tickets}
          onClose={() => {
            setEscalateModalOpen(false);
            setEscalateModalTicket(null);
          }}
          onConfirmEscalate={handleEscalateTicket}
        />
      )}
    </div>
  );
}
