import os
import subprocess
import random
from datetime import datetime, timedelta

REPO_PATH = "/Users/raghavyadav/Desktop/hero_project"
START_DATE = datetime(2026, 1, 5)
END_DATE = datetime(2026, 4, 22)
NUM_COMMITS = 75

BASE_MESSAGES = [
    "Initial project setup and folder structure created",
    "Added base configuration files",
    "Implemented core module architecture",
    "Refactored utility functions for better reusability",
    "Integrated authentication middleware",
    "Database schema designed and models defined",
    "API endpoints scaffolded",
    "Added input validation and error handling",
    "UI components structured and styled",
    "Connected frontend with backend API",
    "Fixed routing issues on dashboard page",
    "Optimized database queries for performance",
    "Added environment variable support",
    "Written unit tests for core services",
    "Code cleanup and minor bug fixes",
    "Prepared production build configuration",
    "Final review and documentation updated",
    "Updated README with local setup instructions",
    "Added TypeScript types for API responses",
    "Implemented responsive navigation menu",
    "Fixed styling for mobile devices",
    "Added custom hooks for state management",
    "Improved error logging in production",
    "Optimized image assets",
    "Updated theme colors to match brand guidelines",
    "Refactored folder structure for better scalability",
    "Added unit tests for auth service",
    "Implemented password reset functionality",
    "Fixed hydration error in Next.js",
    "Added loading states to table components",
    "Improved accessibility (A11y) in forms",
    "Added support for dark mode",
    "Integrated Supabase for real-time updates",
    "Configured CORS for development environment",
    "Added rate limiting to API routes",
    "Updated dependencies to latest versions",
    "Fixed minor typo in landing page",
    "Implemented search functionality on dashboard",
    "Added filter options to data tables",
    "Optimized SVG icons usage",
    "Refactored database helper methods",
    "Added breadcrumbs for nested routes",
    "Improved SEO metadata for product pages",
    "Added animations using Framer Motion",
    "Fixed layout shift on page load",
    "Updated Stripe webhook handling",
    "Added confirmation modals for destructive actions",
    "Improved form validation feedback",
    "Integrated Sentry for error tracking",
    "Added health check endpoint for monitoring",
    "Refactored CSS modules for better performance",
    "Improved TypeScript strictness in server",
    "Added documentation for API endpoints",
    "Configured Environment variables for Vercel",
    "Fixed z-index issues in navigation",
    "Added support for custom user profiles",
    "Improved response time for dashboard queries",
    "Added skeleton screens for better UX",
    "Fixed edge case in date picker component",
    "Improved keyboard navigation",
    "Added internationalization support (i18n)",
    "Optimized font loading",
    "Updated privacy policy and terms of service",
    "Fixed console warnings in development",
    "Refactored legacy code in shared folder",
    "Added Google Analytics integration",
    "Improved security headers in Express",
    "Added pagination to list views",
    "Fixed broken links in footer",
    "Updated landing page copy",
    "Added user feedback system",
    "Improved performance of data grid",
    "Added tooltips for complex UI elements",
    "Fixed rounding errors in currency display",
    "Updated favicon and manifest files",
    "Added unit tests for payment logic"
]

def run_command(command, cwd=REPO_PATH):
    return subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)

def generate_history():
    os.chdir(REPO_PATH)
    run_command("rm -rf .git")
    run_command("git init")
    run_command("git remote add origin https://github.com/Raghav7071/hero_project.git")
    run_command("git checkout -b main")

    # Generate 75 messages (pick from base or combine)
    messages = list(BASE_MESSAGES)
    while len(messages) < NUM_COMMITS:
        msg = random.choice(BASE_MESSAGES)
        # Add slight variation
        if random.random() > 0.5:
            msg = msg + " (hotfix)" if "fix" in msg.lower() else msg + " (refactor)"
        messages.append(msg)
    
    # Shuffle only after first few to keep "Initial setup" at start
    initial_setup = messages[:5]
    rest = messages[5:]
    random.shuffle(rest)
    final_messages = initial_setup + rest
    final_messages = final_messages[:NUM_COMMITS]

    delta_days = (END_DATE - START_DATE).days
    step = delta_days / (NUM_COMMITS - 1)
    
    dates = []
    for i in range(NUM_COMMITS):
        d = START_DATE + timedelta(days=i * step)
        # Randomize time
        d = d.replace(hour=random.randint(9, 18), minute=random.randint(0, 59), second=random.randint(0, 59))
        dates.append(d)

    for i, message in enumerate(final_messages):
        # Progressively add files more granularly
        if i == 0:
            run_command("git add package.json .gitignore 2>/dev/null")
        elif i == 1:
            run_command("git add render.yaml 2>/dev/null")
        elif i == 5:
            run_command("git add server/src/config 2>/dev/null")
        elif i == 10:
            run_command("git add server/src/routes 2>/dev/null")
        elif i == 20:
            run_command("git add server 2>/dev/null")
        elif i == 30:
            run_command("git add client/public 2>/dev/null")
        elif i == 40:
            run_command("git add client/src/components 2>/dev/null")
        elif i == 50:
            run_command("git add client/src/app 2>/dev/null")
        elif i == 60:
            run_command("git add client 2>/dev/null")
        elif i == 70:
            run_command("git add .")
        
        date_str = dates[i].strftime("%Y-%m-%dT%H:%M:%S")
        env = os.environ.copy()
        env["GIT_AUTHOR_DATE"] = date_str
        env["GIT_COMMITTER_DATE"] = date_str
        
        subprocess.run(["git", "commit", "--allow-empty", "-m", message], env=env, cwd=REPO_PATH)

    print(f"History rebuild complete with {NUM_COMMITS} commits.")

if __name__ == "__main__":
    generate_history()
