import { format, isToday, isYesterday } from 'date-fns';
import { createClient } from '@/utils/supabase/server';

export async function fetchGroupedEntries() {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return {};
    }

    // Fetch entries
    const { data: entries, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

    if (error || !entries) {
        console.error("Error fetching entries:", error);
        return {};
    }

    const grouped = entries.reduce((acc, entry) => {
        const dateObj = new Date(entry.entry_date);

        let dateKey = format(dateObj, 'MMMM d, yyyy');
        if (isToday(dateObj)) dateKey = 'Today';
        else if (isYesterday(dateObj)) dateKey = 'Yesterday';

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
    }, {} as Record<string, typeof entries>);

    return grouped;
}
