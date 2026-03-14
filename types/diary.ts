export type EntrySource = 'telegram' | 'manual' | 'voice';

export interface DiaryEntry {
    id: string;
    user_id: string;
    content: string;
    entry_date: string;
    source: EntrySource;
    tags: string[];
    metadata: {
        message_id?: number;
        duration?: number;
        voice_url?: string;
        [key: string]: any;
    };
    is_public?: boolean;
    share_id?: string;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}
