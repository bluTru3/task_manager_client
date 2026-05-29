# Task Manager Frontend - ESE Assignment Submission

## Assignment Information

- **Module:** ESE1 - Enterprise Software Engineering
- **Student:** Brittney Lightfoot
- **Submission Date:** May 2026

---

## Project Overview

A React-based frontend for the Task Manager API. Provides user authentication (register/login) and task management interface.

### Live Application

**Frontend URL:** (https://fuzzy-giggle-6jg7xpr4w99frgv5-5174.app.github.dev/)

**Backend API:** (https://humble-broccoli-7g94jxrpxvv2x7pv-8000.app.github.dev/)

### Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Styling | CSS Modules |
| Authentication | JWT (stored in localStorage) |

---

## Features Implemented

| Feature | Status |
|---------|--------|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Token Storage | ✅ |
| Protected Routes | ✅ |
| Task List View | ✅ |
| Create Task | ✅ |
| Edit Task | ✅ |
| Delete Task | ✅ |
| User Profile | ✅ |
| Logout | ✅ |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/bluTru3/task_manager_client
cd taskmanager-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Update the API URL in .env.local
# VITE_API_URL=http://localhost:8000/api

# 5. Start development server
npm run dev