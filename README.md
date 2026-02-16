# 🎓 LESSON.LAB v1.0.5

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
* **History**: History of generetions is stored in Database.
* **Cache**: All Api requests now cached.

## Tech Stack
- Framework: React 18
- Bundler: Rolldown/Vite (Experimental high-speed build)
- Styling: Tailwind CSS v4.0
- Icons: Lucide React
- Markdown: ReactMarkdown
- postreSQL via supabase
- PHP 8.5 version
- Composer
  

## Getting Started

1. Clone and Install (..\lesson-planner-main):
Bash

   ```bash
   git clone https://github.com/hilexa-hlxa/lesson-planner.git
   cd lesson-planner
   npm install

2. Composer install (..\lesson-planner-main\backend):
   ```bash
   composer install

   composer require phpoffice/phpword

3. Launch Development Servers
Run Frontend (..\lesson-planner-main):

    ```bash

    npm run dev

4. Run backend (..\lesson-planner-main):
    ```bash
    
    php -S 127.0.0.1:8000 -t backend/public
    
5. Docker Deployment (Alternative)
Bash
    ```bash
    
    docker-compose up -d --build

    
🏗 Project Structure
/src — React components (Landing, Hub, Dashboard, Profile).

/backend — PHP API and Supabase logic.

api.js — Axios-like fetch wrapper for backend communication.

📄 License
© 2026 LESSON.LAB / CORE_SYSTEM. Created for professional educators.

















