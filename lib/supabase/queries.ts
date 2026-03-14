import { format, isToday, isYesterday } from 'date-fns';

export async function fetchGroupedEntries() {
    // Demo mock data because the actual database isn't fully provisioned globally.
    // Replace with real Supabase queries when env is set: 
    // const supabase = createClientComponentClient(); ...
    const entries = [
        {
            id: 1,
            content: "Decided to start using ZenStream today. It feels incredibly clean and less bloated than Notion for just dumping my brain.",
            entry_date: new Date().toISOString(),
            source: 'telegram',
            tags: ["productivity", "mindfulness"]
        },
        {
            id: 2,
            content: "Had a great coffee chat with Sarah about the new marketing initiatives.",
            entry_date: new Date(Date.now() - 86400000).toISOString(),
            source: 'manual',
            tags: ["coffee", "work"]
        },
        {
            id: 3,
            content: "Feeling slightly burnt out but pushing through the sprint.",
            entry_date: new Date(Date.now() - 172800000).toISOString(),
            source: 'telegram',
            tags: ["work", "health"]
        }
    ];

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
