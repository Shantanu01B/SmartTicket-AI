import joblib
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'ml', 'models')

# Load models globally so they stay in memory
try:
    category_model = joblib.load(os.path.join(MODELS_DIR, 'category_model.joblib'))
    urgency_model = joblib.load(os.path.join(MODELS_DIR, 'urgency_model.joblib'))
    chatbot_model = joblib.load(os.path.join(MODELS_DIR, 'chatbot_model.joblib'))
except Exception as e:
    print(f"Warning: ML models not found. Please run train_models.py. Error: {e}")
    category_model = None
    urgency_model = None
    chatbot_model = None

def predict_chatbot_intent(text):
    if not chatbot_model:
        return "unknown"
    prediction = chatbot_model.predict([text])
    return prediction[0]

def get_chatbot_response(intent):
    responses = {
        "greeting": "Hello! I am your Local IT Support Assistant. How can I help you today?",
        "password_reset": "To reset your password, please submit an 'Authentication Issue' ticket. Our team will send you a secure reset link.",
        "network_issue": "It sounds like a network problem. Please create a 'Network Issue' ticket so our DevOps team can check the routers and VPN.",
        "database_issue": "Database issues are handled by the Backend Team. Please file a 'Database Issue' ticket with the error details.",
        "ticket_status": "You can track your ticket status in the 'Tickets' tab. If you need a specific update, let me know the ticket ID!",
        "hardware_help": "Hardware problems (like broken monitors or printers) require an IT Support ticket. Please describe the device in your request.",
        "goodbye": "Goodbye! Feel free to reach out if you have more questions. Have a great day!",
        "unknown": "I'm not quite sure I understand. Could you rephrase that? I can help with passwords, network, database, or hardware issues."
    }
    return responses.get(intent, responses["unknown"])

def predict_category(text):
    if not category_model:
        return "Unknown"
    prediction = category_model.predict([text])
    return prediction[0]

def predict_urgency(text):
    if not urgency_model:
        return "Medium"
    prediction = urgency_model.predict([text])
    return prediction[0]

def assign_department(category):
    mapping = {
        "Authentication Issue": "IT Support",
        "Database Issue": "Backend Team",
        "Server Issue": "DevOps",
        "Payment Issue": "Finance Team",
        "Network Issue": "DevOps",
        "UI Bug": "Frontend Team",
        "API Issue": "Backend Team",
        "Security Issue": "Security Team",
        "Deployment Issue": "DevOps",
        "Performance Issue": "Backend Team"
    }
    return mapping.get(category, "IT Support")

def generate_summary(text):
    # Basic Extractive Summarization
    if not text:
        return "No description provided."
    
    # Simple split by punctuation
    sentences = [s.strip() for s in re.split(r'[.!?\n]', text) if len(s.strip()) > 10]
    
    if not sentences:
        return text[:100] + "..." if len(text) > 100 else text
        
    # Return the first substantial sentence
    return sentences[0][:150] + "..." if len(sentences[0]) > 150 else sentences[0]

def process_ticket(title, description):
    """
    Combined processing replacing the Gemini call.
    """
    combined_text = f"{title}. {description}"
    
    category = predict_category(combined_text)
    urgency = predict_urgency(combined_text)
    department = assign_department(category)
    summary = generate_summary(description)
    
    return {
        "category": category,
        "urgency": urgency,
        "department_name": department,
        "summary": summary,
        "suggested_solution": "A local ML model analyzed your ticket. A specialist from the assigned department will review it shortly."
    }

def find_similar_tickets(new_title, new_description, existing_tickets, threshold=0.3):
    """
    Finds existing tickets that are similar to the proposed new ticket.
    Uses TF-IDF and Cosine Similarity.
    """
    print(f"DEBUG: Checking duplicates for: '{new_title}'. Comparing against {len(existing_tickets)} tickets.")
    if not existing_tickets:
        return []

    # Combine new ticket text
    new_text = f"{new_title} {new_description}"
    
    # Prepare existing tickets text
    texts = [new_text]
    for t in existing_tickets:
        texts.append(f"{t.title} {t.description}")
        
    # Vectorize
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
    except:
        return [] # Case where no meaningful words are found
        
    # Calculate cosine similarity of the first item (new ticket) with all others
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # Filter and format results
    similar = []
    for i, score in enumerate(cosine_sim):
        if score >= threshold:
            ticket = existing_tickets[i]
            similar.append({
                "id": ticket.id,
                "title": ticket.title,
                "status": ticket.status,
                "score": float(score)
            })
            
    # Sort by similarity score descending
    similar.sort(key=lambda x: x['score'], reverse=True)
    return similar[:3] # Return top 3 matches
