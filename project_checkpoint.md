project_root/
│
├── app.py
├── db.py
├── items_weapons_routes.py
│
├── static/
│   ├── img/
│   │   └── Items/              ← stores item images (PNG/JPG)
│   └── js/
│       ├── item_view_modal.js  ← handles the “View” modal
│       └── list_items.js       ← handles loading and rendering of list tables
│
├── templates/
│   ├── index.html              ← main page
│   ├── partials/
│   │   ├── head.html
│   │   ├── nav.html
│   │   └── item_modal.html
│   └── sections/
│       ├── general_rules.html
│       ├── combat.html
│       ├── stats.html
│       ├── magic.html
│       └── lists.html
│
└── requirements.txt (optional for deployment)
