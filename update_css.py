import sys

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

css_addition = """
        /* Actuals columns borders & backgrounds */
        .pivot-table tbody td.cell-actual-store {
            border-left: 2.5px solid #10b981;
            border-right: 2.5px solid #10b981;
            background: #f8fafc;
            padding: 0;
        }
        .pivot-table tbody td.cell-actual-staff {
            border-left: 2.5px solid #f97316;
            border-right: 2.5px solid #f97316;
            background: #f8fafc;
            padding: 0;
        }
        .pivot-table thead th.actual-store-header {
            border-left: 2.5px solid #10b981;
            border-right: 2.5px solid #10b981;
        }
        .pivot-table thead th.actual-staff-header {
            border-left: 2.5px solid #f97316;
            border-right: 2.5px solid #f97316;
        }

        .pivot-table tbody td.cell-actual-store .total-value,
        .pivot-table tbody td.cell-actual-staff .total-value {
            display: block;
            padding: 0 0.6rem;
            font-size: 0.8125rem;
            font-weight: 700;
            color: #0f172a;
            text-align: right;
            line-height: 32px;
        }

        /* Dark mode actuals */
        html.dark-mode .pivot-table tbody td.cell-actual-store,
        body.dark-mode .pivot-table tbody td.cell-actual-store,
        html.dark-mode .pivot-table tbody td.cell-actual-staff,
        body.dark-mode .pivot-table tbody td.cell-actual-staff {
            background: #18181b !important;
        }
        html.dark-mode .pivot-table tbody td.cell-actual-store .total-value,
        body.dark-mode .pivot-table tbody td.cell-actual-store .total-value,
        html.dark-mode .pivot-table tbody td.cell-actual-staff .total-value,
        body.dark-mode .pivot-table tbody td.cell-actual-staff .total-value {
            color: #e4e4e7 !important;
        }
"""

if '/* Actuals columns' not in content:
    content = content.replace('/* Category total row */', css_addition + '        /* Category total row */')

    with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("CSS updated.")
else:
    print("CSS already updated.")
