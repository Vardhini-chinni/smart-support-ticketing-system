package com.helpdesk;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Academic Subject Mapping:
 * - OOPJ: Encapsulation, Inheritance (SupportMember -> Agent), Polymorphism, Services
 * - ADSA: Graph Representation (Adjacency List), Breadth-First Search (BFS), Depth-First Search (DFS)
 * - DMGT: Directed Graph G = (V, E) and Binary Relations between Customers, Tickets, Categories, and Agents
 */
public class HelpdeskDomain {

    // Base class demonstrating Inheritance in OOPJ
    public static abstract class PersonEntity {
        private String id;
        private String name;
        private String email;

        public PersonEntity(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
    }

    public static class Customer extends PersonEntity {
        public Customer(String customerId, String name, String email) {
            super(customerId, name, email);
        }
    }

    public static class Agent extends PersonEntity {
        private String team;
        private String role;
        private String escalationLevel;
        private String status;

        public Agent(String agentId, String name, String email, String team, String role, String escalationLevel, String status) {
            super(agentId, name, email);
            this.team = team;
            this.role = role;
            this.escalationLevel = escalationLevel;
            this.status = status;
        }

        public String getTeam() { return team; }
        public String getRole() { return role; }
        public String getEscalationLevel() { return escalationLevel; }
        public String getStatus() { return status; }
    }

    // ADSA Escalation Graph with BFS and DFS Traversal
    public static class EscalationGraph {
        private final Map<String, List<String>> adjacencyList = new LinkedHashMap<>();

        public void addVertex(String vertex) {
            adjacencyList.putIfAbsent(vertex, new ArrayList<>());
        }

        public void addDirectedEdge(String from, String to) {
            addVertex(from);
            addVertex(to);
            if (!adjacencyList.get(from).contains(to)) {
                adjacencyList.get(from).add(to);
            }
        }

        public List<String> bfsTraversal(String startNode) {
            List<String> visitedOrder = new ArrayList<>();
            Set<String> visited = new LinkedHashSet<>();
            Queue<String> queue = new LinkedList<>();

            visited.add(startNode);
            queue.offer(startNode);

            while (!queue.isEmpty()) {
                String current = queue.poll();
                visitedOrder.add(current);
                for (String neighbor : adjacencyList.getOrDefault(current, Collections.emptyList())) {
                    if (!visited.contains(neighbor)) {
                        visited.add(neighbor);
                        queue.offer(neighbor);
                    }
                }
            }
            return visitedOrder;
        }

        public List<String> dfsTraversal(String startNode) {
            List<String> visitedOrder = new ArrayList<>();
            Set<String> visited = new LinkedHashSet<>();
            dfsHelper(startNode, visited, visitedOrder);
            return visitedOrder;
        }

        private void dfsHelper(String node, Set<String> visited, List<String> visitedOrder) {
            visited.add(node);
            visitedOrder.add(node);
            for (String neighbor : adjacencyList.getOrDefault(node, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    dfsHelper(neighbor, visited, visitedOrder);
                }
            }
        }
    }
}
