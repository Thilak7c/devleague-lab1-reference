# PDPA UI Copy — Data Privacy Messaging

All user-facing copy needed for the frontend's privacy story. Drop these
directly into the UI — written to be short enough to actually get read,
not buried in a wall of legal text. Backed by what the backend actually
does (see `backend-pipeline/`), not aspirational — every claim here is
something the pipeline genuinely does today.

---

## 1. Upload screen — primary privacy statement

**Placement:** directly below or beside the upload area, visible before
the user uploads anything — not a footer link, not a modal they have to
seek out.

**Short version (default, always visible):**
> 🔒 Your document is processed in memory only and is never saved to a
> database. Personal information (like ID numbers or names) is
> automatically detected and masked before anything is shown to you.

**Expandable "Learn more" version (click/tap to expand):**
> **How we handle your data:**
> - Your file is processed entirely in memory during this session — it is
>   never written to disk or stored in a database.
> - Once you close this page or the session ends, your document and its
>   extracted data are gone. Nothing persists.
> - Before any extracted data is displayed or exported, we scan for
>   personal information (ID numbers, account numbers, names, emails,
>   phone numbers) and automatically mask it.
> - We do not share your document or its contents with any third party,
>   except for the extraction step itself in cases where a scanned
>   document requires AI-assisted reading (see below).
> - No account, login, or personal profile is required to use this tool.

---

## 2. Processing state — masking transparency message

**Placement:** part of the "Analyzing…" processing state, so the user
sees privacy protection happening as part of the pipeline, not as an
afterthought.

> Extracting data → Checking for personal information → Analyzing trends…

(Each step can appear as a brief sequential status if the UI supports it
— reinforces that masking is a real pipeline step, not a checkbox.)

---

## 3. Results screen — masking confirmation badge

**Placement:** near the top of the results/dashboard view, small and
clear, not hidden in settings.

**If PII was found and masked (`privacy.maskedCount > 0`):**
> 🔒 {maskedCount} field(s) masked for privacy

Example: "🔒 3 fields masked for privacy"

**Optional expandable detail (click to see what types were found, never
the original values):**
> The following types of information were detected and masked:
> - {list distinct `type` values from `privacy.matches`, e.g. "Email
>   Address", "Malaysian IC Number"}
>
> Original values are never stored or displayed — only the type of
> information found.

**If no PII was found (`privacy.maskedCount === 0`):**
> ✓ No personal information detected in this document

(Framed as a positive confirmation, not silence — same principle as the
"no anomalies found" empty state in the results dashboard: absence of a
problem should read as a checked, positive result, not a blank screen.)

---

## 4. Scanned-PDF / vision-fallback disclosure (if/when implemented)

**Placement:** shown only if the document actually goes through the
vision-model fallback path (i.e. `extractionMethod === "vision"` once
that path is wired in).

> This document was processed using AI-assisted image reading, since it
> appears to be a scanned document without extractable text. Data
> accuracy may vary slightly compared to text-based documents.

(Only show this when true — don't display it for the default text/
spreadsheet path, since it would incorrectly imply AI reads every
document.)

---

## 5. Error state — extraction/privacy-relevant errors

**If a document can't be processed (matches `EXTRACTION_FAILED` /
`NO_DATA_FOUND` from the API contract):**
> We couldn't extract usable data from this document. No data from this
> file has been stored — you can try again with a different file.

(Reinforces the no-persistence story even in the failure path — a user
worried about privacy shouldn't have to guess whether a failed upload
left something behind.)

---

## 6. Footer / always-visible micro-copy (optional, if there's room)

> No login required · Nothing stored · [Learn more about how we handle
> your data →]

---

## Notes for Student A (implementation)

- Section 1's short version should be visible without any interaction —
  this is likely to matter for the rubric's PDPA/impact criteria, and a
  judge should see it without hunting.
- Section 3's badge count (`maskedCount`) and type list (`matches[].type`)
  come directly from the `privacy` object in the API response — no
  frontend-side PII logic needed, just display what the backend already
  computed.
- Keep the tone plain and human — avoid legal-document phrasing ("the
  Company shall...") since this is meant to actually be read, not just
  exist for compliance optics.
