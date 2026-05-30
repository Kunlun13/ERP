# Architecture Documentation

## Session Handling Strategy

```
Login → Select Session → Store in Redux + localStorage
                              ↓
                    X-Session-Id header on every API call
                              ↓
                    Backend requireSession middleware
                              ↓
                    All queries filtered by sessionId
```

### Database Collections with sessionId

- StudentFieldTemplate (unique per session)
- Student
- Test
- Mark
- ReportTemplate
- SchoolSettings
- ActivityLog (optional)

## Authentication Flow

```
1. POST /auth/login { email, password }
2. Server validates with bcrypt.compare
3. Returns JWT (7d expiry) + user object
4. Frontend stores token in localStorage
5. Axios interceptor adds Authorization header
6. protect middleware verifies JWT on each request
7. authorize middleware checks role (admin/teacher)
```

## MongoDB Schema Design

### User
- email (unique), password (hashed), role, profilePhoto

### AcademicSession
- name (unique), startYear, endYear, isActive

### Student
- sessionId + class + rollNo (compound unique index)
- Text index on name, rollNo for search

### Test
- subjects[] with type: marks|grade, maxMarks

### Mark
- sessionId + studentId + testId (compound unique)
- Computed: totalObtained, totalMax, percentage

### ReportTemplate
- Flexible sections, tables with testIds[], schoolHeader

### ActivityLog
- Audit trail for all CRUD operations

## Frontend State (Redux Toolkit)

```
store/
├── authSlice     → user, token, login/logout
├── sessionSlice  → sessions[], activeSessionId
└── uiSlice       → sidebar, theme (dark/light)
```

## Component Hierarchy

```
App
├── LoginPage
├── SessionSelectPage
└── DashboardLayout
    ├── Sidebar (navigation)
    ├── Navbar (session selector, theme, logout)
    └── Outlet (pages)
        ├── DashboardPage
        ├── DraftBuilderPage
        ├── StudentsPage → StudentProfilePage
        ├── TestsPage
        ├── MarksPage
        ├── AnalysisPage
        ├── ReportsPage
        └── SettingsPage
```

## PDF Generation Strategy

1. Render report/analysis in a DOM element with `ref`
2. `html2canvas` captures element as high-res image
3. `jsPDF` adds image to A4 pages with pagination
4. Multi-page support for long reports
5. `printElement()` opens print-friendly window

## Future-Ready Architecture

- `SchoolSettings.feeManagementEnabled` - Fee module flag
- `SchoolSettings.attendanceEnabled` - Attendance module flag
- `ActivityLog` - Full audit trail
- CSV import/export on students
- Role-based `authorize()` middleware
- Notification-ready structure via `notificationsEnabled` flag

## Scalability Notes

- Indexed sessionId on all collections
- Modular route/controller structure
- Service layer for analytics and marks computation
- ES6 modules throughout
- Environment-based configuration
