# Leave & Productivity Analyzer

A full-stack web application that analyzes employee attendance, leave usage, and productivity based on uploaded Excel attendance sheets.

## Link
- **https://leave-and-productivity-analyzer-es7.vercel.app 

## Features

- 📊 **Excel File Upload** - Upload .xlsx attendance files
- 📈 **Productivity Analysis** - Calculate productivity scores based on worked hours
- 📅 **Leave Tracking** - Track leaves used against monthly limit (2 leaves/month)
- 📉 **Interactive Dashboards** - Beautiful charts and visualizations
- 💾 **Data Persistence** - Store attendance data in MongoDB
- 🔄 **Monthly Analysis** - View historical attendance data

## Business Rules

- **Monday to Friday**: 8.5 hours per day (10:00 AM to 6:30 PM)
- **Saturday**: 4 hours (half day from 10:00 AM to 2:00 PM)
- **Sunday**: Off (no working hours expected)
- **Leave Policy**: 2 leaves allowed per month
- **Productivity**: (Actual Worked Hours / Expected Working Hours) × 100

## Tech Stack

- **Framework**: Next.js 16.x
- **Language**: TypeScript (TSX)
- **Styling**: Tailwind CSS 4.x
- **Database**: MongoDB
- **ORM**: Prisma
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Excel Parsing**: xlsx

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd leave-productivity-analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Make sure your MongoDB connection string includes the database name!

4. **Set up Prisma**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
leave-productivity-analyzer/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── upload/        # File upload endpoint (POST)
│   │   ├── attendance/    # Fetch attendance data endpoint (GET)
│   │   └── employees/     # Employee management endpoint
│   ├── analyze/           # Dashboard & analysis page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (upload interface)
│   ├── globals.css        # Global styles
│   └── providers.tsx      # Client providers (QueryClient, etc.)
├── components/            # React components
│   ├── pages/
│   │   ├── Home.tsx       # Upload interface
│   │   └── Analyze.tsx    # Dashboard with charts
│   ├── charts/            # Visualization components
│   │   ├── ProductivityTrendChart.tsx
│   │   ├── HoursComparisonChart.tsx
│   │   └── AttendanceBreakdownChart.tsx
│   ├── AttendanceTable.tsx
│   ├── CircularProgress.tsx
│   ├── SummaryCard.tsx
│   ├── MonthSelector.tsx
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   ├── EmptyState.tsx
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities & logic
│   ├── excelParser.ts   # Excel file parsing (274 lines)
│   ├── prisma.ts        # Prisma client singleton
│   └── utils.ts         # Helper utilities
├── hooks/               # React hooks
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── prisma/              # Database
│   └── schema.prisma    # Prisma schema (MongoDB)
├── types/               # TypeScript definitions
│   └── attendance.ts    # AttendanceRecord, DashboardStats, ParsedData
├── public/              # Static assets
├── prisma/              # Database configuration
├── .github/
│   └── copilot-instructions.md  # AI agent instructions
└── Configuration files (tsconfig.json, tailwind.config.ts, etc.)
```

## API Endpoints

### POST `/api/upload`
Upload and process an Excel attendance file.

**Request**: FormData with `file` field (.xlsx only)
**Response**: 
```json
{
  "success": true,
  "employeeId": "mongoObjectId",
  "month": "2024-01",
  "year": 2024,
  "message": "Successfully processed 20 attendance records"
}
```

**Behavior**:
- Creates or finds employee by name
- Parses Excel file and calculates metrics (worked hours, productivity, status)
- Deletes existing records for the month (allows re-upload)
- Creates/updates MonthlySummary with aggregated stats
- Returns navigation params for `/analyze` page

### GET `/api/attendance`
Fetch attendance data for a specific employee and month.

**Query Parameters**:
- `employeeId` - MongoDB Employee ID
- `month` - Month in YYYY-MM format
- `year` - Year

**Response**: 
```json
{
  "records": [
    {
      "date": "2024-01-01T00:00:00Z",
      "employeeName": "John Doe",
      "inTime": "10:00",
      "outTime": "18:30",
      "workedHours": 8.5,
      "expectedHours": 8.5,
      "status": "Present",
      "productivity": 100
    }
  ],
  "stats": {
    "totalExpectedHours": 170,
    "totalActualHours": 165.5,
    "leavesUsed": 1,
    "leaveLimit": 2,
    "productivityScore": 97.35,
    "presentDays": 19,
    "leaveDays": 1,
    "weekendDays": 8,
    "halfDays": 2
  },
  "dailyProductivity": [ { "date": "2024-01-01", "productivity": 100, ... } ],
  "employeeName": "John Doe",
  "month": "2024-01"
}
```

## Excel File Format

Your Excel file should have the following columns in the first sheet:

| Employee Name | Date | In-Time | Out-Time |
|--------------|------|---------|----------|
| John Doe | 2024-01-01 | 10:00 | 18:30 |
| John Doe | 2024-01-02 | 10:15 | 18:45 |
| John Doe | 2024-01-03 | | |
| John Doe | 2024-01-04 | Leave | Leave |

**Column Notes**:
- **Date**: Supported formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Excel serial date
- **In-Time/Out-Time**: Supported formats:
  - HH:MM (24-hour)
  - HH:MM:SS (24-hour with seconds)
  - h:MM AM/PM (12-hour format)
  - Excel time serial numbers
- **Leave Days**: Leave keyword or missing in-time/out-time treated as leave
- **Weekends**: Saturday/Sunday automatically detected and marked as 'Weekend'
- **Half-Days**: Worked hours < 50% of expected hours marked as 'Half-Day'

**Example valid formats**:
```
| John Doe | 01/01/2024 | 10:00 AM | 06:30 PM |
| John Doe | 2024-01-02 | 10:00 | 18:30 |
| John Doe | 2024-01-03 | 10:00:00 | 18:30:00 |
| John Doe | 2024-01-04 | Leave | Leave |
| John Doe | 01/06/2024 | | |  # Saturday - auto-detected
```

## Database Schema

The application uses MongoDB with Prisma ORM. Key models:

### Employee
- `id` - MongoDB ObjectId
- `name` - Employee name (used to find/create on upload)
- `email` - Optional unique email
- Relations: attendanceRecords[], monthlySummaries[]

### AttendanceRecord
- `id` - MongoDB ObjectId
- `employeeId` - Reference to Employee
- `date` - Attendance date
- `inTime`, `outTime` - Time strings
- `workedHours` - Calculated hours worked
- `expectedHours` - Hours expected for that day
- `status` - 'Present' | 'Leave' | 'Half-Day' | 'Weekend'
- `productivity` - (workedHours / expectedHours) × 100
- `month` - "YYYY-MM" (for efficient querying)
- `year` - Year integer
- Indexes: (employeeId, date), (employeeId, month, year)

### MonthlySummary
- `id` - MongoDB ObjectId
- `employeeId` - Reference to Employee
- `month` - "YYYY-MM"
- `year` - Year
- `totalExpectedHours`, `totalActualHours` - Monthly aggregates
- `leavesUsed` - Leaves taken this month
- `leaveLimit` - 2 (policy limit)
- `productivityScore` - Overall monthly productivity
- `presentDays`, `leaveDays`, `weekendDays`, `halfDays` - Day counts
- Unique constraint: (employeeId, month, year)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables
4. Deploy

## Troubleshooting

### Prisma Connection Error
- **Issue**: `error: P1012 database connection error`
- **Solution**: Ensure `DATABASE_URL` includes the database name
- **Format**: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### Module Not Found / Prisma Client Issues
- **Solution**: 
  ```bash
  npm install
  npm run db:generate
  npm run db:push
  ```
- Always run `npm run db:generate` after modifying `prisma/schema.prisma`

### Excel Upload Fails
- Verify file is `.xlsx` format (not .xls or .csv)
- Check Excel sheet has "Employee Name", "Date", "In-Time", "Out-Time" columns
- Ensure date format is recognized (YYYY-MM-DD or DD/MM/YYYY)
- Check browser console for detailed error messages

### Build Errors
- Ensure all client components have `'use client'` directive (see `components/pages/`)
- API routes should not have `'use client'`
- Run `npm run lint` to catch TypeScript issues

### Dashboard Not Loading
- Verify query parameters: `?employeeId=...&month=YYYY-MM&year=YYYY`
- Check Network tab - ensure `/api/attendance` returns 200 with data
- Clear browser cache and try again
- Check MongoDB connection with `npm run db:studio`

### Pagination / Performance
- AttendanceRecords are indexed on (employeeId, month, year) for fast queries
- Large uploads (1000+ records) may take several seconds - this is expected
- For better performance, consider batching uploads by month

## Key Features Deep Dive

### Smart Excel Parsing
- Handles 10+ time format variations automatically
- Detects leave days, weekends, and half-days from attendance patterns
- Computes productivity score in real-time
- Supports re-uploading (overwrites previous month's data)

### Interactive Dashboard
- Real-time productivity trend chart
- Hours comparison (expected vs. actual)
- Attendance breakdown pie chart
- Detailed attendance table with status badges
- Month/year selector for historical data
- Responsive design for mobile/tablet

### Data Calculations
All metrics follow strict business rules:
- **Expected Hours**: M-F: 8.5h, Sat: 4h, Sun: 0h
- **Worked Hours**: Calculated from in/out times (HH:MM format, rounded to 2 decimals)
- **Productivity**: (Actual / Expected) × 100 (0-100% range)
- **Leave Policy**: Max 2 leaves/month enforced
- **Half-Day**: Triggered when worked < 50% of expected hours

## Development Notes

### For AI Agents
See `.github/copilot-instructions.md` for detailed architecture, patterns, and workflows.

### Adding New Features
1. **New metric**: Update `DashboardStats` in `types/attendance.ts` → Add calculation in `excelParser.ts` → Update `MonthlySummary` schema
2. **New visualization**: Create component in `components/charts/` using Recharts → Add data to `ParsedData` → Render in `Analyze.tsx`
3. **Schema changes**: Modify `prisma/schema.prisma` → Run `npm run db:push`

### Performance Considerations
- Attendance queries indexed on (employeeId, month, year)
- MonthlySummary upserted (not recreated) to avoid cascade deletes
- Excel parsing happens server-side (FormData → Buffer → Workbook)
- Frontend pagination not implemented (monthly data typically < 30 records)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following project patterns
4. Test locally: `npm run dev` and verify on `/` and `/analyze` pages
5. Submit a pull request with description

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
