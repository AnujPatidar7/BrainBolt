#  BrainBolt — Adaptive Infinite Quiz Platform

BrainBolt is a full-stack adaptive quiz platform that dynamically adjusts question difficulty based on user performance. The system is built with a secure backend architecture to prevent cheating, ensure transactional consistency, and maintain reliable leaderboard updates.

---

#  System Architecture

BrainBolt follows a secure client–server architecture:

Frontend (React + Vite)  
→ Express Backend (API + Business Logic)  
→ Supabase (PostgreSQL + Auth)

## Why This Architecture?

Instead of allowing the frontend to communicate directly with the database, all critical operations are handled by the backend. This ensures:

-  Server-side answer validation  
-  Secure scoring logic  
-  Atomic database transactions  
-  Idempotent answer handling  
-  Leaderboard integrity  
-  Prevention of client-side tampering  

---

#  Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** Supabase (PostgreSQL)  
- **Authentication:** Supabase Auth (server-side managed)

---

#  Authentication

Supabase Auth is used for user management.

### Security Model

- Backend uses Supabase **service role key**
- JWT tokens verified server-side
- All protected routes require `Authorization: Bearer <token>`

### Authentication Flow

1. Frontend sends credentials to backend.
2. Backend calls Supabase Auth.
3. Backend returns session token.
4. Frontend stores token.
5. Token sent in Authorization header for protected routes.

---

#  Adaptive Difficulty Algorithm

BrainBolt uses a momentum-based adaptive system implemented on the backend.

### Momentum Formula

```js
newMomentum = momentum * 0.7 + signal * 0.3
```

Where:
- `signal = +1` for correct answer
- `signal = -1` for wrong answer

### Difficulty Adjustment Rule

Difficulty changes only when:

```
|momentum| > 0.6
```

This creates hysteresis and prevents rapid oscillation.

### Example

- Start: difficulty = 5, momentum = 0  
- Correct → momentum = 0.3  
- Correct → momentum = 0.51  
- Correct → momentum = 0.657 → difficulty increases  
- Wrong → momentum decreases but difficulty does not immediately drop  

This ensures stable progression.

---

#  Scoring System

Score is calculated server-side:

```js
base = difficulty * 10
multiplier = min(1 + streak * 0.15, 3.0)
scoreDelta = round(base * multiplier)
```

### Properties

- Higher difficulty → higher base score
- Streak increases multiplier
- Multiplier capped at 3.0
- Wrong answers yield 0 points
- All logic executed on backend

---

#  Idempotent Answer Submission

Each answer submission includes a unique idempotency key:

```
user_id + question_id + state_version
```

Database constraint:

```sql
UNIQUE(user_id, idempotency_key)
```

This prevents:

- Duplicate submissions  
- Double clicks  
- Network retries  
- Race condition side effects  

---

#  Atomic Transactions

Answer submission executes inside a single transaction:

1. Insert into `answer_log`
2. Update `user_state`
3. Update `leaderboard_score`
4. Update `leaderboard_streak`

If any step fails → full rollback.

This guarantees data consistency.

---

#  Optimistic Concurrency Control

The `user_state` table contains a `state_version` column.

Update query:

```sql
UPDATE user_state
SET ...
WHERE user_id = ? AND state_version = ?
```

If no rows are affected → concurrent modification detected → request rejected.

---

#  Leaderboards

Two leaderboard tables:

- `leaderboard_score`
- `leaderboard_streak`

### Queries

```sql
SELECT * FROM leaderboard_score
ORDER BY total_score DESC
LIMIT 50;

SELECT * FROM leaderboard_streak
ORDER BY max_streak DESC
LIMIT 50;
```

Indexes are added on sorting columns for performance.

---

#  Backend Setup

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment

Create `.env` inside `backend/`:

```
PORT=5000
DATABASE_URL=your_supabase_pooler_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Run Backend

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

#  Frontend Setup

## 1. Install Dependencies

```bash
cd frontend
npm install
```

## 2. Configure Environment

Create `.env` inside `frontend/`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 3. Run Frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

#  API Endpoints

## Authentication

```
POST /api/auth/signup
POST /api/auth/login
```

## Quiz

```
GET  /api/quiz/next
POST /api/quiz/answer
GET  /api/quiz/state
```

## Leaderboards

```
GET /api/leaderboard/score
GET /api/leaderboard/streak
```

---

#  Testing Flow

1. Sign up  
2. Log in  
3. Fetch next question  
4. Submit answer  
5. Observe:
   - Streak changes  
   - Score updates  
   - Difficulty adjusts  
   - Leaderboards update  

---

#  Project Structure

## Backend

```
backend/
 ├── src/
 │   ├── application/
 │   ├── domain/
 │   ├── infrastructure/
 │   ├── presentation/
 │   ├── app.js
 │   └── server.js
```

## Frontend

```
frontend/
 ├── src/
 │   ├── hooks/
 │   ├── contexts/
 │   ├── pages/
 │   ├── components/
 │   └── lib/
```


---

#  Conclusion

BrainBolt is a production-ready adaptive quiz platform designed with:

- Clean architecture separation  
- Secure server-side validation  
- Transactional database consistency  
- Idempotent answer handling  
- Optimistic concurrency control  
- Momentum-based adaptive intelligence  
- Scalable leaderboard system  

The system is structured for extensibility, security, and scalability while maintaining strict separation between frontend presentation and backend business logic.
