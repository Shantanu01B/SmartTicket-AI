import csv
import os
import random

# Categories and Urgencies mapping
categories = [
    "Authentication Issue",
    "Database Issue",
    "Server Issue",
    "Payment Issue",
    "Network Issue",
    "UI Bug",
    "API Issue",
    "Security Issue",
    "Deployment Issue",
    "Performance Issue"
]

templates = {
    "Authentication Issue": [
        ("I forgot my password and cannot log in.", "Low"),
        ("MFA is not sending code to my phone.", "Medium"),
        ("Single sign-on is failing for the entire department.", "High"),
        ("Users cannot log in to the system at all.", "Critical"),
        ("My account is locked out after multiple attempts.", "Low"),
        ("Token expires too quickly.", "Medium"),
        ("Cannot reset password, link is broken.", "High"),
        ("All authentication services are down.", "Critical")
    ],
    "Database Issue": [
        ("Query taking too long to execute in reporting module.", "Medium"),
        ("Database connection timeout when accessing user records.", "High"),
        ("Production database is down and corrupted.", "Critical"),
        ("Cannot write to database, getting readonly error.", "High"),
        ("Data mismatch in the latest migration.", "Medium"),
        ("Database storage is full.", "Critical"),
        ("Slow reads on the dashboard.", "Low"),
        ("SQL injection attempt detected.", "Critical")
    ],
    "Server Issue": [
        ("Server 3 needs a reboot, it's lagging.", "Medium"),
        ("Production server crashed unexpectedly.", "Critical"),
        ("High CPU usage on web server.", "High"),
        ("Need a new staging server provisioned.", "Low"),
        ("Out of memory error on main server.", "High"),
        ("Server rack lost power.", "Critical"),
        ("Log rotation failed, disk full.", "Medium"),
        ("SSL certificate expired on the server.", "High")
    ],
    "Payment Issue": [
        ("Customer payment failed but money was deducted.", "High"),
        ("Payment gateway timeout.", "High"),
        ("Cannot update billing information.", "Medium"),
        ("Invoices are generating with incorrect amounts.", "Critical"),
        ("Stripe webhook is failing.", "High"),
        ("Refund button is not working.", "Medium"),
        ("Payment processor is completely down.", "Critical"),
        ("User wants a copy of their receipt.", "Low")
    ],
    "Network Issue": [
        ("VPN is extremely slow today.", "Low"),
        ("Cannot access internal tools from branch office.", "Medium"),
        ("Main office internet is completely down.", "Critical"),
        ("DNS resolution failing for our primary domain.", "Critical"),
        ("Firewall blocking legitimate traffic.", "High"),
        ("Intermittent ping drops to AWS.", "Medium"),
        ("Guest wifi is not connecting.", "Low"),
        ("BGP route leak affecting services.", "Critical")
    ],
    "UI Bug": [
        ("Button is misaligned on mobile view.", "Low"),
        ("Dark mode text is unreadable on the settings page.", "Low"),
        ("Dashboard chart is not rendering on Safari.", "Medium"),
        ("Entire site layout breaks on 4k monitors.", "Medium"),
        ("Typo on the landing page.", "Low"),
        ("Submit button remains disabled after form fill.", "High"),
        ("Modal doesn't close when clicking outside.", "Low"),
        ("CSS not loading at all, page is unstyled.", "High")
    ],
    "API Issue": [
        ("API returning 500 error on user creation.", "High"),
        ("Rate limit is too low for partner integration.", "Medium"),
        ("API documentation is outdated.", "Low"),
        ("Core API service is down and returning 502.", "Critical"),
        ("JSON response format changed unexpectedly.", "High"),
        ("Missing CORS headers on public API.", "Medium"),
        ("API key generation fails.", "High"),
        ("Webhooks are delayed by 5 minutes.", "Medium")
    ],
    "Security Issue": [
        ("Suspicious login attempts from multiple IPs.", "High"),
        ("Sensitive user data exposed in URL parameters.", "Critical"),
        ("Need to revoke access for terminated employee.", "High"),
        ("Malware detected on workstation.", "Critical"),
        ("Phishing email received by multiple staff.", "Medium"),
        ("Open port found on production server.", "High"),
        ("API endpoints missing authentication check.", "Critical"),
        ("Dependency has a known CVE vulnerability.", "Medium")
    ],
    "Deployment Issue": [
        ("CI/CD pipeline failed during build.", "Medium"),
        ("Deployment crashed and rolled back.", "High"),
        ("Cannot deploy to production, Jenkins is down.", "High"),
        ("Latest deployment introduced a critical bug.", "Critical"),
        ("Staging environment is out of sync.", "Low"),
        ("Docker image build taking 2 hours.", "Medium"),
        ("Missing environment variables in production.", "Critical"),
        ("Deployment locked by another user.", "Low")
    ],
    "Performance Issue": [
        ("Application takes 10 seconds to load.", "High"),
        ("Memory leak in background worker.", "High"),
        ("Images loading slowly on product page.", "Medium"),
        ("System grinds to a halt during peak hours.", "Critical"),
        ("Search function takes too long.", "Medium"),
        ("High latency when communicating with external API.", "Medium"),
        ("Frontend bundle size is too large.", "Low"),
        ("Database deadlocks happening frequently.", "Critical")
    ]
}

def generate_dataset():
    os.makedirs('app/ml/datasets', exist_ok=True)
    
    data = []
    
    # Generate around 150 rows by repeating and slightly modifying
    for _ in range(2):
        for category, issues in templates.items():
            for text, urgency in issues:
                data.append({
                    'ticket_text': text,
                    'category': category,
                    'urgency': urgency
                })
                
                # Add variations
                data.append({
                    'ticket_text': f"URGENT: {text}",
                    'category': category,
                    'urgency': urgency
                })
                
                data.append({
                    'ticket_text': f"Please help, {text.lower()}",
                    'category': category,
                    'urgency': urgency
                })
    
    # Write to CSV
    csv_file = 'app/ml/datasets/tickets_dataset.csv'
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['ticket_text', 'category', 'urgency'])
        writer.writeheader()
        writer.writerows(data)
        
    print(f"Generated {len(data)} rows in {csv_file}")

if __name__ == '__main__':
    generate_dataset()
