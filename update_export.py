import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_export = """        /* ── Export ───────────────────────────────────────────── */
        window.exportCSV = function() {
            if (!categories.length) { toast('warning','No Data','Load data first'); return; }

            let rows = [];
            let hdr = ['itemser_description','item_type'];
            sites.forEach(s     => hdr.push(s + ' (Store Target)'));
            staffList.forEach(s => hdr.push(s + ' (Staff Target)'));
            sites.forEach(s     => hdr.push(s + ' (Store Achievement)'));
            staffList.forEach(s => hdr.push(s + ' (Staff Achievement)'));
            rows.push(hdr.join(','));

            categories.forEach(cat => {
                const types = structure[cat];
                const itemRows = types.length ? types : [''];
                itemRows.forEach(type => {
                    let r = [csvE(cat), csvE(type)];
                    sites.forEach(s     => r.push(targets[tKey('store', s, cat, type)] || ''));
                    staffList.forEach(s => r.push(targets[tKey('staff', s, cat, type)] || ''));
                    sites.forEach(s     => r.push(actualStore[s + '||' + cat + '||' + type] || '0'));
                    staffList.forEach(s => r.push(actualStaff[s + '||' + cat + '||' + type] || '0'));
                    rows.push(r.join(','));
                });
                // Total row
                let tr = [csvE('Total ' + cat), ''];
                sites.forEach(s     => tr.push(calcCatTotal('store', s, cat) || ''));
                staffList.forEach(s => tr.push(calcCatTotal('staff', s, cat) || ''));
                sites.forEach(s     => tr.push(calcCatActual(actualStore, s, cat) || '0'));
                staffList.forEach(s => tr.push(calcCatActual(actualStaff, s, cat) || '0'));
                rows.push(tr.join(','));
            });

            // Grand Total
            let gr = ['Grand Total', ''];
            sites.forEach(s     => gr.push(calcGrandTotal('store', s) || ''));
            staffList.forEach(s => gr.push(calcGrandTotal('staff', s) || ''));
            sites.forEach(s     => gr.push(calcGrandActual(actualStore, s) || '0'));
            staffList.forEach(s => gr.push(calcGrandActual(actualStaff, s) || '0'));
            rows.push(gr.join(','));

            const blob = new Blob([rows.join('\\n')], { type:'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'target_achievement_' + new Date().toISOString().slice(0,10) + '.csv';
            a.click();
            URL.revokeObjectURL(a.href);
            toast('success','Exported','CSV downloaded');
        };"""

start_str = "        /* ── Export ───────────────────────────────────────────── */"
end_str = "        /* ── Reset ───────────────────────────────────────────── */"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_export + "\n\n" + content[end_idx:]
    with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Export JS updated successfully.")
else:
    print("Could not find replacement boundaries.")
