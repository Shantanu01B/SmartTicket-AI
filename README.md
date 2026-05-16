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
*(You can attach your screenshots here)*

---

## 🛡️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ by [Your Name]**
