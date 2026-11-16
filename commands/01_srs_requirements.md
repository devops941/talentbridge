# Phase 01: Requirement Analysis & Software Requirements Specification (SRS)

## 1. Objectives
- Formalize functional requirements (FR-01 to FR-18) and non-functional requirements (NFRs).
- Detail User Stories & Acceptance Criteria for primary actors: Admin, Recruiter, and Manager.
- Define business rules, error states, and Traceability Matrix.

## 2. Generate SRS Documentation
Run the following PowerShell command to generate `docs\srs\SRS.md`:

```powershell
Set-Content -Path "docs\srs\SRS.md" -Value @"
# Software Requirements Specification (SRS) - TalentBridge

## 1. User Roles & Personas
- **System Administrator:** Manages user accounts, assigns roles (Admin, Recruiter, Manager), audits system events.
- **HR Recruiter:** Creates job postings, uploads candidate resumes, reviews extracted skills, inspects matching scores, adjusts candidate pipeline stages.
- **HR Manager:** Reviews shortlisted profiles, tracks recruitment cycle metrics, generates analytics and CSV/PDF reports.

## 2. Functional Requirements (FR)
- **FR-01 (Auth):** User authentication via secure JWT tokens with expiration & refresh.
- **FR-02 (RBAC):** Role-Based Access Control enforcing endpoint-level permissions.
- **FR-03 (Job CRUD):** Create, view, update, archive, and publish vacancies with experience ranges and locations.
- **FR-04 (Skill Requirements):** Explicitly categorize required skills vs. preferred skills for each job.
- **FR-05 (Candidate Profile):** Maintain candidate demographic data without storing sensitive/protected attributes.
- **FR-06 (Resume Upload):** Validate PDF files (magic byte signature, MIME type, max 10MB limit).
- **FR-07 (Parsing):** Extract text page-by-page using PyMuPDF; log parse status (UPLOADED, PROCESSING, COMPLETED, PARTIAL, FAILED).
- **FR-08 (Skill Extraction):** Extract skills via phrase matching against approved taxonomy.
- **FR-09 (Normalization):** Map aliases to canonical names (e.g. 'Postgres' -> 'PostgreSQL').
- **FR-10 (Matching Engine):** Calculate suitability using weighted Skill Coverage (70%) and TF-IDF Cosine Similarity (30%).
- **FR-11 (Explainability):** Return detailed breakdown: matched skills, missing required skills, and rationale.
- **FR-12 (Ranking):** Present ranked candidate leaderboard with deterministic tie-breaking.
- **FR-13 (Review Pipeline):** Manage stages: Application Received -> Under Review -> Shortlisted -> Interview Scheduled -> Interview Completed -> Selected / Not Selected / On Hold.
- **FR-14 (Analytics):** Dashboard KPIs (Total Candidates, Active Vacancies, Shortlist Rate, Stage Funnel).
- **FR-15 (Reports):** Export candidate shortlists in CSV and PDF formats.
- **FR-16 (Audit Trail):** Immutable event logs for auth, edits, status transitions, and data access.
- **FR-17 (Notifications):** In-app alert notifications on job/candidate processing events.
- **FR-18 (Data Privacy):** Granular access control for viewing original PDF documents.

## 3. Requirement Traceability Matrix (RTM)
| Req ID | Module | Implementation Phase | Test Case ID |
|:---|:---|:---|:---|
| FR-01, 02 | Auth & RBAC | Phase 07 | TC-AUTH-01..05 |
| FR-03, 04 | Jobs & Skills | Phase 09 | TC-JOB-01..04 |
| FR-05 | Candidates | Phase 10 | TC-CAND-01..03 |
| FR-06 | Document Management | Phase 11 | TC-DOC-01..04 |
| FR-07, 08, 09 | NLP Parser | Phase 12, 13 | TC-NLP-01..06 |
| FR-10, 11, 12 | Matching & Ranking | Phase 14, 15 | TC-MATCH-01..05 |
| FR-13 | Recruitment Pipeline| Phase 16 | TC-PIPE-01..03 |
| FR-14, 15 | Analytics & Reports | Phase 17, 18 | TC-REP-01..03 |
| FR-16, 17, 18 | Audit & Security | Phase 18, 19 | TC-SEC-01..04 |
"@
```

## 3. Phase 01 Acceptance Criteria Check
- [x] SRS document generated with complete functional requirement mappings.
- [x] RTM table defines traceability from requirements to test cases.

