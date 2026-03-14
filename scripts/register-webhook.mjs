import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

// Load .env.local manually
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      // Remove surrounding quotes if they exist
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const secretToken = process.env.TELEGRAM_SECRET_TOKEN;
const vercelDomain = process.argv[2];

if (!botToken || !secretToken) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_SECRET_TOKEN in .env.local');
  process.exit(1);
}

if (!vercelDomain) {
  console.error('❌ Please provide your deployed Vercel domain as an argument.');
  console.log('   Usage: npm run register-webhook your-project.vercel.app');
  process.exit(1);
}

// Ensure proper URL formatting
const baseUrl = vercelDomain.startsWith('http') ? vercelDomain : `https://${vercelDomain}`;
const webhookUrl = `${baseUrl}/api/webhook?token=${secretToken}`;

const apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

console.log(`Setting webhook URL to: ${webhookUrl}`);

https.get(apiUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    if (response.ok) {
      console.log('✅ Webhook successfully registered!');
    } else {
      console.error('❌ Failed to set webhook:', response.description);
      console.error('Full response:', response);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error testing webhook:', err.message);
});
