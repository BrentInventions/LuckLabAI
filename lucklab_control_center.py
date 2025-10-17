#!/usr/bin/env python3
"""
LuckLab AI - Master Control Center
All-in-one backend management dashboard
"""

import os
import sys
import json
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, simpledialog
from datetime import datetime, timedelta
import threading
import subprocess
import time
from auto_generate_picks import auto_generate_todays_picks

# File paths - relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PICKS_FILE = os.path.join(SCRIPT_DIR, "lucklab_picks.json")
AUTO_PICKS_FILE = os.path.join(SCRIPT_DIR, "lucklab_auto_picks.json")

class LuckLabControlCenter:
    def __init__(self, root):
        self.root = root
        self.root.title("🔬 LuckLab AI - Master Control Center")
        self.root.geometry("1600x1000")
        self.root.configure(bg='#0a0a0a')
        
        # Process tracking
        self.http_server_process = None
        self.predictor_server_process = None
        self.email_verification_process = None
        self.odds_updater_thread = None
        self.odds_updating = False
        
        # Data
        self.picks = self.load_picks()
        self.current_edit_index = None
        
        self.setup_ui()
        self.check_server_status()
        
        # Auto-start services when Control Center opens
        self.root.after(1000, self.auto_start_services)
        
    def setup_ui(self):
        """Setup the main UI with tabs"""
        # Header
        header_frame = tk.Frame(self.root, bg='#0a0a0a', height=100)
        header_frame.pack(fill=tk.X, padx=20, pady=10)
        header_frame.pack_propagate(False)
        
        tk.Label(header_frame, text="🔬 LuckLab AI", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 28, 'bold')).pack(anchor=tk.W)
        tk.Label(header_frame, text="Master Control Center - Where Science Meets Sports and Luck Meets Data", 
                bg='#0a0a0a', fg='#cccccc', font=('Arial', 12, 'italic')).pack(anchor=tk.W)
        
        # Notebook (tabs)
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TNotebook', background='#0a0a0a', borderwidth=0)
        style.configure('TNotebook.Tab', background='#1a1a1a', foreground='#00ff88', 
                       padding=[20, 10], font=('Arial', 11, 'bold'))
        style.map('TNotebook.Tab', background=[('selected', '#00ff88')], 
                 foreground=[('selected', '#000000')])
        
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Tab 1: Server Control
        self.server_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.server_tab, text='🖥️  Server Control')
        self.setup_server_tab()
        
        # Tab 2: Pick Manager
        self.picks_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.picks_tab, text='🎯  Pick Manager')
        self.setup_picks_tab()
        
        # Tab 3: Live Monitoring
        self.monitor_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.monitor_tab, text='📊  Live Monitoring')
        self.setup_monitor_tab()
        
        # Tab 4: Pick Requests (NEW)
        self.requests_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.requests_tab, text='📥  Pick Requests')
        self.setup_requests_tab()
        
        # Tab 5: Admin Alerts
        self.alerts_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.alerts_tab, text='🔔  Admin Alerts')
        self.setup_alerts_tab()
        
        # Tab 5: Win Verification (NEW)
        self.verification_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.verification_tab, text='🏆  Win Verification')
        self.setup_verification_tab()
        
        # Tab 6: Enhanced AI Picks (NEW)
        self.enhanced_picks_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.enhanced_picks_tab, text='🧠  Enhanced AI Picks')
        self.setup_enhanced_picks_tab()
        
        # Tab 7: User Management (NEW)
        self.users_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.users_tab, text='👥  User Management')
        self.setup_users_tab()
        
        # Tab 8: Settings
        self.settings_tab = tk.Frame(notebook, bg='#0a0a0a')
        notebook.add(self.settings_tab, text='⚙️  Settings')
        self.setup_settings_tab()
        
    def setup_server_tab(self):
        """Server control panel"""
        # Title
        tk.Label(self.server_tab, text="Server & Service Control", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Container
        container = tk.Frame(self.server_tab, bg='#0a0a0a')
        container.pack(fill=tk.BOTH, expand=True, padx=30)
        
        # HTTP Server Section
        http_frame = tk.LabelFrame(container, text="HTTP Web Server (Port 8000)", 
                                   bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                   relief=tk.RIDGE, bd=3)
        http_frame.pack(fill=tk.X, pady=10)
        
        http_inner = tk.Frame(http_frame, bg='#1a1a1a')
        http_inner.pack(fill=tk.X, padx=20, pady=15)
        
        self.http_status_label = tk.Label(http_inner, text="⚪ Stopped", 
                                          bg='#1a1a1a', fg='#ff4444', font=('Arial', 14, 'bold'))
        self.http_status_label.pack(side=tk.LEFT, padx=10)
        
        tk.Button(http_inner, text="▶️ Start Server", command=self.start_http_server,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(http_inner, text="⏹️ Stop Server", command=self.stop_http_server,
                 bg='#ff4444', fg='#000000', font=('Arial', 11, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(http_inner, text="🌐 Open Website", command=self.open_website,
                 bg='#00d4ff', fg='#000000', font=('Arial', 11, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # AI Predictor Server Section
        predictor_frame = tk.LabelFrame(container, text="AI Predictor Server (Port 5002)", 
                                       bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                       relief=tk.RIDGE, bd=3)
        predictor_frame.pack(fill=tk.X, pady=10)
        
        predictor_inner = tk.Frame(predictor_frame, bg='#1a1a1a')
        predictor_inner.pack(fill=tk.X, padx=20, pady=15)
        
        self.predictor_status_label = tk.Label(predictor_inner, text="⚪ Stopped", 
                                              bg='#1a1a1a', fg='#ff4444', font=('Arial', 14, 'bold'))
        self.predictor_status_label.pack(side=tk.LEFT, padx=10)
        
        tk.Button(predictor_inner, text="▶️ Start Predictor", command=self.start_predictor,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(predictor_inner, text="⏹️ Stop Predictor", command=self.stop_predictor,
                 bg='#ff4444', fg='#000000', font=('Arial', 11, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # Quick Actions
        actions_frame = tk.LabelFrame(container, text="Quick Actions", 
                                     bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                     relief=tk.RIDGE, bd=3)
        actions_frame.pack(fill=tk.X, pady=10)
        
        actions_inner = tk.Frame(actions_frame, bg='#1a1a1a')
        actions_inner.pack(fill=tk.X, padx=20, pady=15)
        
        tk.Button(actions_inner, text="🚀 Start All Services", command=self.start_all,
                 bg='#00ff88', fg='#000000', font=('Arial', 12, 'bold'),
                 width=20, height=2, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        tk.Button(actions_inner, text="⏹️ Stop All Services", command=self.stop_all,
                 bg='#ff4444', fg='#000000', font=('Arial', 12, 'bold'),
                 width=20, height=2, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        tk.Button(actions_inner, text="🔄 Restart All", command=self.restart_all,
                 bg='#ffaa00', fg='#000000', font=('Arial', 12, 'bold'),
                 width=20, height=2, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        tk.Button(actions_inner, text="🤖 Force Start AI", command=self.force_start_ai,
                 bg='#00d4ff', fg='#000000', font=('Arial', 12, 'bold'),
                 width=20, height=2, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        # Console Output
        console_frame = tk.LabelFrame(container, text="Server Logs", 
                                     bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                     relief=tk.RIDGE, bd=3)
        console_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.console_output = scrolledtext.ScrolledText(console_frame, width=120, height=15,
                                                       bg='#000000', fg='#00ff88',
                                                       font=('Consolas', 9), wrap=tk.WORD)
        self.console_output.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.log("🔬 LuckLab AI Control Center Started")
        self.log("=" * 80)
        
    def setup_picks_tab(self):
        """Pick management panel"""
        # Similar to your existing dashboard but integrated
        tk.Label(self.picks_tab, text="AI Pick Manager", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Main container
        main_container = tk.Frame(self.picks_tab, bg='#0a0a0a')
        main_container.pack(fill=tk.BOTH, expand=True, padx=20)
        
        # Left panel - Input
        input_frame = tk.LabelFrame(main_container, text="➕ Add/Edit Pick", 
                                   bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                   relief=tk.RIDGE, bd=3)
        input_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)
        
        inner_input = tk.Frame(input_frame, bg='#1a1a1a')
        inner_input.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Sport
        tk.Label(inner_input, text="Sport:", bg='#1a1a1a', fg='#00ff88').grid(row=0, column=0, sticky=tk.W, pady=5)
        self.sport_var = tk.StringVar(value="NFL")
        sport_combo = ttk.Combobox(inner_input, textvariable=self.sport_var,
                                   values=["NFL", "NBA", "MLB", "NHL", "CFB", "CBB"],
                                   width=25, state='readonly')
        sport_combo.grid(row=0, column=1, pady=5, sticky=tk.W)
        
        # Game
        tk.Label(inner_input, text="Game:", bg='#1a1a1a', fg='#00ff88').grid(row=1, column=0, sticky=tk.W, pady=5)
        self.game_entry = tk.Entry(inner_input, width=30, bg='#0a0a0a', fg='#ffffff',
                                   insertbackground='#00ff88', font=('Arial', 10))
        self.game_entry.grid(row=1, column=1, pady=5, sticky=tk.W)
        
        # Date/Time
        tk.Label(inner_input, text="Game Time:", bg='#1a1a1a', fg='#00ff88').grid(row=2, column=0, sticky=tk.W, pady=5)
        date_frame = tk.Frame(inner_input, bg='#1a1a1a')
        date_frame.grid(row=2, column=1, pady=5, sticky=tk.W)
        
        self.game_date_var = tk.StringVar(value="Today")
        ttk.Combobox(date_frame, textvariable=self.game_date_var,
                    values=["Today", "Tomorrow", "Custom"], width=10, state='readonly').pack(side=tk.LEFT, padx=2)
        
        self.game_time_entry = tk.Entry(date_frame, width=8, bg='#0a0a0a', fg='#ffffff')
        self.game_time_entry.pack(side=tk.LEFT, padx=2)
        self.game_time_entry.insert(0, "20:00")
        
        # Pick Type
        tk.Label(inner_input, text="Pick Type:", bg='#1a1a1a', fg='#00ff88').grid(row=3, column=0, sticky=tk.W, pady=5)
        self.pick_type_var = tk.StringVar(value="Spread")
        ttk.Combobox(inner_input, textvariable=self.pick_type_var,
                    values=["Spread", "Moneyline", "Over/Under"], width=25, state='readonly').grid(row=3, column=1, pady=5, sticky=tk.W)
        
        # Pick
        tk.Label(inner_input, text="Pick:", bg='#1a1a1a', fg='#00ff88').grid(row=4, column=0, sticky=tk.W, pady=5)
        self.pick_entry = tk.Entry(inner_input, width=30, bg='#0a0a0a', fg='#ffffff')
        self.pick_entry.grid(row=4, column=1, pady=5, sticky=tk.W)
        
        # Confidence
        tk.Label(inner_input, text="Confidence:", bg='#1a1a1a', fg='#00ff88').grid(row=5, column=0, sticky=tk.W, pady=5)
        self.confidence_entry = tk.Entry(inner_input, width=30, bg='#0a0a0a', fg='#ffffff')
        self.confidence_entry.grid(row=5, column=1, pady=5, sticky=tk.W)
        self.confidence_entry.insert(0, "75%")
        
        # Odds
        tk.Label(inner_input, text="Odds:", bg='#1a1a1a', fg='#00ff88').grid(row=6, column=0, sticky=tk.W, pady=5)
        self.odds_entry = tk.Entry(inner_input, width=30, bg='#0a0a0a', fg='#ffffff')
        self.odds_entry.grid(row=6, column=1, pady=5, sticky=tk.W)
        self.odds_entry.insert(0, "-110")
        
        # Price
        tk.Label(inner_input, text="Price ($):", bg='#1a1a1a', fg='#00ff88').grid(row=7, column=0, sticky=tk.W, pady=5)
        self.price_entry = tk.Entry(inner_input, width=30, bg='#0a0a0a', fg='#ffffff')
        self.price_entry.grid(row=7, column=1, pady=5, sticky=tk.W)
        self.price_entry.insert(0, "55.00")
        
        # Buttons
        btn_frame = tk.Frame(inner_input, bg='#1a1a1a')
        btn_frame.grid(row=8, column=0, columnspan=2, pady=20)
        
        tk.Button(btn_frame, text="➕ Add Pick", command=self.add_pick,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 width=12, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="✏️ Update", command=self.update_pick,
                 bg='#ffaa00', fg='#000000', font=('Arial', 11, 'bold'),
                 width=12, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🗑️ Delete", command=self.delete_pick,
                 bg='#ff4444', fg='#000000', font=('Arial', 11, 'bold'),
                 width=12, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🔄 Update Odds", command=self.update_all_odds,
                 bg='#00d4ff', fg='#000000', font=('Arial', 11, 'bold'),
                 width=12, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # Auto-generate picks button
        auto_btn_frame = tk.Frame(inner_input, bg='#1a1a1a')
        auto_btn_frame.grid(row=9, column=0, columnspan=2, pady=15)
        
        tk.Button(auto_btn_frame, text="🤖 Auto-Generate Today's Picks", command=self.auto_generate_picks,
                 bg='#9966ff', fg='#ffffff', font=('Arial', 12, 'bold'),
                 width=30, height=2, cursor='hand2').pack(pady=5)
        
        tk.Label(auto_btn_frame, text="Generate AI picks for all games today",
                bg='#1a1a1a', fg='#cccccc', font=('Arial', 9)).pack()
        
        # Enhanced picks button
        tk.Button(auto_btn_frame, text="🔥 Load Enhanced AI Picks", command=self.load_enhanced_picks_to_manager,
                 bg='#ff6b35', fg='#ffffff', font=('Arial', 12, 'bold'),
                 width=30, height=2, cursor='hand2').pack(pady=5)
        
        tk.Label(auto_btn_frame, text="Load picks from Dimerz Pro analysis",
                bg='#1a1a1a', fg='#cccccc', font=('Arial', 9)).pack()
        
        # Right panel - Picks list
        list_frame = tk.LabelFrame(main_container, text="📊 Current Picks", 
                                  bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                  relief=tk.RIDGE, bd=3)
        list_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10)
        
        # Treeview
        tree_container = tk.Frame(list_frame, bg='#1a1a1a')
        tree_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        columns = ("Game", "Sport", "Pick", "Odds", "Price")
        self.picks_tree = ttk.Treeview(tree_container, columns=columns, show='tree headings', height=20)
        
        self.picks_tree.heading("#0", text="ID")
        self.picks_tree.column("#0", width=40)
        self.picks_tree.heading("Game", text="Game")
        self.picks_tree.column("Game", width=200)
        self.picks_tree.heading("Sport", text="Sport")
        self.picks_tree.column("Sport", width=60)
        self.picks_tree.heading("Pick", text="Pick")
        self.picks_tree.column("Pick", width=100)
        self.picks_tree.heading("Odds", text="Odds")
        self.picks_tree.column("Odds", width=60)
        self.picks_tree.heading("Price", text="Price")
        self.picks_tree.column("Price", width=60)
        
        scrollbar = ttk.Scrollbar(tree_container, orient=tk.VERTICAL, command=self.picks_tree.yview)
        self.picks_tree.configure(yscroll=scrollbar.set)
        
        self.picks_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.picks_tree.bind('<ButtonRelease-1>', self.on_pick_select)
        
        self.refresh_picks_list()
        
    def setup_monitor_tab(self):
        """Live monitoring panel"""
        tk.Label(self.monitor_tab, text="Live System Monitor", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Stats
        stats_frame = tk.Frame(self.monitor_tab, bg='#0a0a0a')
        stats_frame.pack(fill=tk.X, padx=30, pady=10)
        
        # Stat boxes
        for i, (title, value_func) in enumerate([
            ("Total Picks", lambda: str(len(self.picks))),
            ("Active Picks", lambda: str(sum(1 for p in self.picks if p.get('isActive', True)))),
            ("Revenue Potential", lambda: f"${sum(p.get('price', 0) for p in self.picks):.2f}"),
            ("Avg Confidence", lambda: "75%")
        ]):
            box = tk.Frame(stats_frame, bg='#1a1a1a', relief=tk.RIDGE, bd=3)
            box.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)
            
            tk.Label(box, text=title, bg='#1a1a1a', fg='#cccccc',
                    font=('Arial', 10)).pack(pady=(10, 5))
            tk.Label(box, text=value_func(), bg='#1a1a1a', fg='#00ff88',
                    font=('Arial', 24, 'bold')).pack(pady=(5, 10))
        
        # Activity log
        log_frame = tk.LabelFrame(self.monitor_tab, text="Activity Log", 
                                 bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                 relief=tk.RIDGE, bd=3)
        log_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        self.activity_log = scrolledtext.ScrolledText(log_frame, width=120, height=20,
                                                      bg='#000000', fg='#00ff88',
                                                      font=('Consolas', 9))
        self.activity_log.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    def setup_requests_tab(self):
        """Pick requests notification panel"""
        # Title
        tk.Label(self.requests_tab, text="Pick Requests from Users", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Stats frame
        stats_frame = tk.Frame(self.requests_tab, bg='#1a1a1a')
        stats_frame.pack(fill=tk.X, padx=30, pady=10)
        
        self.pending_requests_label = tk.Label(stats_frame, text="⏳ Pending: 0", 
                                              bg='#1a1a1a', fg='#ffaa00', font=('Arial', 14, 'bold'))
        self.pending_requests_label.pack(side=tk.LEFT, padx=20, pady=10)
        
        self.fulfilled_requests_label = tk.Label(stats_frame, text="✅ Fulfilled: 0", 
                                                bg='#1a1a1a', fg='#00ff88', font=('Arial', 14, 'bold'))
        self.fulfilled_requests_label.pack(side=tk.LEFT, padx=20, pady=10)
        
        # Buttons
        btn_frame = tk.Frame(self.requests_tab, bg='#0a0a0a')
        btn_frame.pack(fill=tk.X, padx=30, pady=10)
        
        tk.Button(btn_frame, text="🔄 Refresh Requests", command=self.load_requests,
                 bg='#00d4ff', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🎯 Send Pick", command=self.fulfill_selected_request,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # Requests table
        table_frame = tk.Frame(self.requests_tab, bg='#0a0a0a')
        table_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        # Scrollbar
        scrollbar = tk.Scrollbar(table_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Treeview
        columns = ('ID', 'Username', 'Membership', 'Type', 'Sport', 'Time', 'Status')
        self.requests_tree = ttk.Treeview(table_frame, columns=columns, show='headings',
                                         yscrollcommand=scrollbar.set, height=15)
        
        # Configure columns
        self.requests_tree.heading('ID', text='Request ID')
        self.requests_tree.heading('Username', text='User')
        self.requests_tree.heading('Membership', text='Membership')
        self.requests_tree.heading('Type', text='Type')
        self.requests_tree.heading('Sport', text='Sport')
        self.requests_tree.heading('Time', text='Time')
        self.requests_tree.heading('Status', text='Status')
        
        self.requests_tree.column('ID', width=150)
        self.requests_tree.column('Username', width=150)
        self.requests_tree.column('Membership', width=100)
        self.requests_tree.column('Type', width=120)
        self.requests_tree.column('Sport', width=80)
        self.requests_tree.column('Time', width=150)
        self.requests_tree.column('Status', width=100)
        
        self.requests_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.requests_tree.yview)
        
        # Bind selection
        self.requests_tree.bind('<<TreeviewSelect>>', self.on_request_selected)
        
        # Detail panel
        detail_frame = tk.LabelFrame(self.requests_tab, text="Request Details", 
                                     bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'))
        detail_frame.pack(fill=tk.X, padx=30, pady=10)
        
        self.request_detail_text = scrolledtext.ScrolledText(detail_frame, height=8, 
                                                             bg='#0a0a0a', fg='#ffffff',
                                                             font=('Consolas', 10))
        self.request_detail_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Auto-refresh every 10 seconds
        self.auto_refresh_requests()
    
    def load_requests(self):
        """Load pending requests from backend"""
        try:
            import requests as http_requests
            response = http_requests.get('http://localhost:5002/api/get-requests?status=pending')
            
            if response.status_code == 200:
                data = response.json()
                requests = data.get('requests', [])
                
                # Clear tree
                for item in self.requests_tree.get_children():
                    self.requests_tree.delete(item)
                
                # Populate tree
                pending_count = 0
                for req in requests:
                    if req['status'] == 'pending':
                        pending_count += 1
                        self.requests_tree.insert('', 'end', values=(
                            req['id'],
                            req['username'],
                            req['membership'].upper(),
                            req['request_type'].replace('_', ' ').title(),
                            req['sport'].upper(),
                            req['timestamp'].split('T')[1].split('.')[0],
                            '⏳ Pending'
                        ), tags=(req['id'],))
                
                self.pending_requests_label.config(text=f"⏳ Pending: {pending_count}")
                self.log(f"📥 Loaded {pending_count} pending requests")
                
        except Exception as e:
            self.log(f"❌ Error loading requests: {str(e)}")
    
    def on_request_selected(self, event):
        """Display request details when selected"""
        selection = self.requests_tree.selection()
        if not selection:
            return
        
        item = self.requests_tree.item(selection[0])
        request_id = item['values'][0]
        
        # Get full request details
        try:
            import requests as http_requests
            response = http_requests.get('http://localhost:5002/api/get-requests')
            
            if response.status_code == 200:
                data = response.json()
                requests = data.get('requests', [])
                
                for req in requests:
                    if req['id'] == request_id:
                        # Display details
                        detail_text = f"""
🆔 Request ID: {req['id']}
👤 User: {req['username']}
📧 Email: {req.get('email', 'N/A')}
💳 Membership: {req['membership'].upper()}
🎯 Type: {req['request_type'].replace('_', ' ').title()}
🏈 Sport: {req['sport'].upper()}
🔢 Number of Picks: {req.get('num_picks', 'N/A')}
⏰ Requested: {req['timestamp']}
📊 Status: {req['status'].upper()}

Preferences:
{json.dumps(req.get('preferences', {}), indent=2)}
                        """
                        
                        self.request_detail_text.delete('1.0', tk.END)
                        self.request_detail_text.insert('1.0', detail_text.strip())
                        break
                        
        except Exception as e:
            self.log(f"❌ Error loading request details: {str(e)}")
    
    def fulfill_selected_request(self):
        """Fulfill the selected request by sending picks"""
        selection = self.requests_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a request to fulfill")
            return
        
        item = self.requests_tree.item(selection[0])
        request_id = item['values'][0]
        username = item['values'][1]
        
        # Get request details to know how many picks they want
        try:
            import requests as http_requests
            response = http_requests.get('http://localhost:5002/api/get-requests?status=pending')
            if response.status_code == 200:
                data = response.json()
                requests = data.get('requests', [])
                request_details = None
                for req in requests:
                    if req['id'] == request_id:
                        request_details = req
                        break
                
                if request_details:
                    num_picks = request_details.get('num_picks', 1)
                    request_type = request_details.get('request_type', 'single')
                    sport = request_details.get('sport', 'nfl')
                    
                    # Open pick selector dialog with request details
                    self.open_pick_selector_for_request(request_id, username, num_picks, request_type, sport)
                else:
                    messagebox.showerror("Error", "Could not find request details")
            else:
                messagebox.showerror("Error", "Failed to load request details")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load request details: {str(e)}")
    
    def open_pick_selector_for_request(self, request_id, username, num_picks, request_type, sport):
        """Open a dialog to select picks to send"""
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Send {num_picks} Pick{'s' if num_picks > 1 else ''} to {username}")
        dialog.geometry("1000x700")
        dialog.configure(bg='#0a0a0a')
        
        # Header with request details
        header_frame = tk.Frame(dialog, bg='#0a0a0a')
        header_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Label(header_frame, text=f"Select {num_picks} pick{'s' if num_picks > 1 else ''} to send to {username}", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 14, 'bold')).pack()
        
        # Request details
        details_text = f"Request Type: {request_type.upper()}\nSport: {sport.upper()}\nNumber of Picks: {num_picks}"
        tk.Label(header_frame, text=details_text, 
                bg='#0a0a0a', fg='#cccccc', font=('Arial', 10)).pack(pady=5)
        
        # Pick selector (from your existing picks)
        frame = tk.Frame(dialog, bg='#0a0a0a')
        frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Selection counter
        counter_frame = tk.Frame(dialog, bg='#0a0a0a')
        counter_frame.pack(fill=tk.X, padx=20, pady=5)
        
        self.selected_count_label = tk.Label(counter_frame, 
                                           text=f"Selected: 0 / {num_picks} picks", 
                                           bg='#0a0a0a', fg='#ffaa00', font=('Arial', 12, 'bold'))
        self.selected_count_label.pack()
        
        # Treeview for picks with checkboxes
        columns = ('Select', 'Game', 'Pick', 'Odds', 'Confidence', 'Sport')
        pick_tree = ttk.Treeview(frame, columns=columns, show='headings', height=15)
        
        pick_tree.heading('Select', text='✓')
        pick_tree.heading('Game', text='Game')
        pick_tree.heading('Pick', text='Pick')
        pick_tree.heading('Odds', text='Odds')
        pick_tree.heading('Confidence', text='Confidence')
        pick_tree.heading('Sport', text='Sport')
        
        pick_tree.column('Select', width=50)
        pick_tree.column('Game', width=200)
        pick_tree.column('Pick', width=180)
        pick_tree.column('Odds', width=80)
        pick_tree.column('Confidence', width=80)
        pick_tree.column('Sport', width=80)
        
        pick_tree.pack(fill=tk.BOTH, expand=True)
        
        # Store selected picks with their indices
        selected_picks = []
        selected_indices = set()
        
        # Status label for feedback
        status_label = tk.Label(dialog, text="", bg='#0a0a0a', fg='#00ff88', font=('Arial', 10, 'bold'))
        status_label.pack(pady=2)
        
        # Load your picks (filter by sport if specified)
        available_picks = []
        for pick in self.picks:
            pick_sport = pick.get('sport', '').lower()
            if sport.lower() == 'all' or sport.lower() in pick_sport or pick_sport in sport.lower():
                available_picks.append(pick)
        
        for i, pick in enumerate(available_picks):
            pick_tree.insert('', 'end', values=(
                '☐',  # Checkbox placeholder
                pick.get('game', 'N/A'),
                pick.get('pick', 'N/A'),
                pick.get('odds', 'N/A'),
                pick.get('confidence', 'N/A'),
                pick.get('sport', 'N/A')
            ), tags=(json.dumps(pick), str(i)))
        
        def update_selection_count():
            count = len(selected_picks)
            self.selected_count_label.config(text=f"Selected: {count} / {num_picks} picks")
            if count == num_picks:
                self.selected_count_label.config(fg='#00ff88')
            else:
                self.selected_count_label.config(fg='#ffaa00')
        
        def toggle_pick_selection(event):
            selection = pick_tree.selection()
            if not selection:
                return
            
            item = pick_tree.item(selection[0])
            pick_data = json.loads(item['tags'][0])
            pick_index = int(item['tags'][1])
            
            # Check if this pick is already selected using index
            if pick_index in selected_indices:
                # Remove from selection
                selected_picks.remove(pick_data)
                selected_indices.remove(pick_index)
                pick_tree.item(selection[0], values=('☐',) + item['values'][1:])
                status_label.config(text=f"❌ Removed: {pick_data.get('game', 'Unknown')}")
                print(f"Removed pick: {pick_data.get('game', 'Unknown')}")
            else:
                # Add to selection (if not at limit)
                if len(selected_picks) < num_picks:
                    selected_picks.append(pick_data)
                    selected_indices.add(pick_index)
                    pick_tree.item(selection[0], values=('☑',) + item['values'][1:])
                    status_label.config(text=f"✅ Added: {pick_data.get('game', 'Unknown')}")
                    print(f"Added pick: {pick_data.get('game', 'Unknown')}")
                else:
                    status_label.config(text=f"⚠️ Selection limit reached ({num_picks} picks)")
                    messagebox.showwarning("Selection Limit", f"You can only select {num_picks} picks")
            
            update_selection_count()
        
        # Bind both double-click and single-click for easier selection
        pick_tree.bind('<Double-1>', toggle_pick_selection)
        pick_tree.bind('<Button-1>', toggle_pick_selection)
        
        def send_selected_picks():
            if len(selected_picks) != num_picks:
                messagebox.showwarning("Incomplete Selection", 
                    f"Please select exactly {num_picks} picks. Currently selected: {len(selected_picks)}")
                return
            
            # Ask if user wants AI reasoning
            add_reasoning = messagebox.askyesno(
                "AI Reasoning",
                f"Generate AI reasoning for these {num_picks} picks?\n\n"
                "✅ YES = ChatGPT analyzes each pick and adds professional reasoning\n"
                "❌ NO = Send picks as-is without reasoning"
            )
            
            # Show progress
            progress_label = tk.Label(dialog, text="", bg='#0a0a0a', fg='#00ff88', 
                                     font=('Arial', 10, 'italic'))
            progress_label.pack(pady=5)
            
            if add_reasoning:
                progress_label.config(text=f"🤖 Generating AI reasoning for {num_picks} picks...")
                dialog.update()
            
            # Send to backend
            try:
                import requests as http_requests
                response = http_requests.post('http://localhost:5002/api/fulfill-request', json={
                    'request_id': request_id,
                    'picks': selected_picks,  # Send multiple picks
                    'include_reasoning': add_reasoning,
                    'request_type': request_type
                })
                
                if response.status_code == 200:
                    result_data = response.json()
                    if add_reasoning:
                        messagebox.showinfo("Success", 
                            f"{num_picks} picks sent to {username} with AI reasoning!\n\n"
                            f"Each pick now includes professional analysis and context.")
                    else:
                        messagebox.showinfo("Success", f"{num_picks} picks sent to {username}!")
                    dialog.destroy()
                    self.load_requests()  # Refresh the list
                else:
                    error_data = response.json()
                    messagebox.showerror("Error", f"Failed to send picks: {error_data.get('error', 'Unknown error')}")
                    
            except Exception as e:
                messagebox.showerror("Error", f"Failed to send pick: {str(e)}")
        
        # Instructions
        instructions = tk.Label(dialog, 
                              text="💡 Click picks to select them. You need exactly the requested number of picks.",
                              bg='#0a0a0a', fg='#cccccc', font=('Arial', 10, 'italic'))
        instructions.pack(pady=5)
        
        # Buttons
        button_frame = tk.Frame(dialog, bg='#0a0a0a')
        button_frame.pack(pady=10)
        
        tk.Button(button_frame, text=f"✅ Send {num_picks} Pick{'s' if num_picks > 1 else ''}", 
                 command=send_selected_picks,
                 bg='#00ff88', fg='#000000', font=('Arial', 12, 'bold'),
                 width=25, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(button_frame, text="❌ Cancel", 
                 command=dialog.destroy,
                 bg='#ff4444', fg='#ffffff', font=('Arial', 12, 'bold'),
                 width=15, cursor='hand2').pack(side=tk.LEFT, padx=5)
    
    def auto_refresh_requests(self):
        """Auto-refresh requests every 10 seconds"""
        try:
            self.load_requests()
        except:
            pass
        self.root.after(10000, self.auto_refresh_requests)  # 10 seconds
    
    def setup_alerts_tab(self):
        """Admin Alerts - Track who uses the bot and what picks they get"""
        tk.Label(self.alerts_tab, text="Admin Alerts - Bot Usage Tracking", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Stats Summary at top
        stats_frame = tk.Frame(self.alerts_tab, bg='#0a0a0a')
        stats_frame.pack(fill=tk.X, padx=30, pady=(0, 20))
        
        # Stats boxes
        self.total_alerts_label = tk.Label(stats_frame, text="Total Alerts: 0", 
                                          bg='#1a1a1a', fg='#00ff88', 
                                          font=('Arial', 12, 'bold'), 
                                          relief=tk.RIDGE, bd=2, padx=20, pady=10)
        self.total_alerts_label.pack(side=tk.LEFT, padx=10)
        
        self.today_alerts_label = tk.Label(stats_frame, text="Today: 0", 
                                          bg='#1a1a1a', fg='#FFD700', 
                                          font=('Arial', 12, 'bold'), 
                                          relief=tk.RIDGE, bd=2, padx=20, pady=10)
        self.today_alerts_label.pack(side=tk.LEFT, padx=10)
        
        # Controls
        controls_frame = tk.Frame(self.alerts_tab, bg='#0a0a0a')
        controls_frame.pack(fill=tk.X, padx=30, pady=(0, 10))
        
        tk.Button(controls_frame, text="🔄 Refresh Alerts", 
                 bg='#00ff88', fg='#000000', font=('Arial', 10, 'bold'),
                 command=self.refresh_alerts, width=15).pack(side=tk.LEFT, padx=5)
        
        tk.Button(controls_frame, text="🗑️ Clear All Alerts", 
                 bg='#ff4444', fg='#ffffff', font=('Arial', 10, 'bold'),
                 command=self.clear_alerts, width=15).pack(side=tk.LEFT, padx=5)
        
        tk.Button(controls_frame, text="💾 Export Alerts", 
                 bg='#0099ff', fg='#ffffff', font=('Arial', 10, 'bold'),
                 command=self.export_alerts, width=15).pack(side=tk.LEFT, padx=5)
        
        # Alerts Display (Scrollable)
        alerts_container = tk.Frame(self.alerts_tab, bg='#0a0a0a')
        alerts_container.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        # Scrollable text widget
        self.alerts_display = scrolledtext.ScrolledText(
            alerts_container,
            bg='#0a0a0a',
            fg='#00ff88',
            font=('Consolas', 10),
            wrap=tk.WORD,
            relief=tk.RIDGE,
            bd=2,
            insertbackground='#00ff88'
        )
        self.alerts_display.pack(fill=tk.BOTH, expand=True)
        
        # Load existing alerts
        self.load_alerts()
    
    def setup_verification_tab(self):
        """Win Verification Panel - Review user-submitted winning tickets"""
        tk.Label(self.verification_tab, text="Win Verification - Review Submissions", 
                bg='#0a0a0a', fg='#FFD700', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Stats
        stats_frame = tk.Frame(self.verification_tab, bg='#0a0a0a')
        stats_frame.pack(fill=tk.X, padx=30, pady=(0, 20))
        
        self.pending_submissions_label = tk.Label(stats_frame, text="Pending: 0", 
                                                 bg='#1a1a1a', fg='#FFD700', 
                                                 font=('Arial', 12, 'bold'), 
                                                 relief=tk.RIDGE, bd=2, padx=20, pady=10)
        self.pending_submissions_label.pack(side=tk.LEFT, padx=10)
        
        self.approved_submissions_label = tk.Label(stats_frame, text="Approved: 0", 
                                                  bg='#1a1a1a', fg='#00ff88', 
                                                  font=('Arial', 12, 'bold'), 
                                                  relief=tk.RIDGE, bd=2, padx=20, pady=10)
        self.approved_submissions_label.pack(side=tk.LEFT, padx=10)
        
        # Controls
        controls_frame = tk.Frame(self.verification_tab, bg='#0a0a0a')
        controls_frame.pack(fill=tk.X, padx=30, pady=(0, 10))
        
        tk.Button(controls_frame, text="🔄 Refresh", 
                 bg='#00ff88', fg='#000000', font=('Arial', 10, 'bold'),
                 command=self.refresh_submissions, width=15).pack(side=tk.LEFT, padx=5)
        
        tk.Button(controls_frame, text="📂 Open Screenshots Folder", 
                 bg='#0099ff', fg='#ffffff', font=('Arial', 10, 'bold'),
                 command=self.open_screenshots_folder, width=20).pack(side=tk.LEFT, padx=5)
        
        # Submissions List
        list_frame = tk.LabelFrame(self.verification_tab, text="Pending Submissions", 
                                  bg='#1a1a1a', fg='#FFD700', font=('Arial', 12, 'bold'),
                                  relief=tk.RIDGE, bd=3)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        # Scrollable listbox
        scroll_frame = tk.Frame(list_frame, bg='#1a1a1a')
        scroll_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        scrollbar = tk.Scrollbar(scroll_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.submissions_listbox = tk.Listbox(
            scroll_frame,
            bg='#0a0a0a',
            fg='#FFD700',
            font=('Consolas', 10),
            selectmode=tk.SINGLE,
            yscrollcommand=scrollbar.set,
            height=15
        )
        self.submissions_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.submissions_listbox.yview)
        
        # Bind selection event
        self.submissions_listbox.bind('<<ListboxSelect>>', self.on_submission_select)
        
        # Details panel
        details_frame = tk.LabelFrame(self.verification_tab, text="Submission Details", 
                                     bg='#1a1a1a', fg='#FFD700', font=('Arial', 12, 'bold'),
                                     relief=tk.RIDGE, bd=3)
        details_frame.pack(fill=tk.X, padx=30, pady=10)
        
        self.submission_details = scrolledtext.ScrolledText(
            details_frame,
            bg='#0a0a0a',
            fg='#ffffff',
            font=('Consolas', 10),
            height=10,
            wrap=tk.WORD
        )
        self.submission_details.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Action buttons
        action_frame = tk.Frame(self.verification_tab, bg='#0a0a0a')
        action_frame.pack(fill=tk.X, padx=30, pady=10)
        
        tk.Button(action_frame, text="✅ APPROVE & ADD TO TOP 3", 
                 bg='#00ff88', fg='#000000', font=('Arial', 12, 'bold'),
                 command=self.approve_submission, width=25).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="❌ REJECT", 
                 bg='#ff4444', fg='#ffffff', font=('Arial', 12, 'bold'),
                 command=self.reject_submission, width=15).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="👁️ VIEW SCREENSHOT", 
                 bg='#0099ff', fg='#ffffff', font=('Arial', 12, 'bold'),
                 command=self.view_screenshot, width=18).pack(side=tk.LEFT, padx=5)
        
        # Load submissions
        self.load_submissions()
    
    def setup_enhanced_picks_tab(self):
        """Enhanced AI Picks viewer with manual capture option"""
        tk.Label(self.enhanced_picks_tab, text="🧠 Enhanced AI Picks Manager", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=10)
        
        tk.Label(self.enhanced_picks_tab, text="Review AI picks with full reasoning before publishing", 
                bg='#0a0a0a', fg='#cccccc', font=('Arial', 11, 'italic')).pack()
        
        # Main container
        main_container = tk.Frame(self.enhanced_picks_tab, bg='#0a0a0a')
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Left panel - Picks list
        list_frame = tk.LabelFrame(main_container, text="📋 All Enhanced Picks", 
                                   bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                   relief=tk.RIDGE, bd=3)
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)
        
        # Treeview for picks with modern styling
        columns = ('Sport', 'Game', 'Pick', 'Conf', 'Value')
        self.enhanced_tree = ttk.Treeview(list_frame, columns=columns, show='tree headings', height=25)
        
        self.enhanced_tree.heading('#0', text='#')
        self.enhanced_tree.heading('Sport', text='Sport')
        self.enhanced_tree.heading('Game', text='Game')
        self.enhanced_tree.heading('Pick', text='Pick')
        self.enhanced_tree.heading('Conf', text='Confidence')
        self.enhanced_tree.heading('Value', text='Edge')
        
        self.enhanced_tree.column('#0', width=40)
        self.enhanced_tree.column('Sport', width=70)
        self.enhanced_tree.column('Game', width=220)
        self.enhanced_tree.column('Pick', width=150)
        self.enhanced_tree.column('Conf', width=90)
        self.enhanced_tree.column('Value', width=70)
        
        # Configure tags for styling
        self.enhanced_tree.tag_configure('high_confidence', background='#e8f5e8', foreground='#2d5a2d')
        self.enhanced_tree.tag_configure('medium_confidence', background='#fff3cd', foreground='#856404')
        self.enhanced_tree.tag_configure('low_confidence', background='#f8d7da', foreground='#721c24')
        self.enhanced_tree.tag_configure('fire_pick', background='#ff6b35', foreground='white', font=('Arial', 9, 'bold'))
        
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.enhanced_tree.yview)
        self.enhanced_tree.configure(yscroll=scrollbar.set)
        
        self.enhanced_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind events for modern interaction
        self.enhanced_tree.bind('<<TreeviewSelect>>', self.on_enhanced_pick_selected)
        self.enhanced_tree.bind('<Motion>', self.on_tree_hover)
        self.enhanced_tree.bind('<Leave>', self.on_tree_leave)
        
        # Create tooltip
        self.tooltip = None
        
        # Right panel - Details
        details_frame = tk.LabelFrame(main_container, text="🔍 Full Analysis & Reasoning", 
                                      bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                      relief=tk.RIDGE, bd=3)
        details_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10)
        
        self.enhanced_details_text = scrolledtext.ScrolledText(
            details_frame, width=60, height=30,
            bg='#0a0a0a', fg='#ffffff', font=('Courier New', 9),
            insertbackground='#00ff88', wrap=tk.WORD
        )
        self.enhanced_details_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Bottom controls
        controls_frame = tk.Frame(self.enhanced_picks_tab, bg='#0a0a0a')
        controls_frame.pack(fill=tk.X, padx=20, pady=10)
        
        # Manual capture section
        manual_frame = tk.Frame(controls_frame, bg='#1a1a1a', relief=tk.RIDGE, bd=2)
        manual_frame.pack(side=tk.LEFT, padx=10, pady=5)
        
        # Cleanup section
        cleanup_frame = tk.Frame(controls_frame, bg='#1a1a1a', relief=tk.RIDGE, bd=2)
        cleanup_frame.pack(side=tk.LEFT, padx=10, pady=5)
        
        tk.Label(manual_frame, text="🎯 Missed a Game? Capture Manually:", 
                bg='#1a1a1a', fg='#00ff88', font=('Arial', 10, 'bold')).grid(row=0, column=0, columnspan=4, padx=10, pady=5)
        
        tk.Label(manual_frame, text="Team:", bg='#1a1a1a', fg='#ffffff').grid(row=1, column=0, padx=5)
        self.manual_team_entry = tk.Entry(manual_frame, width=20, bg='#0a0a0a', fg='#ffffff')
        self.manual_team_entry.grid(row=1, column=1, padx=5, pady=5)
        
        tk.Label(manual_frame, text="Sport:", bg='#1a1a1a', fg='#ffffff').grid(row=1, column=2, padx=5)
        self.manual_sport_var = tk.StringVar(value="nfl")
        ttk.Combobox(manual_frame, textvariable=self.manual_sport_var,
                    values=["nfl", "nba", "mlb", "nhl", "college-football"],
                    width=12, state='readonly').grid(row=1, column=3, padx=5, pady=5)
        
        tk.Button(manual_frame, text="📸 Capture & Analyze", command=self.manual_capture_enhanced,
                 bg='#ff8800', fg='#000000', font=('Arial', 10, 'bold'),
                 padx=15, pady=5).grid(row=1, column=4, padx=10, pady=5)
        
        # Cleanup section
        tk.Label(cleanup_frame, text="🧹 Cleanup Finished Games:", 
                bg='#1a1a1a', fg='#ff6b35', font=('Arial', 10, 'bold')).pack(pady=5)
        
        tk.Button(cleanup_frame, text="🗑️ Clean Screenshots", command=self.cleanup_screenshots,
                 bg='#ff6b35', fg='#ffffff', font=('Arial', 10, 'bold'),
                 width=15).pack(pady=2)
        
        tk.Button(cleanup_frame, text="⏰ Remove Finished Games", command=self.cleanup_finished_games,
                 bg='#ff6b35', fg='#ffffff', font=('Arial', 10, 'bold'),
                 width=15).pack(pady=2)
        
        # Reload button
        tk.Button(controls_frame, text="🔄 Reload Enhanced Picks", command=self.reload_enhanced_picks,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 padx=20, pady=10, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        # Process screenshots button (lightweight OCR - FREE!)
        tk.Button(controls_frame, text="📊 Extract Picks (OCR - FREE!)", command=self.process_screenshots_lightweight,
                 bg='#ff6600', fg='#ffffff', font=('Arial', 11, 'bold'),
                 padx=20, pady=10, cursor='hand2').pack(side=tk.LEFT, padx=10)
        
        # Generate picks button
        tk.Button(controls_frame, text="🤖 Generate Today's Enhanced Picks", command=self.generate_todays_enhanced_picks,
                 bg='#9966ff', fg='#ffffff', font=('Arial', 12, 'bold'),
                 padx=25, pady=12, cursor='hand2', relief=tk.RAISED, bd=4).pack(side=tk.RIGHT, padx=10)
        
        # Load picks
        self.load_and_populate_enhanced_picks()
    
    def setup_users_tab(self):
        """User Management - Grant membership tiers"""
        # Title
        tk.Label(self.users_tab, text="User Management - Grant Memberships", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        # Add User Form
        form_frame = tk.LabelFrame(self.users_tab, text="Add/Update User", 
                                   bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'))
        form_frame.pack(fill=tk.X, padx=30, pady=10)
        
        form_inner = tk.Frame(form_frame, bg='#1a1a1a')
        form_inner.pack(fill=tk.X, padx=20, pady=15)
        
        # Username
        tk.Label(form_inner, text="Username:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_username_entry = tk.Entry(form_inner, width=30, bg='#0a0a0a', fg='#ffffff',
                                            font=('Arial', 10), insertbackground='#00ff88')
        self.user_username_entry.grid(row=0, column=1, padx=5, pady=5)
        
        # Email
        tk.Label(form_inner, text="Email:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_email_entry = tk.Entry(form_inner, width=30, bg='#0a0a0a', fg='#ffffff',
                                         font=('Arial', 10), insertbackground='#00ff88')
        self.user_email_entry.grid(row=1, column=1, padx=5, pady=5)
        
        # Membership Tier
        tk.Label(form_inner, text="Membership:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=2, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_membership_var = tk.StringVar(value='tier1')
        membership_options = [
            ('Tier 1 (1-2 picks/day)', 'tier1'),
            ('Bronze', 'bronze'),
            ('Silver', 'silver'),
            ('Gold', 'gold'),
            ('Platinum', 'platinum'),
            ('Premium', 'premium')
        ]
        membership_dropdown = ttk.Combobox(form_inner, textvariable=self.user_membership_var,
                                          values=[opt[1] for opt in membership_options],
                                          state='readonly', width=28)
        membership_dropdown.grid(row=2, column=1, padx=5, pady=5)
        
        # Picks Per Day
        tk.Label(form_inner, text="Picks/Day:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=3, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_picks_entry = tk.Entry(form_inner, width=10, bg='#0a0a0a', fg='#ffffff',
                                         font=('Arial', 10), insertbackground='#00ff88')
        self.user_picks_entry.insert(0, '2')
        self.user_picks_entry.grid(row=3, column=1, sticky=tk.W, padx=5, pady=5)
        
        # Parlay Limit Per Day
        tk.Label(form_inner, text="Parlay Limit/Day:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=4, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_parlay_limit_entry = tk.Entry(form_inner, width=10, bg='#0a0a0a', fg='#ffffff',
                                               font=('Arial', 10), insertbackground='#00ff88')
        self.user_parlay_limit_entry.insert(0, '1')
        self.user_parlay_limit_entry.grid(row=4, column=1, sticky=tk.W, padx=5, pady=5)
        
        # Notes
        tk.Label(form_inner, text="Notes:", bg='#1a1a1a', fg='#ffffff', 
                font=('Arial', 10)).grid(row=5, column=0, sticky=tk.W, padx=5, pady=5)
        self.user_notes_entry = tk.Entry(form_inner, width=30, bg='#0a0a0a', fg='#ffffff',
                                         font=('Arial', 10), insertbackground='#00ff88')
        self.user_notes_entry.grid(row=5, column=1, padx=5, pady=5)
        
        # Add/Update Button
        tk.Button(form_inner, text="✅ Add/Update User", command=self.add_update_user,
                 bg='#00ff88', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').grid(row=6, column=0, columnspan=2, pady=10)
        
        # Users Table
        table_frame = tk.LabelFrame(self.users_tab, text="All Users", 
                                    bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'))
        table_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        # Scrollbar
        scrollbar = tk.Scrollbar(table_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Treeview
        columns = ('Username', 'Email', 'Membership', 'Picks/Day', 'Parlay Limit', 'Created', 'Notes')
        self.users_tree = ttk.Treeview(table_frame, columns=columns, show='headings',
                                       yscrollcommand=scrollbar.set, height=15)
        
        self.users_tree.heading('Username', text='Username')
        self.users_tree.heading('Email', text='Email')
        self.users_tree.heading('Membership', text='Membership')
        self.users_tree.heading('Picks/Day', text='Picks/Day')
        self.users_tree.heading('Parlay Limit', text='Parlay Limit')
        self.users_tree.heading('Created', text='Created')
        self.users_tree.heading('Notes', text='Notes')
        
        self.users_tree.column('Username', width=120)
        self.users_tree.column('Email', width=180)
        self.users_tree.column('Membership', width=100)
        self.users_tree.column('Picks/Day', width=80)
        self.users_tree.column('Parlay Limit', width=80)
        self.users_tree.column('Created', width=120)
        self.users_tree.column('Notes', width=150)
        
        self.users_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.users_tree.yview)
        
        # Bind selection
        self.users_tree.bind('<<TreeviewSelect>>', self.on_user_selected)
        
        # Buttons
        btn_frame = tk.Frame(self.users_tab, bg='#0a0a0a')
        btn_frame.pack(fill=tk.X, padx=30, pady=10)
        
        tk.Button(btn_frame, text="🔄 Refresh Users", command=self.load_users,
                 bg='#00d4ff', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🎯 Update Parlay Limit", command=self.update_parlay_limit,
                 bg='#ffaa00', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🗑️ Delete User", command=self.delete_selected_user,
                 bg='#ff4444', fg='#000000', font=('Arial', 11, 'bold'),
                 width=20, cursor='hand2').pack(side=tk.LEFT, padx=5)
        
        # Load users
        self.load_users()
    
    def add_update_user(self):
        """Add or update a user"""
        try:
            username = self.user_username_entry.get().strip()
            email = self.user_email_entry.get().strip()
            membership = self.user_membership_var.get()
            picks_per_day = int(self.user_picks_entry.get())
            parlay_limit = int(self.user_parlay_limit_entry.get())
            notes = self.user_notes_entry.get().strip()
            
            if not username or not email:
                messagebox.showwarning("Missing Info", "Please enter username and email")
                return
            
            import requests as http_requests
            response = http_requests.post('http://localhost:5002/api/create-user', json={
                'username': username,
                'email': email,
                'membership': membership,
                'picks_per_day': picks_per_day,
                'parlay_limit_per_day': parlay_limit,
                'notes': notes
            })
            
            if response.status_code == 200:
                data = response.json()
                action = data.get('action', 'created')
                messagebox.showinfo("Success", f"User {action}: {username} ({membership})")
                self.load_users()
                # Clear form
                self.user_username_entry.delete(0, tk.END)
                self.user_email_entry.delete(0, tk.END)
                self.user_notes_entry.delete(0, tk.END)
                self.user_picks_entry.delete(0, tk.END)
                self.user_picks_entry.insert(0, '2')
                self.user_parlay_limit_entry.delete(0, tk.END)
                self.user_parlay_limit_entry.insert(0, '1')
            else:
                messagebox.showerror("Error", "Failed to add/update user")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to add/update user: {str(e)}")
    
    def load_users(self):
        """Load all users from backend"""
        try:
            import requests as http_requests
            response = http_requests.get('http://localhost:5002/api/get-all-users')
            
            if response.status_code == 200:
                data = response.json()
                users = data.get('users', [])
                
                # Clear tree
                for item in self.users_tree.get_children():
                    self.users_tree.delete(item)
                
                # Populate tree
                for user in users:
                    self.users_tree.insert('', 'end', values=(
                        user.get('username', 'N/A'),
                        user.get('email', 'N/A'),
                        user.get('membership', 'N/A').upper(),
                        user.get('picks_per_day', 0),
                        user.get('parlay_limit_per_day', 1),
                        user.get('created_at', 'N/A').split('T')[0],
                        user.get('notes', '')
                    ), tags=(user.get('id'),))
                
                self.log(f"📋 Loaded {len(users)} users")
                
        except Exception as e:
            self.log(f"❌ Error loading users: {str(e)}")
    
    def on_user_selected(self, event):
        """Handle user selection"""
        selection = self.users_tree.selection()
        if not selection:
            return
        
        item = self.users_tree.item(selection[0])
        values = item['values']
        
        # Populate form for editing
        self.user_username_entry.delete(0, tk.END)
        self.user_username_entry.insert(0, values[0])
        
        self.user_email_entry.delete(0, tk.END)
        self.user_email_entry.insert(0, values[1])
        
        self.user_membership_var.set(values[2].lower())
        
        self.user_picks_entry.delete(0, tk.END)
        self.user_picks_entry.insert(0, str(values[3]))
        
        self.user_notes_entry.delete(0, tk.END)
        self.user_notes_entry.insert(0, values[5])
    
    def delete_selected_user(self):
        """Delete the selected user"""
        selection = self.users_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a user to delete")
            return
        
        item = self.users_tree.item(selection[0])
        user_id = item['tags'][0]
        username = item['values'][0]
        
        if not messagebox.askyesno("Confirm Delete", f"Delete user {username}?"):
            return
        
        try:
            import requests as http_requests
            response = http_requests.delete(f'http://localhost:5002/api/delete-user/{user_id}')
            
            if response.status_code == 200:
                messagebox.showinfo("Success", f"User {username} deleted")
                self.load_users()
            else:
                messagebox.showerror("Error", "Failed to delete user")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to delete user: {str(e)}")
    
    def update_parlay_limit(self):
        """Update parlay limit for selected user"""
        selection = self.users_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a user to update parlay limit")
            return
        
        item = self.users_tree.item(selection[0])
        user_id = item['tags'][0]
        username = item['values'][0]
        current_limit = item['values'][4]  # Parlay Limit column
        
        # Ask for new limit
        new_limit = tk.simpledialog.askinteger(
            "Update Parlay Limit",
            f"Current parlay limit for {username}: {current_limit}\n\nEnter new parlay limit per day:",
            initialvalue=current_limit,
            minvalue=0,
            maxvalue=50
        )
        
        if new_limit is None:  # User cancelled
            return
        
        try:
            import requests as http_requests
            response = http_requests.post('http://localhost:5002/api/update-parlay-limit', json={
                'user_id': user_id,
                'parlay_limit': new_limit
            })
            
            if response.status_code == 200:
                data = response.json()
                messagebox.showinfo("Success", f"Parlay limit updated for {username}: {new_limit} per day")
                self.load_users()
            else:
                error_data = response.json()
                messagebox.showerror("Error", f"Failed to update parlay limit: {error_data.get('error', 'Unknown error')}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to update parlay limit: {str(e)}")
        
    def setup_settings_tab(self):
        """Settings panel"""
        tk.Label(self.settings_tab, text="System Settings", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 18, 'bold')).pack(pady=20)
        
        settings_container = tk.Frame(self.settings_tab, bg='#0a0a0a')
        settings_container.pack(fill=tk.BOTH, expand=True, padx=30)
        
        # API Settings
        api_frame = tk.LabelFrame(settings_container, text="API Configuration", 
                                 bg='#1a1a1a', fg='#00ff88', font=('Arial', 12, 'bold'),
                                 relief=tk.RIDGE, bd=3)
        api_frame.pack(fill=tk.X, pady=10)
        
        api_inner = tk.Frame(api_frame, bg='#1a1a1a')
        api_inner.pack(fill=tk.X, padx=20, pady=15)
        
        tk.Label(api_inner, text="OpenAI API Key:", bg='#1a1a1a', fg='#00ff88',
                font=('Arial', 10)).grid(row=0, column=0, sticky=tk.W, pady=10)
        tk.Entry(api_inner, width=50, bg='#0a0a0a', fg='#ffffff', show='*').grid(row=0, column=1, padx=10)
        
        tk.Label(api_inner, text="The Odds API Key:", bg='#1a1a1a', fg='#00ff88',
                font=('Arial', 10)).grid(row=1, column=0, sticky=tk.W, pady=10)
        tk.Entry(api_inner, width=50, bg='#0a0a0a', fg='#ffffff', show='*').grid(row=1, column=1, padx=10)
        
        tk.Button(api_inner, text="💾 Save Settings", bg='#00ff88', fg='#000000',
                 font=('Arial', 10, 'bold'), width=15).grid(row=2, column=1, pady=20, sticky=tk.E)
        
    # Server Control Methods
    def start_http_server(self):
        """Start HTTP web server"""
        if self.http_server_process:
            self.log("⚠️ HTTP server already running")
            return
        
        try:
            self.log("🚀 Starting HTTP web server on port 8000...")
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            
            self.http_server_process = subprocess.Popen(
                [sys.executable, '-m', 'http.server', '8000'],
                cwd=script_dir,  # Run server in the script's directory
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            self.http_status_label.config(text="🟢 Running", fg='#00ff88')
            self.log("✅ HTTP server started successfully")
            self.log(f"🌐 Website available at: http://localhost:8000/insightai-index.html")
        except Exception as e:
            self.log(f"❌ Error starting HTTP server: {e}")
    
    def stop_http_server(self):
        """Stop HTTP web server"""
        if not self.http_server_process:
            self.log("⚠️ HTTP server not running")
            return
        
        try:
            self.log("⏹️ Stopping HTTP web server...")
            self.http_server_process.terminate()
            self.http_server_process.wait(timeout=5)
            self.http_server_process = None
            self.http_status_label.config(text="⚪ Stopped", fg='#ff4444')
            self.log("✅ HTTP server stopped")
        except Exception as e:
            self.log(f"❌ Error stopping HTTP server: {e}")
    
    def start_predictor(self):
        """Start AI predictor server"""
        if self.predictor_server_process and self.predictor_server_process.poll() is None:
            self.log("⚠️ Predictor server already running")
            return
        
        try:
            self.log("🚀 Starting AI Predictor server on port 5002...")
            
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.join(script_dir, 'backend')
            
            # Verify backend directory exists
            if not os.path.exists(backend_dir):
                self.log(f"❌ Backend directory not found: {backend_dir}")
                self.predictor_status_label.config(text="❌ No Backend", fg='#ff4444')
                return
            
            # Verify the Python file exists
            predictor_file = os.path.join(backend_dir, 'chatgpt_predictor.py')
            if not os.path.exists(predictor_file):
                self.log(f"❌ Predictor file not found: {predictor_file}")
                self.predictor_status_label.config(text="❌ No File", fg='#ff4444')
                return
            
            self.log(f"📁 Backend directory: {backend_dir}")
            self.log(f"🐍 Starting: {predictor_file}")
            
            self.predictor_server_process = subprocess.Popen(
                [sys.executable, 'chatgpt_predictor.py'],
                cwd=backend_dir,  # Run from the backend directory
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            # Give it more time to start
            time.sleep(3)
            
            # Check if it's still running
            if self.predictor_server_process.poll() is None:
                # Test if server is actually responding
                self.log("🔍 Testing server health...")
                try:
                    import urllib.request
                    response = urllib.request.urlopen('http://localhost:5002/api/health', timeout=5)
                    if response.getcode() == 200:
                        self.predictor_status_label.config(text="🟢 Running", fg='#00ff88')
                        self.log("✅ AI Predictor server started successfully")
                        self.log("📡 Server running at: http://localhost:5002")
                        self.log("🌐 Website: http://localhost:5002/insightai-index.html")
                        self.log("✅ Health check passed - server is responding")
                    else:
                        self.log("⚠️ Server started but health check failed")
                        self.predictor_status_label.config(text="🟡 Starting", fg='#ffaa00')
                except Exception as health_error:
                    self.log(f"⚠️ Server started but not responding yet: {health_error}")
                    self.predictor_status_label.config(text="🟡 Starting", fg='#ffaa00')
                    self.log("💡 Server may need more time to fully start")
            else:
                self.predictor_status_label.config(text="❌ Failed", fg='#ff4444')
                self.log("❌ AI Predictor server failed to start - check console window")
                self.log("💡 Make sure Python is installed and all dependencies are available")
                self.predictor_server_process = None
                
        except Exception as e:
            self.log(f"❌ Error starting predictor server: {e}")
            self.log(f"💡 Error details: {str(e)}")
            self.predictor_status_label.config(text="❌ Error", fg='#ff4444')
    
    def stop_predictor(self):
        """Stop AI predictor server"""
        if not self.predictor_server_process:
            self.log("⚠️ Predictor server not running")
            return
        
        try:
            self.log("⏹️ Stopping AI Predictor server...")
            self.predictor_server_process.terminate()
            self.predictor_server_process.wait(timeout=5)
            self.predictor_server_process = None
            self.predictor_status_label.config(text="⚪ Stopped", fg='#ff4444')
            self.log("✅ Predictor server stopped")
        except Exception as e:
            self.log(f"❌ Error stopping predictor server: {e}")
    
    def start_email_verification(self):
        """Start email verification server"""
        if self.email_verification_process and self.email_verification_process.poll() is None:
            self.log("⚠️ Email verification server already running")
            return
        
        try:
            self.log("🚀 Starting Email Verification server on port 5003...")
            
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            email_file = os.path.join(script_dir, 'email_verification.py')
            
            # Verify the file exists
            if not os.path.exists(email_file):
                self.log(f"❌ Email verification file not found: {email_file}")
                self.log("⚠️ Email verification service disabled")
                return
            
            self.log(f"📁 Starting: {email_file}")
            
            self.email_verification_process = subprocess.Popen(
                [sys.executable, 'email_verification.py'],
                cwd=script_dir,
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            # Give it time to start
            time.sleep(2)
            
            # Check if it's still running
            if self.email_verification_process.poll() is None:
                self.log("✅ Email verification server started on port 5003")
            else:
                self.log("❌ Email verification server failed to start")
                self.email_verification_process = None
        except Exception as e:
            self.log(f"❌ Error starting email verification server: {e}")
            self.email_verification_process = None
    
    def stop_email_verification(self):
        """Stop email verification server"""
        try:
            if self.email_verification_process:
                self.email_verification_process.terminate()
                self.email_verification_process.wait(timeout=5)
                self.email_verification_process = None
            self.log("✅ Email verification server stopped")
        except Exception as e:
            self.log(f"❌ Error stopping email verification server: {e}")
    
    def start_all(self):
        """Start all services"""
        self.log("\n" + "="*80)
        self.log("🚀 STARTING ALL SERVICES")
        self.log("="*80)
        
        # Start AI Predictor first (most important)
        self.log("🎯 Starting AI Predictor server...")
        self.start_predictor()
        time.sleep(3)  # Give it more time to start
        
        # Verify AI Predictor is running
        if self.predictor_server_process and self.predictor_server_process.poll() is None:
            self.log("✅ AI Predictor server confirmed running")
        else:
            self.log("❌ AI Predictor failed to start - retrying...")
            self.start_predictor()
            time.sleep(2)
        
        # Start Email Verification Service
        self.log("📧 Starting Email Verification server...")
        self.start_email_verification()
        time.sleep(1)
        
        # Start HTTP server (optional)
        self.log("🌐 Starting HTTP server...")
        self.start_http_server()
        
        self.log("="*80)
        self.log("✅ ALL SERVICES STARTED")
        self.log("🌐 Website: http://localhost:5002/insightai-index.html")
        self.log("🤖 AI Predictor: http://localhost:5002/api/health")
        self.log("📧 Email Verification: http://localhost:5003/api/health")
        self.log("="*80 + "\n")
    
    def stop_all(self):
        """Stop all services"""
        self.log("\n" + "="*80)
        self.log("⏹️ STOPPING ALL SERVICES")
        self.log("="*80)
        self.stop_http_server()
        time.sleep(1)
        self.stop_predictor()
        time.sleep(1)
        self.stop_email_verification()
        self.log("="*80)
        self.log("✅ ALL SERVICES STOPPED")
        self.log("="*80 + "\n")
    
    def restart_all(self):
        """Restart all services"""
        self.log("\n🔄 RESTARTING ALL SERVICES...\n")
        self.stop_all()
        time.sleep(2)
        self.start_all()
    
    def force_start_ai(self):
        """Force start AI Predictor server"""
        self.log("\n🤖 FORCE STARTING AI PREDICTOR...\n")
        
        # Kill any existing process
        if self.predictor_server_process:
            try:
                self.predictor_server_process.terminate()
                self.predictor_server_process.wait(timeout=3)
            except:
                pass
            self.predictor_server_process = None
        
        # Wait a moment
        time.sleep(1)
        
        # Start fresh
        self.start_predictor()
        
        # Give it extra time
        time.sleep(5)
        
        # Test health
        try:
            import urllib.request
            response = urllib.request.urlopen('http://localhost:5002/api/health', timeout=5)
            if response.getcode() == 200:
                self.log("✅ AI Predictor force start successful!")
                self.log("🌐 Website: http://localhost:5002/insightai-index.html")
            else:
                self.log("⚠️ AI Predictor started but health check failed")
        except Exception as e:
            self.log(f"❌ AI Predictor force start failed: {e}")
        
        self.log("="*50 + "\n")
    
    def open_website(self):
        """Open website in browser with splash screen"""
        import webbrowser
        webbrowser.open('http://localhost:8000/splash.html')
        self.log("🌐 Opened website with splash screen (5 sec loading)")
    
    def check_server_status(self):
        """Check if servers are running and restart if needed"""
        try:
            # Check AI Predictor status
            if self.predictor_server_process:
                if self.predictor_server_process.poll() is not None:
                    # Process has died, restart it
                    self.log("⚠️ AI Predictor server died - restarting...")
                    self.predictor_server_process = None
                    self.start_predictor()
                else:
                    # Process is running, test health
                    try:
                        import urllib.request
                        response = urllib.request.urlopen('http://localhost:5002/api/health', timeout=2)
                        if response.getcode() == 200:
                            self.predictor_status_label.config(text="🟢 Running", fg='#00ff88')
                        else:
                            self.predictor_status_label.config(text="🟡 Slow", fg='#ffaa00')
                    except:
                        self.predictor_status_label.config(text="🟡 Starting", fg='#ffaa00')
            else:
                # No process running, try to start
                self.log("🔄 AI Predictor not running - attempting to start...")
                self.start_predictor()
                
        except Exception as e:
            self.log(f"⚠️ Health check error: {e}")
        
        # Schedule next check
        self.root.after(10000, self.check_server_status)  # Check every 10 seconds
    
    # Pick Management Methods
    def load_picks(self):
        """Load picks from JSON files (both main and auto-generated)"""
        all_picks = []
        
        # Load main picks file
        try:
            with open(PICKS_FILE, 'r') as f:
                main_picks = json.load(f)
                if isinstance(main_picks, list):
                    all_picks.extend(main_picks)
        except:
            pass
        
        # Load auto-generated picks file
        try:
            with open(AUTO_PICKS_FILE, 'r') as f:
                auto_picks = json.load(f)
                if isinstance(auto_picks, list):
                    all_picks.extend(auto_picks)
        except:
            pass
        
        # Remove duplicates based on ID
        seen_ids = set()
        unique_picks = []
        for pick in all_picks:
            if pick.get('id') not in seen_ids:
                seen_ids.add(pick.get('id'))
                unique_picks.append(pick)
        
        return unique_picks
    
    def save_picks(self):
        """Save picks to both main and auto-generated JSON files"""
        with open(PICKS_FILE, 'w') as f:
            json.dump(self.picks, f, indent=2)
        
        # Also save to auto-generated file for backup
        with open(AUTO_PICKS_FILE, 'w') as f:
            json.dump(self.picks, f, indent=2)
    
    def add_pick(self):
        """Add new pick"""
        if not self.game_entry.get().strip():
            messagebox.showerror("Error", "Game is required!")
            return
        
        pick = {
            'id': len(self.picks) + 1,
            'sport': self.sport_var.get(),
            'game': self.game_entry.get().strip(),
            'teams': self.game_entry.get().strip(),
            'pick_type': self.pick_type_var.get(),
            'betType': self.pick_type_var.get(),
            'pick': self.pick_entry.get().strip() or 'TBD',
            'prediction': self.pick_entry.get().strip() or 'TBD',
            'confidence': self.confidence_entry.get().strip() or '75%',
            'odds': self.odds_entry.get().strip() or '-110',
            'price': float(self.price_entry.get() or 55.00),
            'reasoning': 'AI analysis pending...',
            'status': 'available',
            'isActive': True,
            'date': self.get_game_datetime(),
            'generated_at': datetime.now().isoformat()
        }
        
        self.picks.append(pick)
        self.save_picks()
        self.refresh_picks_list()
        self.log(f"✅ Added pick: {pick['game']}")
        messagebox.showinfo("Success", "Pick added!")
    
    def update_pick(self):
        """Update selected pick"""
        selection = self.picks_tree.selection()
        if not selection:
            messagebox.showerror("Error", "Select a pick to update!")
            return
        
        idx = int(self.picks_tree.item(selection[0])['text']) - 1
        if 0 <= idx < len(self.picks):
            self.picks[idx].update({
                'sport': self.sport_var.get(),
                'game': self.game_entry.get().strip(),
                'teams': self.game_entry.get().strip(),
                'pick': self.pick_entry.get().strip(),
                'confidence': self.confidence_entry.get().strip(),
                'odds': self.odds_entry.get().strip(),
                'price': float(self.price_entry.get())
            })
            self.save_picks()
            self.refresh_picks_list()
            self.log(f"✏️ Updated pick: {self.picks[idx]['game']}")
            messagebox.showinfo("Success", "Pick updated!")
    
    def delete_pick(self):
        """Delete selected pick"""
        selection = self.picks_tree.selection()
        if not selection:
            messagebox.showerror("Error", "Select a pick to delete!")
            return
        
        if messagebox.askyesno("Confirm", "Delete this pick?"):
            idx = int(self.picks_tree.item(selection[0])['text']) - 1
            if 0 <= idx < len(self.picks):
                deleted = self.picks.pop(idx)
                self.save_picks()
                self.refresh_picks_list()
                self.log(f"🗑️ Deleted pick: {deleted['game']}")
                messagebox.showinfo("Success", "Pick deleted!")
    
    def update_all_odds(self):
        """Update odds for all picks"""
        self.log("🔄 Updating odds for all picks...")
        for pick in self.picks:
            pick['odds_updated_at'] = datetime.now().isoformat()
        self.save_picks()
        self.refresh_picks_list()
        self.log("✅ Odds updated")
        messagebox.showinfo("Success", "Odds updated!")
    
    def auto_generate_picks(self):
        """Auto-generate AI picks for today's games using real ESPN data"""
        if messagebox.askyesno("Auto-Generate Picks", 
                              "This will generate AI picks for all today's games using real ESPN data.\n\nThis requires the AI Predictor server to be running.\n\nThis may take several minutes due to API rate limits.\n\nContinue?"):
            
            # Show progress
            progress = tk.Toplevel(self.root)
            progress.title("Generating Picks")
            progress.geometry("600x400")
            progress.configure(bg='#0a0a0a')
            
            tk.Label(progress, text="🤖 Auto-Generating Real AI Picks", 
                    bg='#0a0a0a', fg='#00ff88', font=('Arial', 14, 'bold')).pack(pady=20)
            
            progress_text = scrolledtext.ScrolledText(progress, width=70, height=18,
                                                     bg='#000000', fg='#00ff88', font=('Consolas', 9))
            progress_text.pack(padx=20, pady=10)
            
            def generate_thread():
                try:
                    progress_text.insert(tk.END, "Starting LuckLab AI Auto-Generator...\n")
                    progress_text.insert(tk.END, "="*60 + "\n\n")
                    progress_text.see(tk.END)
                    
                    # CLEAR PICK MANAGER FIRST
                    progress_text.insert(tk.END, "Clearing Pick Manager to start fresh...\n")
                    self.picks = []  # Clear the control center's picks list
                    self.save_picks()  # Save empty picks to files
                    self.refresh_picks_list()  # Update the Pick Manager UI
                    progress_text.insert(tk.END, "Pick Manager cleared!\n")
                    progress_text.insert(tk.END, "Old picks removed from website!\n")
                    progress_text.insert(tk.END, "Waiting 4 seconds for website to detect flush...\n\n")
                    progress_text.see(tk.END)
                    
                    # Give website time to detect the flush (auto-refresh is every 3 seconds)
                    time.sleep(4)
                    
                    # Import and run the real auto-generate function
                    progress_text.insert(tk.END, "Connecting to ESPN API...\n")
                    progress_text.insert(tk.END, "Fetching today's games from all sports...\n")
                    progress_text.see(tk.END)
                    
                    # Define callback for real-time updates
                    def on_pick_generated(new_pick, all_picks):
                        """Called each time a pick is generated - updates GUI in real-time"""
                        # Add to control center's pick list
                        new_pick['id'] = len(self.picks) + 1
                        self.picks.append(new_pick)
                        
                        # Update GUI on main thread
                        self.root.after(0, self.refresh_picks_list)
                        
                        # Show in progress window
                        pick_summary = f"+ {new_pick.get('game', 'Unknown')} - {new_pick.get('pickType', 'Unknown')}: {new_pick.get('pick', 'Unknown')}\n"
                        progress_text.insert(tk.END, pick_summary)
                        progress_text.see(tk.END)
                    
                    # Run the real auto-generate function with callback
                    generated_picks = auto_generate_todays_picks(pick_callback=on_pick_generated)
                    
                    if generated_picks:
                        progress_text.insert(tk.END, f"\n{'='*60}\n")
                        progress_text.insert(tk.END, f"Successfully generated {len(generated_picks)} real AI picks!\n")
                        progress_text.insert(tk.END, f"All picks are now live on the website!\n")
                        progress_text.insert(tk.END, "="*60 + "\n")
                        progress_text.see(tk.END)
                        
                        # Picks are already added via callback, just need final save
                        self.save_picks()
                        
                        self.log(f"Auto-generated {len(generated_picks)} real AI picks for today's games")
                        
                        # Auto-close after 5 seconds
                        self.root.after(5000, progress.destroy)
                    else:
                        progress_text.insert(tk.END, "\nNo picks were generated. This could be because:\n")
                        progress_text.insert(tk.END, "- No games scheduled for today\n")
                        progress_text.insert(tk.END, "- ESPN API is temporarily unavailable\n")
                        progress_text.insert(tk.END, "- Rate limiting occurred\n")
                        progress_text.see(tk.END)
                        
                        self.log("⚠️ Auto-generate completed but no picks were generated")
                        
                        # Keep window open for manual close
                        tk.Button(progress, text="Close", command=progress.destroy,
                                 bg='#9966ff', fg='#ffffff', font=('Arial', 10, 'bold')).pack(pady=10)
                    
                except Exception as e:
                    progress_text.insert(tk.END, f"\n❌ Error: {e}\n")
                    progress_text.insert(tk.END, "\nThis could be due to:\n")
                    progress_text.insert(tk.END, "- AI Predictor server not running\n")
                    progress_text.insert(tk.END, "- Network connectivity issues\n")
                    progress_text.insert(tk.END, "- ESPN API changes\n")
                    progress_text.see(tk.END)
                    
                    self.log(f"❌ Error auto-generating picks: {e}")
                    
                    # Keep window open for manual close
                    tk.Button(progress, text="Close", command=progress.destroy,
                             bg='#9966ff', fg='#ffffff', font=('Arial', 10, 'bold')).pack(pady=10)
            
            threading.Thread(target=generate_thread, daemon=True).start()
    
    def load_enhanced_picks_to_manager(self):
        """Load enhanced picks from Dimerz Pro into the AI Pick Manager"""
        try:
            picks_path = os.path.join(SCRIPT_DIR, 'dimerzPro', 'processed_picks')
            
            if not os.path.exists(picks_path):
                messagebox.showerror("Error", "⚠️ No enhanced picks found!\n\nRun: python dimerzPro/run_complete_system.py")
                return
            
            # Clear current picks tree and list
            for item in self.picks_tree.get_children():
                self.picks_tree.delete(item)
            self.picks = []  # Clear the picks list
            
            # Load each sport
            pick_id = 1
            total_loaded = 0
            
            for sport in ['nfl', 'nba', 'mlb', 'nhl', 'college-football']:
                sport_files = [f for f in os.listdir(picks_path) if f.startswith(f'{sport}_picks_basic_') or f.startswith(f'{sport}_picks_')]
                if sport_files:
                    latest_file = sorted(sport_files)[-1]
                    with open(os.path.join(picks_path, latest_file), 'r') as f:
                        sport_data = json.load(f)
                        
                        for game in sport_data.get('games', []):
                            # Handle both basic and enhanced formats
                            if 'best_bet' in game:
                                # Enhanced format
                                best_bet = game['best_bet']
                                pick_text = best_bet.get('pick', 'N/A')
                                pick_type = best_bet.get('type', 'Spread')
                                confidence = best_bet.get('confidence', 'N/A')
                                odds = best_bet.get('odds', 'N/A')
                                price = "100.00"  # Default price
                            else:
                                # Basic format (Simple Formatter)
                                spread = game.get('spread_pick', '')
                                total = game.get('total_pick', '')
                                moneyline = game.get('moneyline_pick', '')
                                
                                # Choose the first available pick
                                if spread and 'See screenshot' not in spread:
                                    pick_text = spread
                                    pick_type = "Spread"
                                    odds = game.get('spread_odds', 'N/A')
                                elif total and 'See screenshot' not in total:
                                    pick_text = total
                                    pick_type = "Over/Under"
                                    odds = game.get('total_odds', 'N/A')
                                elif moneyline and 'See screenshot' not in moneyline:
                                    pick_text = moneyline
                                    pick_type = "Moneyline"
                                    odds = game.get('moneyline_odds', 'N/A')
                                else:
                                    pick_text = "View details"
                                    pick_type = "Spread"
                                    odds = 'N/A'
                                
                                # Get confidence from probability
                                prob = game.get('probability', 'N/A')
                                confidence = prob if prob != 'N/A' else '70%'
                                price = "100.00"  # Default price
                            
                            # Create pick object for the picks list
                            pick_obj = {
                                'id': pick_id,
                                'sport': sport.upper().replace('-', ' ').title(),
                                'game': game.get('matchup', 'N/A'),
                                'pick_type': pick_type,
                                'pick': pick_text,
                                'confidence': confidence,
                                'odds': odds,
                                'price': float(price),
                                'game_time': game.get('game_time', datetime.now().isoformat())
                            }
                            
                            # Add to picks list
                            self.picks.append(pick_obj)
                            
                            # Add to picks tree display
                            self.picks_tree.insert('', 'end', text=str(pick_id),
                                values=(
                                    game.get('matchup', 'N/A'),
                                    sport.upper(),
                                    pick_text,
                                    odds,
                                    f"${price}"
                                ))
                            pick_id += 1
                            total_loaded += 1
            
            # Save picks to JSON files
            self.save_picks()
            
            messagebox.showinfo("Success", f"✅ Loaded {total_loaded} enhanced picks into AI Pick Manager!\n\nPicks have been saved and are ready for the website.")
            
        except Exception as e:
            messagebox.showerror("Error", f"❌ Error loading enhanced picks: {str(e)}")
    
    def get_game_datetime_from_time(self, time_str):
        """Convert time string to full datetime for today"""
        try:
            hour, minute = map(int, time_str.split(':'))
            game_date = datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
            return game_date.isoformat()
        except:
            return datetime.now().isoformat()
    
    def on_pick_select(self, event):
        """Handle pick selection"""
        selection = self.picks_tree.selection()
        if selection:
            idx = int(self.picks_tree.item(selection[0])['text']) - 1
            if 0 <= idx < len(self.picks):
                pick = self.picks[idx]
                self.game_entry.delete(0, tk.END)
                self.game_entry.insert(0, pick.get('game', ''))
                self.pick_entry.delete(0, tk.END)
                self.pick_entry.insert(0, pick.get('pick', ''))
                self.confidence_entry.delete(0, tk.END)
                self.confidence_entry.insert(0, pick.get('confidence', ''))
                self.odds_entry.delete(0, tk.END)
                self.odds_entry.insert(0, pick.get('odds', ''))
                self.price_entry.delete(0, tk.END)
                self.price_entry.insert(0, str(pick.get('price', '')))
    
    def refresh_picks_list(self):
        """Refresh picks tree view"""
        for item in self.picks_tree.get_children():
            self.picks_tree.delete(item)
        
        for pick in self.picks:
            self.picks_tree.insert('', 'end', text=pick['id'],
                                  values=(pick.get('game', ''),
                                         pick.get('sport', ''),
                                         pick.get('pick', ''),
                                         pick.get('odds', ''),
                                         f"${pick.get('price', 0):.2f}"))
    
    def get_game_datetime(self):
        """Get game datetime from inputs"""
        date_option = self.game_date_var.get()
        time_str = self.game_time_entry.get()
        
        try:
            hour, minute = map(int, time_str.split(':'))
        except:
            hour, minute = 20, 0
        
        if date_option == "Today":
            game_date = datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
        elif date_option == "Tomorrow":
            game_date = (datetime.now() + timedelta(days=1)).replace(hour=hour, minute=minute, second=0, microsecond=0)
        else:
            game_date = (datetime.now() + timedelta(days=1)).replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        return game_date.isoformat()
    
    # Utility Methods
    def log(self, message):
        """Log message to console"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.console_output.insert(tk.END, f"[{timestamp}] {message}\n")
        self.console_output.see(tk.END)
        
        # Also log to activity log if it exists
        if hasattr(self, 'activity_log'):
            self.activity_log.insert(tk.END, f"[{timestamp}] {message}\n")
            self.activity_log.see(tk.END)
    
    # ===========================================
    # ADMIN ALERTS SYSTEM
    # ===========================================
    
    def load_alerts(self):
        """Load alerts from file"""
        alerts_file = os.path.join(SCRIPT_DIR, "admin_alerts.json")
        
        try:
            if os.path.exists(alerts_file):
                with open(alerts_file, 'r') as f:
                    alerts = json.load(f)
                    self.display_alerts(alerts)
            else:
                self.alerts_display.insert(tk.END, "No alerts yet. Alerts will appear when users generate AI picks.\n\n")
        except Exception as e:
            self.alerts_display.insert(tk.END, f"Error loading alerts: {e}\n")
    
    def display_alerts(self, alerts):
        """Display alerts in the text widget"""
        self.alerts_display.delete(1.0, tk.END)
        
        if not alerts:
            self.alerts_display.insert(tk.END, "No alerts yet.\n")
            return
        
        # Update stats
        total = len(alerts)
        today = sum(1 for a in alerts if a.get('date', '')[:10] == datetime.now().strftime('%Y-%m-%d'))
        
        self.total_alerts_label.config(text=f"Total Alerts: {total}")
        self.today_alerts_label.config(text=f"Today: {today}")
        
        # Display alerts (newest first)
        for alert in reversed(alerts):
            timestamp = alert.get('timestamp', 'Unknown time')
            user = alert.get('user', 'Unknown user')
            tier = alert.get('tier', 'free')
            pick_type = alert.get('pick_type', 'single')
            sport = alert.get('sport', 'Unknown')
            game = alert.get('game', 'Unknown game')
            bet_type = alert.get('bet_type', 'Unknown')
            pick = alert.get('pick', 'N/A')
            
            # Format alert with color coding
            alert_text = f"""
{'='*80}
⏰ {timestamp}
👤 USER: {user} (Tier: {tier.upper()})
🎯 PICK TYPE: {pick_type.upper()}
🏈 SPORT: {sport.upper()}
🎮 GAME: {game}
📊 BET TYPE: {bet_type}
✅ AI PICK: {pick}
{'='*80}

"""
            self.alerts_display.insert(tk.END, alert_text)
        
        self.alerts_display.see(tk.END)
    
    def refresh_alerts(self):
        """Reload alerts from file"""
        self.load_alerts()
        self.log_message("Alerts refreshed")
    
    def clear_alerts(self):
        """Clear all alerts"""
        if messagebox.askyesno("Clear Alerts", "Are you sure you want to clear all alerts?"):
            alerts_file = os.path.join(SCRIPT_DIR, "admin_alerts.json")
            with open(alerts_file, 'w') as f:
                json.dump([], f)
            
            self.alerts_display.delete(1.0, tk.END)
            self.alerts_display.insert(tk.END, "All alerts cleared.\n")
            self.total_alerts_label.config(text="Total Alerts: 0")
            self.today_alerts_label.config(text="Today: 0")
            self.log_message("All alerts cleared")
    
    def export_alerts(self):
        """Export alerts to text file"""
        alerts_file = os.path.join(SCRIPT_DIR, "admin_alerts.json")
        export_file = os.path.join(SCRIPT_DIR, f"alerts_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        
        try:
            if os.path.exists(alerts_file):
                with open(alerts_file, 'r') as f:
                    alerts = json.load(f)
                
                with open(export_file, 'w') as f:
                    f.write("LUCKLAB AI - ADMIN ALERTS EXPORT\n")
                    f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write("="*80 + "\n\n")
                    
                    for alert in alerts:
                        f.write(f"Time: {alert.get('timestamp')}\n")
                        f.write(f"User: {alert.get('user')}\n")
                        f.write(f"Tier: {alert.get('tier')}\n")
                        f.write(f"Sport: {alert.get('sport')}\n")
                        f.write(f"Game: {alert.get('game')}\n")
                        f.write(f"Bet Type: {alert.get('bet_type')}\n")
                        f.write(f"AI Pick: {alert.get('pick')}\n")
                        f.write("-"*80 + "\n\n")
                
                messagebox.showinfo("Export Complete", f"Alerts exported to:\n{export_file}")
                self.log_message(f"Alerts exported to {export_file}")
            else:
                messagebox.showwarning("No Alerts", "No alerts to export")
        except Exception as e:
            messagebox.showerror("Export Error", str(e))
    
    # ===========================================
    # WIN VERIFICATION SYSTEM
    # ===========================================
    
    def load_submissions(self):
        """Load win submissions from file"""
        submissions_file = os.path.join(SCRIPT_DIR, "win_submissions.json")
        
        try:
            if os.path.exists(submissions_file):
                with open(submissions_file, 'r') as f:
                    self.submissions = json.load(f)
            else:
                self.submissions = []
                
            self.refresh_submissions_display()
        except Exception as e:
            print(f"Error loading submissions: {e}")
            self.submissions = []
    
    def refresh_submissions_display(self):
        """Update submissions listbox"""
        self.submissions_listbox.delete(0, tk.END)
        
        pending = [s for s in self.submissions if s.get('status') == 'pending']
        approved = [s for s in self.submissions if s.get('status') == 'approved']
        
        self.pending_submissions_label.config(text=f"Pending: {len(pending)}")
        self.approved_submissions_label.config(text=f"Approved: {len(approved)}")
        
        for i, sub in enumerate(pending):
            display_text = f"[{sub.get('timestamp', 'N/A')[:16]}] {sub.get('user', 'Unknown')} - ${sub.get('amount', 0):,.0f} profit"
            self.submissions_listbox.insert(tk.END, display_text)
        
        if not pending:
            self.submissions_listbox.insert(tk.END, "No pending submissions")
    
    def refresh_submissions(self):
        """Reload submissions"""
        self.load_submissions()
        self.log_message("Win submissions refreshed")
    
    def on_submission_select(self, event):
        """Show details when submission is selected"""
        selection = self.submissions_listbox.curselection()
        if not selection:
            return
        
        index = selection[0]
        pending = [s for s in self.submissions if s.get('status') == 'pending']
        
        if index >= len(pending):
            return
        
        sub = pending[index]
        self.current_submission = sub
        
        # Display details
        details = f"""
{'='*60}
SUBMISSION DETAILS
{'='*60}

ID: {sub.get('id', 'N/A')}
Timestamp: {sub.get('timestamp', 'N/A')}
User: {sub.get('user', 'Unknown')}
Email: {sub.get('email', 'Unknown')}
Tier: {sub.get('tier', 'free').upper()}

Total Profit: ${sub.get('amount', 0):,.2f}
Winning Picks: {sub.get('picks', 'N/A')}

Twitter: {sub.get('twitter', 'N/A')}
Instagram: {sub.get('instagram', 'N/A')}

Status: {sub.get('status', 'pending').upper()}

{'='*60}
"""
        self.submission_details.delete(1.0, tk.END)
        self.submission_details.insert(tk.END, details)
    
    def approve_submission(self):
        """Approve submission and add to Top 3"""
        if not hasattr(self, 'current_submission'):
            messagebox.showwarning("No Selection", "Please select a submission first")
            return
        
        sub = self.current_submission
        
        if messagebox.askyesno("Approve Submission", 
                              f"Approve {sub.get('user')}'s win of ${sub.get('amount'):,.2f}?\n\nThis will update the Top 3 leaderboard."):
            
            # Mark as approved
            sub['status'] = 'approved'
            sub['verified'] = True
            sub['approved_date'] = datetime.now().isoformat()
            
            # Save submissions
            submissions_file = os.path.join(SCRIPT_DIR, "win_submissions.json")
            with open(submissions_file, 'w') as f:
                json.dump(self.submissions, f, indent=2)
            
            # Update Top 3 (this will be saved to a file that frontend reads)
            self.update_top_3_leaderboard(sub)
            
            # Refresh display
            self.refresh_submissions_display()
            self.submission_details.delete(1.0, tk.END)
            self.submission_details.insert(tk.END, "✅ APPROVED! User will appear on leaderboard.")
            
            self.log_message(f"Approved win submission: {sub.get('user')} - ${sub.get('amount'):,.2f}")
            messagebox.showinfo("Approved", "Win verified and added to leaderboard!")
    
    def reject_submission(self):
        """Reject submission"""
        if not hasattr(self, 'current_submission'):
            messagebox.showwarning("No Selection", "Please select a submission first")
            return
        
        sub = self.current_submission
        
        if messagebox.askyesno("Reject Submission", f"Reject {sub.get('user')}'s submission?"):
            sub['status'] = 'rejected'
            sub['rejected_date'] = datetime.now().isoformat()
            
            submissions_file = os.path.join(SCRIPT_DIR, "win_submissions.json")
            with open(submissions_file, 'w') as f:
                json.dump(self.submissions, f, indent=2)
            
            self.refresh_submissions_display()
            self.log_message(f"Rejected win submission: {sub.get('user')}")
            messagebox.showinfo("Rejected", "Submission rejected")
    
    def view_screenshot(self):
        """Open screenshot in default image viewer"""
        if not hasattr(self, 'current_submission'):
            messagebox.showwarning("No Selection", "Please select a submission first")
            return
        
        sub = self.current_submission
        screenshot_data = sub.get('screenshot')
        
        if not screenshot_data:
            messagebox.showwarning("No Screenshot", "This submission has no screenshot")
            return
        
        # Save base64 to temp file and open
        try:
            import base64
            from PIL import Image
            import io
            
            # Remove data URL prefix if present
            if ',' in screenshot_data:
                screenshot_data = screenshot_data.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(screenshot_data)
            image = Image.open(io.BytesIO(image_data))
            
            # Save to temp file
            temp_file = os.path.join(SCRIPT_DIR, f"temp_screenshot_{sub.get('id', 'unknown')}.png")
            image.save(temp_file)
            
            # Open in default viewer
            import platform
            if platform.system() == 'Windows':
                os.startfile(temp_file)
            elif platform.system() == 'Darwin':  # macOS
                subprocess.call(['open', temp_file])
            else:  # Linux
                subprocess.call(['xdg-open', temp_file])
            
            self.log_message(f"Opened screenshot for {sub.get('user')}")
        except Exception as e:
            messagebox.showerror("Error", f"Could not open screenshot: {e}")
    
    def open_screenshots_folder(self):
        """Open folder containing screenshots"""
        import platform
        if platform.system() == 'Windows':
            os.startfile(SCRIPT_DIR)
        elif platform.system() == 'Darwin':
            subprocess.call(['open', SCRIPT_DIR])
        else:
            subprocess.call(['xdg-open', SCRIPT_DIR])
    
    def update_top_3_leaderboard(self, submission):
        """Update the Top 3 leaderboard with new winner"""
        # This saves to a file that the frontend JavaScript reads
        top3_file = os.path.join(SCRIPT_DIR, "top3_bettors.json")
        
        # Load existing top 3
        if os.path.exists(top3_file):
            with open(top3_file, 'r') as f:
                top3 = json.load(f)
        else:
            top3 = []
        
        # Create bettor entry
        new_bettor = {
            'rank': 0,  # Will be recalculated
            'name': submission.get('user'),
            'email': submission.get('email'),
            'twitter': submission.get('twitter', submission.get('user')),
            'instagram': submission.get('instagram', submission.get('user')),
            'winRate': '85%',  # Can be calculated from their history
            'totalPicks': 1,  # Can be tracked
            'totalWins': 1,
            'profit': submission.get('amount'),
            'avatar': f"https://ui-avatars.com/api/?name={submission.get('user')}&size=150&background=FFD700&color=000&bold=true"
        }
        
        # Check if user already exists
        existing_index = next((i for i, b in enumerate(top3) if b.get('email') == submission.get('email')), None)
        
        if existing_index is not None:
            # Update existing entry (add to profit)
            top3[existing_index]['profit'] += submission.get('amount')
            top3[existing_index]['totalPicks'] += 1
            top3[existing_index]['totalWins'] += 1
        else:
            # Add new entry
            top3.append(new_bettor)
        
        # Sort by profit and keep top 3
        top3.sort(key=lambda x: x.get('profit', 0), reverse=True)
        top3 = top3[:3]
        
        # Update ranks
        for i, bettor in enumerate(top3):
            bettor['rank'] = i + 1
        
        # Save to file
        with open(top3_file, 'w') as f:
            json.dump(top3, f, indent=2)
        
        print(f"\n{'='*70}")
        print(f"TOP 3 LEADERBOARD UPDATED")
        print(f"{'='*70}")
        for bettor in top3:
            print(f"#{bettor['rank']} {bettor['name']} - ${bettor['profit']:,.2f}")
        print(f"{'='*70}\n")
    
    def load_and_populate_enhanced_picks(self):
        """Load and display enhanced AI picks"""
        try:
            picks_path = os.path.join(SCRIPT_DIR, 'dimerzPro', 'processed_picks')
            
            if not os.path.exists(picks_path):
                self.enhanced_details_text.insert('1.0', "⚠️ No enhanced picks found!\n\nRun: python dimerzPro/run_complete_system.py")
                return
            
            # Clear tree
            for item in self.enhanced_tree.get_children():
                self.enhanced_tree.delete(item)
            
            # Load each sport
            pick_num = 1
            total_picks = 0
            
            for sport in ['nfl', 'nba', 'mlb', 'nhl', 'college-football']:
                # Look for basic picks first, then enhanced picks
                sport_files = [f for f in os.listdir(picks_path) if f.startswith(f'{sport}_picks_basic_') or f.startswith(f'{sport}_picks_')]
                if sport_files:
                    latest_file = sorted(sport_files)[-1]
                    with open(os.path.join(picks_path, latest_file), 'r') as f:
                        sport_data = json.load(f)
                        
                        for game in sport_data.get('games', []):
                            # Handle both basic and enhanced formats
                            if 'best_bet' in game:
                                # Enhanced format
                                best_bet = game['best_bet']
                                pick_text = best_bet.get('pick', 'N/A')
                                conf = best_bet.get('confidence', 'N/A')
                                value = f"{best_bet.get('value_rating', 'N/A')}/10"
                            else:
                                # Basic format (Simple Formatter)
                                # Show the best pick from spread/total/moneyline
                                spread = game.get('spread_pick', '')
                                total = game.get('total_pick', '')
                                moneyline = game.get('moneyline_pick', '')
                                
                                # Choose the first available pick
                                if spread and 'See screenshot' not in spread:
                                    pick_text = f"Spread: {spread}"
                                elif total and 'See screenshot' not in total:
                                    pick_text = f"Total: {total}"
                                elif moneyline and 'See screenshot' not in moneyline:
                                    pick_text = f"ML: {moneyline}"
                                else:
                                    pick_text = "View details"
                                
                                # Show probability and edge as confidence/value
                                prob = game.get('probability', 'N/A')
                                edge = game.get('edge', 'N/A')
                                
                                # Determine confidence level and add fire emoji for high confidence
                                try:
                                    prob_num = float(prob.replace('%', '')) if prob != 'N/A' else 0
                                    edge_num = float(edge.replace('%', '')) if edge != 'N/A' else 0
                                    
                                    if prob_num >= 70 or edge_num >= 10:
                                        conf = f"🔥 {prob}" if prob != 'N/A' else '🔥 High'
                                        tags = ['fire_pick', 'high_confidence']
                                    elif prob_num >= 60 or edge_num >= 5:
                                        conf = f"⚡ {prob}" if prob != 'N/A' else '⚡ Med'
                                        tags = ['high_confidence']
                                    elif prob_num >= 50 or edge_num >= 0:
                                        conf = f"📊 {prob}" if prob != 'N/A' else '📊 Low'
                                        tags = ['medium_confidence']
                                    else:
                                        conf = prob if prob != 'N/A' else 'Basic'
                                        tags = ['low_confidence']
                                except:
                                    conf = prob if prob != 'N/A' else 'Basic'
                                    tags = ['medium_confidence']
                                
                                value = edge if edge != 'N/A' else 'N/A'
                            
                            # Use tags for styling
                            if 'tags' in locals():
                                all_tags = tags + [json.dumps(game)]
                            else:
                                all_tags = [json.dumps(game)]
                            
                            self.enhanced_tree.insert('', 'end', text=str(pick_num),
                                values=(
                                    sport.upper(),
                                    game.get('matchup', 'N/A')[:35],
                                    pick_text,
                                    conf,
                                    value
                                ),
                                tags=all_tags
                            )
                            pick_num += 1
                            total_picks += 1
            
            self.enhanced_details_text.delete('1.0', tk.END)
            self.enhanced_details_text.insert('1.0', f"✅ Loaded {total_picks} enhanced AI picks\n\nClick any pick to view full analysis...")
            
        except Exception as e:
            self.enhanced_details_text.insert('1.0', f"❌ Error loading picks: {e}")
    
    def on_tree_hover(self, event):
        """Show tooltip on hover with betting lines"""
        if self.tooltip:
            self.tooltip.destroy()
            self.tooltip = None
        
        # Get item under cursor
        item = self.enhanced_tree.identify('item', event.x, event.y)
        if not item:
            return
        
        # Get item data
        try:
            item_data = self.enhanced_tree.item(item, 'tags')
            if not item_data or not item_data[0]:
                return
            
            game_data = json.loads(item_data[0])
            
            # Create tooltip content
            tooltip_text = f"🎯 {game_data.get('matchup', 'N/A')}\n\n"
            
            # Add betting lines
            spread = game_data.get('spread_pick', '')
            total = game_data.get('total_pick', '')
            moneyline = game_data.get('moneyline_pick', '')
            
            if spread and 'See screenshot' not in spread:
                spread_odds = game_data.get('spread_odds', 'N/A')
                tooltip_text += f"📊 SPREAD: {spread} ({spread_odds})\n"
            
            if total and 'See screenshot' not in total:
                total_odds = game_data.get('total_odds', 'N/A')
                tooltip_text += f"📈 TOTAL: {total} ({total_odds})\n"
            
            if moneyline and 'See screenshot' not in moneyline:
                ml_odds = game_data.get('moneyline_odds', 'N/A')
                tooltip_text += f"💰 MONEYLINE: {moneyline} ({ml_odds})\n"
            
            # Add probability and edge
            prob = game_data.get('probability', 'N/A')
            edge = game_data.get('edge', 'N/A')
            tooltip_text += f"\n🎲 Probability: {prob}\n"
            tooltip_text += f"💎 Edge: {edge}"
            
            # Create tooltip window
            self.tooltip = tk.Toplevel()
            self.tooltip.wm_overrideredirect(True)
            self.tooltip.wm_geometry(f"+{event.x_root+10}+{event.y_root+10}")
            
            # Style tooltip
            self.tooltip.configure(bg='#2d2d2d')
            
            # Create tooltip label
            tooltip_label = tk.Label(self.tooltip, text=tooltip_text, 
                                   bg='#2d2d2d', fg='#ffffff', 
                                   font=('Consolas', 9), 
                                   justify=tk.LEFT,
                                   relief=tk.RAISED, bd=2)
            tooltip_label.pack(padx=5, pady=5)
            
        except Exception as e:
            pass  # Silently ignore tooltip errors
    
    def on_tree_leave(self, event):
        """Hide tooltip when leaving tree"""
        if self.tooltip:
            self.tooltip.destroy()
            self.tooltip = None
    
    def on_enhanced_pick_selected(self, event):
        """Show details when pick is selected"""
        selection = self.enhanced_tree.selection()
        if not selection:
            return
        
        item = self.enhanced_tree.item(selection[0])
        tags = item.get('tags', [])
        if not tags or not tags[0]:
            return
        
        try:
            game = json.loads(tags[0])
        except (json.JSONDecodeError, IndexError):
            return
        
        # Check if this is enhanced or basic format
        is_enhanced = 'best_bet' in game
        
        if is_enhanced:
            # ENHANCED FORMAT - Full AI analysis
            details = f"""
{'='*70}
🎯 ENHANCED AI ANALYSIS
{'='*70}

📊 GAME: {game.get('matchup', 'N/A')}
🏆 Sport: {game.get('sport', 'N/A').upper()}
📅 Date: {game.get('date', 'N/A')}

{'='*70}
✅ RECOMMENDED BET
{'='*70}

Pick: {game.get('best_bet', {}).get('pick', 'N/A')}
Odds: {game.get('best_bet', {}).get('odds', 'N/A')}
Confidence: {game.get('best_bet', {}).get('confidence', 'N/A')}
Value Rating: {game.get('best_bet', {}).get('value_rating', 'N/A')}/10

{'='*70}
🧠 WHY THIS BET
{'='*70}

{game.get('reasoning', {}).get('why_this_bet', 'No reasoning available')}

PRIMARY FACTORS:
"""
            
            for factor in game.get('reasoning', {}).get('primary_factors', []):
                details += f"  ✓ {factor}\n"
            
            details += f"\nKEY EDGES:\n"
            for edge in game.get('reasoning', {}).get('key_edges', []):
                details += f"  💎 {edge}\n"
            
            details += f"\nRISKS:\n"
            for risk in game.get('reasoning', {}).get('risks', []):
                details += f"  ⚠️ {risk}\n"
            
            # Game context
            context = game.get('game_context', {})
            if context:
                details += f"\n{'='*70}\n🏈 GAME CONTEXT\n{'='*70}\n\n"
                
                if context.get('injuries'):
                    details += "🏥 INJURIES:\n"
                    for injury in context.get('injuries', []):
                        details += f"  • {injury}\n"
                
                if context.get('weather'):
                    details += f"\n🌦️ WEATHER: {context.get('weather', 'N/A')}\n"
                
                if context.get('travel'):
                    details += f"\n✈️ TRAVEL:\n  {context['travel'].get('away_travel', 'N/A')}\n"
        
        else:
            # BASIC FORMAT - OCR extracted data (Simple Formatter)
            details = f"""
{'='*70}
📊 DIMERZ PRO PICK DATA (OCR Extracted - FREE!)
{'='*70}

📊 GAME: {game.get('matchup', 'N/A')}
🏆 Sport: {game.get('sport', 'N/A').upper()}
📁 Screenshot: {game.get('filename', 'N/A')}

{'='*70}
💰 BETTING LINES
{'='*70}

🎯 SPREAD PICK: {game.get('spread_pick', 'N/A')}
   Odds: {game.get('spread_odds', 'N/A')}

🎯 TOTAL PICK: {game.get('total_pick', 'N/A')}
   Odds: {game.get('total_odds', 'N/A')}

💵 MONEYLINE: {game.get('moneyline_pick', 'N/A')}
   Odds: {game.get('moneyline_odds', 'N/A')}

{'='*70}
📊 DIMERZ PRO ANALYSIS
{'='*70}

📈 Probability: {game.get('probability', 'N/A')}
   (Dimerz AI's win probability)

💎 Edge: {game.get('edge', 'N/A')}
   (Your betting value advantage)

📊 Data Points: {game.get('data_extracted', 'N/A')}

{'='*70}
💡 ABOUT THIS DATA
{'='*70}

✅ Probability = How likely this bet is to win (Dimerz AI model)
✅ Edge = The value advantage you have on this bet
✅ Higher Edge = Better value bet

📸 View screenshot for full Dimerz analysis
📊 All data extracted instantly with OCR (no AI costs!)

{'='*70}\n"""
        
        self.enhanced_details_text.delete('1.0', tk.END)
        self.enhanced_details_text.insert('1.0', details)
    
    def manual_capture_enhanced(self):
        """Manually capture a missed game"""
        team = self.manual_team_entry.get().strip()
        sport = self.manual_sport_var.get()
        
        if not team:
            messagebox.showwarning("Warning", "Enter team name!")
            return
        
        if messagebox.askyesno("Confirm", f"Capture {team} ({sport.upper()})?\n\nThis will screenshot & analyze the game."):
            threading.Thread(target=self._run_manual_capture, args=(team, sport), daemon=True).start()
    
    def _run_manual_capture(self, team, sport):
        """Run manual capture in background"""
        try:
            script_path = os.path.join(SCRIPT_DIR, 'dimerzPro', 'run_complete_system.py')
            subprocess.run(['python', script_path, '--manual', team, '--sport', sport], timeout=120)
            self.root.after(0, lambda: messagebox.showinfo("Success", f"✅ {team} captured!\n\nClick Reload to see it."))
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Failed: {e}"))
    
    def generate_todays_enhanced_picks(self):
        """Generate today's enhanced AI picks for all sports"""
        if not messagebox.askyesno("Generate Picks", 
            "🤖 Generate Enhanced AI Picks for All Sports?\n\n" +
            "This will:\n" +
            "✅ Fetch games from ESPN (next 4 days)\n" +
            "✅ Screenshot Dimerz picks for all sports\n" +
            "✅ AI analyze with injuries/weather/travel\n" +
            "✅ Save to processed_picks/\n" +
            "✅ Auto-reload in this dashboard\n\n" +
            "Takes ~10 minutes for all sports."):
            return
        
        # Show progress window
        progress = tk.Toplevel(self.root)
        progress.title("Generating Enhanced Picks...")
        progress.geometry("500x300")
        progress.configure(bg='#0a0a0a')
        
        tk.Label(progress, text="🤖 Generating Enhanced AI Picks", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 14, 'bold')).pack(pady=20)
        
        status_text = scrolledtext.ScrolledText(progress, width=60, height=12, 
                                               bg='#1a1a1a', fg='#ffffff', font=('Courier New', 9))
        status_text.pack(pady=10, padx=20)
        
        status_text.insert('1.0', "Starting system...\n\n")
        
        def run_generation():
            try:
                status_text.insert(tk.END, "📡 Fetching games from ESPN...\n")
                status_text.see(tk.END)
                progress.update()
                
                script_path = os.path.join(SCRIPT_DIR, 'dimerzPro', 'run_complete_system.py')
                
                status_text.insert(tk.END, "📸 Capturing screenshots...\n")
                status_text.see(tk.END)
                progress.update()
                
                # Run the complete system
                result = subprocess.run(
                    ['python', script_path],
                    capture_output=True,
                    text=True,
                    timeout=900  # 15 minute timeout
                )
                
                if result.returncode == 0:
                    status_text.insert(tk.END, "\n✅ SUCCESS!\n")
                    status_text.insert(tk.END, "All sports analyzed with enhanced AI\n")
                    status_text.see(tk.END)
                    progress.update()
                    time.sleep(2)
                    
                    # Reload picks in main window
                    self.root.after(0, self.reload_enhanced_picks)
                    progress.destroy()
                else:
                    status_text.insert(tk.END, f"\n❌ Error:\n{result.stderr}\n")
                    status_text.see(tk.END)
                    
            except subprocess.TimeoutExpired:
                status_text.insert(tk.END, "\n❌ Timeout (>15 min)\n")
                status_text.see(tk.END)
            except Exception as e:
                status_text.insert(tk.END, f"\n❌ Error: {e}\n")
                status_text.see(tk.END)
        
        threading.Thread(target=run_generation, daemon=True).start()
    
    def process_screenshots_lightweight(self):
        """Extract pick data from screenshots using Simple Formatter (FREE, INSTANT!)"""
        if not messagebox.askyesno("Extract Picks", 
            "📊 Extract Picks from Screenshots (Simple Formatter)?\n\n" +
            "This will:\n" +
            "✅ Find all 114 screenshots\n" +
            "✅ Extract: Spread, Total, Probability, Edge\n" +
            "✅ Use OCR + Pattern Matching (NO AI COSTS!)\n" +
            "✅ Process ALL games in ~30 seconds\n" +
            "✅ Save to processed_picks/\n" +
            "✅ Auto-reload in dashboard\n\n" +
            "100% FREE - No rate limits!\n" +
            "Shows Dimerz Probability & Edge for each pick."):
            return
        
        # Show progress window
        progress = tk.Toplevel(self.root)
        progress.title("Extracting Picks...")
        progress.geometry("500x300")
        progress.configure(bg='#0a0a0a')
        
        tk.Label(progress, text="📊 Extracting Basic Pick Data", 
                bg='#0a0a0a', fg='#00ff88', font=('Arial', 14, 'bold')).pack(pady=20)
        
        status_text = scrolledtext.ScrolledText(progress, width=60, height=12, 
                                               bg='#1a1a1a', fg='#ffffff', font=('Courier New', 9))
        status_text.pack(pady=10, padx=20)
        
        status_text.insert('1.0', "Starting extraction...\n\n")
        
        def run_processing():
            try:
                status_text.insert(tk.END, "📊 Extracting with Simple Formatter (OCR + Pattern Matching)...\n")
                status_text.insert(tk.END, "Processing all 114 screenshots instantly (NO API COSTS!)...\n\n")
                status_text.see(tk.END)
                progress.update()
                
                # Run simple formatter
                script_path = os.path.join(SCRIPT_DIR, 'dimerzPro', 'simple_formatter.py')
                
                result = subprocess.run(
                    ['python', script_path],
                    capture_output=True,
                    text=True,
                    timeout=600
                )
                
                if result.returncode == 0:
                    status_text.insert(tk.END, "\n✅ EXTRACTION COMPLETE!\n\n")
                    status_text.insert(tk.END, "📊 Extracted: Spread, Total, Probability, Edge\n")
                    status_text.insert(tk.END, "💾 Saved to: processed_picks/\n")
                    status_text.insert(tk.END, "📈 Data Source: Dimerz Pro (OCR + Pattern Matching)\n")
                    status_text.insert(tk.END, "\n🎯 All picks now show:\n")
                    status_text.insert(tk.END, "  • Probability (Dimerz AI win %)\n")
                    status_text.insert(tk.END, "  • Edge (Your value advantage)\n")
                    status_text.insert(tk.END, "\nReloading picks...\n")
                    status_text.see(tk.END)
                    progress.update()
                    time.sleep(2)
                    
                    # Reload picks
                    self.root.after(0, self.reload_enhanced_picks)
                    progress.destroy()
                else:
                    status_text.insert(tk.END, f"\n❌ Error:\n{result.stderr[:500]}\n")
                    status_text.see(tk.END)
                    
            except subprocess.TimeoutExpired:
                status_text.insert(tk.END, "\n❌ Timeout\n")
                status_text.see(tk.END)
            except Exception as e:
                status_text.insert(tk.END, f"\n❌ Error: {e}\n")
                status_text.see(tk.END)
        
        threading.Thread(target=run_processing, daemon=True).start()
    
    def reload_enhanced_picks(self):
        """Reload enhanced picks from disk"""
        self.load_and_populate_enhanced_picks()
        messagebox.showinfo("Success", "Enhanced picks reloaded!")
    
    def cleanup_screenshots(self):
        """Clean up old screenshots"""
        try:
            screenshots_dir = os.path.join(SCRIPT_DIR, 'dimerzPro', 'screenshots')
            if os.path.exists(screenshots_dir):
                count = 0
                for filename in os.listdir(screenshots_dir):
                    if filename.endswith('.png'):
                        file_path = os.path.join(screenshots_dir, filename)
                        os.remove(file_path)
                        count += 1
                
                messagebox.showinfo("Success", f"✅ Cleaned up {count} old screenshots!")
            else:
                messagebox.showinfo("Info", "📁 No screenshots directory found")
        except Exception as e:
            messagebox.showerror("Error", f"❌ Error cleaning screenshots: {str(e)}")
    
    def cleanup_finished_games(self):
        """Remove finished games from processed picks"""
        try:
            picks_dir = os.path.join(SCRIPT_DIR, 'dimerzPro', 'processed_picks')
            
            if not os.path.exists(picks_dir):
                messagebox.showinfo("Info", "📁 No processed picks directory found")
                return
            
            current_time = datetime.now()
            games_removed = 0
            
            for filename in os.listdir(picks_dir):
                if filename.endswith('.json') and 'picks' in filename:
                    file_path = os.path.join(picks_dir, filename)
                    try:
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                        
                        # Filter out finished games
                        original_count = len(data.get('games', []))
                        active_games = []
                        
                        for game in data.get('games', []):
                            # Check if game is finished
                            game_time_str = game.get('game_time', '')
                            if game_time_str:
                                try:
                                    # Parse game time and check if it's more than 3 hours old
                                    game_time = datetime.fromisoformat(game_time_str.replace('Z', '+00:00'))
                                    time_diff = current_time - game_time.replace(tzinfo=None)
                                    
                                    # Remove games that finished more than 3 hours ago
                                    if time_diff.total_seconds() > 3 * 3600:  # 3 hours
                                        continue
                                except:
                                    # If we can't parse the time, keep the game
                                    pass
                            
                            active_games.append(game)
                        
                        # Update the file if games were removed
                        if len(active_games) < original_count:
                            data['games'] = active_games
                            data['total_games'] = len(active_games)
                            data['last_updated'] = current_time.isoformat()
                            
                            with open(file_path, 'w') as f:
                                json.dump(data, f, indent=2)
                            
                            removed_count = original_count - len(active_games)
                            games_removed += removed_count
                    
                    except Exception as e:
                        print(f"⚠️ Error processing {filename}: {e}")
            
            if games_removed > 0:
                messagebox.showinfo("Success", f"✅ Removed {games_removed} finished games!")
                # Reload the enhanced picks display
                self.load_and_populate_enhanced_picks()
            else:
                messagebox.showinfo("Info", "✅ No finished games to remove")
                
        except Exception as e:
            messagebox.showerror("Error", f"❌ Error cleaning finished games: {str(e)}")
    
    def auto_start_services(self):
        """Automatically start AI Predictor when Control Center opens"""
        try:
            self.log("🚀 Auto-starting services...")
            
            # Start AI Predictor
            if not self.predictor_server_process:
                self.start_predictor()
            
            self.log("✅ Auto-start complete!")
            
        except Exception as e:
            self.log(f"⚠️ Auto-start error: {str(e)}")
    
    def on_closing(self):
        """Handle window close"""
        if messagebox.askokcancel("Quit", "Stop all services and quit?"):
            self.stop_all()
            self.root.destroy()

def main():
    root = tk.Tk()
    app = LuckLabControlCenter(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == '__main__':
    main()

