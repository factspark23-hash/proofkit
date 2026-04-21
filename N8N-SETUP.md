# ProofKit n8n Automation Setup

## What This Does

Every day at 9 AM, the automation:
1. Generates today's promotional content (rotates through 7 platforms)
2. Creates a GitHub Issue with copy-paste ready text
3. Sends you a Telegram message with the content
4. Sends you an email with the content

You just open the notification, copy-paste the text, and post. Takes 2 minutes.

## Setup (5 minutes)

### Step 1: Import the workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `n8n-free-workflow.json`
4. Click **Import**

### Step 2: Set up credentials

You need 3 free credentials:

#### A. GitHub Token (free)
1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Name: "ProofKit n8n"
4. Scopes: check **repo** (for creating issues)
5. Copy the token
6. In n8n: **Credentials** → **Add** → **Header Auth**
   - Name: "GitHub Token"
   - Header Name: `Authorization`
   - Header Value: `token YOUR_TOKEN_HERE`

#### B. Telegram Bot (free)
1. Open Telegram, search for **@BotFather**
2. Send `/newbot`
3. Name it "ProofKit Promo Bot"
4. Copy the **bot token**
5. Start a chat with your bot, send any message
6. Visit `https://api.telegram.org/botYOUR_TOKEN/getUpdates` to get your **chat ID**
7. In n8n: **Credentials** → **Add** → **Telegram API**
   - Name: "Telegram Bot"
   - Access Token: `YOUR_BOT_TOKEN`
   - Update the **chat ID** in the Telegram node

#### C. Email (SMTP) (free with Gmail)
1. In Gmail: Settings → Forwarding → Enable IMAP
2. Generate app password: https://myaccount.google.com/apppasswords
3. In n8n: **Credentials** → **Add** → **SMTP**
   - Host: `smtp.gmail.com`
   - Port: `465`
   - User: your email
   - Password: your app password
   - SSL/TLS: enabled

### Step 3: Update placeholders

In the workflow, find and replace:
- `REPLACE_WITH_CREDENTIAL_ID` → select your credentials from dropdown
- `REPLACE_WITH_CHAT_ID` → your Telegram chat ID
- `REPLACE_WITH_EMAIL` → your email address

### Step 4: Activate

1. Click the **Active** toggle in the top right
2. Done. It will run daily at 9 AM.

### Manual test

Click **Execute Workflow** to run it immediately and verify everything works.

## The 7-Day Rotation

| Day | Platform | Content |
|-----|----------|---------|
| 1 | HackerNews | Show HN post |
| 2 | Product Hunt | Launch post |
| 3 | Reddit r/SaaS | Pricing roast |
| 4 | Reddit r/Entrepreneur | Tool comparison |
| 5 | Reddit r/webdev | Open source |
| 6 | Twitter/X | 4-tweet thread |
| 7 | Reddit r/smallbusiness | Free tool |

After Day 7, it loops back to Day 1 (with slightly varied timing so it doesn't look spammy).

## Upgrading Later (when you have money)

Add these nodes to auto-post (instead of copy-paste):

### Reddit Auto-Post
1. Create Reddit app: https://www.reddit.com/prefs/apps
2. Add **Reddit OAuth2** credential in n8n
3. Add HTTP Request node: `POST https://oauth.reddit.com/api/submit`

### Twitter Auto-Post
1. Apply for Twitter API: https://developer.twitter.com
2. Add **Twitter OAuth2** credential in n8n
3. Add HTTP Request node: `POST https://api.twitter.com/2/tweets`

### Discord Webhook (free!)
1. Server Settings → Integrations → Webhooks → New
2. Copy webhook URL
3. Add HTTP Request node: `POST YOUR_WEBHOOK_URL`
4. Send the daily content as a Discord message
