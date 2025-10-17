# LuckLab AI - Sports Betting Prediction Platform

## 🚀 Backend Deployment

### Structure
```
/
├── chatgpt_predictor.py       # Main Flask API
├── requirements.txt            # Python dependencies
├── *.json                      # Data files
├── email_verification.py       # Email service
└── lucklab_control_center.py  # Admin GUI
```

### Deploy to Render.com

1. **Root Directory**: (leave blank)
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `python chatgpt_predictor.py`

### Environment Variables (Required)

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5002
FLASK_ENV=production
SECRET_KEY=your_secret_key_here
```

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables and run:
```bash
set OPENAI_API_KEY=your_key
python chatgpt_predictor.py
```

## 📝 Features

- User authentication with password hashing
- Pick request/fulfillment system
- AI-powered pick reasoning
- Daily limits management
- Admin control panel
- Email verification service

## 🔒 Security

- All API keys use environment variables
- Password hashing with SHA-256 + salt
- Session management with secure tokens
- CORS configured for GitHub Pages frontend

## 📖 Documentation

See deployment guides in the repository for detailed setup instructions.

