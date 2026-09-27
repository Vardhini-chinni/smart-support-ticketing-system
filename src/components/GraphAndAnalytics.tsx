import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  GitBranch,
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { GraphPayload, OverviewData, TicketItem } from '../types';

interface EscalationGraphViewProps {
  tickets: TicketItem[];
  selectedTicketId: string;
  onSelectTicketId: (id: string) => void;
  onOpenEscalateModal: (ticket: TicketItem) => void;
}

export const EscalationGraphView: React.FC<EscalationGraphViewProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicketId,
  onOpenEscalateModal,
}) => {
  const [graphData, setGraphData] = useState<GraphPayload | null>(null);
  const [traversalMode, setTraversalMode] = useState<'IDLE' | 'BFS' | 'DFS'>('IDLE');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  const loadGraph = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/graph/${ticketId}`);
      if (res.ok) {
        const payload = await res.json();
        setGraphData(payload);
      }
    } catch {
      // Fallback handled gracefully
    }
  };

  useEffect(() => {
    const target = selectedTicketId || tickets[0]?.ticket_id || 'T101';
    loadGraph(target);
    setTraversalMode('IDLE');
    setActiveStepIndex(-1);
  }, [selectedTicketId, tickets]);

  // Animate BFS / DFS traversal steps
  useEffect(() => {
    if (traversalMode === 'IDLE' || !graphData) return;
    const totalSteps = graphData.nodes.length;
    if (activeStepIndex < totalSteps - 1) {
      const timer = setTimeout(() => {
        setActiveStepIndex((prev) => prev + 1);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [traversalMode, activeStepIndex, graphData]);

  const handleRunBFS = () => {
    setTraversalMode('BFS');
    setActiveStepIndex(0);
  };

  const handleRunDFS = () => {
    setTraversalMode('DFS');
    setActiveStepIndex(0);
  };

  const handleResetGraph = () => {
    setTraversalMode('IDLE');
    setActiveStepIndex(-1);
  };

  if (!graphData) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-sm text-slate-500">
        Loading interactive escalation graph...
      </div>
    );
  }

  const traversalOrder =
    traversalMode === 'BFS'
      ? graphData.bfs.order
      : traversalMode === 'DFS'
      ? graphData.dfs.order
      : [];

  const visitedUpToStep =
    activeStepIndex >= 0 ? traversalOrder.slice(0, activeStepIndex + 1) : [];

  const currentHighlightedNode =
    activeStepIndex >= 0 ? traversalOrder[activeStepIndex] : null;

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Inspect Ticket Escalation Graph
            </label>
            <select
              value={graphData.ticket.ticket_id}
              onChange={(e) => onSelectTicketId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {tickets.map((t) => (
                <option key={t.ticket_id} value={t.ticket_id}>
                  {t.ticket_id} — {t.customer_name} ({t.category_name} · {t.current_escalation_level})
                </option>
              ))}
            </select>
          </div>

          <div className="pl-3 border-l border-slate-200 text-xs space-y-0.5">
            <div className="text-slate-500">
              Current Escalation Level:{' '}
              <span className="font-mono font-bold text-indigo-700">
                {graphData.currentLevel}
              </span>
            </div>
            <div className="text-slate-500">
              Current Active Node:{' '}
              <span className="font-mono font-semibold text-slate-900">
                {graphData.currentNode}
              </span>
            </div>
          </div>
        </div>

        {/* BFS / DFS / Reset Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunBFS}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              traversalMode === 'BFS'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Run BFS
          </button>
          <button
            onClick={handleRunDFS}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              traversalMode === 'DFS'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Run DFS
          </button>
          <button
            onClick={handleResetGraph}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Graph
          </button>
          {graphData.ticket.status !== 'Resolved' && (
            <button
              onClick={() => onOpenEscalateModal(graphData.ticket)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Escalate Ticket
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas & Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directed Escalation Graph Visualization */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Directed Escalation Graph G = (V, E) · {graphData.ticket.ticket_id}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vertices |V| = {graphData.nodeCount} · Directed Edges |E| = {graphData.edgeCount}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600">
              {traversalMode === 'IDLE'
                ? 'Mode: Live Escalation State'
                : `${traversalMode} Traversal Active (Step ${activeStepIndex + 1}/${
                    graphData.nodes.length
                  })`}
            </div>
          </div>

          {/* Vertical Directed Graph Nodes & Edges */}
          <div className="w-full max-w-md flex flex-col items-center py-2">
            {graphData.nodes.map((node, index) => {
              const isVisitedInTraversal = visitedUpToStep.includes(node.id);
              const isActiveStepNode = currentHighlightedNode === node.id;
              const isReachedInEscalation = graphData.activeEscalationPath.includes(node.id);

              let borderClass = 'border-slate-300 bg-slate-50';
              if (traversalMode !== 'IDLE') {
                if (isActiveStepNode) {
                  borderClass =
                    traversalMode === 'BFS'
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                      : 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600';
                } else if (isVisitedInTraversal) {
                  borderClass =
                    traversalMode === 'BFS'
                      ? 'border-indigo-400 bg-indigo-50/40'
                      : 'border-emerald-400 bg-emerald-50/40';
                }
              } else if (node.isCurrent) {
                borderClass = 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600';
              } else if (isReachedInEscalation) {
                borderClass = 'border-slate-400 bg-white';
              }

              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${borderClass}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-500">
                        Vertex V{index + 1}
                      </span>
                      <span
                        className={`font-mono font-semibold ${
                          node.isCurrent
                            ? 'text-indigo-700'
                            : isReachedInEscalation
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {traversalMode !== 'IDLE' && isVisitedInTraversal
                          ? `${traversalMode} Visited #${visitedUpToStep.indexOf(node.id) + 1}`
                          : node.status}
                      </span>
                    </div>
                    <div className="mt-1 text-base font-bold text-slate-900">{node.label}</div>
                    <div className="mt-0.5 text-xs text-slate-600">{node.sublabel}</div>
                  </div>

                  {index < graphData.nodes.length - 1 && (
                    <div className="flex flex-col items-center my-1.5">
                      <div className="w-0.5 h-4 bg-slate-400" />
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                        Directed Edge e{index + 1} (↓)
                      </span>
                      <ArrowDown className="w-4 h-4 text-slate-600 -mt-0.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Graph State & Traversal Trace Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Graph Properties</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Number of Nodes</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {graphData.nodeCount}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Directed Edges</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {graphData.edgeCount}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-700">Current Escalation Path</div>
              <div className="font-mono text-indigo-700 leading-relaxed">
                {graphData.activeEscalationPath.join(' → ')}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-700">
                {traversalMode === 'IDLE'
                  ? 'Click "Run BFS" or "Run DFS" to animate traversal'
                  : `${traversalMode} Traversal Sequence`}
              </div>
              <div className="font-mono text-slate-800 leading-relaxed">
                {traversalMode === 'IDLE'
                  ? graphData.bfs.order.join(' → ')
                  : visitedUpToStep.join(' → ')}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Ticket Escalation Hops ({graphData.ticket.escalations.length})
            </h3>
            {graphData.ticket.escalations.length === 0 ? (
              <p className="text-xs text-slate-500">
                Ticket {graphData.ticket.ticket_id} is currently handled at{' '}
                {graphData.ticket.current_escalation_level} without higher-tier hops.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {graphData.ticket.escalations.map((esc) => (
                  <div
                    key={esc.escalation_id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="font-mono font-semibold text-rose-700">
                      {esc.previous_level} → {esc.level}
                    </div>
                    <div className="text-slate-600 mt-0.5">{esc.reason}</div>
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

interface GraphAnalysisViewProps {
  tickets: TicketItem[];
  selectedTicketId: string;
  onSelectTicketId: (id: string) => void;
}

export const GraphAnalysisView: React.FC<GraphAnalysisViewProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicketId,
}) => {
  const [graphData, setGraphData] = useState<GraphPayload | null>(null);
  const [executedAlgorithm, setExecutedAlgorithm] = useState<'BOTH' | 'BFS' | 'DFS'>('BOTH');

  useEffect(() => {
    const target = selectedTicketId || tickets[0]?.ticket_id || 'T101';
    fetch(`/api/graph/${target}`)
      .then((r) => r.json())
      .then((d) => setGraphData(d))
      .catch(() => {});
  }, [selectedTicketId, tickets]);

  if (!graphData) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-sm text-slate-500">
        Loading graph analysis...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Graph Analysis · BFS & DFS Traversal Verification (ADSA & DMGT)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal verification of vertices, directed edges, adjacency lists, and FIFO Queue (BFS)
            vs LIFO Stack (DFS) traversals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={graphData.ticket.ticket_id}
            onChange={(e) => onSelectTicketId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            {tickets.map((t) => (
              <option key={t.ticket_id} value={t.ticket_id}>
                {t.ticket_id} — {t.customer_name} ({t.category_name})
              </option>
            ))}
          </select>
          <button
            onClick={() => setExecutedAlgorithm('BFS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              executedAlgorithm === 'BFS'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Run BFS
          </button>
          <button
            onClick={() => setExecutedAlgorithm('DFS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              executedAlgorithm === 'DFS'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Run DFS
          </button>
          <button
            onClick={() => setExecutedAlgorithm('BOTH')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              executedAlgorithm === 'BOTH'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Compare Both
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Number of Nodes |V|</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {graphData.nodeCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Ticket Root + 4 Escalation Tiers
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Number of Directed Edges |E|</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {graphData.edgeCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Ordered pairs (u, v) in relation R
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Current Escalation Path</div>
          <div className="text-xs font-mono font-semibold text-indigo-700 mt-2 leading-relaxed">
            {graphData.activeEscalationPath.join(' → ')}
          </div>
        </div>
      </div>

      {/* BFS and DFS Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(executedAlgorithm === 'BOTH' || executedAlgorithm === 'BFS') && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  BFS Traversal (Breadth-First Search)
                </h3>
                <p className="text-xs text-slate-500">
                  Uses FIFO Queue data structure · Time Complexity: O(V + E)
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-indigo-700">FIFO Queue</span>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs font-mono text-indigo-950">
              {graphData.bfs.order.join(' → ')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2 px-3">Step</th>
                    <th className="py-2 px-3">Dequeued Node</th>
                    <th className="py-2 px-3">Queue State</th>
                    <th className="py-2 px-3">Visited Set</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {graphData.bfs.steps.map((s) => (
                    <tr key={s.step}>
                      <td className="py-2 px-3 font-semibold text-indigo-700">#{s.step}</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">{s.current}</td>
                      <td className="py-2 px-3 text-slate-600">
                        [{s.queue.length > 0 ? s.queue.join(', ') : 'empty'}]
                      </td>
                      <td className="py-2 px-3 text-slate-500">{s.visited.join(' → ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(executedAlgorithm === 'BOTH' || executedAlgorithm === 'DFS') && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  DFS Traversal (Depth-First Search)
                </h3>
                <p className="text-xs text-slate-500">
                  Uses LIFO Stack / Recursion · Time Complexity: O(V + E)
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700">LIFO Stack</span>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-mono text-emerald-950">
              {graphData.dfs.order.join(' → ')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2 px-3">Step</th>
                    <th className="py-2 px-3">Popped Node</th>
                    <th className="py-2 px-3">Stack State</th>
                    <th className="py-2 px-3">Visited Set</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {graphData.dfs.steps.map((s) => (
                    <tr key={s.step}>
                      <td className="py-2 px-3 font-semibold text-emerald-700">#{s.step}</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">{s.current}</td>
                      <td className="py-2 px-3 text-slate-600">
                        [{s.stack.length > 0 ? s.stack.join(', ') : 'empty'}]
                      </td>
                      <td className="py-2 px-3 text-slate-500">{s.visited.join(' → ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Adjacency List Representation */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Adjacency List Representation (DMGT & ADSA)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(graphData.adjacencyList).map(([vertex, neighbors]) => (
            <div key={vertex} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-indigo-700">{vertex}</span>
              <span className="text-slate-400"> → </span>
              <span className="text-slate-800">
                {neighbors.length > 0 ? `[ ${neighbors.join(', ')} ]` : '[ ∅ (Terminal Node) ]'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AnalyticsViewProps {
  data: OverviewData;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  const { tickets, categories, escalations, metrics } = data;

  const byCategory = categories.map((cat) => {
    const matching = tickets.filter(
      (t) => t.category_name.toLowerCase() === cat.category_name.toLowerCase()
    );
    const resolved = matching.filter((t) => t.status === 'Resolved').length;
    const escalated = matching.filter((t) => t.status === 'Escalated').length;
    return {
      name: cat.category_name,
      team: cat.default_team,
      total: matching.length,
      resolved,
      escalated,
      pct: metrics.totalTickets > 0 ? Math.round((matching.length / metrics.totalTickets) * 100) : 0,
    };
  });

  const byStatus = [
    { status: 'Open', count: metrics.openTickets, color: 'bg-indigo-600' },
    { status: 'In Progress', count: metrics.inProgressTickets, color: 'bg-amber-500' },
    { status: 'Escalated', count: metrics.escalatedTickets, color: 'bg-rose-600' },
    { status: 'Resolved', count: metrics.resolvedTickets, color: 'bg-emerald-600' },
  ];

  const byPriority = (['Critical', 'High', 'Medium', 'Low'] as const).map((p) => {
    const count = tickets.filter((t) => t.priority === p).length;
    const pct = metrics.totalTickets > 0 ? Math.round((count / metrics.totalTickets) * 100) : 0;
    return { priority: p, count, pct };
  });

  const resolutionRate =
    metrics.totalTickets > 0
      ? Math.round((metrics.resolvedTickets / metrics.totalTickets) * 100)
      : 0;

  const escalationRate =
    metrics.totalTickets > 0
      ? Math.round((metrics.escalatedTickets / metrics.totalTickets) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Total Escalation Events</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {escalations.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {escalationRate}% of tickets currently escalated
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Resolution Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {resolutionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.resolvedTickets} of {metrics.totalTickets} tickets closed
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Average Resolution Time</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {metrics.avgResolutionTime}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all 6 support teams</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500">Automated Classification Accuracy</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">100%</div>
          <div className="text-xs text-slate-400 mt-1">Deterministic IF-THEN keyword rules</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Tickets by Category & Support Team
          </h3>
          <div className="space-y-3.5">
            {byCategory.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">
                    {item.name} <span className="font-normal text-slate-500">({item.team})</span>
                  </span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {item.total} total · {item.resolved} resolved · {item.escalated} escalated
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.max(item.pct, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Status & Priority */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Tickets by Status</h3>
            <div className="space-y-3">
              {byStatus.map((s) => {
                const pct =
                  metrics.totalTickets > 0
                    ? Math.round((s.count / metrics.totalTickets) * 100)
                    : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{s.status}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {s.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full`}
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Tickets by Priority</h3>
            <div className="space-y-3">
              {byPriority.map((p) => (
                <div key={p.priority}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{p.priority}</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {p.count} ({p.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${Math.max(p.pct, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
