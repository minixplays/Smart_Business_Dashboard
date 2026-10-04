import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_js = """        /* ── State ─────────────────────────────────────────────── */
        let rawData      = [];
        let structure     = {};   // { category -> Set of item_types }
        let sites         = [];
        let staffList     = [];
        let categories    = [];
        let targets       = {};   // key -> value  (user-entered targets)
        let actualStore   = {};
        let actualStaff   = {};
        let currentView   = 'both';

        const STORAGE_KEY  = 'target_achievement_data';
        const TARGETS_KEY  = 'target_achievement_targets';

        /* ── Init ──────────────────────────────────────────────── */
        document.addEventListener('DOMContentLoaded', function() {
            setupUpload();
            loadFromStorage();
        });

        /* ── Upload ────────────────────────────────────────────── */
        function setupUpload() {
            const dz = document.getElementById('dz-target');
            const fi = document.getElementById('fi-target');

            ['dragover','dragenter'].forEach(e => dz.addEventListener(e, ev => { ev.preventDefault(); dz.classList.add('dragover'); }));
            ['dragleave','drop'].forEach(e => dz.addEventListener(e, ev => { ev.preventDefault(); dz.classList.remove('dragover'); }));

            dz.addEventListener('drop', e => {
                const f = e.dataTransfer.files[0];
                if (f && f.name.endsWith('.csv')) processFile(f);
                else toast('error','Invalid File','Please upload a .csv file');
            });
            fi.addEventListener('change', e => { if (e.target.files[0]) processFile(e.target.files[0]); });
        }

        function processFile(file) {
            const r = new FileReader();
            r.onload = function(e) {
                const rows = parseCSV(e.target.result);
                if (validateData(rows)) {
                    rawData = rows;
                    saveRawToStorage();
                    buildStructure();
                    toast('success','Data Loaded', rawData.length + ' records parsed');
                }
            };
            r.readAsText(file);
        }

        /* ── CSV Parser ────────────────────────────────────────── */
        function parseCSV(text) {
            const lines = text.split(/\\r?\\n/).filter(l => l.trim());
            if (lines.length < 2) return [];
            const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
            const out = [];
            for (let i = 1; i < lines.length; i++) {
                const vals = parseLine(lines[i]);
                if (vals.length < headers.length) continue;
                const row = {};
                headers.forEach((h, idx) => row[h] = (vals[idx]||'').trim());
                out.push(row);
            }
            return out;
        }

        function parseLine(line) {
            const res = []; let cur = '', inQ = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (inQ) {
                    if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
                    else if (c === '"') inQ = false;
                    else cur += c;
                } else {
                    if (c === '"') inQ = true;
                    else if (c === ',') { res.push(cur); cur = ''; }
                    else cur += c;
                }
            }
            res.push(cur);
            return res;
        }

        function validateData(rows) {
            if (!rows.length) { toast('error','Empty File','No data rows found'); return false; }
            const need = ['itemser_description','item_type','site_descr','sp_name'];
            const keys = Object.keys(rows[0]);
            const miss = need.filter(n => !keys.includes(n));
            if (miss.length) { toast('error','Missing Columns', 'Need: ' + miss.join(', ')); return false; }
            return true;
        }

        /* ── Build Structure ───────────────────────────────────── */
        function buildStructure() {
            structure = {};
            actualStore = {};
            actualStaff = {};
            const sSet = new Set(), stSet = new Set();

            rawData.forEach(r => {
                const cat  = r['itemser_description'] || 'Unknown';
                const type = r['item_type'] || '';
                const site = r['site_descr'] || '';
                const sp   = r['sp_name'] || '';

                if (!structure[cat]) structure[cat] = new Set();
                if (type) structure[cat].add(type);
                if (site) {
                    sSet.add(site);
                    const k = site + '||' + cat + '||' + type;
                    actualStore[k] = (actualStore[k] || 0) + 1;
                }
                if (sp) {
                    stSet.add(sp);
                    const k = sp + '||' + cat + '||' + type;
                    actualStaff[k] = (actualStaff[k] || 0) + 1;
                }
            });

            // Convert sets to sorted arrays
            for (const cat in structure) structure[cat] = Array.from(structure[cat]).sort();
            sites      = Array.from(sSet).sort();
            staffList  = Array.from(stSet).sort();
            categories = Object.keys(structure).sort();

            // Load saved targets
            loadTargetsFromStorage();
            renderTable();
            updateKPIs();
            showUI(true);
        }

        /* ── Render Pivot Table ────────────────────────────────── */
        function renderTable() {
            const wrap   = document.getElementById('pivot-table-wrapper');
            const showS  = currentView === 'both' || currentView === 'store';
            const showSt = currentView === 'both' || currentView === 'staff';

            // Columns to render
            const storeCols = showS  ? sites     : [];
            const staffCols = showSt ? staffList  : [];
            const totalDataCols = storeCols.length + staffCols.length;

            let h = '<table class="pivot-table" id="pivotTable">';

            /* ── THEAD ── */
            h += '<thead>';

            // Row 1: group headers
            if (storeCols.length || staffCols.length) {
                h += '<tr class="group-header">';
                h += '<th class="col-cat" rowspan="2" style="text-align:left;">Product Category</th>';
                h += '<th class="col-type" rowspan="2" style="text-align:left;">Product Type</th>';
                if (storeCols.length)
                    h += '<th colspan="' + storeCols.length + '" class="store-group">site_descr</th>';
                if (staffCols.length)
                    h += '<th colspan="' + staffCols.length + '" class="staff-group">sp_name</th>';
                if (storeCols.length)
                    h += '<th colspan="' + storeCols.length + '" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">Store Achivement</th>';
                if (staffCols.length)
                    h += '<th colspan="' + staffCols.length + '" style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);">Staff Achivement</th>';
                h += '</tr>';
            }

            // Row 2: individual column names
            h += '<tr>';
            if (!storeCols.length && !staffCols.length) {
                h += '<th class="col-cat" style="text-align:left;">Product Category</th>';
                h += '<th class="col-type" style="text-align:left;">Product Type</th>';
            }
            storeCols.forEach(s => { h += '<th class="store-col-header">' + esc(s) + '</th>'; });
            staffCols.forEach(s => { h += '<th class="staff-col-header">' + esc(s) + '</th>'; });
            storeCols.forEach(s => { h += '<th class="actual-store-header">' + esc(s) + '</th>'; });
            staffCols.forEach(s => { h += '<th class="actual-staff-header">' + esc(s) + '</th>'; });
            h += '</tr></thead>';

            /* ── TBODY ── */
            h += '<tbody>';

            categories.forEach(cat => {
                const types = structure[cat];

                if (types.length === 0) {
                    // Category with no sub-items
                    h += '<tr>';
                    h += '<td class="cell-cat">' + esc(cat) + '</td>';
                    h += '<td class="cell-type"></td>';
                    storeCols.forEach(s => h += inputCell(tKey('store', s, cat, ''), 'store-col'));
                    staffCols.forEach(s => h += inputCell(tKey('staff', s, cat, ''), 'staff-col'));
                    storeCols.forEach(s => h += '<td class="cell-actual-store"><span class="total-value">' + (actualStore[s + '||' + cat + '||'] || '') + '</span></td>');
                    staffCols.forEach(s => h += '<td class="cell-actual-staff"><span class="total-value">' + (actualStaff[s + '||' + cat + '||'] || '') + '</span></td>');
                    h += '</tr>';
                } else {
                    types.forEach(type => {
                        h += '<tr>';
                        h += '<td class="cell-cat">' + esc(cat) + '</td>';
                        h += '<td class="cell-type">' + esc(type) + '</td>';
                        storeCols.forEach(s => h += inputCell(tKey('store', s, cat, type), 'store-col'));
                        staffCols.forEach(s => h += inputCell(tKey('staff', s, cat, type), 'staff-col'));
                        storeCols.forEach(s => h += '<td class="cell-actual-store"><span class="total-value">' + (actualStore[s + '||' + cat + '||' + type] || '') + '</span></td>');
                        staffCols.forEach(s => h += '<td class="cell-actual-staff"><span class="total-value">' + (actualStaff[s + '||' + cat + '||' + type] || '') + '</span></td>');
                        h += '</tr>';
                    });
                }

                // Category Total row
                h += '<tr class="row-cat-total">';
                h += '<td class="cell-cat" colspan="2">Total ' + esc(cat) + '</td>';
                storeCols.forEach(s => h += '<td class="cell-input store-col"><span class="total-value" data-total-key="store__' + escA(s) + '__cat__' + escA(cat) + '">' + (calcCatTotal('store', s, cat) || '') + '</span></td>');
                staffCols.forEach(s => h += '<td class="cell-input staff-col"><span class="total-value" data-total-key="staff__' + escA(s) + '__cat__' + escA(cat) + '">' + (calcCatTotal('staff', s, cat) || '') + '</span></td>');
                storeCols.forEach(s => h += '<td class="cell-actual-store"><span class="total-value" style="color:#b45309;">' + (calcCatActual(actualStore, s, cat) || '') + '</span></td>');
                staffCols.forEach(s => h += '<td class="cell-actual-staff"><span class="total-value" style="color:#b45309;">' + (calcCatActual(actualStaff, s, cat) || '') + '</span></td>');
                h += '</tr>';
            });

            // Grand Total
            h += '<tr class="row-grand-total">';
            h += '<td class="cell-cat" colspan="2">Grand Total</td>';
            storeCols.forEach(s => h += '<td class="cell-input store-col"><span class="total-value">' + (calcGrandTotal('store', s) || '') + '</span></td>');
            staffCols.forEach(s => h += '<td class="cell-input staff-col"><span class="total-value">' + (calcGrandTotal('staff', s) || '') + '</span></td>');
            storeCols.forEach(s => h += '<td class="cell-actual-store"><span class="total-value" style="color:#f4c74a;">' + (calcGrandActual(actualStore, s) || '') + '</span></td>');
            staffCols.forEach(s => h += '<td class="cell-actual-staff"><span class="total-value" style="color:#f4c74a;">' + (calcGrandActual(actualStaff, s) || '') + '</span></td>');
            h += '</tr>';

            h += '</tbody></table>';
            wrap.innerHTML = h;

            renderCards();
        }

        /* ── Helper: input cell HTML ─────────────────────────── */
        function inputCell(key, colClass) {
            const val = targets[key] || '';
            return '<td class="cell-input ' + colClass + '">' +
                   '<input type="number" min="0" data-key="' + escA(key) + '" value="' + val + '" ' +
                   'oninput="window._tgt.onInput(this)" placeholder="—">' +
                   '</td>';
        }

        /* ── Keys ────────────────────────────────────────────── */
        function tKey(prefix, colName, cat, type) {
            return prefix + '||' + colName + '||' + cat + '||' + type;
        }

        /* ── Calculation ─────────────────────────────────────── */
        function calcCatTotal(prefix, colName, cat) {
            const types = structure[cat];
            let sum = 0, hasAny = false;
            if (types.length === 0) {
                const v = parseInt(targets[tKey(prefix, colName, cat, '')]) || 0;
                return v || '';
            }
            types.forEach(type => {
                const v = parseInt(targets[tKey(prefix, colName, cat, type)]) || 0;
                if (v) hasAny = true;
                sum += v;
            });
            return hasAny ? sum : '';
        }

        function calcGrandTotal(prefix, colName) {
            let sum = 0, hasAny = false;
            categories.forEach(cat => {
                const catSum = calcCatTotal(prefix, colName, cat);
                if (catSum !== '') { hasAny = true; sum += catSum; }
            });
            return hasAny ? sum : '';
        }

        function calcCatActual(actualsDict, colName, cat) {
            const types = structure[cat];
            let sum = 0, hasAny = false;
            if (types.length === 0) {
                const v = actualsDict[colName + '||' + cat + '||'] || 0;
                return v || '';
            }
            types.forEach(type => {
                const v = actualsDict[colName + '||' + cat + '||' + type] || 0;
                if (v) { hasAny = true; sum += v; }
            });
            return hasAny ? sum : '';
        }

        function calcGrandActual(actualsDict, colName) {
            let sum = 0, hasAny = false;
            categories.forEach(cat => {
                const catSum = calcCatActual(actualsDict, colName, cat);
                if (catSum !== '') { hasAny = true; sum += catSum; }
            });
            return hasAny ? sum : '';
        }
"""

start_str = "        /* ── State ─────────────────────────────────────────────── */"
end_str = "        /* ── Achievement Cards ───────────────────────────────── */"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_js + "\\n" + content[end_idx:]
    with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("JS updated successfully.")
else:
    print("Could not find replacement boundaries.")
