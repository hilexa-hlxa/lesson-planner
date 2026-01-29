# 🎓 LESSON.LAB v1.0.4

Professional next-generation automated lesson planning system built with **React 18**, **Vite (Rolldown)**, and **Tailwind CSS 4**. Designed for educators who value speed, efficiency, and bold design.

## 🚀 Key Features
* **Trilingual Support**: Full localization for Kazakh, Russian, and English.
* **Smart Navigation (Hub)**: Dedicated zones for Teachers (Tools) and Students (Games).
* **GitHub-Style Profile**: Personalized user dashboard with editable profile data (John Doe @Guest).
* **Dynamic Auth**: Secure login/registration system with real-time validation and password hashing.
* **Smart History**: Manage, edit, and store your generated plans with an intuitive UI.
* **Dark/Light Mode**: High-contrast brutalist design that respects your eyes.
* **AI-Powered**: Ready to integrate with Google Gemini for instant plan generation.
* **Fullstack Ready**: Backend API integration with PHP 8.1 and Supabase (PostgreSQL).

## Tech Stack
- Framework: React 18
- Bundler: Rolldown/Vite (Experimental high-speed build)
- Styling: Tailwind CSS v4.0
- Icons: Lucide React
- Markdown: ReactMarkdown
- postreSQL via supabase
- PHP 8.1+ version
  

## Getting Started

1. Clone and Install:
Bash

   ```bash
   git clone https://github.com/hilexa-hlxa/lesson-planner.git
   cd lesson-planner
   npm install
   
3. Database connection:
Powershell

    ```powershell


    setx DB_DSN  "pgsql:host=aws-1-ap-south-1.pooler.supabase.com;port=6543;dbname=postgres;sslmode=require"

    setx DB_USER "postgres.ywoxdnpfbdgessvhyabz"

    setx DB_PASS "!@Asdzxc4017"

!!! close all trerminals then continue !!!
   
3. Launch Development Server front-end:
Bash
    ```bash
    export DB_DSN="pgsql:host=aws-1-ap-south-1.pooler.supabase.com;port=6543;dbname=postgres;sslmode=require"
    
    export DB_USER="postgres.ywoxdnpfbdgessvhyabz"
    
    export DB_PASS="!@Asdzxc4017"
    
!!! Restart all terminals after setting environment variables !!!

3. Launch Development Servers
Run Frontend:

    ```bash

    npm run dev

Run backend:
    ```bash
    
    php -S 127.0.0.1:8000 -t backend/public
    
4. Docker Deployment (Alternative)
Bash
    ```bash
    
    docker-compose up -d --build

    
🏗 Project Structure
/src — React components (Landing, Hub, Dashboard, Profile).

/backend — PHP API and Supabase logic.

api.js — Axios-like fetch wrapper for backend communication.

📄 License
© 2026 LESSON.LAB / CORE_SYSTEM. Created for professional educators.









