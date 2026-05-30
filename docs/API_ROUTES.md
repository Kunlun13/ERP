# API Routes Reference

Base URL: `http://localhost:5000/api`

All session-scoped routes require header: `X-Session-Id: <sessionObjectId>`
All protected routes require header: `Authorization: Bearer <token>`

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register teacher/admin |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Get current user |
| PUT | `/auth/profile` | Yes | Update profile (+ photo) |
| POST | `/auth/logout` | Yes | Log activity logout |

## Academic Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sessions` | Yes | List all sessions |
| POST | `/sessions` | Yes | Create session |
| GET | `/sessions/:id` | Yes | Get session |
| PUT | `/sessions/:id` | Yes | Update session |
| DELETE | `/sessions/:id` | Admin | Delete session |

## Student Field Template

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/templates` | Yes | Get/create default template |
| PUT | `/templates` | Yes | Save field template |

## Students

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/students` | Yes | List (class, search, page) |
| GET | `/students/classes` | Yes | Distinct classes |
| GET | `/students/export` | Yes | Export all students |
| POST | `/students/import` | Yes | Bulk import JSON |
| GET | `/students/:id` | Yes | Profile + marks summary |
| POST | `/students` | Yes | Create (+ photo upload) |
| PUT | `/students/:id` | Yes | Update |
| DELETE | `/students/:id` | Yes | Soft delete |

## Tests

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/tests` | Yes | List (?class=10) |
| GET | `/tests/:id` | Yes | Get test |
| POST | `/tests` | Yes | Create test |
| PUT | `/tests/:id` | Yes | Update |
| DELETE | `/tests/:id` | Yes | Delete |

## Marks

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/marks?testId=&class=` | Yes | Class-wise marks grid |
| GET | `/marks/student/:studentId` | Yes | Student marks history |
| POST | `/marks` | Yes | Save single student marks |
| POST | `/marks/bulk` | Yes | Bulk save class marks |

## Analytics

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/analytics/class?class=&testId=` | Yes | Class rankings & stats |
| GET | `/analytics/student/:studentId` | Yes | Student performance trend |

## Reports

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/reports/templates` | Yes | List saved templates |
| POST | `/reports/templates` | Yes | Create template |
| PUT | `/reports/templates/:id` | Yes | Update template |
| DELETE | `/reports/templates/:id` | Yes | Delete template |
| POST | `/reports/generate` | Yes | Generate report data |

## Settings

| Method | Endpoint | Session | Description |
|--------|----------|---------|-------------|
| GET | `/settings` | Yes | School settings |
| PUT | `/settings` | Yes | Update (+ logo) |
| GET | `/settings/activities` | Yes | Audit log |
| GET | `/settings/dashboard` | Yes | Dashboard stats |

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API status check |
