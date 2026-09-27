-- =====================================================================
-- SMART CUSTOMER SUPPORT TICKETING & ESCALATION MANAGEMENT SYSTEM
-- Academic Subject Mapping: DBMS (Relational Schema, PK/FK Constraints)
-- =====================================================================

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    category_id VARCHAR(20) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS agents (
    agent_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team VARCHAR(80) NOT NULL,
    role VARCHAR(60) NOT NULL,
    escalation_level VARCHAR(40) NOT NULL,
    status VARCHAR(30) DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS tickets (
    ticket_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    agent_id VARCHAR(20) NOT NULL,
    category_id VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Escalated', 'Resolved')),
    created_date DATETIME NOT NULL,
    updated_date DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS escalations (
    escalation_id VARCHAR(20) PRIMARY KEY,
    ticket_id VARCHAR(20) NOT NULL,
    from_agent VARCHAR(100) NOT NULL,
    to_agent VARCHAR(100) NOT NULL,
    previous_level VARCHAR(40) NOT NULL,
    level VARCHAR(40) NOT NULL,
    reason TEXT NOT NULL,
    date DATETIME NOT NULL,
    status VARCHAR(30) DEFAULT 'Active',
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);
