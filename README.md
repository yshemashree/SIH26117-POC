# Rakshaka.AI

An on-premises agentic AI workbench, prototyped for Mangalore Refinery and
Petrochemicals Limited under SIH26117. Rakshaka is the Kannada word for
protector: the workbench is built to read, draft and reason over
confidential refinery documents without any data leaving the plant network.

This repository holds the frontend preview: a working interface that
demonstrates the intended product experience end to end using hardcoded,
representative scenarios. It is not wired to a real model backend. The
composer, agent step transcript, human-in-the-loop approval gate, audit
trail, network monitor, model router and knowledge base are all real,
interactive UI backed by realistic sample data.

## What is demonstrated

- **Document analysis with OCR and vision.** Reads a scanned tank inspection
  report, cross references it against an SOP, and drafts a Word approval
  note. Flags a limit breach and holds the deliverable for human sign off.
- **Coding in an isolated sandbox.** Writes and tests a flare knockout drum
  sizing script against a worked engineering example, with a visible pass or
  fail console.
- **Knowledge retrieval with citations.** Answers a policy question grounded
  in an SOP, with exact clause and page references.
- **Spreadsheet analysis and report generation.** Summarizes a quarterly HSE
  incident log into a board ready slide summary.

Two of the four scenarios share the same underlying incident thread, so the
knowledge base graph and the audit trail show how a single finding threads
through more than one deliverable.

## Running locally

```bash
npm install
npm run dev
```

Sign in with the Google button on the login screen (this is a UI mock, no
real OAuth call is made). From the workbench, pick a sample prompt or type
your own request. Sample source documents are available under
`public/sample-files` and can be attached from the composer or downloaded
from the Knowledge Base panel.

## Stack

React, TypeScript, Vite, Tailwind CSS v4. No backend, no external network
calls; all scenario data lives in `src/lib/data.ts`.
