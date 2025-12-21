# AI Agent Instructions for Leave & Productivity Analyzer

## Architecture Overview

**Leave & Productivity Analyzer** is a Next.js 16 full-stack application that processes Excel attendance sheets to generate productivity insights. The system follows a three-tier architecture:

1. **Client Layer**: React components (TSX) using shadcn/ui components, Recharts for visualizations, Framer Motion for animations
2. **API Layer**: Next.js App Router endpoints (`/app/api`) handling file uploads, Excel parsing, and data queries
3. **Data Layer**: MongoDB + Prisma ORM managing employee records, daily attendance, and monthly summaries

## Critical Data Flow

1. **Upload Phase** (`POST /api/upload`):
   - User uploads `.xlsx` file → parsed by `excelParser.ts`
   - Creates/finds employee record in database
   - Generates attendance records with computed metrics (workedHours, status, productivity)
   - Creates/updates MonthlySummary with aggregated stats
   - Returns employeeId, month, year for navigation

2. **Analysis Phase** (`GET /api/attendance`):
   - Fetches stored records filtered by employeeId, month, year
   - Transforms Prisma data into `ParsedData` format
   - Drives dashboard components on `/analyze` page

## Business Rules (Non-Negotiable)

**Working Hours Expected:**
- Monday-Friday: 8.5 hours (10:00 AM - 6:30 PM)
- Saturday: 4 hours (10:00 AM - 2:00 PM, half-day)
- Sunday: 0 hours (off)

**Leave Policy**: 2 leaves per month max

**Productivity Calculation**: (Actual Worked Hours / Expected Working Hours) × 100

**Status Values**: `'Present' | 'Leave' | 'Half-Day' | 'Weekend'`

See `excelParser.ts` (lines 75-90) for `getExpectedHours()` and `calculateWorkedHours()` implementations.

## Key Patterns & Conventions

### Excel Parsing
- Entry point: [lib/excelParser.ts](lib/excelParser.ts) (274 lines, comprehensive)
- Handles multiple time formats: HH:MM, HH:MM:SS, AM/PM, Excel serial numbers
- Returns `ParsedData` interface with records array + aggregated `DashboardStats`
- Detects leave/weekend/half-day automatically from attendance patterns

### API Response Format
All API routes return structured JSON matching `ParsedData` type:
```typescript
{
  records: AttendanceRecord[],      // Daily records with date, hours, status, productivity
  stats: DashboardStats,            // Monthly aggregates
  dailyProductivity: DailyProductivity[],  // Trend data
  employeeName: string,
  month: "YYYY-MM"
}
```

### Database Patterns
- **Cascade deletes**: Employee deletion removes all related records
- **Upsert for summaries**: `MonthlySummary` uses composite unique key `(employeeId, month, year)`
- **Index strategy**: AttendanceRecords indexed on `(employeeId, date)` and `(employeeId, month, year)` for query performance
- MongoDB-specific: `@id @default(auto()) @map("_id") @db.ObjectId`

### Component Structure
- **Page components** (`components/pages/`): `Home.tsx` (upload), `Analyze.tsx` (dashboard)
- **Feature components**: `AttendanceTable`, `CircularProgress` (KPI display), `SummaryCard`, `MonthSelector`
- **Charts** (`components/charts/`): `ProductivityTrendChart`, `HoursComparisonChart`, `AttendanceBreakdownChart` (all Recharts)
- **UI components** (`components/ui/`): shadcn/ui library (accordion, dialog, button, etc.)

### Type System
Central types in [types/attendance.ts](types/attendance.ts):
- `AttendanceRecord`: Daily data with times, worked hours, productivity
- `DashboardStats`: Monthly aggregates (total hours, leaves used, productivity score)
- `ParsedData`: Full response structure from both upload and fetch endpoints

## Developer Workflows

### Setup Commands
```bash
npm install                    # Install deps
npm run db:generate           # Regenerate Prisma client (run after schema changes)
npm run db:push               # Sync schema to MongoDB
npm run dev                   # Start dev server (localhost:3000)
npm run build && npm start    # Production build & run
```

**Important**: `.env` must include `DATABASE_URL` (MongoDB connection string with database name) and `NEXT_PUBLIC_APP_URL`.

### Testing Local Changes
1. Upload new attendance sheet via `/` (Home page)
2. Observe response in Network tab (should return employeeId, month, year)
3. Navigate to `/analyze?employeeId=...&month=YYYY-MM&year=YYYY` to verify dashboard renders correctly
4. Check MongoDB via `npm run db:studio` if needed

### Common Tasks

**Adding a new metric to dashboard:**
1. Update `DashboardStats` interface in [types/attendance.ts](types/attendance.ts)
2. Add calculation logic in [lib/excelParser.ts](lib/excelParser.ts) `calculateStats()` function
3. Update Prisma schema `MonthlySummary` model, run `npm run db:push`
4. Pass to chart components via `ParsedData`

**Modifying Excel parsing:**
- All parsing logic centralized in [lib/excelParser.ts](lib/excelParser.ts)
- `parseTimeToDate()` handles time string variants (modify here for new formats)
- `getExpectedHours()` implements business rules
- `calculateWorkedHours()` derives worked duration

**Changing UI styling:**
- Global styles: [app/globals.css](app/globals.css)
- Tailwind config: [tailwind.config.ts](tailwind.config.ts)
- Component-level: Use shadcn/ui components (pre-built, see `components/ui/`)

## Integration Points

- **Excel Library**: `xlsx` package (XLSX namespace) - used for reading `.xlsx` workbooks
- **Charts**: Recharts (BarChart, LineChart, PieChart components)
- **Animations**: Framer Motion (motion.div, AnimatePresence for page transitions)
- **Notifications**: `sonner` toast library (see [components/ui/sonner.tsx](components/ui/sonner.tsx))
- **HTTP Client**: Native `fetch()` API (no axios/swr wrapper)
- **State Management**: React hooks + `@tanstack/react-query` (query cache)

## Common Pitfalls

1. **File upload validation**: Route checks `.xlsx` extension; ExcelParser expects specific column names - verify sheet format
2. **Timezone handling**: Time calculations use local Date objects; ensure MongoDB timezone matches server
3. **Month format**: Always "YYYY-MM" string; searchParams provide month/year separately, concatenate carefully
4. **Database cascade**: Deleting employee cascades all attendance records and summaries
5. **Prisma client**: Must run `npm run db:generate` after schema changes before deploying

## File Reference Quick Map

| Purpose | Files |
|---------|-------|
| Attendance calculation engine | [lib/excelParser.ts](lib/excelParser.ts) |
| API endpoints | [app/api/upload/route.ts](app/api/upload/route.ts), [app/api/attendance/route.ts](app/api/attendance/route.ts) |
| Dashboard UI | [components/pages/Analyze.tsx](components/pages/Analyze.tsx), [components/SummaryCard.tsx](components/SummaryCard.tsx) |
| Types | [types/attendance.ts](types/attendance.ts) |
| Database | [prisma/schema.prisma](prisma/schema.prisma), [lib/prisma.ts](lib/prisma.ts) |
| Entry points | [app/layout.tsx](app/layout.tsx), [app/page.tsx](app/page.tsx) |
