# Report Management System - Technical Documentation

## Project Overview

A comprehensive report management system that allows users to create, customize, and distribute professional reports with various themes, AI assistance, and email capabilities.

## Features Implemented

### 1. Login Page (`/components/LoginPage.tsx`)
- **Organization Logo Display**: Shows a professional logo at the top
- **Input Fields**:
  - Region input
  - Organization name input
  - Report type dropdown (Achievement, Financial, Maintenance, Other)
  - Custom report type field (appears when "Other" is selected)
- **Usage Counter**: Displays the number of times the app has been used (persisted in backend)

### 2. Report Form Page (`/components/ReportForm.tsx`)
- **Core Fields**:
  - Report title
  - Report date
  - Reporting period
  - Executive summary
  - Detailed report content
- **Theme Selection**: 5 different themes available
  - Professional (Blue)
  - Corporate (Gray)
  - Creative (Purple)
  - Modern (Teal)
  - Elegant (Black & Gold)
- **AI Assistance**: Button to generate AI-assisted content for summary and details
- **Documentation Section** (Achievement & Maintenance reports only):
  - Image upload (multiple files)
  - Video upload (multiple files)
  - Reference links
  - Section automatically hidden in final report if not used
- **Action Buttons**:
  - Preview Report
  - Generate PDF
  - Send via Email

### 3. Report Preview Page (`/components/ReportPreview.tsx`)
- **Live Preview**: Shows exactly how the report will look
- **Theme-based Styling**: Applies selected theme colors
- **PDF Generation**: Downloads report as HTML (can be printed to PDF)
- **Email Functionality**: 
  - Send report via email with custom message
  - After sending, prompts user to rate the app
- **Rating System**:
  - 5-star rating
  - Optional feedback text
  - Stored in backend for analytics

### 4. Backend Server (`/supabase/functions/server/index.tsx`)
All endpoints are prefixed with `/make-server-207bf4c4/`

**Endpoints:**
- `GET /usage-count` - Retrieve current usage count
- `POST /increment-usage` - Increment usage counter
- `POST /ai-assist` - Generate AI-assisted report content
- `POST /generate-pdf` - Generate HTML report (convertible to PDF)
- `POST /send-email` - Send report via email (logs to backend)
- `POST /submit-rating` - Submit user rating and feedback

**Data Storage:**
- Usage count
- Email logs (timestamp, recipient, report details)
- Ratings (timestamp, rating, feedback, report type)
- Average rating calculation

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: Supabase KV Store
- **Icons**: lucide-react
- **Notifications**: Sonner

## Data Flow

1. **Login Flow**:
   - User enters region, organization, and selects report type
   - Usage counter is fetched from backend
   - On submit, usage counter is incremented
   - User proceeds to report form

2. **Report Creation Flow**:
   - User fills in report details
   - Can optionally use AI assistance for content generation
   - Can add documentation (images, videos, links) for Achievement/Maintenance reports
   - Selects theme for report styling
   - Can preview, generate PDF, or send via email

3. **Report Generation Flow**:
   - Preview shows styled report with selected theme
   - Generate PDF sends data to backend, returns HTML
   - Send Email stores email log and shows rating dialog
   - Rating submission stores data in backend

## Backend Integration Notes

### Current Implementation
- **AI Assistance**: Currently returns mock suggestions. To enable real AI:
  - Integrate with OpenAI, Anthropic Claude, or similar API
  - Add API key using environment variables
  - Update the `/ai-assist` endpoint

- **Email Sending**: Currently logs attempts. To enable real emails:
  - Integrate with SendGrid, Mailgun, Resend, or similar
  - Add API key using environment variables
  - Update the `/send-email` endpoint

- **PDF Generation**: Currently returns HTML. For production PDFs:
  - Use libraries like puppeteer, pdfmake, or jsPDF
  - Generate actual PDF bytes
  - Return as binary response

### Data Persistence
All data is stored in Supabase KV store:
- `app_usage_count`: Total number of app uses
- `email_logs`: Array of email sending attempts
- `app_ratings`: Array of user ratings
- `average_rating`: Calculated average rating

## Theme System

Each theme includes:
- Primary color (headers, accents)
- Secondary color (info boxes, footer)
- Text color (headings)
- Accent/border color

Themes are applied consistently across:
- Report preview
- PDF generation
- Final report output

## Security Considerations

**Important Notes:**
1. This is a prototype/demonstration system
2. For production use with real organizational data:
   - Add user authentication
   - Implement proper authorization
   - Encrypt sensitive data
   - Add rate limiting
   - Validate all inputs
   - Sanitize content before PDF generation
   - Use secure email service with proper authentication
   - Add GDPR/privacy compliance features

## Future Enhancements (Discussed but not yet implemented)

1. **Internal Report Details**: To be discussed and implemented based on requirements
2. **Advanced Templates**: More template options per report type
3. **Report History**: Store and retrieve past reports
4. **User Accounts**: Multi-user support with authentication
5. **Analytics Dashboard**: View usage statistics and ratings
6. **Batch Operations**: Generate multiple reports at once
7. **Custom Branding**: Upload custom logos and color schemes
8. **Collaboration**: Share reports with team members
9. **Version Control**: Track report versions and changes
10. **Export Options**: Additional formats (Excel, Word, etc.)

## Usage Instructions

1. **Start the Application**: Open the app in your browser
2. **Login**: Enter region, organization, and select report type
3. **Create Report**: Fill in all required fields
4. **Optional - Use AI**: Click "AI Assist" for content suggestions
5. **Optional - Add Documentation**: Upload files or add links (Achievement/Maintenance only)
6. **Select Theme**: Choose your preferred report style
7. **Preview**: Review the report before finalizing
8. **Generate**: Download as PDF or send via email
9. **Rate**: Provide feedback after sending (optional)

## Known Limitations

1. PDF generation returns HTML format (use browser's "Print to PDF" for now)
2. Email sending is simulated (logs only, no actual emails sent)
3. AI assistance returns template suggestions (no real AI integration)
4. File uploads are handled but not persisted or included in PDF
5. No user authentication system
6. No report history or storage
7. Limited validation on file uploads
8. No virus scanning on uploaded files

## Development Notes

- All components are responsive and work on mobile/tablet/desktop
- Error handling is implemented with user-friendly messages
- Loading states are shown during async operations
- Toast notifications provide feedback for all actions
- Backend logging helps with debugging
- KV store is used for simplicity (consider Postgres for complex queries)
