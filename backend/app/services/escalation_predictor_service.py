from datetime import datetime
from app.models.ticket import Ticket
from app.extensions import db

def predict_risk_level(score):
    if score < 40:
        return 'Low Risk'
    elif score < 75:
        return 'Medium Risk'
    else:
        return 'High Risk'

def calculate_escalation_score(ticket):
    """
    Computes Escalation Risk Score (0-100), Level (Low/Medium/High Risk), and Reason bullets.
    """
    # 1. Ticket Urgency Score
    urgency_scores = {
        'Low': 5,
        'Medium': 15,
        'High': 35,
        'Critical': 50
    }
    urgency = ticket.urgency or 'Medium'
    score = urgency_scores.get(urgency, 15)
    reasons = []

    if urgency in ['High', 'Critical']:
        reasons.append(f"Critical production impact detected due to '{urgency}' urgency")
    else:
        reasons.append(f"Base risk initialized from '{urgency}' urgency level")

    # 2. Ticket Category Risk (some categories are high-complexity/high-risk)
    high_risk_categories = ['Server Issue', 'Security Issue', 'Database Issue', 'Deployment Issue', 'API Issue']
    category = ticket.category
    if category in high_risk_categories:
        score += 15
        reasons.append(f"High-complexity category detected: {category}")

    # 3. Department workload
    if ticket.department_id:
        # Count open/active tickets assigned to the department
        workload = Ticket.query.filter(
            Ticket.department_id == ticket.department_id,
            ~Ticket.status.in_(['Resolved', 'Closed'])
        ).count()
        
        if workload > 10:
            score += 25
            reasons.append(f"Current team workload is extremely high ({workload} active tickets)")
        elif workload > 5:
            score += 12
            reasons.append(f"Current team workload is moderately high ({workload} active tickets)")
        else:
            reasons.append(f"Current team workload is stable ({workload} active tickets)")

    # 4. Average resolution time of similar tickets
    if category:
        resolved_tickets = Ticket.query.filter(
            Ticket.category == category,
            Ticket.status.in_(['Resolved', 'Closed'])
        ).all()
        
        if resolved_tickets:
            total_duration = 0
            count = 0
            for r in resolved_tickets:
                if r.updated_at and r.created_at:
                    duration = (r.updated_at - r.created_at).total_seconds() / 3600.0 # in hours
                    total_duration += duration
                    count += 1
            if count > 0:
                avg_hours = total_duration / count
                if avg_hours > 48:
                    score += 20
                    reasons.append(f"Similar tickets historically take over 48 hours to resolve (avg: {avg_hours:.1f} hrs)")
                elif avg_hours > 12:
                    score += 10
                    reasons.append(f"Similar tickets historically require moderate resolution times (avg: {avg_hours:.1f} hrs)")
                else:
                    reasons.append(f"Similar tickets historically resolved quickly (avg: {avg_hours:.1f} hrs)")
            else:
                reasons.append("Insufficient historical resolution logs for category metrics")
        else:
            reasons.append("Insufficient historical resolution logs for category metrics")

    # 5. Number of active similar tickets (duplicate/related issues load)
    if category:
        active_similar = Ticket.query.filter(
            Ticket.category == category,
            Ticket.id != ticket.id,
            ~Ticket.status.in_(['Resolved', 'Closed'])
        ).count()
        
        if active_similar > 5:
            score += 15
            reasons.append(f"Multiple active tickets of same category exist ({active_similar} active tickets)")
        elif active_similar > 2:
            score += 5
            reasons.append(f"A few active tickets of same category exist ({active_similar} active tickets)")

    # 6. Ticket age and SLA deadline
    if ticket.created_at:
        age_hours = (datetime.utcnow() - ticket.created_at).total_seconds() / 3600.0
        if ticket.sla_deadline:
            if datetime.utcnow() > ticket.sla_deadline:
                score = 100
                reasons = ["SLA deadline has been breached! Immediate escalation required."]
            else:
                total_sla_hours = (ticket.sla_deadline - ticket.created_at).total_seconds() / 3600.0
                if total_sla_hours > 0:
                    percent_elapsed = (age_hours / total_sla_hours) * 100.0
                    if percent_elapsed > 80:
                        score += 30
                        reasons.append(f"Ticket has elapsed {percent_elapsed:.1f}% of its SLA allocation")
                    elif percent_elapsed > 50:
                        score += 15
                        reasons.append(f"Ticket has elapsed {percent_elapsed:.1f}% of its SLA allocation")
        else:
            if age_hours > 48:
                score += 15
                reasons.append(f"Ticket remains unresolved after {age_hours:.1f} hours")

    # Bound and categorize
    score = min(max(score, 0), 100)
    level = predict_risk_level(score)
    reason_str = "\n".join(f"• {r}" for r in reasons)

    return score, level, reason_str
