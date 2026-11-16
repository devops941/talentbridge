# Phase 03: UI/UX Design & Prototyping

## 1. Objectives
- Define the visual design system, color palette, typography, and responsive grid layout.
- Formalize screen wireframes for HR Recruiter and Manager dashboards.
- Specify states for components: loading spinners, empty placeholders, validation messages, and error states.

## 2. Design System Guidelines
- **Theme:** Clean, modern HR aesthetic with high accessibility contrast (WCAG AA compliant).
- **Background:** White (`#FFFFFF`) and warm off-white surface (`#F8F9FA`).
- **Primary Color / Brand:** Forest Green / Teal Accent (`#0F766E` / `#0D9488`).
- **Text:** Charcoal dark (`#1E293B`) for body text, muted slate (`#64748B`) for captions.
- **Status Colors:**
  - `COMPLETED / SELECTED`: Green (`#10B981`)
  - `PROCESSING / UNDER_REVIEW`: Blue (`#3B82F6`)
  - `PARTIAL / ON_HOLD`: Amber (`#F59E0B`)
  - `FAILED / NOT_SELECTED`: Rose / Red (`#EF4444`)

## 3. UI Screen Specification & Component Inventory
Run the following PowerShell command to generate `docs\architecture\UI_SPECIFICATION.md`:

```powershell
Set-Content -Path "docs\architecture\UI_SPECIFICATION.md" -Value @"
# TalentBridge - UI/UX Design Specification

## 1. Screen Inventory
1. **Login Screen:** Clean card layout, email/password fields, show/hide password toggle, alert messages.
2. **Dashboard Screen:**
   - KPI cards: Total Vacancies, Resumes Screened, Shortlisted Candidates, In-Interview.
   - Stage Funnel Bar Chart (Recharts).
   - Recent Uploads table with live processing status badges.
3. **Job Management:**
   - Job Table with search, department filter, and status badges (Draft, Published, Closed).
   - Job Create / Edit Modal: Title, department, min/max experience, skill tagger (Required vs. Preferred).
4. **Candidate Directory:**
   - Candidate List with quick search by name, email, or skill.
   - Duplicate warning banner if candidate email or phone already exists.
5. **Resume Upload Screen:**
   - Drag-and-drop zone with drag-over visual feedback.
   - File size validation (< 10MB) and .pdf mime-type guard.
   - Upload progress bar and batch parsing status table.
6. **Matching & Ranking Leaderboard:**
   - Job selector dropdown.
   - Ranked candidate list sorted by combined score descending.
   - Visual score pill (e.g. 84.5%) with tooltip breakdown: Skill Coverage vs TF-IDF Text Similarity.
   - Matched skills displayed as green badges; missing required skills displayed as red outlined badges.
7. **Recruiter Review & Pipeline:**
   - Kanban Board / Tabular view by recruitment stage.
   - Candidate card with one-click stage change dropdown.
   - Recruiter review modal for 1-5 star rating and interview notes.
8. **Reports & Exports:**
   - Date range and job filter.
   - Export Shortlist to CSV or PDF.
9. **User Management (Admin only):**
   - User table, role assignment dropdown, account active/disabled toggle.
"@
```

## 4. Phase 03 Acceptance Criteria Check
- [x] Design palette, tokens, and visual system documented.
- [x] Detailed UI layout inventory completed for all screens.

