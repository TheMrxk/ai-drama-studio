# AI Drama Studio - Backend

## Quick Start

### 1. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and set your API keys
```

### 4. Run server
```bash
python -m app.main
```

Server will start at http://localhost:5000

## API Endpoints

- `GET /health` - Health check
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Current user info
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/generate` - Generate script
- `GET /api/projects/:id/versions` - List versions
- `POST /api/export` - Export script
