# Civic Nexus AI

**Team ResolvX | Smart India Hackathon 2026 | Problem Statement 26043**

> Civic Nexus AI turns recurring civic problems into funded university innovation projects — routine issues still go straight to government.

## Problem statement

Existing civic complaint platforms collect and queue reports, but recurring, systemic problems never reach anyone equipped to actually solve them. A pothole gets fixed (eventually); a water-scarcity pattern that shows up every summer in the same district never gets researched or redesigned — it just gets re-reported every year.

**PS ID:** SIH26043
**Title:** A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships
**Theme:** Smart Education
**Category:** Software

## What it does

Citizens report local problems with a photo, GPS location, and voice or text input in their own language. The system checks each report for duplicates and spam, then looks for patterns over time and location:

- **One-off issue** → routed directly to the relevant government department through standard channels
- **Recurring / systemic issue** → routed to a matched university team, with funding support from CSR or industry partners released as work progresses

Citizens get status updates every 15 days regardless of which path their report takes.

## Architecture

```
Citizen (web/mobile)
      │
      ▼
Language processing (transcription, language detection, translation to English)
      │
      ▼
Duplicate/spam check (text embedding + similarity search against recent reports)
      │
      ▼
Pattern detection (same similarity technique, applied over time + location)
      │
      ├── One-off ──────────► Government routing
      │
      └── Recurring ────────► University matching ──► CSR/industry funding
                                                            │
                                                            ▼
                                                  Shared status tracking dashboard
```

## Tech stack

| Layer | Tools | Why |
|---|---|---|
| Frontend | Next.js, React, Tailwind CSS | Fast to build responsive dashboards for citizens, mentors, and admins |
| Backend | FastAPI | Async support for real-time status updates via WebSockets |
| Database | Supabase (PostgreSQL) | Managed Postgres with built-in auth, quick to set up for a hackathon timeline |
| AI/NLP | Whisper, Sentence Transformers | Speech-to-text and embedding generation for duplicate/pattern detection |
| Deployment | Vercel (frontend), Render (backend/AI) | Free-tier friendly, quick CI/CD |

## Current status

This is a hackathon prototype. Honest scope as of submission:

- [x] System architecture and data flow designed
- [x] UI mockups for citizen reporting flow
- [ ] Duplicate detection — rule-based placeholder; ML-based embedding similarity in progress
- [ ] Recurring-pattern detection — logic designed, not yet implemented
- [ ] University/mentor matching — currently coordinator-based (problems routed to a university's registered coordinator, who assigns internally); automated student-level matching is a future goal, not current scope
- [ ] CSR/funding milestone tracking — designed, not yet built

## Team

**ResolvX** — Team ID 131299

## References

1. UN Sustainable Development Goals — https://sdgs.un.org/goals
2. Crowdsourced Civic Issue Reporting and Resolution System (IJERT) — https://www.ijert.org/crowdsourced-civic-issue-reporting-and-resolution-system-ijertv15is042848
3. Fornaroli & Gatica, digital governance research — https://www.idiap.ch/~gatica/publications/FornaroliGatica-dgov23.pdf
4. Jharkhand Urban Development & Housing Department portal — https://uddp.jharkhand.gov.in/