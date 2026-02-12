# Email Sending — Dual Sender with Fallback

## Why the fallback exists

Our primary sender domain (`reports@whereismymoneygo.com`) requires DNS verification in Resend before emails can be sent. Until the domain is verified, Resend returns a **403 "Domain not verified"** error.

To ensure paid users always receive their Pro Report, we implemented a dual-sender strategy:

1. **Primary sender**: `reports@whereismymoneygo.com` — our branded domain
2. **Fallback sender**: `onboarding@resend.dev` — Resend's default verified sender that always works

The system tries the primary sender first. If it gets a 403 domain error, it automatically retries with the fallback sender. The user always gets their PDF download regardless of email outcome.

## How it works

```
User pays → PDF generated → Try primary sender
                              ↓ success → done (email sent from branded domain)
                              ↓ 403 domain error → Try fallback sender
                                                     ↓ success → done (email sent from resend.dev)
                                                     ↓ fail → PDF download still available
```

All logic lives in: `frontend/lib/sendReportEmail.ts`

## How to switch back once domain is verified

Once Resend shows your domain as **Verified**:

1. The primary sender will start working automatically — no code changes needed
2. Optionally, disable the fallback by setting `EMAIL_FALLBACK_ENABLED=false`
3. The fallback code can stay in place as a safety net (recommended)

To confirm it's working, check the server logs for:
```
[Email] event="email_send_result" attempt="primary" ok=true
```

If you still see `attempt="fallback"`, the domain is still pending.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `RESEND_API_KEY` | — | Your Resend API key (required) |
| `RESEND_FROM_PRIMARY` | `Leaky Wallet <reports@whereismymoneygo.com>` | Primary sender address |
| `RESEND_FROM_FALLBACK` | `Leaky Wallet <onboarding@resend.dev>` | Fallback sender (always verified) |
| `EMAIL_SENDING_ENABLED` | `true` | Set to `false` to skip all email sending (PDF download still works) |
| `EMAIL_FALLBACK_ENABLED` | `true` | Set to `false` to disable automatic fallback on domain errors |

## How to test locally

1. Set env vars in `frontend/.env.local`
2. Run `npm run dev` to start the Next.js server
3. Use the dev-mode Stripe bypass to generate a Pro Report
4. Check terminal logs for email send attempts:
   ```
   [Email] event="email_send_attempt" attempt="primary" emailHash=abc123
   [Email] event="email_send_result" attempt="primary" ok=false error="Domain not verified"
   [Email] event="email_send_attempt" attempt="fallback" emailHash=abc123
   [Email] event="email_send_result" attempt="fallback" ok=true messageId=msg_xxx
   ```
5. To test with email disabled: set `EMAIL_SENDING_ENABLED=false`

### Running unit tests

```bash
cd frontend
npm test
```

Tests cover: primary success, primary→fallback success, both fail, non-domain errors, and invalid email.

## Where to check Resend logs

1. Go to [resend.com/emails](https://resend.com/emails)
2. Filter by API key or recipient
3. Check the **Status** column: Delivered, Bounced, or Failed
4. For domain verification status: [resend.com/domains](https://resend.com/domains)

## API routes that send email

| Route | Purpose | Uses fallback? |
|---|---|---|
| `/api/deliver-report` | Primary — called after Stripe payment + PDF generation | Yes |
| `/api/send-pro-report` | Legacy — direct email send | Yes |

Both routes call `sendReportEmail()` from `frontend/lib/sendReportEmail.ts`.

## Structured logs

The utility logs structured events (no PII beyond hashed email):

```
[Email] event="email_send_attempt" attempt="primary|fallback" emailHash=<sha256-first-12>
[Email] event="email_send_result" attempt="primary|fallback" ok=true|false messageId=<id> error="<msg>"
[Email] event="email_skip" reason="sending_disabled|invalid_email|no_api_key"
```
