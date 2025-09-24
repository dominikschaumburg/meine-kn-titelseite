# Meine KN Titelseite

A professional web application for creating personalized cover pages with user selfies.

## Features

- 📱 Mobile-first responsive design
- 📸 Camera capture functionality (landscape orientation)
- 🎨 Random template selection with background/foreground layering
- 🛡️ OpenAI content moderation
- 🔒 Watermark protection with DOI verification
- ✅ Terms and privacy policy acceptance
- 🚀 Railway deployment ready

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom corporate design
- **Image Processing**: Canvas API, Sharp
- **Content Moderation**: OpenAI Omni Moderation
- **Deployment**: Railway Platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your OpenAI API key to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_APP_URL`: https://meine-kn-titelseite.de

3. Deploy automatically via Git pushes

### Domain Configuration

Configure your custom domain `meine-kn-titelseite.de` in Railway's dashboard.

## Template Structure

Templates are stored in the `templates/` directory:
```
templates/
├── 1/
│   ├── background.jpg
│   └── foreground.png
├── 2/
│   ├── background.jpg
│   └── foreground.png
```

Each template requires:
- `background.jpg`: Background image (1920x1920px)
- `foreground.png`: Overlay image with transparency (1920x1920px)

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for content moderation
- `NEXT_PUBLIC_APP_URL`: Public URL of the application

## Corporate Design

The app uses KN's corporate design with:
- **Colors**: Blue (#4F80FF), Green (#6bb024), Red (#e84f1c)
- **Font**: DIN Next
- **Logo**: KN branding elements

## License

Private corporate project.