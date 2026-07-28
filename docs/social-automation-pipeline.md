# Automated Blog-to-Social Pipeline

The social worker runs after the existing daily blog job. It uses the published
blog row as the source of truth and never edits older posts or their creative.

## Daily sequence

1. Create the UK and US blog drafts and their colour-block hero images.
2. Run `npm run content:stop-slop -- <uk-file> <us-file>`.
3. Publish the blog rows to the Emergency Tradesmen Supabase project.
4. The database trigger creates one idempotent social campaign per new blog and
   adds a draft for each enabled account in the matching market.
5. Run `npm run social:run`.
6. The worker uses Last 30 Days research, writes platform-specific copy, applies
   the Stop/Slop score, checks for duplicate content, and assigns the configured
   daily posting time.
7. Safe content that passes the quality gate moves to `scheduled`. Hazard-led
   content moves to `review_required` and creates an alert.
8. A scheduler runs `npm run social:run` every 15 minutes. At the configured
   daily time it publishes through a server-side adapter. Disconnected or
   creator-assisted accounts move to `creator_action_required` and create an
   alert. They are requeued automatically after the account is connected.

## Required environment

- `SUPABASE_URL` or `VITE_SUPABASE_URL`, when supplied, must contain project
  `antqstrspkchkoylysqa`. The worker defaults to that project and refuses any
  conflicting URL.
- `SUPABASE_SERVICE_ROLE_KEY` stays server-side. On the local scheduler, the
  authenticated Supabase CLI can supply it without writing a key to disk.
- `LAST30DAYS_PYTHON` and `LAST30DAYS_SKILL_DIR` are optional when they use the
  standard Windows installation.
- `SOCIAL_PUBLISH_WEBHOOK_<PLATFORM>` connects a verified platform adapter.
- `SOCIAL_PUBLISH_WEBHOOK_TOKEN` authenticates the adapter request.

The worker refuses to run against any other Supabase project.

## Commands

- `npm run social:prepare` researches and prepares queued campaigns.
- `npm run social:publish` handles publications whose scheduled time has arrived.
- `npm run social:run` performs both stages.
- `npm run social:dry-run` exercises the pipeline without database writes.

## Quality and safety

- Stop/Slop must score at least `35/50`.
- The database stores the dimension scores and issue list for each publication.
- A unique content hash prevents the same account from receiving reused copy.
- Gas, fire, electrical, smoke, sewage and structural topics require approval
  when `approval_mode` is `safety_only`.
- Every detection, generation, review, schedule and publish action produces an
  event. Approval requests and failures produce deduplicated alerts.
