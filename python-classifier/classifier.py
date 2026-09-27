#!/usr/bin/env python3
"""
Rule-Based Ticket Classification Service (Python)
Academic Subject Mapping: Python Programming
Deterministic IF-THEN Keyword Classification Rules (No ML / AI Prediction)
"""

import sys
import json
import re

CLASSIFICATION_RULES = [
    {
        "category": "Payment",
        "team": "Payment Support",
        "keywords": ["payment failed", "payment", "paid", "transaction", "deducted"]
    },
    {
        "category": "Technical",
        "team": "Technical Support",
        "keywords": ["application not working", "login", "password", "crashed", "crash", "error"]
    },
    {
        "category": "Refund",
        "team": "Refund Support",
        "keywords": ["refund not received", "money back", "refund"]
    },
    {
        "category": "Delivery",
        "team": "Delivery Support",
        "keywords": ["delayed delivery", "delivery delay", "delivery", "shipping", "parcel", "courier"]
    },
    {
        "category": "Account",
        "team": "Account Support",
        "keywords": ["account issue", "account", "profile", "username"]
    }
]


def classify_ticket(text: str) -> dict:
    """
    Applies explainable IF-THEN keyword rules to classify customer ticket text.
    """
    normalized = (text or "").lower().strip()

    for idx, rule in enumerate(CLASSIFICATION_RULES):
        matched = [kw for kw in rule["keywords"] if kw in normalized]
        if matched:
            branch = "IF" if idx == 0 else "ELIF"
            return {
                "category": rule["category"],
                "assignedTeam": rule["team"],
                "matchedKeywords": matched,
                "ruleExplanation": f"{branch} description contains ({', '.join(matched)}) THEN Category = '{rule['category']}' AND Team = '{rule['team']}'"
            }

    return {
        "category": "General",
        "assignedTeam": "General Support",
        "matchedKeywords": [],
        "ruleExplanation": "ELSE (no domain keyword matched) THEN Category = 'General' AND Team = 'General Support'"
    }


if __name__ == "__main__":
    raw_input = sys.stdin.read() if not sys.argv[1:] else " ".join(sys.argv[1:])
    result = classify_ticket(raw_input)
    print(json.dumps(result))
