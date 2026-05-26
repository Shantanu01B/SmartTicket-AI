# SmartTicket AI – Intelligent IT Support Management 🛡️🤖

**SmartTicket AI** is an enterprise-grade IT Support Ticket Management System that leverages **Local Machine Learning (NLP)** to automate ticket classification, urgency prediction, and duplicate detection. Unlike traditional systems, it runs its AI models fully offline, ensuring data privacy and high-speed performance without external API dependencies.

---

## 🌟 Key Features

### 1. **Intelligent Ticket Processing**
- **Auto-Classification**: Automatically detects if a ticket is a *Database Issue*, *Server Issue*, *Authentication Error*, etc., using a trained Scikit-learn model.
- **Urgency Prediction**: Analyzes the sentiment and keywords to flag tickets as *Low*, *Medium*, *High*, or *Critical*.
- **AI Summary Generator**: Uses extractive NLP to pull the most relevant "core insight" from long ticket descriptions.
- **Smart Routing**: Automatically assigns tickets to the correct department (e.g., *DevOps*, *Backend Team*, *IT Support*) based on content.

### 2. **Duplicate Ticket Detection (Unique! ⭐)**
- Uses **TF-IDF Vectorization** and **Cosine Similarity** to scan for similar active tickets in real-time.
- Prevents "Ticket Spam" by warning users before they submit a redundant issue.

### 3. **Trained AI Chat Assistant**
- A local Support Assistant powered by an **Intent Classification Model**.
- Can understand varied phrasing for common requests like password resets, network help, and ticket status updates.

### 4. **Role-Based Access Control (RBAC)**
- **Admin**: Full control over users, roles, departments, and global ticket management.
- **Support Agent**: Focused on resolving tickets, adding activity logs, and managing assignments.
- **Employee**: Can submit tickets, track status, and use the AI assistant.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios.
- **Backend**: Flask (Python), SQLAlchemy ORM, Flask-JWT-Extended (Auth), Flask-CORS.
- **Database**: MySQL.
- **Machine Learning**: Scikit-Learn, Pandas, NLTK, Joblib.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file with your MySQL credentials:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/smartticket_ai
   JWT_SECRET_KEY=your_secret_key
   ```
5. **Train the AI Models**:
   ```bash
   python train_models.py
   ```
6. Run the server:
   ```bash
   python run.py
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots
<img width="1874" height="834" alt="Screenshot 2026-05-16 192519" src="https://github.com/user-attachments/assets/48970b0c-fd9a-4d03-8fd5-e9b7af57673b" />
<img width="1746" height="868" alt="Screenshot 2026-05-16 201846" src="https://github.com/user-attachments/assets/e4122246-1877-45b6-beeb-48c20bb50282" />
<img width="1897" height="860" alt="Screenshot 2026-05-16 201932" src="https://github.com/user-attachments/assets/70ad5275-7110-4639-b894-14311030fa3e" />
<img width="1906" height="861" alt="Screenshot 2026-05-16 201942" src="https://github.com/user-attachments/assets/6fcc47fd-5174-4f05-bd65-bad6857ba07c" />
<img width="1907" height="857" alt="Screenshot 2026-05-16 201952" src="https://github.com/user-attachments/assets/6c1e5f58-7597-44bd-883e-09c2e39fa0cb" />
<img width="1889" height="857" alt="Screenshot 2026-05-16 202001" src="https://github.com/user-attachments/assets/d7fdcadc-5d90-469a-ad47-53bef926fd30" />
<img width="1909" height="850" alt="Screenshot 2026-05-16 202203" src="https://github.com/user-attachments/assets/480816a2-d569-49f2-84ce-d77f3500e5c1" />


---

