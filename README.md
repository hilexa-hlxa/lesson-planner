# LESSON.LAB v1.0.1

Professional next-generation automated lesson planning system built with React, Vite (Rolldown), and Tailwind CSS 4.

## Key Features
- Trilingual Support: Full localization for Kazakh, Russian, and English.
- Dynamic Auth: Seamless login/registration with real-time email validation.
- Smart History: Save, edit, and manage your generated plans with an intuitive UI.
- Dark/Light Mode: High-contrast brutalist design that respects your eyes.
- AI-Powered: Ready to integrate with Google Gemini for instant plan generation.
- Authentification + password hash
- API's for login logout
- Database migration to supabase

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

    npm run dev

5. Launch Development Server back-end:
Bash


    ```bash

    php -S 127.0.0.1:8000 -t backend/public

📄 License
© 2026 LESSON.LAB / CORE_SYSTEM. Created for professional educators.








