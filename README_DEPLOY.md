# Quick Deploy Options

## Option 1: Render (Khuyến nghị)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Settings:**
- Repository: `trieudz61/ngoc-huong-farm`
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

## Option 2: Railway
- Repository: `trieudz61/ngoc-huong-farm`
- Start Command: `node server/server.js`

## Option 3: Heroku
```bash
heroku create ngoc-huong-farm-backend
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your_api_key
git push heroku master
```

## Environment Variables cần thiết:
- `NODE_ENV=production`
- `GEMINI_API_KEY=your_gemini_api_key`