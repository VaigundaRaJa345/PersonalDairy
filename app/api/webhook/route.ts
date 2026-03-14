import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase via Service Role locally to bypass RLS securely for webhooks
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

/**
 * Extracts hashtags automatically #work -> "work"
 */
function extractTags(text: string): string[] {
    const match = text.match(/#[\w]+/g);
    return match ? match.map((t) => t.toLowerCase()) : [];
}

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        // Secure via Custom Token sent by Telegram
        if (token !== process.env.TELEGRAM_SECRET_TOKEN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const update = await req.json();

        if (update.message && update.message.text) {
            const text = update.message.text;
            const telegramUserId = update.message.from.id.toString();
            const messageId = update.message.message_id;

            const tags = extractTags(text);

            // Match the inbound Telegram ID to the correct ZenStream user
            const { data: userMapping, error: mapError } = await supabase
                .from('user_mappings')
                .select('user_id')
                .eq('telegram_id', telegramUserId)
                .single();

            if (mapError || !userMapping) {
                return NextResponse.json({ status: 'unauthorized_telegram_user' });
            }

            // Automatically Insert via Service Role 
            const { error: insertError } = await supabase.from('diary_entries').insert({
                user_id: userMapping.user_id,
                content: text,
                source: 'telegram',
                metadata: { message_id: messageId },
                tags: tags,
            });

            if (insertError) throw insertError;
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (err) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
