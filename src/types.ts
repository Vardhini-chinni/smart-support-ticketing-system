export type PageId =
  | 'dashboard'
  | 'create-ticket'
  | 'all-tickets'
  | 'customers'
  | 'agents-teams'
  | 'escalations'
  | 'escalation-graph'
  | 'graph-analysis'
  | 'analytics'
  | 'db-relationships'
  | 'system-flow'
  | 'about-project';

export interface EscalationItem {
  escalation_id: string;
  ticket_id: string;
  from_agent: string;
  to_agent: string;
  previous_level: string;
  level: string;
  reason: string;
  date: string;
  status: 'Active' | 'Resolved';
  customer_name?: string;
  ticket_title?: string;
  current_agent?: string;
  ticket_status?: string;
}

export interface TicketItem {
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
  customer_name: string;
  customer_email: string;
  category_name: string;
  agent_name: string;
  agent_role: string;
  agent_level: string;
  escalations: EscalationItem[];
}

export interface CustomerItem {
  customer_id: string;
  name: string;
  email: string;
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  tickets: TicketItem[];
}

export interface AgentItem {
  agent_id: string;
  name: string;
  team: string;
  role: string;
  escalation_level: 'Level 1 Agent' | 'Level 2 Agent' | 'Senior Agent' | 'Manager';
  status: 'Available' | 'Busy' | 'On Duty';
  active_tickets: number;
  total_assigned: number;
  tickets: TicketItem[];
}

export interface CategoryItem {
  category_id: string;
  category_name: string;
  default_team: string;
}

export interface OverviewData {
  metrics: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    escalatedTickets: number;
    avgResolutionTime: string;
    avgResolutionHours: number;
  };
  tickets: TicketItem[];
  customers: CustomerItem[];
  agents: AgentItem[];
  categories: CategoryItem[];
  escalations: EscalationItem[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  sublabel: string;
  role: string;
  isCurrent: boolean;
  status: string;
}

export interface GraphPayload {
  ticket: TicketItem;
  currentLevel: string;
  currentNode: string;
  activeEscalationPath: string[];
  fullEscalationHierarchy: string[];
  nodes: GraphNodeData[];
  edges: { from: string; to: string }[];
  nodeCount: number;
  edgeCount: number;
  adjacencyList: Record<string, string[]>;
  bfs: {
    order: string[];
    steps: { step: number; current: string; queue: string[]; visited: string[] }[];
  };
  dfs: {
    order: string[];
    steps: { step: number; current: string; stack: string[]; visited: string[] }[];
  };
}
