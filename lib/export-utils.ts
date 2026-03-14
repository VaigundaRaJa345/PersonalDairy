import { DiaryEntry } from "@/types/diary";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import JSZip from "jszip";

export const exportToPDF = (entries: DiaryEntry[]) => {
    const doc = new jsPDF() as any;
    
    doc.setFont("playfair", "bold");
    doc.setFontSize(22);
    doc.text("Journal Export", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, 14, 30);
    
    const tableData = entries.map(entry => [
        format(new Date(entry.entry_date), 'dd-MM-yyyy HH:mm'),
        entry.source,
        entry.content,
        entry.tags?.join(', ') || '-'
    ]);

    doc.autoTable({
        startY: 40,
        head: [['Date', 'Source', 'Content', 'Tags']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillStyle: '#111827', textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 }
    });

    doc.save(`journal-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToZIP = async (entries: DiaryEntry[]) => {
    const zip = new JSZip();
    
    entries.forEach((entry, index) => {
        const dateStr = format(new Date(entry.entry_date), 'yyyy-MM-dd_HH-mm');
        const filename = `entry_${dateStr}_${index}.txt`;
        const content = `Date: ${format(new Date(entry.entry_date), 'dd-MM-yyyy HH:mm')}\nSource: ${entry.source}\nTags: ${entry.tags?.join(', ')}\n\nContent:\n${entry.content}`;
        zip.file(filename, content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `journal-export-${format(new Date(), 'yyyy-MM-dd')}.zip`;
    link.click();
};
