import csv
import os

intents = {
    "greeting": [
        "hello", "hi", "hey", "good morning", "good afternoon", "is anyone there?",
        "hi there", "hello assistant", "yo", "greetings"
    ],
    "password_reset": [
        "i forgot my password", "reset my password", "can't log in", "account locked",
        "password change", "need new password", "login failure", "forgot credentials",
        "how to change password", "locked out of my account"
    ],
    "network_issue": [
        "internet is slow", "wifi not working", "cannot connect to vpn", "no internet access",
        "network down", "vpn failing", "slow connection", "dropped calls", "cannot browse",
        "router issue", "ethernet problem"
    ],
    "database_issue": [
        "database connection error", "sql error", "query taking too long", "db timeout",
        "cannot reach database", "production database down", "slow reads", "data corruption",
        "database migration failed", "sql injection warning"
    ],
    "ticket_status": [
        "what is my ticket status?", "check my ticket", "ticket update", "is my issue resolved?",
        "when will my ticket be fixed?", "any update on my request?", "track my ticket",
        "status of ticket #123", "why is my ticket still open?"
    ],
    "hardware_help": [
        "my monitor is black", "keyboard not working", "mouse broken", "printer jammed",
        "laptop wont turn on", "need a new headset", "broken screen", "usb port failure",
        "webcam not working", "battery issue"
    ],
    "goodbye": [
        "bye", "goodbye", "see you later", "thanks for help", "that's all", "quit", "exit"
    ]
}

def generate_chatbot_dataset():
    os.makedirs('app/ml/datasets', exist_ok=True)
    
    data = []
    for intent, examples in intents.items():
        for example in examples:
            data.append({'text': example, 'intent': intent})
            
    csv_file = 'app/ml/datasets/chatbot_dataset.csv'
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['text', 'intent'])
        writer.writeheader()
        writer.writerows(data)
        
    print(f"Generated {len(data)} rows in {csv_file}")

if __name__ == '__main__':
    generate_chatbot_dataset()
