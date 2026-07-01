# Professional Resume Builder

A production-quality resume builder application that helps users create professional, ATS-friendly resumes with live preview and PDF export.

Built with **FastAPI**, **Jinja2**, **Vanilla JavaScript**, and **Playwright** PDF generation.

---

## ✨ Features

- **Step-by-step wizard** — Guided resume creation with 14 organized steps
- **Live preview** — See your resume update in real-time as you type
- **Professional templates** — ATS-friendly templates designed for top tech companies
- **PDF export** — Pixel-perfect PDF generation via Playwright (Chromium)
- **Auto-save** — Never lose your work with automatic local + server storage
- **Drag & drop** — Reorder sections and entries effortlessly
- **Smart sections** — Empty sections are automatically hidden
- **Auto layout** — Content automatically flows to additional pages
- **Responsive** — Works beautifully on desktop, tablet, and mobile
- **Accessible** — Keyboard navigation, ARIA labels, screen reader support

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+ (for Playwright browser installation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Automated_CV_Generator

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright Chromium browser
python -m playwright install chromium

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

Visit **http://localhost:8000** in your browser.

### Docker

```bash
# Production
docker compose up -d

# Development (with hot-reload)
docker compose --profile dev up
```

---

## 📁 Project Structure

```
Automated_CV_Generator/
├── app/
│   ├── api/                    # API routes and dependencies
│   │   ├── deps.py             # Dependency injection
│   │   ├── pages.py            # HTML page routes
│   │   └── routes.py           # REST API endpoints
│   ├── core/                   # Core configuration
│   │   ├── config.py           # App settings (Pydantic)
│   │   ├── database.py         # SQLAlchemy engine & sessions
│   │   └── security.py         # Input sanitization, XSS prevention
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── base.py             # Base model with common fields
│   │   ├── resume.py           # Resume & related models
│   │   └── user.py             # User model (optional auth)
│   ├── schemas/                # Pydantic validation schemas
│   │   ├── resume.py           # Resume data schemas
│   │   └── user.py             # User schemas
│   ├── repositories/           # Data access layer
│   │   └── resume_repository.py
│   ├── services/               # Business logic layer
│   │   ├── pdf_service.py      # PDF generation engine
│   │   ├── resume_service.py   # Resume business logic
│   │   └── template_service.py # Template rendering
│   ├── templates/              # Jinja2 templates
│   │   └── resume_templates/   # Resume template system
│   │       ├── base.html       # Base template
│   │       └── modern/         # Modern ATS template
│   ├── frontend/               # Frontend application
│   │   ├── index.html          # Landing page
│   │   ├── builder.html        # Resume builder page
│   │   └── static/
│   │       ├── css/            # Stylesheets
│   │       ├── js/             # JavaScript modules
│   │       └── images/         # Static images
│   └── main.py                 # FastAPI application entry
├── alembic/                    # Database migrations
├── tests/                      # Test suite
├── data/                       # SQLite database (auto-created)
├── exports/                    # Generated PDFs
├── uploads/                    # User uploads
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🔧 Configuration

All settings are managed via environment variables. See `.env.example` for all options.

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `true` | Enable debug mode |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/resume_builder.db` | Database connection |
| `SECRET_KEY` | — | Secret key for security |
| `PDF_ENGINE` | `playwright` | PDF engine (`playwright` or `weasyprint`) |
| `MAX_UPLOAD_SIZE_MB` | `5` | Max photo upload size |

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=app --cov-report=html
```

---

## 📐 Architecture

The application follows a **clean layered architecture**:

```
API Routes → Services → Repositories → Database
                ↓
          Template Engine → PDF Engine
```

- **API Layer** — FastAPI routes handling HTTP requests
- **Service Layer** — Business logic, validation, orchestration
- **Repository Layer** — Database access (SQLAlchemy)
- **Template Engine** — Jinja2 resume rendering
- **PDF Engine** — Playwright/WeasyPrint PDF generation

---

## 🎨 Template System

Resume templates are self-contained directories:

```
resume_templates/
└── modern/
    ├── template.html    # Jinja2 template
    └── styles.css       # Template-specific styles
```

To add a new template, create a new directory with `template.html` and `styles.css`. The template will be automatically discovered and available for selection.

---

## 🛡️ Security

- All user input is sanitized via `bleach`
- HTML is escaped to prevent XSS
- File uploads are validated (type, size)
- PDF generation runs in sandboxed Chromium

---

## 📄 License

MIT License
