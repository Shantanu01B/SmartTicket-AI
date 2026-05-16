import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import nltk

def train():
    print("Loading ticket dataset...")
    df = pd.read_csv('app/ml/datasets/tickets_dataset.csv')
    
    X = df['ticket_text']
    y_category = df['category']
    y_urgency = df['urgency']
    
    # Create models pipeline
    print("Training Category Model...")
    cat_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=1000)),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    cat_pipeline.fit(X, y_category)
    
    print("Training Urgency Model...")
    urg_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=1000)),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    urg_pipeline.fit(X, y_urgency)
    
    # Chatbot Training
    print("Loading chatbot dataset...")
    df_chat = pd.read_csv('app/ml/datasets/chatbot_dataset.csv')
    X_chat = df_chat['text']
    y_intent = df_chat['intent']
    
    print("Training Chatbot Intent Model...")
    chat_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=500)),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    chat_pipeline.fit(X_chat, y_intent)
    
    # Ensure directory exists
    os.makedirs('app/ml/models', exist_ok=True)
    
    # Save models
    print("Saving models...")
    joblib.dump(cat_pipeline, 'app/ml/models/category_model.joblib')
    joblib.dump(urg_pipeline, 'app/ml/models/urgency_model.joblib')
    joblib.dump(chat_pipeline, 'app/ml/models/chatbot_model.joblib')
    print("Training complete! Models saved in app/ml/models/")

if __name__ == "__main__":
    train()
