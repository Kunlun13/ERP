# Step-by-Step Setup Guide

## Backend Setup

### Step 1: Install dependencies
```bash
cd backend
npm install
```

### Step 2: Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB URI and JWT secret.

### Step 3: Start MongoDB
Ensure MongoDB is running on `mongodb://127.0.0.1:27017` or update `MONGODB_URI`.

### Step 4: Seed database
```bash
npm run seed
```
Creates:
- Admin user: admin@school.com / admin123
- Session: 2025-2026
- Default school settings

### Step 5: Start server
```bash
npm run dev
```
API available at http://localhost:5000/api/health

---

## Frontend Setup

### Step 1: Install dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure environment
```bash
cp .env.example .env
```
Default uses Vite proxy to backend (no change needed for local dev).

### Step 3: Start dev server
```bash
npm run dev
```
App available at http://localhost:5173

---

## Module Walkthrough

### 1. Student Draft Builder
- Navigate to Student Draft Builder
- Add/reorder fields with drag-and-drop
- Set field types and required flags
- Save template (used for student forms)

### 2. Student Management
- Select class filter
- Add students with photo upload
- View profile with performance charts
- Search and paginate

### 3. Test Creation
- Create test with dynamic subjects
- Choose marks (numeric) or grade per subject
- Tests are session and class scoped

### 4. Marks Entry
- Class-wise: Select class → test → enter all students
- Mark absent with checkbox
- Bulk save

### 5. Analysis
- Class-wise: Rankings, bar chart, pass/fail pie
- Student-wise: Performance across tests
- Export PDF / Print

### 6. Report Generation
- Select student and tests
- Customize school header, remarks, footer
- Generate → Preview → Download PDF
- Save as reusable template

### 7. Settings
- School name, logo, pass percentage
- Activity audit log
- Enable future modules (attendance, fees)
