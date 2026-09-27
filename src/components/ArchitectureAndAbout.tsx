import React, { useState } from 'react';
import {
  Database,
  Key,
  Link2,
  ArrowDown,
  GitBranch,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { OverviewData } from '../types';

interface DatabaseRelationshipsViewProps {
  data: OverviewData;
}

export const DatabaseRelationshipsView: React.FC<DatabaseRelationshipsViewProps> = ({
  data,
}) => {
  const [activeTable, setActiveTable] = useState<
    'customers' | 'tickets' | 'agents' | 'categories' | 'escalations'
  >('tickets');

  const entities = [
    {
      name: 'CUSTOMER',
      table: 'customers',
      rows: data.customers.length,
      fields: [
        { name: 'customer_id', key: 'PK', type: 'VARCHAR(20)' },
        { name: 'name', key: '', type: 'VARCHAR(100)' },
        { name: 'email', key: 'UNIQUE', type: 'VARCHAR(120)' },
      ],
    },
    {
      name: 'CATEGORY',
      table: 'categories',
      rows: data.categories.length,
      fields: [
        { name: 'category_id', key: 'PK', type: 'VARCHAR(20)' },
        { name: 'category_name', key: 'UNIQUE', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'AGENT',
      table: 'agents',
      rows: data.agents.length,
      fields: [
        { name: 'agent_id', key: 'PK', type: 'VARCHAR(20)' },
        { name: 'name', key: '', type: 'VARCHAR(100)' },
        { name: 'team', key: '', type: 'VARCHAR(80)' },
        { name: 'role', key: '', type: 'VARCHAR(60)' },
        { name: 'escalation_level', key: '', type: 'VARCHAR(40)' },
      ],
    },
    {
      name: 'TICKET',
      table: 'tickets',
      rows: data.tickets.length,
      fields: [
        { name: 'ticket_id', key: 'PK', type: 'VARCHAR(20)' },
        { name: 'customer_id', key: 'FK', type: 'VARCHAR(20)' },
        { name: 'agent_id', key: 'FK', type: 'VARCHAR(20)' },
        { name: 'category_id', key: 'FK', type: 'VARCHAR(20)' },
        { name: 'title', key: '', type: 'VARCHAR(200)' },
        { name: 'description', key: '', type: 'TEXT' },
        { name: 'priority', key: '', type: 'VARCHAR(20)' },
        { name: 'status', key: '', type: 'VARCHAR(30)' },
        { name: 'created_date', key: '', type: 'DATETIME' },
      ],
    },
    {
      name: 'ESCALATION',
      table: 'escalations',
      rows: data.escalations.length,
      fields: [
        { name: 'escalation_id', key: 'PK', type: 'VARCHAR(20)' },
        { name: 'ticket_id', key: 'FK', type: 'VARCHAR(20)' },
        { name: 'from_agent', key: '', type: 'VARCHAR(100)' },
        { name: 'to_agent', key: '', type: 'VARCHAR(100)' },
        { name: 'level', key: '', type: 'VARCHAR(40)' },
        { name: 'reason', key: '', type: 'TEXT' },
        { name: 'date', key: '', type: 'DATETIME' },
      ],
    },
  ];

  const relationships = [
    {
      parent: 'Customer (1)',
      child: 'Tickets (Many)',
      constraint: 'tickets.customer_id → customers.customer_id',
      description: 'One customer can submit multiple support tickets over time.',
    },
    {
      parent: 'Agent (1)',
      child: 'Tickets (Many)',
      constraint: 'tickets.agent_id → agents.agent_id',
      description: 'One support agent can be assigned to multiple active or resolved tickets.',
    },
    {
      parent: 'Category (1)',
      child: 'Tickets (Many)',
      constraint: 'tickets.category_id → categories.category_id',
      description: 'One rule-detected category groups many related customer tickets.',
    },
    {
      parent: 'Ticket (1)',
      child: 'Escalations (Many)',
      constraint: 'escalations.ticket_id → tickets.ticket_id',
      description: 'One ticket can undergo multiple sequential escalation hops across levels.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Entity-Relationship (ER) Diagram & Relational Schema (DBMS)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Normalized 5-table relational database structure with Primary Keys (PK), Foreign Keys
          (FK), and 1-to-Many referential integrity
        </p>
      </div>

      {/* Cardinality Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relationships.map((rel) => (
          <div
            key={rel.constraint}
            className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <Link2 className="w-3.5 h-3.5" />
              {rel.parent} ───► {rel.child}
            </div>
            <div className="text-[11px] font-mono text-slate-600">{rel.constraint}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{rel.description}</p>
          </div>
        ))}
      </div>

      {/* Visual ER Diagram Layout */}
      <div className="p-6 rounded-xl bg-white border border-slate-200">
        <div className="text-xs font-semibold text-slate-500 mb-4">
          Visual Entity-Relationship Schema
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Parent Master Entities */}
          <div className="space-y-4">
            {[entities[0], entities[1], entities[2]].map((ent) => (
              <div
                key={ent.name}
                className="rounded-xl border-2 border-slate-300 bg-slate-50 overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">{ent.name}</span>
                  <span className="text-[11px] font-mono text-slate-300">
                    1 ───► many TICKET
                  </span>
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {ent.fields.map((f) => (
                    <div
                      key={f.name}
                      className="px-4 py-2 flex items-center justify-between font-mono"
                    >
                      <span className="text-slate-900 font-medium">{f.name}</span>
                      <div className="flex items-center gap-2">
                        {f.key && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              f.key === 'PK'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {f.key}
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px]">{f.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Center Column: Central TICKET Fact Table */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full rounded-xl border-2 border-indigo-600 bg-indigo-50/30 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-indigo-700 text-white flex items-center justify-between">
                <span className="font-mono text-xs font-bold">TICKET (Central Entity)</span>
                <span className="text-[11px] font-mono text-indigo-200">
                  {data.tickets.length} rows
                </span>
              </div>
              <div className="divide-y divide-indigo-100 text-xs bg-white">
                {entities[3].fields.map((f) => (
                  <div
                    key={f.name}
                    className="px-4 py-2.5 flex items-center justify-between font-mono"
                  >
                    <span className="text-slate-900 font-semibold">{f.name}</span>
                    <div className="flex items-center gap-2">
                      {f.key && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            f.key === 'PK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {f.key}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">{f.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: ESCALATION Child Table */}
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-rose-500 bg-rose-50/20 overflow-hidden">
              <div className="px-4 py-3 bg-rose-700 text-white flex items-center justify-between">
                <span className="font-mono text-xs font-bold">ESCALATION</span>
                <span className="text-[11px] font-mono text-rose-200">
                  TICKET (1) ───► (many)
                </span>
              </div>
              <div className="divide-y divide-slate-200 text-xs bg-white">
                {entities[4].fields.map((f) => (
                  <div
                    key={f.name}
                    className="px-4 py-2.5 flex items-center justify-between font-mono"
                  >
                    <span className="text-slate-900 font-medium">{f.name}</span>
                    <div className="flex items-center gap-2">
                      {f.key && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            f.key === 'PK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {f.key}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">{f.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-900">Relational Join Integrity</div>
              <p className="text-slate-600 leading-relaxed">
                Every ticket row stores <span className="font-mono">customer_id</span>,{' '}
                <span className="font-mono">agent_id</span>, and{' '}
                <span className="font-mono">category_id</span> foreign keys, enabling relational
                INNER JOIN queries across all 5 tables.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Relational Table Explorer */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Live Relational Database Table Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Inspect live records stored in each relational table
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['tickets', 'customers', 'agents', 'categories', 'escalations'] as const).map(
              (tbl) => (
                <button
                  key={tbl}
                  onClick={() => setActiveTable(tbl)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors ${
                    activeTable === tbl
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tbl}
                </button>
              )
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTable === 'customers' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4">customer_id (PK)</th>
                  <th className="py-2.5 px-4">name</th>
                  <th className="py-2.5 px-4">email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.customers.map((c) => (
                  <tr key={c.customer_id}>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{c.customer_id}</td>
                    <td className="py-2.5 px-4 text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'categories' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4">category_id (PK)</th>
                  <th className="py-2.5 px-4">category_name</th>
                  <th className="py-2.5 px-4">default_team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.categories.map((cat) => (
                  <tr key={cat.category_id}>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{cat.category_id}</td>
                    <td className="py-2.5 px-4 text-slate-900">{cat.category_name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{cat.default_team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'agents' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4">agent_id (PK)</th>
                  <th className="py-2.5 px-4">name</th>
                  <th className="py-2.5 px-4">team</th>
                  <th className="py-2.5 px-4">role</th>
                  <th className="py-2.5 px-4">escalation_level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.agents.map((a) => (
                  <tr key={a.agent_id}>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{a.agent_id}</td>
                    <td className="py-2.5 px-4 text-slate-900">{a.name}</td>
                    <td className="py-2.5 px-4 text-slate-700">{a.team}</td>
                    <td className="py-2.5 px-4 text-slate-600">{a.role}</td>
                    <td className="py-2.5 px-4 text-slate-800">{a.escalation_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'tickets' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4">ticket_id (PK)</th>
                  <th className="py-2.5 px-4">customer_id (FK)</th>
                  <th className="py-2.5 px-4">agent_id (FK)</th>
                  <th className="py-2.5 px-4">category_id (FK)</th>
                  <th className="py-2.5 px-4">priority</th>
                  <th className="py-2.5 px-4">status</th>
                  <th className="py-2.5 px-4">created_date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.tickets.map((t) => (
                  <tr key={t.ticket_id}>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{t.ticket_id}</td>
                    <td className="py-2.5 px-4 text-slate-800">{t.customer_id}</td>
                    <td className="py-2.5 px-4 text-slate-800">{t.agent_id}</td>
                    <td className="py-2.5 px-4 text-slate-800">{t.category_id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{t.priority}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{t.status}</td>
                    <td className="py-2.5 px-4 text-slate-500">{t.created_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'escalations' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4">escalation_id (PK)</th>
                  <th className="py-2.5 px-4">ticket_id (FK)</th>
                  <th className="py-2.5 px-4">from_agent</th>
                  <th className="py-2.5 px-4">to_agent</th>
                  <th className="py-2.5 px-4">level</th>
                  <th className="py-2.5 px-4">date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.escalations.map((e) => (
                  <tr key={e.escalation_id}>
                    <td className="py-2.5 px-4 font-bold text-rose-700">{e.escalation_id}</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{e.ticket_id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{e.from_agent}</td>
                    <td className="py-2.5 px-4 text-slate-900">{e.to_agent}</td>
                    <td className="py-2.5 px-4 text-rose-700">{e.level}</td>
                    <td className="py-2.5 px-4 text-slate-500">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export const SystemFlowView: React.FC = () => {
  const flowStages = [
    {
      step: '01',
      title: 'Customer',
      subtitle: 'Manual Customer & Complaint Entry',
      detail:
        'Customer manually enters Name, Email, Problem Title, Description, and Priority in the Create Ticket interface.',
    },
    {
      step: '02',
      title: 'Create Ticket',
      subtitle: 'Input Validation & Request Dispatch',
      detail:
        'Form validates customer name, email format, and complaint text before forwarding the payload for rule classification.',
    },
    {
      step: '03',
      title: 'Python Rule-Based Classifier',
      subtitle: 'Explainable IF-THEN Keyword Evaluation',
      detail:
        'Scans complaint text for domain keywords (Payment, Technical, Refund, Delivery, Account, or General fallback).',
    },
    {
      step: '04',
      title: 'Category Detected',
      subtitle: 'Automated Category Tagging',
      detail:
        'Assigns the matched Category ID (CAT01–CAT06) automatically without manual user dropdown selection.',
    },
    {
      step: '05',
      title: 'Java Auto Routing',
      subtitle: 'Object-Oriented Routing Engine',
      detail:
        'Maps the detected category to its specialized Support Team and selects the designated Support Agent.',
    },
    {
      step: '06',
      title: 'Support Team & Agent Assigned',
      subtitle: 'Relational Database Storage',
      detail:
        'Stores Customer, Ticket, Category FK, and Agent FK records in the relational database with Open/Assigned status.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-white border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          End-to-End System Architecture & Workflow Diagram
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete operational pipeline from manual ticket submission to graph-based escalation and
          final resolution
        </p>
      </div>

      {/* Linear Pipeline + Decision Split Diagram */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 flex flex-col items-center">
        <div className="w-full max-w-xl flex flex-col items-center">
          {flowStages.map((stage, index) => (
            <React.Fragment key={stage.step}>
              <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {stage.step}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{stage.title}</div>
                  <div className="text-xs font-semibold text-indigo-700">{stage.subtitle}</div>
                  <p className="text-xs text-slate-600 mt-1">{stage.detail}</p>
                </div>
              </div>
              {index < flowStages.length && (
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-0.5 h-3 bg-slate-400" />
                  <ArrowDown className="w-4 h-4 text-slate-600 -mt-1" />
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Decision Node: Resolved? */}
          <div className="w-64 p-3.5 rounded-xl bg-amber-50 border-2 border-amber-500 text-center">
            <div className="text-xs font-mono font-bold text-amber-800">DECISION GATE</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Resolved at Current Tier?</div>
          </div>

          {/* YES / NO Split */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* YES Branch */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col items-center text-center space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-800">
                ↙ YES (First-Contact Resolution)
              </span>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div className="text-sm font-bold text-slate-900">Close & Resolve Ticket</div>
              <p className="text-xs text-slate-600">
                Ticket status updated to Resolved and resolution timestamp recorded in database.
              </p>
            </div>

            {/* NO Branch */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex flex-col items-center text-center space-y-2">
              <span className="text-xs font-mono font-bold text-rose-800">
                ↘ NO (Requires Higher Authority)
              </span>
              <div className="text-sm font-bold text-slate-900">Escalate Ticket</div>
              <ArrowDown className="w-4 h-4 text-rose-600" />
              <div className="w-full p-2.5 rounded-lg bg-white border border-rose-200 text-xs font-mono font-semibold text-slate-800">
                Escalation Graph (Level 1 → Level 2 → Senior Agent → Manager)
              </div>
              <ArrowDown className="w-4 h-4 text-emerald-600" />
              <div className="text-sm font-bold text-emerald-800">
                Resolve & Close at Senior/Manager Tier
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AboutProjectView: React.FC = () => {
  const subjects = [
    {
      code: 'DBMS',
      name: 'Database Management Systems',
      summary: 'Relational Schema, Keys, Normalization & Multi-Table Joins',
      points: [
        'Five normalized relational tables: customers, tickets, agents, categories, and escalations.',
        'Enforces Primary Keys (customer_id, ticket_id, agent_id, category_id, escalation_id) and Foreign Keys linking tickets to customers, agents, and categories.',
        'Implements 1-to-Many relationships: Customer (1:N) Tickets, Agent (1:N) Tickets, Category (1:N) Tickets, and Ticket (1:N) Escalations.',
        'Uses relational joins and aggregation queries to compute live customer ticket counts, active agent workloads, and resolution metrics.',
      ],
    },
    {
      code: 'DMGT',
      name: 'Discrete Mathematics & Graph Theory',
      summary: 'Binary Relations, Directed Graphs G = (V, E) & Vertex Degrees',
      points: [
        'Models customer-to-ticket, ticket-to-category, and ticket-to-agent mappings as formal binary relations.',
        'Represents the escalation hierarchy as a Directed Acyclic Graph G = (V, E), where V is the set of ticket and escalation tier vertices and E is the set of directed transitions.',
        'Demonstrates ordered pairs (u, v) ∈ E for each escalation hop: Ticket → Level 1 Agent → Level 2 Agent → Senior Agent → Manager.',
      ],
    },
    {
      code: 'ADSA',
      name: 'Advanced Data Structures & Algorithms',
      summary: 'Adjacency List Graph Storage, BFS (Queue) & DFS (Stack) Traversals',
      points: [
        'Stores the escalation graph using an Adjacency List representation for O(V + E) space and traversal efficiency.',
        'Implements Breadth-First Search (BFS) using a First-In-First-Out (FIFO) Queue to explore escalation tiers level by level.',
        'Implements Depth-First Search (DFS) using a Last-In-First-Out (LIFO) Stack to trace complete escalation chains from root ticket to terminal manager.',
      ],
    },
    {
      code: 'OOPJ',
      name: 'Object-Oriented Programming in Java',
      summary: 'Encapsulation, Inheritance, Polymorphism & Service Layer Architecture',
      points: [
        'Models core entities (Customer, Ticket, Agent, Category, Escalation) as encapsulated classes with private fields and getter/setter methods.',
        'Demonstrates inheritance through a base PersonEntity class extended by Customer and Agent domain classes.',
        'Encapsulates business logic into dedicated routing and escalation management services that automatically assign support teams and escalation tiers.',
      ],
    },
    {
      code: 'PYTHON',
      name: 'Python Rule-Based Ticket Classification',
      summary: 'Deterministic IF-THEN Keyword Classification (No Machine Learning)',
      points: [
        'Implements a dedicated, explainable rule-based classifier using deterministic IF-ELIF-ELSE keyword matching.',
        'Automatically detects Payment, Technical, Refund, Delivery, Account, or General categories from unstructured problem descriptions.',
        'Does NOT use machine learning or opaque black-box predictions—every classification decision provides the exact matched keywords and triggered rule.',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-white border border-slate-200">
        <div className="text-xs font-mono font-semibold text-indigo-600">
          ACADEMIC PROJECT DOCUMENTATION
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          Smart Customer Support Ticketing & Escalation Management System
        </h2>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
          This full-stack web system solves helpdesk delays caused by disconnected customer
          records, manual ticket categorization, and untracked escalations. It integrates
          Relational Database Management (DBMS), Discrete Mathematics & Graph Theory (DMGT),
          Advanced Data Structures & Algorithms (ADSA), Object-Oriented Programming (OOPJ), and
          Python Rule-Based Classification into one cohesive application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.code}
            className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {sub.code}
                </span>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2.5">{sub.name}</h3>
              <div className="text-xs font-semibold text-indigo-700 mt-0.5">{sub.summary}</div>

              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {sub.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
