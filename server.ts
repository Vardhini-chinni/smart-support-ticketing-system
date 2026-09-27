import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';

// ============================================================================
// Academic Subject Mapping:
// - OOPJ: Encapsulated Domain Classes, Inheritance, Routing & Escalation Services
// - DBMS: Relational Tables (customers, categories, agents, tickets, escalations)
//         with Primary Keys (PK) and Foreign Keys (FK)
// - ADSA: Graph Representation (Adjacency List), BFS & DFS Traversals
// - DMGT: Directed Graphs G = (V, E) and Binary Relations
// - Python: Rule-Based Keyword Classification Service
// ============================================================================

export interface CustomerRecord {
  customer_id: string;
  name: string;
  email: string;
}

export interface CategoryRecord {
  category_id: string;
  category_name: string;
  default_team: string;
}

export interface AgentRecord {
  agent_id: string;
  name: string;
  team: string;
  role: string;
  escalation_level: 'Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager';
  status: 'Available' | 'Busy' | 'On Duty';
}

export interface TicketRecord {
  ticket_id: string;
  customer_id: string;
  agent_id: string;
  category_id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  assigned_team: string;
  current_escalation_level: 'Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager';
  matched_keywords: string[];
  rule_explanation: string;
  resolution_hours: number | null;
  created_date: string;
  updated_date: string;
}

export interface EscalationRecord {
  escalation_id: string;
  ticket_id: string;
  from_agent: string;
  to_agent: string;
  previous_level: string;
  level: string;
  reason: string;
  date: string;
  status: 'Active' | 'Resolved';
}

interface DatabaseSchema {
  customers: CustomerRecord[];
  categories: CategoryRecord[];
  agents: AgentRecord[];
  tickets: TicketRecord[];
  escalations: EscalationRecord[];
}

// ----------------------------------------------------------------------------
// PYTHON RULE-BASED CLASSIFIER BRIDGE (No ML / No AI — Deterministic Rules)
// ----------------------------------------------------------------------------
const CLASSIFICATION_RULES = [
  {
    category: 'Payment',
    team: 'Payment Support',
    keywords: ['payment failed', 'payment', 'paid', 'transaction', 'deducted'],
  },
  {
    category: 'Technical',
    team: 'Technical Support',
    keywords: ['application not working', 'login', 'password', 'crashed', 'crash', 'error'],
  },
  {
    category: 'Refund',
    team: 'Refund Support',
    keywords: ['refund not received', 'money back', 'refund'],
  },
  {
    category: 'Delivery',
    team: 'Delivery Support',
    keywords: ['delayed delivery', 'delivery delay', 'delivery', 'shipping', 'parcel', 'courier'],
  },
  {
    category: 'Account',
    team: 'Account Support',
    keywords: ['account issue', 'account', 'profile', 'username'],
  },
];

function runPythonRuleClassifier(text: string): {
  category: string;
  assignedTeam: string;
  matchedKeywords: string[];
  ruleExplanation: string;
} {
  const scriptPath = path.resolve(process.cwd(), 'python-classifier/classifier.py');
  if (fs.existsSync(scriptPath)) {
    try {
      const output = execFileSync('python3', [scriptPath, text], {
        encoding: 'utf-8',
        timeout: 1500,
      });
      const parsed = JSON.parse(output.trim());
      if (parsed && parsed.category) {
        return parsed;
      }
    } catch {
      // Fallback to identical in-memory deterministic rule engine if python3 binary is unavailable
    }
  }

  const normalized = (text || '').toLowerCase().trim();
  for (let i = 0; i < CLASSIFICATION_RULES.length; i++) {
    const rule = CLASSIFICATION_RULES[i];
    const matched = rule.keywords.filter((kw) => normalized.includes(kw));
    if (matched.length > 0) {
      const branch = i === 0 ? 'IF' : 'ELIF';
      return {
        category: rule.category,
        assignedTeam: rule.team,
        matchedKeywords: matched,
        ruleExplanation: `${branch} description contains (${matched.join(', ')}) THEN Category = '${rule.category}' AND Team = '${rule.team}'`,
      };
    }
  }

  return {
    category: 'General',
    assignedTeam: 'General Support',
    matchedKeywords: [],
    ruleExplanation: "ELSE (no domain keyword matched) THEN Category = 'General' AND Team = 'General Support'",
  };
}

// ----------------------------------------------------------------------------
// ADSA: GRAPH REPRESENTATION & BFS / DFS TRAVERSAL ENGINE
// ----------------------------------------------------------------------------
export class EscalationGraphEngine {
  private adjacencyList: Map<string, string[]> = new Map();
  private nodeMetadata: Map<string, { id: string; label: string; sublabel: string; role: string; isCurrent: boolean; status: string }> = new Map();

  addNode(id: string, label: string, sublabel: string, role: string, isCurrent = false, status = 'Visited') {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
    this.nodeMetadata.set(id, { id, label, sublabel, role, isCurrent, status });
  }

  addDirectedEdge(from: string, to: string) {
    if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
    if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
    const list = this.adjacencyList.get(from)!;
    if (!list.includes(to)) {
      list.push(to);
    }
  }

  runBFS(startNode: string): { order: string[]; steps: { step: number; current: string; queue: string[]; visited: string[] }[] } {
    const visited = new Set<string>();
    const queue: string[] = [];
    const order: string[] = [];
    const steps: { step: number; current: string; queue: string[]; visited: string[] }[] = [];

    if (!this.adjacencyList.has(startNode)) return { order, steps };

    visited.add(startNode);
    queue.push(startNode);
    let stepCount = 1;

    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }

      steps.push({
        step: stepCount++,
        current,
        queue: [...queue],
        visited: [...order],
      });
    }

    return { order, steps };
  }

  runDFS(startNode: string): { order: string[]; steps: { step: number; current: string; stack: string[]; visited: string[] }[] } {
    const visited = new Set<string>();
    const stack: string[] = [startNode];
    const order: string[] = [];
    const steps: { step: number; current: string; stack: string[]; visited: string[] }[] = [];

    if (!this.adjacencyList.has(startNode)) return { order, steps };

    let stepCount = 1;
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        visited.add(current);
        order.push(current);

        const neighbors = [...(this.adjacencyList.get(current) || [])].reverse();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }

        steps.push({
          step: stepCount++,
          current,
          stack: [...stack],
          visited: [...order],
        });
      }
    }

    return { order, steps };
  }

  toSerializable(startNode: string) {
    const nodes = Array.from(this.nodeMetadata.values());
    const edges: { from: string; to: string }[] = [];
    for (const [from, targets] of this.adjacencyList.entries()) {
      for (const to of targets) {
        edges.push({ from, to });
      }
    }
    const bfs = this.runBFS(startNode);
    const dfs = this.runDFS(startNode);
    const adjacencyRecord: Record<string, string[]> = {};
    for (const [k, v] of this.adjacencyList.entries()) {
      adjacencyRecord[k] = v;
    }

    return {
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      adjacencyList: adjacencyRecord,
      bfs,
      dfs,
    };
  }
}

// ----------------------------------------------------------------------------
// INITIAL REALISTIC DEMO DATA (8 Customers, 6 Categories, 6 Agents, 15 Tickets)
// ----------------------------------------------------------------------------
function getInitialSeedData(): DatabaseSchema {
  const customers: CustomerRecord[] = [
    { customer_id: 'C101', name: 'Vardhini', email: 'vardhini@example.com' },
    { customer_id: 'C102', name: 'Aarav Kulkarni', email: 'aarav.kulkarni@example.com' },
    { customer_id: 'C103', name: 'Meera Deshmukh', email: 'meera.deshmukh@example.com' },
    { customer_id: 'C104', name: 'Karthik Reddy', email: 'karthik.reddy@example.com' },
    { customer_id: 'C105', name: 'Ananya Chatterjee', email: 'ananya.c@example.com' },
    { customer_id: 'C106', name: 'Devansh Joshi', email: 'devansh.joshi@example.com' },
    { customer_id: 'C107', name: 'Nandini Rao', email: 'nandini.rao@example.com' },
    { customer_id: 'C108', name: 'Siddharth Malhotra', email: 'siddharth.m@example.com' },
  ];

  const categories: CategoryRecord[] = [
    { category_id: 'CAT01', category_name: 'Payment', default_team: 'Payment Support' },
    { category_id: 'CAT02', category_name: 'Technical', default_team: 'Technical Support' },
    { category_id: 'CAT03', category_name: 'Refund', default_team: 'Refund Support' },
    { category_id: 'CAT04', category_name: 'Delivery', default_team: 'Delivery Support' },
    { category_id: 'CAT05', category_name: 'Account', default_team: 'Account Support' },
    { category_id: 'CAT06', category_name: 'General', default_team: 'General Support' },
  ];

  const agents: AgentRecord[] = [
    {
      agent_id: 'A101',
      name: 'Arjun Mehta',
      team: 'Payment Support',
      role: 'Billing & Gateway Specialist',
      escalation_level: 'Level 1 Agent',
      status: 'Available',
    },
    {
      agent_id: 'A102',
      name: 'Sneha Iyer',
      team: 'Technical Support',
      role: 'Platform Systems Engineer',
      escalation_level: 'Level 1 Agent',
      status: 'Busy',
    },
    {
      agent_id: 'A103',
      name: 'Rohan Verma',
      team: 'Refund Support',
      role: 'Dispute & Refund Analyst',
      escalation_level: 'Level 2 Agent',
      status: 'Available',
    },
    {
      agent_id: 'A104',
      name: 'Kavya Nair',
      team: 'Delivery Support',
      role: 'Fulfillment & Logistics Lead',
      escalation_level: 'Level 2 Agent',
      status: 'Available',
    },
    {
      agent_id: 'A105',
      name: 'Priya Sharma',
      team: 'Account Support',
      role: 'Senior Escalation Engineer',
      escalation_level: 'Senior Agent',
      status: 'On Duty',
    },
    {
      agent_id: 'A106',
      name: 'Rajesh Krishnan',
      team: 'General Support',
      role: 'Support Operations Manager',
      escalation_level: 'Manager',
      status: 'On Duty',
    },
  ];

  const tickets: TicketRecord[] = [
    {
      ticket_id: 'T101',
      customer_id: 'C101',
      agent_id: 'A106',
      category_id: 'CAT01',
      title: 'Payment deducted without order confirmation',
      description: 'My payment was deducted but my order was not confirmed.',
      priority: 'Critical',
      status: 'Escalated',
      assigned_team: 'Payment Support',
      current_escalation_level: 'Manager',
      matched_keywords: ['payment', 'deducted'],
      rule_explanation: "IF description contains (payment, deducted) THEN Category = 'Payment' AND Team = 'Payment Support'",
      resolution_hours: null,
      created_date: '2026-09-24 09:15:00',
      updated_date: '2026-09-27 05:40:00',
    },
    {
      ticket_id: 'T102',
      customer_id: 'C102',
      agent_id: 'A102',
      category_id: 'CAT02',
      title: 'Application crashes on login attempt',
      description: 'The application crashes whenever I try to login.',
      priority: 'High',
      status: 'In Progress',
      assigned_team: 'Technical Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['login', 'crash'],
      rule_explanation: "ELIF description contains (login, crash) THEN Category = 'Technical' AND Team = 'Technical Support'",
      resolution_hours: null,
      created_date: '2026-09-24 11:30:00',
      updated_date: '2026-09-26 14:20:00',
    },
    {
      ticket_id: 'T103',
      customer_id: 'C103',
      agent_id: 'A105',
      category_id: 'CAT03',
      title: 'Approved refund not credited to bank',
      description: 'I requested a refund but I have not received it.',
      priority: 'High',
      status: 'Escalated',
      assigned_team: 'Refund Support',
      current_escalation_level: 'Senior Agent',
      matched_keywords: ['refund', 'refund not received'],
      rule_explanation: "ELIF description contains (refund) THEN Category = 'Refund' AND Team = 'Refund Support'",
      resolution_hours: null,
      created_date: '2026-09-24 14:05:00',
      updated_date: '2026-09-26 18:10:00',
    },
    {
      ticket_id: 'T104',
      customer_id: 'C104',
      agent_id: 'A104',
      category_id: 'CAT04',
      title: 'Express parcel delayed at regional hub',
      description: 'My courier parcel shows delayed delivery for the past 4 days without tracking updates.',
      priority: 'Medium',
      status: 'Escalated',
      assigned_team: 'Delivery Support',
      current_escalation_level: 'Level 2 Agent',
      matched_keywords: ['delayed delivery', 'delivery', 'parcel', 'courier'],
      rule_explanation: "ELIF description contains (delayed delivery, delivery, parcel, courier) THEN Category = 'Delivery' AND Team = 'Delivery Support'",
      resolution_hours: null,
      created_date: '2026-09-25 08:45:00',
      updated_date: '2026-09-26 16:00:00',
    },
    {
      ticket_id: 'T105',
      customer_id: 'C105',
      agent_id: 'A105',
      category_id: 'CAT05',
      title: 'Unable to update organization profile and username',
      description: 'Facing an account issue when trying to update my profile settings and primary username.',
      priority: 'Low',
      status: 'Resolved',
      assigned_team: 'Account Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['account issue', 'account', 'profile', 'username'],
      rule_explanation: "ELIF description contains (account issue, account, profile, username) THEN Category = 'Account' AND Team = 'Account Support'",
      resolution_hours: 3.5,
      created_date: '2026-09-25 10:12:00',
      updated_date: '2026-09-25 13:42:00',
    },
    {
      ticket_id: 'T106',
      customer_id: 'C106',
      agent_id: 'A106',
      category_id: 'CAT06',
      title: 'Enterprise SLA documentation inquiry',
      description: 'Need official compliance certificate and annual SLA documentation for vendor onboarding.',
      priority: 'Low',
      status: 'Resolved',
      assigned_team: 'General Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: [],
      rule_explanation: "ELSE (no domain keyword matched) THEN Category = 'General' AND Team = 'General Support'",
      resolution_hours: 2.0,
      created_date: '2026-09-25 12:00:00',
      updated_date: '2026-09-25 14:00:00',
    },
    {
      ticket_id: 'T107',
      customer_id: 'C107',
      agent_id: 'A101',
      category_id: 'CAT01',
      title: 'UPI transaction failed twice during checkout',
      description: 'My payment failed twice during subscription renewal and the transaction timed out.',
      priority: 'High',
      status: 'Open',
      assigned_team: 'Payment Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['payment failed', 'payment', 'transaction'],
      rule_explanation: "IF description contains (payment failed, payment, transaction) THEN Category = 'Payment' AND Team = 'Payment Support'",
      resolution_hours: null,
      created_date: '2026-09-25 15:20:00',
      updated_date: '2026-09-25 15:20:00',
    },
    {
      ticket_id: 'T108',
      customer_id: 'C108',
      agent_id: 'A102',
      category_id: 'CAT02',
      title: 'Password reset link returning server error 500',
      description: 'Password reset workflow throws an unexpected error and the application not working on mobile browser.',
      priority: 'Critical',
      status: 'In Progress',
      assigned_team: 'Technical Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['application not working', 'password', 'error'],
      rule_explanation: "ELIF description contains (application not working, password, error) THEN Category = 'Technical' AND Team = 'Technical Support'",
      resolution_hours: null,
      created_date: '2026-09-25 17:10:00',
      updated_date: '2026-09-26 09:30:00',
    },
    {
      ticket_id: 'T109',
      customer_id: 'C101',
      agent_id: 'A103',
      category_id: 'CAT03',
      title: 'Money back request for duplicate annual charge',
      description: 'Was billed twice for the same invoice and need my money back via instant refund.',
      priority: 'Medium',
      status: 'Resolved',
      assigned_team: 'Refund Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['money back', 'refund'],
      rule_explanation: "ELIF description contains (money back, refund) THEN Category = 'Refund' AND Team = 'Refund Support'",
      resolution_hours: 5.2,
      created_date: '2026-09-26 08:30:00',
      updated_date: '2026-09-26 13:42:00',
    },
    {
      ticket_id: 'T110',
      customer_id: 'C104',
      agent_id: 'A104',
      category_id: 'CAT04',
      title: 'Shipping address pin code correction before dispatch',
      description: 'Please update shipping apartment number before courier dispatches the hardware kit delivery.',
      priority: 'Medium',
      status: 'Resolved',
      assigned_team: 'Delivery Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['delivery', 'shipping', 'courier'],
      rule_explanation: "ELIF description contains (delivery, shipping, courier) THEN Category = 'Delivery' AND Team = 'Delivery Support'",
      resolution_hours: 1.8,
      created_date: '2026-09-26 10:05:00',
      updated_date: '2026-09-26 11:53:00',
    },
    {
      ticket_id: 'T111',
      customer_id: 'C105',
      agent_id: 'A105',
      category_id: 'CAT05',
      title: 'Two-factor authentication locked out my account',
      description: 'Lost my authenticator phone and now my account profile is locked out completely.',
      priority: 'High',
      status: 'Open',
      assigned_team: 'Account Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['account', 'profile'],
      rule_explanation: "ELIF description contains (account, profile) THEN Category = 'Account' AND Team = 'Account Support'",
      resolution_hours: null,
      created_date: '2026-09-26 13:15:00',
      updated_date: '2026-09-26 13:15:00',
    },
    {
      ticket_id: 'T112',
      customer_id: 'C102',
      agent_id: 'A101',
      category_id: 'CAT01',
      title: 'Paid invoice still marked as overdue in portal',
      description: 'We already paid the quarterly invoice yesterday via wire transaction but portal shows overdue.',
      priority: 'Medium',
      status: 'Resolved',
      assigned_team: 'Payment Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['paid', 'transaction'],
      rule_explanation: "IF description contains (paid, transaction) THEN Category = 'Payment' AND Team = 'Payment Support'",
      resolution_hours: 4.0,
      created_date: '2026-09-26 15:00:00',
      updated_date: '2026-09-26 19:00:00',
    },
    {
      ticket_id: 'T113',
      customer_id: 'C106',
      agent_id: 'A102',
      category_id: 'CAT02',
      title: 'Dashboard export module crashed on large CSV',
      description: 'Exporting 50,000 rows crashed the browser tab with an out-of-memory error.',
      priority: 'Medium',
      status: 'In Progress',
      assigned_team: 'Technical Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['crashed', 'crash', 'error'],
      rule_explanation: "ELIF description contains (crashed, crash, error) THEN Category = 'Technical' AND Team = 'Technical Support'",
      resolution_hours: null,
      created_date: '2026-09-26 16:40:00',
      updated_date: '2026-09-27 02:15:00',
    },
    {
      ticket_id: 'T114',
      customer_id: 'C107',
      agent_id: 'A104',
      category_id: 'CAT04',
      title: 'Delivery delay for replacement security token',
      description: 'Experiencing a severe delivery delay for our replacement hardware security parcel.',
      priority: 'High',
      status: 'Open',
      assigned_team: 'Delivery Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: ['delivery delay', 'delivery', 'parcel'],
      rule_explanation: "ELIF description contains (delivery delay, delivery, parcel) THEN Category = 'Delivery' AND Team = 'Delivery Support'",
      resolution_hours: null,
      created_date: '2026-09-27 01:20:00',
      updated_date: '2026-09-27 01:20:00',
    },
    {
      ticket_id: 'T115',
      customer_id: 'C108',
      agent_id: 'A106',
      category_id: 'CAT06',
      title: 'Request for custom webhook integration training',
      description: 'Would like to schedule a walkthrough session for our engineering team next week.',
      priority: 'Low',
      status: 'Open',
      assigned_team: 'General Support',
      current_escalation_level: 'Level 1 Agent',
      matched_keywords: [],
      rule_explanation: "ELSE (no domain keyword matched) THEN Category = 'General' AND Team = 'General Support'",
      resolution_hours: null,
      created_date: '2026-09-27 04:10:00',
      updated_date: '2026-09-27 04:10:00',
    },
  ];

  const escalations: EscalationRecord[] = [
    {
      escalation_id: 'E101',
      ticket_id: 'T101',
      from_agent: 'Arjun Mehta (Level 1 Agent)',
      to_agent: 'Rohan Verma (Level 2 Agent)',
      previous_level: 'Level 1 Agent',
      level: 'Level 2 Agent',
      reason: 'Payment gateway settlement log shows debit without webhook callback; requires Level 2 trace.',
      date: '2026-09-24 14:30:00',
      status: 'Active',
    },
    {
      escalation_id: 'E102',
      ticket_id: 'T101',
      from_agent: 'Rohan Verma (Level 2 Agent)',
      to_agent: 'Priya Sharma (Senior Agent)',
      previous_level: 'Level 2 Agent',
      level: 'Senior Agent',
      reason: 'Merchant reconciliation discrepancy across acquiring bank ledger; escalated to Senior Agent.',
      date: '2026-09-25 11:15:00',
      status: 'Active',
    },
    {
      escalation_id: 'E103',
      ticket_id: 'T101',
      from_agent: 'Priya Sharma (Senior Agent)',
      to_agent: 'Rajesh Krishnan (Manager)',
      previous_level: 'Senior Agent',
      level: 'Manager',
      reason: 'Critical SLA breach imminent; escalated to Support Operations Manager for manual order fulfillment override.',
      date: '2026-09-26 09:45:00',
      status: 'Active',
    },
    {
      escalation_id: 'E104',
      ticket_id: 'T103',
      from_agent: 'Arjun Mehta (Level 1 Agent)',
      to_agent: 'Rohan Verma (Level 2 Agent)',
      previous_level: 'Level 1 Agent',
      level: 'Level 2 Agent',
      reason: 'Refund ARN reference number not generated by processor after 48 hours.',
      date: '2026-09-25 10:00:00',
      status: 'Active',
    },
    {
      escalation_id: 'E105',
      ticket_id: 'T103',
      from_agent: 'Rohan Verma (Level 2 Agent)',
      to_agent: 'Priya Sharma (Senior Agent)',
      previous_level: 'Level 2 Agent',
      level: 'Senior Agent',
      reason: 'Requires manual NEFT/IMPS payout authorization by Senior Resolution Lead.',
      date: '2026-09-26 16:20:00',
      status: 'Active',
    },
    {
      escalation_id: 'E106',
      ticket_id: 'T104',
      from_agent: 'Sneha Iyer (Level 1 Agent)',
      to_agent: 'Kavya Nair (Level 2 Agent)',
      previous_level: 'Level 1 Agent',
      level: 'Level 2 Agent',
      reason: 'Regional courier hub hold exceeds 72 hours; escalated to Level 2 Logistics Lead.',
      date: '2026-09-26 15:50:00',
      status: 'Active',
    },
  ];

  return { customers, categories, agents, tickets, escalations };
}

// ----------------------------------------------------------------------------
// PERSISTENT RELATIONAL DATABASE MANAGER
// ----------------------------------------------------------------------------
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'helpdesk_relational_db.json');

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tickets) && parsed.tickets.length > 0) {
        return parsed;
      }
    } catch {
      // Re-seed if corrupted
    }
  }
  const initial = getInitialSeedData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function formatNow(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// Helper to join Ticket with Customer, Category, Agent, and Escalations (DBMS INNER/LEFT JOIN)
function enrichTickets(db: DatabaseSchema) {
  return db.tickets.map((t) => {
    const customer = db.customers.find((c) => c.customer_id === t.customer_id) || {
      customer_id: t.customer_id,
      name: 'Unknown Customer',
      email: 'unknown@example.com',
    };
    const category = db.categories.find((cat) => cat.category_id === t.category_id) || {
      category_id: t.category_id,
      category_name: 'General',
      default_team: 'General Support',
    };
    const agent = db.agents.find((a) => a.agent_id === t.agent_id) || db.agents[0];
    const ticketEscalations = db.escalations.filter((e) => e.ticket_id === t.ticket_id);

    return {
      ...t,
      customer_name: customer.name,
      customer_email: customer.email,
      category_name: category.category_name,
      agent_name: agent.name,
      agent_role: agent.role,
      agent_level: agent.escalation_level,
      escalations: ticketEscalations,
    };
  });
}

// Build Escalation Graph for a specific Ticket
function buildTicketEscalationGraph(db: DatabaseSchema, ticketId: string) {
  const ticket = db.tickets.find((t) => t.ticket_id === ticketId) || db.tickets[0];
  const enriched = enrichTickets(db).find((t) => t.ticket_id === ticket.ticket_id)!;
  const engine = new EscalationGraphEngine();

  const levelOrder: ('Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager')[] = [
    'Level 1 Agent',
    'Level 2 Agent',
    'Senior Agent',
    'Manager',
  ];

  const levelAgents: Record<string, string> = {
    'Level 1 Agent': 'Arjun Mehta',
    'Level 2 Agent': 'Rohan Verma',
    'Senior Agent': 'Priya Sharma',
    'Manager': 'Rajesh Krishnan',
  };

  // Customize Level 1/2 agent names based on ticket category or escalation records
  const ticketEscs = db.escalations.filter((e) => e.ticket_id === ticket.ticket_id);
  if (ticketEscs.length > 0) {
    for (const esc of ticketEscs) {
      const fromName = esc.from_agent.split(' (')[0];
      const toName = esc.to_agent.split(' (')[0];
      if (esc.previous_level) levelAgents[esc.previous_level] = fromName;
      if (esc.level) levelAgents[esc.level] = toName;
    }
  } else {
    const assignedAgent = db.agents.find((a) => a.agent_id === ticket.agent_id);
    if (assignedAgent) {
      levelAgents[ticket.current_escalation_level] = assignedAgent.name;
    }
  }

  const startNodeId = `Ticket ${ticket.ticket_id}`;
  const currentLevelIndex = levelOrder.indexOf(ticket.current_escalation_level);

  engine.addNode(
    startNodeId,
    `Ticket ${ticket.ticket_id}`,
    `${enriched.customer_name} · ${enriched.category_name}`,
    'Ticket Root',
    false,
    ticket.status
  );

  let prevNodeId = startNodeId;
  for (let idx = 0; idx < levelOrder.length; idx++) {
    const lvl = levelOrder[idx];
    const isReached = idx <= currentLevelIndex;
    const isCurrent = idx === currentLevelIndex;
    const nodeStatus =
      ticket.status === 'Resolved' && isCurrent
        ? 'Resolved'
        : isCurrent
        ? 'Current Active Level'
        : isReached
        ? 'Escalated Past'
        : 'Available Next Tier';

    engine.addNode(
      lvl,
      lvl,
      `${levelAgents[lvl]} (${idx === 0 ? ticket.assigned_team : lvl})`,
      lvl,
      isCurrent,
      nodeStatus
    );
    engine.addDirectedEdge(prevNodeId, lvl);
    prevNodeId = lvl;
  }

  const graphData = engine.toSerializable(startNodeId);
  const activePath = ['Ticket ' + ticket.ticket_id, ...levelOrder.slice(0, currentLevelIndex + 1)];

  return {
    ticket: enriched,
    currentLevel: ticket.current_escalation_level,
    currentNode: ticket.current_escalation_level,
    activeEscalationPath: activePath,
    fullEscalationHierarchy: ['Ticket ' + ticket.ticket_id, ...levelOrder],
    ...graphData,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  let db = loadDatabase();

  // 1. GET /api/overview -> Full relational dataset + dashboard analytics
  app.get('/api/overview', (_req, res) => {
    db = loadDatabase();
    const enrichedTickets = enrichTickets(db);

    const totalTickets = enrichedTickets.length;
    const openTickets = enrichedTickets.filter((t) => t.status === 'Open').length;
    const inProgressTickets = enrichedTickets.filter((t) => t.status === 'In Progress').length;
    const resolvedTickets = enrichedTickets.filter((t) => t.status === 'Resolved').length;
    const escalatedTickets = enrichedTickets.filter((t) => t.status === 'Escalated').length;

    const resolvedWithHours = enrichedTickets.filter((t) => t.resolution_hours !== null);
    const avgResolutionHours =
      resolvedWithHours.length > 0
        ? Number(
            (
              resolvedWithHours.reduce((acc, item) => acc + (item.resolution_hours || 0), 0) /
              resolvedWithHours.length
            ).toFixed(1)
          )
        : 3.4;

    // Enrich customers with ticket counts (DBMS GROUP BY aggregation)
    const enrichedCustomers = db.customers.map((c) => {
      const custTickets = enrichedTickets.filter((t) => t.customer_id === c.customer_id);
      return {
        ...c,
        total_tickets: custTickets.length,
        open_tickets: custTickets.filter((t) => t.status !== 'Resolved').length,
        resolved_tickets: custTickets.filter((t) => t.status === 'Resolved').length,
        tickets: custTickets,
      };
    });

    // Enrich agents with active ticket count
    const enrichedAgents = db.agents.map((a) => {
      const agentTickets = enrichedTickets.filter((t) => t.agent_id === a.agent_id);
      const activeCount = agentTickets.filter((t) => t.status !== 'Resolved').length;
      return {
        ...a,
        active_tickets: activeCount,
        total_assigned: agentTickets.length,
        tickets: agentTickets,
      };
    });

    // Enrich escalations with customer & ticket metadata
    const enrichedEscalations = db.escalations.map((e) => {
      const t = enrichedTickets.find((tk) => tk.ticket_id === e.ticket_id);
      return {
        ...e,
        customer_name: t ? t.customer_name : 'Unknown',
        ticket_title: t ? t.title : '',
        current_agent: t ? `${t.agent_name} (${t.current_escalation_level})` : e.to_agent,
        ticket_status: t ? t.status : e.status,
      };
    });

    res.json({
      metrics: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        escalatedTickets,
        avgResolutionTime: `${avgResolutionHours} hrs`,
        avgResolutionHours,
      },
      tickets: enrichedTickets,
      customers: enrichedCustomers,
      agents: enrichedAgents,
      categories: db.categories,
      escalations: enrichedEscalations,
      rawTables: db,
    });
  });

  // 2. POST /api/classify -> Python Rule-Based Classifier preview/execution
  app.post('/api/classify', (req, res) => {
    const { description, title } = req.body || {};
    const combinedText = `${title || ''} ${description || ''}`.trim();
    const result = runPythonRuleClassifier(combinedText);
    res.json(result);
  });

  // 3. POST /api/tickets -> Create & Classify Ticket (Manual Customer Entry enforced)
  app.post('/api/tickets', (req, res) => {
    try {
      const { customerName, customerEmail, title, description, priority } = req.body || {};

      if (!customerName || !String(customerName).trim()) {
        return res.status(400).json({ error: 'Please enter customer name.' });
      }
      const emailStr = String(customerEmail || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailStr || !emailRegex.test(emailStr)) {
        return res.status(400).json({ error: 'Please enter a valid email.' });
      }
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Please enter problem title.' });
      }
      if (!description || !String(description).trim()) {
        return res.status(400).json({ error: 'Please enter ticket description.' });
      }

      db = loadDatabase();

      // Step 1: Find or create Customer record (preserving all manually entered customers)
      const cleanName = String(customerName).trim();
      const cleanEmail = emailStr.toLowerCase();

      let customer = db.customers.find(
        (c) => c.email.toLowerCase() === cleanEmail && c.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (!customer) {
        const nextCustNum = 101 + db.customers.length;
        customer = {
          customer_id: `C${nextCustNum}`,
          name: cleanName,
          email: cleanEmail,
        };
        db.customers.push(customer);
      }

      // Step 2: Run Python Rule-Based Classifier on description + title
      const classification = runPythonRuleClassifier(`${title} ${description}`);

      // Step 3: Java OOP Routing Logic -> Match Category & Support Team & Agent
      const categoryRecord =
        db.categories.find(
          (c) => c.category_name.toLowerCase() === classification.category.toLowerCase()
        ) || db.categories[db.categories.length - 1];

      const assignedTeam = categoryRecord.default_team;
      const teamAgent =
        db.agents.find((a) => a.team.toLowerCase() === assignedTeam.toLowerCase()) || db.agents[0];

      // Generate next Ticket ID (e.g., T116, T117...)
      const maxTicketNum = db.tickets.reduce((max, t) => {
        const num = parseInt(t.ticket_id.replace(/\D/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 100);
      const newTicketId = `T${maxTicketNum + 1}`;
      const nowStr = formatNow();

      const validPriority = ['Low', 'Medium', 'High', 'Critical'].includes(priority)
        ? priority
        : 'Medium';

      const newTicket: TicketRecord = {
        ticket_id: newTicketId,
        customer_id: customer.customer_id,
        agent_id: teamAgent.agent_id,
        category_id: categoryRecord.category_id,
        title: String(title).trim(),
        description: String(description).trim(),
        priority: validPriority,
        status: 'Open',
        assigned_team: assignedTeam,
        current_escalation_level: 'Level 1 Agent',
        matched_keywords: classification.matchedKeywords,
        rule_explanation: classification.ruleExplanation,
        resolution_hours: null,
        created_date: nowStr,
        updated_date: nowStr,
      };

      // Put newest ticket at top or chronological order
      db.tickets.unshift(newTicket);
      saveDatabase(db);

      const enrichedNewTicket = enrichTickets(db).find((t) => t.ticket_id === newTicketId);

      return res.status(201).json({
        message: 'Ticket created, classified, and routed successfully.',
        ticket: enrichedNewTicket,
        classification: {
          ticketId: newTicketId,
          detectedCategory: categoryRecord.category_name,
          assignedTeam,
          assignedAgent: teamAgent.name,
          currentStatus: newTicket.status,
          matchedKeywords: classification.matchedKeywords,
          ruleExplanation: classification.ruleExplanation,
        },
      });
    } catch {
      return res.status(500).json({ error: 'Unable to create ticket. Please try again.' });
    }
  });

  // 4. PATCH /api/tickets/:ticketId/assign -> Assign / Reassign Agent & Team
  app.patch('/api/tickets/:ticketId/assign', (req, res) => {
    const { ticketId } = req.params;
    const { agentId, status } = req.body || {};
    db = loadDatabase();

    const ticket = db.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const agent = db.agents.find((a) => a.agent_id === agentId);
    if (agent) {
      ticket.agent_id = agent.agent_id;
      ticket.assigned_team = agent.team;
      ticket.current_escalation_level = agent.escalation_level;
    }

    if (status && ['Open', 'In Progress', 'Escalated', 'Resolved'].includes(status)) {
      ticket.status = status;
    } else if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    ticket.updated_date = formatNow();
    saveDatabase(db);

    const enriched = enrichTickets(db).find((t) => t.ticket_id === ticketId);
    res.json({ message: 'Agent assigned successfully.', ticket: enriched });
  });

  // 5. PATCH /api/tickets/:ticketId/status -> Update status or Resolve ticket
  app.patch('/api/tickets/:ticketId/status', (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body || {};
    db = loadDatabase();

    const ticket = db.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    if (status && ['Open', 'In Progress', 'Escalated', 'Resolved'].includes(status)) {
      ticket.status = status;
      if (status === 'Resolved' && ticket.resolution_hours === null) {
        ticket.resolution_hours = 2.8;
        // Also mark escalations for this ticket as Resolved
        db.escalations.forEach((e) => {
          if (e.ticket_id === ticketId) {
            e.status = 'Resolved';
          }
        });
      }
    }

    ticket.updated_date = formatNow();
    saveDatabase(db);

    const enriched = enrichTickets(db).find((t) => t.ticket_id === ticketId);
    res.json({ message: `Ticket ${ticketId} status updated to ${ticket.status}.`, ticket: enriched });
  });

  // 6. POST /api/tickets/:ticketId/escalate -> Escalate ticket along Level 1 -> Level 2 -> Senior Agent -> Manager
  app.post('/api/tickets/:ticketId/escalate', (req, res) => {
    const { ticketId } = req.params;
    const { reason, targetLevel } = req.body || {};
    db = loadDatabase();

    const ticket = db.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const levelOrder: ('Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager')[] = [
      'Level 1 Agent',
      'Level 2 Agent',
      'Senior Agent',
      'Manager',
    ];

    const currentAgent = db.agents.find((a) => a.agent_id === ticket.agent_id) || db.agents[0];
    const currentIdx = levelOrder.indexOf(ticket.current_escalation_level);

    let nextLevel: 'Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager' =
      currentIdx < levelOrder.length - 1 ? levelOrder[currentIdx + 1] : 'Manager';

    if (targetLevel && levelOrder.includes(targetLevel)) {
      nextLevel = targetLevel;
    }

    // Find appropriate agent for the new escalation level
    const nextAgent =
      db.agents.find((a) => a.escalation_level === nextLevel) ||
      db.agents[db.agents.length - 1];

    const maxEscNum = db.escalations.reduce((max, e) => {
      const num = parseInt(e.escalation_id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);

    const newEscalation: EscalationRecord = {
      escalation_id: `E${maxEscNum + 1}`,
      ticket_id: ticket.ticket_id,
      from_agent: `${currentAgent.name} (${ticket.current_escalation_level})`,
      to_agent: `${nextAgent.name} (${nextLevel})`,
      previous_level: ticket.current_escalation_level,
      level: nextLevel,
      reason:
        reason && String(reason).trim()
          ? String(reason).trim()
          : `Escalated from ${ticket.current_escalation_level} to ${nextLevel} for specialized resolution.`,
      date: formatNow(),
      status: 'Active',
    };

    ticket.current_escalation_level = nextLevel;
    ticket.agent_id = nextAgent.agent_id;
    ticket.status = 'Escalated';
    ticket.updated_date = formatNow();

    db.escalations.unshift(newEscalation);
    saveDatabase(db);

    const enriched = enrichTickets(db).find((t) => t.ticket_id === ticketId);
    res.json({
      message: `Ticket ${ticketId} escalated to ${nextLevel} (${nextAgent.name}).`,
      ticket: enriched,
      escalation: newEscalation,
    });
  });

  // 7. GET /api/graph/:ticketId -> Escalation Graph + BFS & DFS Traversal Analysis
  app.get('/api/graph/:ticketId', (req, res) => {
    db = loadDatabase();
    const { ticketId } = req.params;
    const graphPayload = buildTicketEscalationGraph(db, ticketId);
    res.json(graphPayload);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Helpdesk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
