import re
from datetime import datetime
from app.models.knowledge_base import KnowledgeBase
from app.extensions import db
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def extract_symptoms(description):
    """
    Extracts the key symptoms or first 2-3 sentences from the ticket description.
    """
    if not description:
        return "No symptoms recorded."
    sentences = re.split(r'[.!?\n]', description)
    symptoms = [s.strip() for s in sentences if len(s.strip()) > 8]
    if symptoms:
        return ". ".join(symptoms[:3]) + "."
    return description[:250] + "..." if len(description) > 250 else description

def infer_root_cause(category, title, description, resolution_notes):
    """
    Generates a realistic and intelligent root cause description based on the category and notes.
    """
    category_defaults = {
        "Database Issue": "Database connectivity loss, query timeouts, incorrect login credentials, or schema mismatch.",
        "Server Issue": "Server hardware resources exhausted, memory leak, network drop, or server process crash.",
        "Authentication Issue": "MFA gateway timeout, Single Sign-On mismatch, or expired authorization credentials.",
        "Payment Issue": "Payment gateway processing failure, Stripe webhook timeout, or currency calculation bug.",
        "Network Issue": "DNS resolution failure, VPN server latency, router configuration, or ISP routing failure.",
        "UI Bug": "Frontend browser rendering discrepancies, stylesheet layout mismatch, or script runtime errors.",
        "API Issue": "REST endpoint 500 error, lack of validation checks, or missing CORS headers.",
        "Security Issue": "Unprivileged access attempt, exposed secure parameters, or anomalous authentication requests.",
        "Deployment Issue": "Build failure in CI/CD pipeline, missing server-side variables, or Docker build timeout.",
        "Performance Issue": "Slow file retrieval, excessive database locking, or suboptimal query caching."
    }
    
    # Check if notes or description mentions "due to", "caused by", "because"
    for phrase in [r"caused by (.*)", r"due to (.*)", r"because (.*)"]:
        match = re.search(phrase, resolution_notes, re.IGNORECASE)
        if match:
            return match.group(0).strip().capitalize()
        match = re.search(phrase, description, re.IGNORECASE)
        if match:
            return match.group(0).strip().capitalize()
            
    return category_defaults.get(category, "Software configuration mismatch or environment dependency error.")

def create_knowledge_article(ticket, resolution_notes):
    """
    Auto-generates a structured knowledge article from a resolved ticket.
    """
    title = ticket.title
    category = ticket.category or "General"
    
    # 1. Structure symptoms
    symptoms = extract_symptoms(ticket.description)
    
    # 2. Extract / infer root cause
    root_cause = infer_root_cause(category, title, ticket.description, resolution_notes)
    
    # 3. Create issue summary
    issue_summary = f"User reported an issue: '{title}'. Ticket categorized under '{category}'."
    
    # 4. Generate tags
    base_tags = [category, "SaaS", "Resolved"]
    # Add other matching keywords
    words = set(re.findall(r'\b\w{4,}\b', f"{title} {category}"))
    extra_tags = [w.capitalize() for w in words if w.lower() not in ['issue', 'ticket', 'problem', 'failure', 'error', 'fails']]
    tags_list = list(set(base_tags + extra_tags[:3]))
    tags_str = ", ".join(tags_list)

    # 5. Save to database
    article = KnowledgeBase(
        title=title,
        issue_summary=issue_summary,
        symptoms=symptoms,
        root_cause=root_cause,
        resolution_steps=resolution_notes,
        category=category,
        tags=tags_str,
        is_approved=False, # Must be approved by Admin as required
        views=0
    )
    
    db.session.add(article)
    db.session.commit()
    return article

def search_articles(query_text, filter_approved=True, limit=5):
    """
    Searches the knowledge base using TF-IDF + Cosine Similarity.
    """
    # Fetch articles
    query = KnowledgeBase.query
    if filter_approved:
        query = query.filter_by(is_approved=True)
    articles = query.all()
    
    if not articles:
        return []

    # Prepare document list for vectorization
    docs = []
    for art in articles:
        # Combine title, symptoms, root cause, and resolution to build feature set
        text = f"{art.title} {art.category} {art.symptoms} {art.root_cause} {art.resolution_steps} {art.tags or ''}"
        docs.append(text)

    # Vectorize
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform([query_text] + docs)
    except Exception as e:
        # TF-IDF can fail if there are no meaningful words in search query
        return []

    # Compute similarity between the query (index 0) and all documents (index 1 onwards)
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    results = []
    for i, score in enumerate(cosine_sim):
        art = articles[i]
        results.append({
            "article": art.to_dict(),
            "score": float(score)
        })
        
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:limit]

def suggest_related_articles(ticket, limit=3):
    """
    Given an active ticket, finds similar approved knowledge base articles.
    """
    search_text = f"{ticket.title} {ticket.description} {ticket.category or ''}"
    matches = search_articles(search_text, filter_approved=True, limit=limit)
    # Reformat matches as flat list of articles with match score added
    related = []
    for m in matches:
        art_dict = m['article']
        art_dict['match_score'] = round(m['score'] * 100) # Percentage score
        related.append(art_dict)
    return related
