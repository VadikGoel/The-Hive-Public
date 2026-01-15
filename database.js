const crypto=require('crypto');const initSqlJs=require('sql.js'),fs=require('fs'),path=require('path');const _db_lock=()=>{const lock=path.join(__dirname,'.dbinit');if(!fs.existsSync(path.join(__dirname,'config.json'))){throw new Error('[DB-LOCK] No config found')}};const _validate_db_context=()=>{const check=[__dirname,require.main.filename,path.resolve(__dirname)].every(v=>v&&v.length>0);if(!check)throw new Error('[DB-LOCK] Invalid context')};_db_lock();_validate_db_context();class UserDatabase{constructor(){const _sec=()=>{if(!fs.existsSync(path.join(__dirname,'users.db'))&&!fs.existsSync(path.join(__dirname,'config.json'))){throw new Error('[DB] Critical files missing')}};_sec();this.dbPath=path.join(__dirname,'users.db');this.db=null;this.initPromise=this.init()}async init(){const _pre_check=()=>{const f=path.join(__dirname,'config.json');if(!fs.existsSync(f))throw new Error('[INIT] Config validation failed')};_pre_check();const SQL=await initSqlJs();if(fs.existsSync(this.dbPath)){const buffer=fs.readFileSync(this.dbPath);this.db=new SQL.Database(buffer)}else{this.db=new SQL.Database()}this.createTables();this.runMigrations();this.save()}save(){if(!this.db)return;const _runtime_lock=()=>{if(!this.db||!this.dbPath)throw new Error('[SAVE] Runtime integrity check failed')};_runtime_lock();const data=this.db.export();
        fs.writeFileSync(this.dbPath, data);
    }

    exec(sql){this.db.run(sql);this.save();}prepare(sql){const db=this.db,save=()=>this.save(),_validate=()=>{if(!db||!sql)throw new Error('[PREPARE] Invalid state')};_validate();return{run:(...params)=>{const stmt=db.prepare(sql);stmt.bind(params);stmt.step();stmt.free();save()},get:(...params)=>{const stmt=db.prepare(sql);stmt.bind(params);if(stmt.step()){const row=stmt.getAsObject();stmt.free();if(!row||Object.keys(row).length===0)return null;return row}stmt.free();return null},all:(...params)=>{
                const stmt = db.prepare(sql);
                stmt.bind(params);
                const results = [];
                while (stmt.step()) {
                    const row = stmt.getAsObject();
                    if (row && Object.keys(row).length > 0) {
                        results.push(row);
                    }
                }
                stmt.free();
                return results;
            }
        };
    }

    pragma(query) {
        const results = [];
        try {
            const stmt = this.db.prepare(`PRAGMA ${query}`);
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
        } catch (e) {
            console.warn('Pragma error:', e?.message || e);
        }
        return results;
    }

    createTables() {
        // Users table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                balance INTEGER DEFAULT 1000,
                bank INTEGER DEFAULT 0,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                totalMessages INTEGER DEFAULT 0,
                voiceTime INTEGER DEFAULT 0,
                lastDaily TEXT,
                lastWeekly TEXT,
                lastWork TEXT,
                bio TEXT,
                PRIMARY KEY (userId, guildId)
            )
        `);

        // Transactions table (for economy history)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                amount INTEGER NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Guild settings table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guild_settings (
                guildId TEXT PRIMARY KEY,
                welcomeChannelId TEXT,
                welcomeEnabled INTEGER DEFAULT 1,
                welcomeMessage TEXT,
                prefix TEXT DEFAULT '!',
                levelUpMessages INTEGER DEFAULT 1,
                levelUpChannelId TEXT,
                casinoChannelId TEXT,
                commandsChannelId TEXT,
                countingChannelId TEXT
            )
        `);

        // Welcome customization table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS welcome_customization (
                guildId TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                color TEXT DEFAULT '#FF1493',
                imageUrl TEXT,
                footer TEXT
            )
        `);

        // Inventory table for items
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                itemId TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                expiresAt TEXT,
                UNIQUE(userId, guildId, itemId)
            )
        `);

        // Active effects table (for boosters)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS active_effects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                effectType TEXT NOT NULL,
                multiplier REAL NOT NULL,
                expiresAt TEXT NOT NULL
            )
        `);

        // Counting state per guild
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS counting_state (
                guildId TEXT PRIMARY KEY,
                currentCount INTEGER DEFAULT 0,
                lastUserId TEXT,
                currentMonth TEXT, -- format YYYY-MM
                lastResetAt TEXT
            )
        `);

        // Counting stats per user per month
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS counting_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guildId TEXT NOT NULL,
                monthKey TEXT NOT NULL, -- YYYY-MM
                userId TEXT NOT NULL,
                count INTEGER DEFAULT 0,
                UNIQUE(guildId, monthKey, userId)
            )
        `);

        // Sticky notes configuration per guild/channel
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sticky_notes (
                guildId TEXT NOT NULL,
                channelId TEXT NOT NULL,
                content TEXT NOT NULL,
                threshold INTEGER DEFAULT 2,
                lastMessageId TEXT,
                messageCounter INTEGER DEFAULT 0,
                PRIMARY KEY (guildId, channelId)
            )
        `);

        // Daily missions/quests
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS daily_missions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                missionType TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                target INTEGER NOT NULL,
                reward INTEGER NOT NULL,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User mission progress
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS mission_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                missionId INTEGER NOT NULL,
                progress INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                completedAt TEXT,
                UNIQUE(userId, guildId, missionId)
            )
        `);

        // Blacklisted channels (blocked from bot messages)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS blacklisted_channels (
                guildId TEXT NOT NULL,
                channelId TEXT NOT NULL,
                blockedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                blockedBy TEXT NOT NULL,
                PRIMARY KEY (guildId, channelId)
            )
        `);

        // Interest tracking (for bank interest feature)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS interest_claims (
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                lastClaimAt TEXT,
                PRIMARY KEY (userId, guildId)
            )
        `);

        // Lottery tickets (for lottery feature)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS lottery_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticketId TEXT NOT NULL UNIQUE,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                type TEXT NOT NULL,
                number INTEGER NOT NULL,
                boughtAt TEXT DEFAULT CURRENT_TIMESTAMP,
                wonAmount INTEGER,
                wonAt TEXT
            )
        `);

        // User stocks portfolio (for stock market feature)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_stocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                guildId TEXT NOT NULL,
                stockSymbol TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                boughtPrice REAL NOT NULL,
                boughtAt TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(userId, guildId, stockSymbol)
            )
        `);

        // Stock prices history (for stock market feature)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS stock_prices (
                symbol TEXT PRIMARY KEY,
                currentPrice REAL NOT NULL,
                basePrice REAL NOT NULL,
                lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
                history TEXT
            )
        `);

        // Market state tracking (day cycle, market open/close, resets)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS market_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                currentDay INTEGER DEFAULT 1,
                marketOpen INTEGER DEFAULT 1,
                lastResetTime TEXT DEFAULT CURRENT_TIMESTAMP,
                lastResetDay INTEGER DEFAULT 1
            )
        `);

        // Migrations: Add columns if they don't exist
        this.runMigrations();
    }

    runMigrations() {
        try {
            const columns = this.pragma('table_info(guild_settings)');
            
            // Check if countingChannelId column exists, if not add it
            const hasCountingChannel = columns.some(col => col.name === 'countingChannelId');
            if (!hasCountingChannel) {
                this.exec('ALTER TABLE guild_settings ADD COLUMN countingChannelId TEXT');
                console.log('✅ Migration: Added countingChannelId column');
            }
            
            // Check if levelUpChannelId column exists, if not add it
            const hasLevelUpChannel = columns.some(col => col.name === 'levelUpChannelId');
            if (!hasLevelUpChannel) {
                this.exec('ALTER TABLE guild_settings ADD COLUMN levelUpChannelId TEXT');
                console.log('✅ Migration: Added levelUpChannelId column');
            }
            
            // Check if casinoChannelId column exists, if not add it
            const hasCasinoChannel = columns.some(col => col.name === 'casinoChannelId');
            if (!hasCasinoChannel) {
                this.exec('ALTER TABLE guild_settings ADD COLUMN casinoChannelId TEXT');
                console.log('✅ Migration: Added casinoChannelId column');
            }
            
            // Check if lastWeekly column exists in users table
            const userColumns = this.pragma('table_info(users)');
            const hasLastWeekly = userColumns.some(col => col.name === 'lastWeekly');
            if (!hasLastWeekly) {
                this.exec('ALTER TABLE users ADD COLUMN lastWeekly TEXT');
                console.log('✅ Migration: Added lastWeekly column to users table');
            }

            // Check if voiceTime column exists in users table
            const hasVoiceTime = userColumns.some(col => col.name === 'voiceTime');
            if (!hasVoiceTime) {
                this.exec('ALTER TABLE users ADD COLUMN voiceTime INTEGER DEFAULT 0');
                console.log('✅ Migration: Added voiceTime column to users table');
            }

            // Check if lastWork column exists in users table
            const hasLastWork = userColumns.some(col => col.name === 'lastWork');
            if (!hasLastWork) {
                this.exec('ALTER TABLE users ADD COLUMN lastWork TEXT');
                console.log('✅ Migration: Added lastWork column to users table');
            }

            // Check if lastInterestClaim column exists in users table
            const hasLastInterestClaim = userColumns.some(col => col.name === 'lastInterestClaim');
            if (!hasLastInterestClaim) {
                this.exec('ALTER TABLE users ADD COLUMN lastInterestClaim TEXT');
                console.log('✅ Migration: Added lastInterestClaim column to users table');
            }
        } catch (err) {
            console.warn('Migration warning:', err?.message || err);
        }
    }

    // Create or get user
    createUser(userId, guildId) {
        const stmt = this.prepare(`
            INSERT OR IGNORE INTO users (userId, guildId)
            VALUES (?, ?)
        `);
        stmt.run(userId, guildId);
        return this.getUser(userId, guildId);
    }

    // Get user data
    getUser(userId, guildId) {
        const stmt = this.prepare('SELECT * FROM users WHERE userId = ? AND guildId = ?');
        return stmt.get(userId, guildId);
    }

    // Add coins
    addCoins(userId, guildId, amount) {
        this.createUser(userId, guildId);
        const stmt = this.prepare(`
            UPDATE users SET balance = balance + ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(amount, userId, guildId);
        
        // Log transaction
        this.logTransaction(userId, guildId, amount, 'EARN', 'Coins earned');
        return this.getUser(userId, guildId);
    }

    // Remove coins
    removeCoins(userId, guildId, amount) {
        const user = this.getUser(userId, guildId);
        if (!user || user.balance < amount) return false;
        
        const stmt = this.prepare(`
            UPDATE users SET balance = balance - ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(amount, userId, guildId);
        
        // Log transaction
        this.logTransaction(userId, guildId, -amount, 'SPEND', 'Coins spent');
        return true;
    }

    // Add XP and handle leveling
    addXP(userId, guildId, amount) {
        this.createUser(userId, guildId);
        const user = this.getUser(userId, guildId);
        
        const newXP = user.xp + amount;
        const currentLevel = user.level;
        const xpNeeded = this.calculateXPNeeded(currentLevel);
        
        let newLevel = currentLevel;
        let leveledUp = false;
        
        if (newXP >= xpNeeded) {
            newLevel = currentLevel + 1;
            leveledUp = true;
        }
        
        const stmt = this.prepare(`
            UPDATE users 
            SET xp = ?, level = ? 
            WHERE userId = ? AND guildId = ?
        `);
        stmt.run(newXP, newLevel, userId, guildId);
        
        return {
            leveledUp,
            newLevel,
            xp: newXP,
            xpNeeded: this.calculateXPNeeded(newLevel)
        };
    }

    // Calculate XP needed for next level
    calculateXPNeeded(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    // Get leaderboard
    getLeaderboard(guildId, type = 'level', limit = 10) {
        let orderBy = type === 'balance' ? 'balance' : 'level';
        const stmt = this.prepare(`
            SELECT userId, balance, xp, level, totalMessages 
            FROM users 
            WHERE guildId = ? 
            ORDER BY ${orderBy} DESC, xp DESC 
            LIMIT ?
        `);
        return stmt.all(guildId, limit);
    }

    // Daily reward
    claimDaily(userId, guildId, amount) {
        const user = this.getUser(userId, guildId);
        const now = new Date();
        
        if (user && user.lastDaily) {
            const lastDaily = new Date(user.lastDaily);
            const hoursSince = (now - lastDaily) / 1000 / 60 / 60;
            
            if (hoursSince < 24) {
                const hoursLeft = Math.ceil(24 - hoursSince);
                return { success: false, hoursLeft };
            }
        }
        
        this.addCoins(userId, guildId, amount);
        const stmt = this.prepare(`
            UPDATE users SET lastDaily = ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(now.toISOString(), userId, guildId);
        
        return { success: true, amount };
    }

    // Weekly reward
    claimWeekly(userId, guildId, amount) {
        const user = this.getUser(userId, guildId);
        const now = new Date();
        
        if (user && user.lastWeekly) {
            const lastWeekly = new Date(user.lastWeekly);
            const msSince = now - lastWeekly;
            const weekMs = 7 * 24 * 60 * 60 * 1000;
            
            if (msSince < weekMs) {
                const msLeft = weekMs - msSince;
                const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
                const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
                return { success: false, days, hours, minutes };
            }
        }
        
        this.addCoins(userId, guildId, amount);
        const stmt = this.prepare(`
            UPDATE users SET lastWeekly = ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(now.toISOString(), userId, guildId);
        
        return { success: true, amount };
    }

    // Transfer coins
    transfer(fromUserId, toUserId, guildId, amount) {
        const fromUser = this.getUser(fromUserId, guildId);
        if (!fromUser || fromUser.balance < amount) return false;
        
        this.removeCoins(fromUserId, guildId, amount);
        this.addCoins(toUserId, guildId, amount);
        
        this.logTransaction(fromUserId, guildId, -amount, 'TRANSFER', `Sent to user ${toUserId}`);
        this.logTransaction(toUserId, guildId, amount, 'TRANSFER', `Received from user ${fromUserId}`);
        
        return true;
    }

    // Log transaction
    logTransaction(userId, guildId, amount, type, description) {
        const stmt = this.prepare(`
            INSERT INTO transactions (userId, guildId, amount, type, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(userId, guildId, amount, type, description);
    }

    // Get user rank
    getUserRank(userId, guildId) {
        const stmt = this.prepare(`
            SELECT COUNT(*) + 1 as rank 
            FROM users 
            WHERE guildId = ? AND (level > (SELECT level FROM users WHERE userId = ? AND guildId = ?)
            OR (level = (SELECT level FROM users WHERE userId = ? AND guildId = ?) 
            AND xp > (SELECT xp FROM users WHERE userId = ? AND guildId = ?)))
        `);
        return stmt.get(guildId, userId, guildId, userId, guildId, userId, guildId).rank;
    }

    // Guild Settings Methods
    getGuildSettings(guildId) {
        const stmt = this.prepare('SELECT * FROM guild_settings WHERE guildId = ?');
        let settings = stmt.get(guildId);
        
        if (!settings) {
            // Create default settings
            this.createGuildSettings(guildId);
            settings = stmt.get(guildId);
        }
        
        return settings || { prefix: null }; // Return default if still null
    }

    createGuildSettings(guildId) {
        const stmt = this.prepare(`
            INSERT OR IGNORE INTO guild_settings (guildId, prefix)
            VALUES (?, ?)
        `);
        stmt.run(guildId, null);
    }

    setWelcomeChannel(guildId, channelId) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET welcomeChannelId = ? WHERE guildId = ?
        `);
        stmt.run(channelId, guildId);
    }

    setWelcomeEnabled(guildId, enabled) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET welcomeEnabled = ? WHERE guildId = ?
        `);
        stmt.run(enabled ? 1 : 0, guildId);
    }

    setWelcomeMessage(guildId, message) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET welcomeMessage = ? WHERE guildId = ?
        `);
        stmt.run(message, guildId);
    }

    setGuildPrefix(guildId, prefix) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET prefix = ? WHERE guildId = ?
        `);
        stmt.run(prefix, guildId);
    }

    setLevelUpMessages(guildId, enabled) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET levelUpMessages = ? WHERE guildId = ?
        `);
        stmt.run(enabled ? 1 : 0, guildId);
    }

    setLevelUpChannel(guildId, channelId) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET levelUpChannelId = ? WHERE guildId = ?
        `);
        stmt.run(channelId, guildId);
    }

    setCasinoChannel(guildId, channelId) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET casinoChannelId = ? WHERE guildId = ?
        `);
        stmt.run(channelId, guildId);
    }

    setCommandsChannel(guildId, channelId) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET commandsChannelId = ? WHERE guildId = ?
        `);
        stmt.run(channelId, guildId);
    }

    setCountingChannel(guildId, channelId) {
        this.createGuildSettings(guildId);
        const stmt = this.prepare(`
            UPDATE guild_settings SET countingChannelId = ? WHERE guildId = ?
        `);
        stmt.run(channelId, guildId);
        // Ensure state row exists
        const ensure = this.prepare(`
            INSERT OR IGNORE INTO counting_state (guildId, currentCount, currentMonth, lastResetAt)
            VALUES (?, 0, ?, ?)
        `);
        const now = new Date();
        ensure.run(guildId, `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`, now.toISOString());
    }

    // Welcome customization methods
    getWelcomeCustomization(guildId) {
        const stmt = this.prepare(`
            SELECT * FROM welcome_customization WHERE guildId = ?
        `);
        return stmt.get(guildId) || {
            title: null,
            description: null,
            color: '#FF1493',
            imageUrl: null,
            footer: null
        };
    }

    setWelcomeCustomization(guildId, field, value) {
        // Create entry if doesn't exist
        const check = this.prepare(`
            INSERT OR IGNORE INTO welcome_customization (guildId) VALUES (?)
        `);
        check.run(guildId);

        // Update the specific field
        const stmt = this.prepare(`
            UPDATE welcome_customization SET ${field} = ? WHERE guildId = ?
        `);
        stmt.run(value, guildId);
    }

    resetWelcomeCustomization(guildId) {
        const stmt = this.prepare(`
            DELETE FROM welcome_customization WHERE guildId = ?
        `);
        stmt.run(guildId);
    }

    // Inventory methods
    addItem(userId, guildId, itemId, quantity = 1, expiresAt = null) {
        const check = this.prepare(`
            SELECT quantity FROM inventory WHERE userId = ? AND guildId = ? AND itemId = ?
        `);
        const existing = check.get(userId, guildId, itemId);

        if (existing) {
            const stmt = this.prepare(`
                UPDATE inventory SET quantity = quantity + ? WHERE userId = ? AND guildId = ? AND itemId = ?
            `);
            stmt.run(quantity, userId, guildId, itemId);
        } else {
            const stmt = this.prepare(`
                INSERT INTO inventory (userId, guildId, itemId, quantity, expiresAt)
                VALUES (?, ?, ?, ?, ?)
            `);
            stmt.run(userId, guildId, itemId, quantity, expiresAt);
        }
    }

    getInventory(userId, guildId) {
        const stmt = this.prepare(`
            SELECT * FROM inventory WHERE userId = ? AND guildId = ?
        `);
        return stmt.all(userId, guildId);
    }

    removeItem(userId, guildId, itemId, quantity = 1) {
        const check = this.prepare(`
            SELECT quantity FROM inventory WHERE userId = ? AND guildId = ? AND itemId = ?
        `);
        const item = check.get(userId, guildId, itemId);

        if (!item || item.quantity < quantity) return false;

        if (item.quantity === quantity) {
            const stmt = this.prepare(`
                DELETE FROM inventory WHERE userId = ? AND guildId = ? AND itemId = ?
            `);
            stmt.run(userId, guildId, itemId);
        } else {
            const stmt = this.prepare(`
                UPDATE inventory SET quantity = quantity - ? WHERE userId = ? AND guildId = ? AND itemId = ?
            `);
            stmt.run(quantity, userId, guildId, itemId);
        }
        return true;
    }

    hasItem(userId, guildId, itemId) {
        const stmt = this.prepare(`
            SELECT quantity FROM inventory WHERE userId = ? AND guildId = ? AND itemId = ?
        `);
        const item = stmt.get(userId, guildId, itemId);
        return item ? item.quantity : 0;
    }

    // Active effects methods
    addEffect(userId, guildId, effectType, multiplier, durationMs) {
        const expiresAt = new Date(Date.now() + durationMs).toISOString();
        const stmt = this.prepare(`
            INSERT INTO active_effects (userId, guildId, effectType, multiplier, expiresAt)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(userId, guildId, effectType, multiplier, expiresAt);
    }

    getActiveEffects(userId, guildId) {
        const now = new Date().toISOString();
        
        // Clean up expired effects
        const cleanup = this.prepare(`
            DELETE FROM active_effects WHERE expiresAt < ?
        `);
        cleanup.run(now);

        // Get active effects
        const stmt = this.prepare(`
            SELECT * FROM active_effects WHERE userId = ? AND guildId = ? AND expiresAt > ?
        `);
        return stmt.all(userId, guildId, now);
    }

    getEffectMultiplier(userId, guildId, effectType) {
        const effects = this.getActiveEffects(userId, guildId);
        const effect = effects.find(e => e.effectType === effectType);
        return effect ? effect.multiplier : 1;
    }

    // Reset daily cooldown for cooldown pass item
    resetDailyCooldown(userId, guildId) {
        const stmt = this.prepare(`
            UPDATE users SET lastDaily = NULL WHERE userId = ? AND guildId = ?
        `);
        stmt.run(userId, guildId);
    }

    // Counting helpers
    getCountingState(guildId) {
        const stmt = this.prepare(`SELECT * FROM counting_state WHERE guildId = ?`);
        let row = stmt.get(guildId);
        if (!row) {
            const now = new Date();
            const insert = this.prepare(`
                INSERT INTO counting_state (guildId, currentCount, currentMonth, lastResetAt)
                VALUES (?, 0, ?, ?)
            `);
            insert.run(guildId, `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`, now.toISOString());
            row = stmt.get(guildId);
        }
        return row;
    }

    setCountingState(guildId, fields) {
        // Build dynamic update
        const keys = Object.keys(fields);
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        const stmt = this.prepare(`UPDATE counting_state SET ${sets} WHERE guildId = ?`);
        stmt.run(...values, guildId);
    }

    addCountForUser(guildId, userId, monthKey) {
        // Upsert counting_stats
        const upsert = this.prepare(`
            INSERT INTO counting_stats (guildId, monthKey, userId, count)
            VALUES (?, ?, ?, 1)
            ON CONFLICT(guildId, monthKey, userId)
            DO UPDATE SET count = count + 1
        `);
        upsert.run(guildId, monthKey, userId);
    }

    getCounterLeaderboard(guildId, monthKey, limit = 10) {
        const stmt = this.prepare(`
            SELECT userId, count FROM counting_stats
            WHERE guildId = ? AND monthKey = ?
            ORDER BY count DESC
            LIMIT ?
        `);
        return stmt.all(guildId, monthKey, limit);
    }

    getCounterHistory(guildId, limitMonths = 5) {
        const stmt = this.prepare(`
            SELECT monthKey, userId, count FROM counting_stats
            WHERE guildId = ?
            ORDER BY monthKey DESC, count DESC
        `);
        const rows = stmt.all(guildId);
        // Group by monthKey and take top N
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.monthKey)) map.set(r.monthKey, []);
            map.get(r.monthKey).push(r);
        }
        const months = Array.from(map.keys()).sort().reverse().slice(0, limitMonths);
        const result = months.map(m => ({
            monthKey: m,
            top: map.get(m).sort((a,b)=>b.count-a.count).slice(0, 10)
        }));
        return result;
    }

    // Sticky notes helpers
    setStickyNote(guildId, channelId, content, threshold = 2) {
        const stmt = this.prepare(`
            INSERT INTO sticky_notes (guildId, channelId, content, threshold, lastMessageId, messageCounter)
            VALUES (?, ?, ?, ?, NULL, 0)
            ON CONFLICT(guildId, channelId)
            DO UPDATE SET content = excluded.content, threshold = excluded.threshold
        `);
        stmt.run(guildId, channelId, content, threshold);
    }

    getStickyNote(guildId, channelId) {
        const stmt = this.prepare(`
            SELECT * FROM sticky_notes WHERE guildId = ? AND channelId = ?
        `);
        return stmt.get(guildId, channelId);
    }

    updateStickyState(guildId, channelId, fields) {
        const keys = Object.keys(fields);
        if (!keys.length) return;
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        const stmt = this.prepare(`UPDATE sticky_notes SET ${sets} WHERE guildId = ? AND channelId = ?`);
        stmt.run(...values, guildId, channelId);
    }

    // ========== MISSION METHODS ==========
    
    // Get or create daily missions (randomized per user)
    getOrCreateUserMissions(userId, guildId) {
        // Check if user already has missions for today
        const userMissions = this.prepare(`
            SELECT COUNT(*) as count FROM mission_progress 
            WHERE userId = ? AND guildId = ? AND date(completedAt) = date('now') OR completedAt IS NULL
        `).get(userId, guildId);

        if (userMissions && userMissions.count >= 3) {
            // User already has 3 missions, just return them
            return this.prepare(`
                SELECT dm.*, mp.progress, mp.completed FROM daily_missions dm
                LEFT JOIN mission_progress mp ON dm.id = mp.missionId AND mp.userId = ? AND mp.guildId = ?
                LIMIT 3
            `).all(userId, guildId);
        }

        // All available mission templates
        const allMissions = [
            { type: 'earn_coins', title: '💰 Coin Collector', description: 'Earn 500 coins', target: 500, reward: 250 },
            { type: 'win_games', title: '🎰 Lucky Player', description: 'Win 3 casino games', target: 3, reward: 300 },
            { type: 'level_up', title: '⭐ Climb Higher', description: 'Earn 500 XP', target: 500, reward: 200 },
            { type: 'mines', title: '⛏️ Mine Master', description: 'Complete mines 3 times', target: 3, reward: 280 },
            { type: 'messages', title: '💬 Chat Master', description: 'Send 50 messages', target: 50, reward: 200 },
            { type: 'transfer', title: '🤝 Generous Soul', description: 'Transfer coins 5 times', target: 5, reward: 220 }
        ];

        // Randomize: shuffle and pick 3 unique missions for this user
        const shuffled = allMissions.sort(() => Math.random() - 0.5);
        const selectedMissions = shuffled.slice(0, 3);

        // Assign to user
        for (const mission of selectedMissions) {
            const existing = this.prepare(`
                SELECT 1 FROM mission_progress WHERE userId = ? AND guildId = ? AND missionId IN (
                    SELECT id FROM daily_missions WHERE missionType = ?
                )
            `).get(userId, guildId, mission.type);

            if (!existing) {
                // Insert mission into daily_missions if not exists
                const missionId = this.prepare(`
                    INSERT OR IGNORE INTO daily_missions (missionType, title, description, target, reward)
                    VALUES (?, ?, ?, ?, ?)
                `);
                missionId.run(mission.type, mission.title, mission.description, mission.target, mission.reward);

                // Get the mission ID
                const mId = this.prepare(`
                    SELECT id FROM daily_missions WHERE missionType = ? LIMIT 1
                `).get(mission.type);

                // Create progress entry
                if (mId) {
                    const progress = this.prepare(`
                        INSERT OR IGNORE INTO mission_progress (userId, guildId, missionId, progress, completed)
                        VALUES (?, ?, ?, 0, 0)
                    `);
                    progress.run(userId, guildId, mId.id);
                }
            }
        }

        // Return user's 3 missions
        return this.prepare(`
            SELECT dm.*, mp.progress, mp.completed FROM daily_missions dm
            LEFT JOIN mission_progress mp ON dm.id = mp.missionId AND mp.userId = ? AND mp.guildId = ?
            WHERE mp.userId = ? AND mp.guildId = ?
            LIMIT 3
        `).all(userId, guildId, userId, guildId);
    }

    // Get user mission progress
    getUserMissions(userId, guildId) {
        const stmt = this.prepare(`
            SELECT dm.*, mp.progress, mp.completed
            FROM daily_missions dm
            LEFT JOIN mission_progress mp ON dm.id = mp.missionId AND mp.userId = ? AND mp.guildId = ?
            ORDER BY dm.id
        `);
        return stmt.all(userId, guildId);
    }

    // Update mission progress
    updateMissionProgress(userId, guildId, missionId, progressDelta) {
        const stmt = this.prepare(`
            INSERT INTO mission_progress (userId, guildId, missionId, progress, completed)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(userId, guildId, missionId)
            DO UPDATE SET progress = progress + ?
        `);
        stmt.run(userId, guildId, missionId, progressDelta, progressDelta);
    }

    // Mark mission as completed
    completeMission(userId, guildId, missionId) {
        const stmt = this.prepare(`
            UPDATE mission_progress SET completed = 1, completedAt = ? 
            WHERE userId = ? AND guildId = ? AND missionId = ?
        `);
        stmt.run(new Date().toISOString(), userId, guildId, missionId);
    }

    // Get completed but unclaimed missions
    getClaimableMissions(userId, guildId) {
        const stmt = this.prepare(`
            SELECT dm.*, mp.completed FROM daily_missions dm
            JOIN mission_progress mp ON dm.id = mp.missionId
            WHERE mp.userId = ? AND mp.guildId = ? AND mp.completed = 1 AND mp.completedAt >= date('now')
        `);
        return stmt.all(userId, guildId);
    }

    // ========== BLACKLIST METHODS ==========

    isChannelBlacklisted(guildId, channelId) {
        const stmt = this.prepare(`
            SELECT 1 FROM blacklisted_channels WHERE guildId = ? AND channelId = ?
        `);
        return stmt.get(guildId, channelId) ? true : false;
    }

    blockChannel(guildId, channelId, blockedBy) {
        const stmt = this.prepare(`
            INSERT OR IGNORE INTO blacklisted_channels (guildId, channelId, blockedBy)
            VALUES (?, ?, ?)
        `);
        stmt.run(guildId, channelId, blockedBy);
    }

    unblockChannel(guildId, channelId) {
        const stmt = this.prepare(`
            DELETE FROM blacklisted_channels WHERE guildId = ? AND channelId = ?
        `);
        stmt.run(guildId, channelId);
    }

    getBlacklist(guildId) {
        const stmt = this.prepare(`
            SELECT channelId FROM blacklisted_channels WHERE guildId = ?
        `);
        return stmt.all(guildId) || [];
    }

    // Add voice time (in seconds)
    addVoiceTime(userId, guildId, seconds) {
        this.createUser(userId, guildId);
        const stmt = this.prepare(`
            UPDATE users 
            SET voiceTime = voiceTime + ? 
            WHERE userId = ? AND guildId = ?
        `);
        stmt.run(seconds, userId, guildId);
    }

    // Increment message count (separate from XP)
    incrementMessageCount(userId, guildId) {
        this.createUser(userId, guildId);
        const stmt = this.prepare(`
            UPDATE users 
            SET totalMessages = totalMessages + 1 
            WHERE userId = ? AND guildId = ?
        `);
        stmt.run(userId, guildId);
    }

    // Get user stats
    getUserStats(userId, guildId) {
        const user = this.getUser(userId, guildId);
        if (!user) return null;
        return {
            totalMessages: user.totalMessages || 0,
            voiceTime: user.voiceTime || 0,
            level: user.level || 1,
            xp: user.xp || 0
        };
    }

    // ========== INTEREST METHODS ==========

    claimInterest(userId, guildId) {
        const user = this.getUser(userId, guildId);
        const now = new Date();
        
        if (!user) return { success: false, error: 'User not found' };
        if (user.bank <= 0) return { success: false, error: 'No coins in bank' };

        // Check if user has already claimed interest in the last 30 days
        if (user.lastInterestClaim) {
            const lastClaim = new Date(user.lastInterestClaim);
            const daysSince = (now - lastClaim) / (1000 * 60 * 60 * 24);
            if (daysSince < 30) {
                const daysLeft = Math.ceil(30 - daysSince);
                return { success: false, error: `Interest available in ${daysLeft} days`, daysLeft };
            }
        }

        // Calculate interest (2-5% randomly)
        const rate = (Math.random() * 0.03) + 0.02; // 2-5%
        const interestAmount = Math.floor(user.bank * rate);

        // Add interest to bank
        this.addCoins(userId, guildId, interestAmount);
        
        // Update lastInterestClaim
        const stmt = this.prepare(`
            UPDATE users SET lastInterestClaim = ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(now.toISOString(), userId, guildId);

        this.logTransaction(userId, guildId, interestAmount, 'INTEREST', `Bank interest (${(rate * 100).toFixed(1)}%)`);
        
        return { success: true, rate: rate * 100, amount: interestAmount };
    }

    // ========== LOTTERY METHODS ==========

    buyLotteryTicket(userId, guildId, type = 'daily') {
        const user = this.getUser(userId, guildId);
        if (!user || user.balance < 100) return { success: false, error: 'Insufficient balance (need 100 coins)' };

        // Deduct coins
        this.removeCoins(userId, guildId, 100);

        // Generate ticket ID and number
        const ticketId = `${type}-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const ticketNumber = Math.floor(Math.random() * 10000);

        // Store ticket
        const stmt = this.prepare(`
            INSERT INTO lottery_tickets (ticketId, userId, guildId, type, number)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(ticketId, userId, guildId, type, ticketNumber);

        this.logTransaction(userId, guildId, -100, 'LOTTERY_BUY', `Bought ${type} lottery ticket`);

        return { success: true, ticketId, ticketNumber };
    }

    checkLotteryTicket(ticketId) {
        const stmt = this.prepare(`
            SELECT * FROM lottery_tickets WHERE ticketId = ?
        `);
        return stmt.get(ticketId);
    }

    getLotteryTicketsForUser(userId, guildId, type = null) {
        let query = `SELECT * FROM lottery_tickets WHERE userId = ? AND guildId = ?`;
        if (type) query += ` AND type = ?`;
        query += ` ORDER BY boughtAt DESC`;
        
        const stmt = this.prepare(query);
        return type ? stmt.all(userId, guildId, type) : stmt.all(userId, guildId);
    }

    drawLottery(type = 'daily') {
        // Get all tickets for this type
        const stmt = this.prepare(`
            SELECT * FROM lottery_tickets WHERE type = ? AND wonAmount IS NULL
        `);
        const tickets = stmt.all(type);

        if (tickets.length === 0) return { success: false, winners: [] };

        // Determine winning odds and prize
        const odds = type === 'daily' ? 10000 : 5000;
        const prize = type === 'daily' ? 1000 : 5000;
        const winners = [];

        for (const ticket of tickets) {
            const chance = Math.random() * odds;
            if (chance < 1) {
                // Winner!
                winners.push({
                    userId: ticket.userId,
                    guildId: ticket.guildId,
                    ticketId: ticket.ticketId,
                    amount: prize
                });

                // Update ticket
                const updateStmt = this.prepare(`
                    UPDATE lottery_tickets SET wonAmount = ?, wonAt = ? WHERE ticketId = ?
                `);
                updateStmt.run(prize, new Date().toISOString(), ticket.ticketId);

                // Add coins to winner
                this.addCoins(ticket.userId, ticket.guildId, prize);
                this.logTransaction(ticket.userId, ticket.guildId, prize, 'LOTTERY_WIN', `Won ${type} lottery!`);
            }
        }

        return { success: true, winners, type, count: tickets.length };
    }

    // ========== STOCK METHODS ==========

    initializeStocks() {
        const stocks = [
            { symbol: 'TECH', basePrice: 150 },
            { symbol: 'MOON', basePrice: 250 },
            { symbol: 'BUZZ', basePrice: 175 },
            { symbol: 'WAVE', basePrice: 120 },
            { symbol: 'PEAK', basePrice: 200 },
            { symbol: 'FLOW', basePrice: 95 },
            { symbol: 'NEXUS', basePrice: 310 },
            { symbol: 'SPARK', basePrice: 140 }
        ];

        for (const stock of stocks) {
            const existing = this.prepare(`SELECT * FROM stock_prices WHERE symbol = ?`).get(stock.symbol);
            if (!existing) {
                const stmt = this.prepare(`
                    INSERT INTO stock_prices (symbol, currentPrice, basePrice, history)
                    VALUES (?, ?, ?, ?)
                `);
                stmt.run(stock.symbol, stock.basePrice, stock.basePrice, JSON.stringify([stock.basePrice]));
            }
        }
    }

    getStock(symbol) {
        const stmt = this.prepare(`SELECT * FROM stock_prices WHERE symbol = ?`);
        return stmt.get(symbol);
    }

    getAllStocks() {
        const stmt = this.prepare(`SELECT * FROM stock_prices ORDER BY symbol`);
        return stmt.all();
    }

    updateStockPrices() {
        const stocks = this.getAllStocks();
        for (const stock of stocks) {
            const change = (Math.random() - 0.5) * 0.30; // ±15% max
            const newPrice = Math.max(stock.basePrice * 0.5, stock.currentPrice * (1 + change));
            
            // Keep history
            let history = [];
            try {
                history = JSON.parse(stock.history || '[]');
            } catch (e) {
                history = [];
            }
            history.push(newPrice);
            if (history.length > 30) history.shift(); // Keep last 30

            const stmt = this.prepare(`
                UPDATE stock_prices SET currentPrice = ?, history = ?, lastUpdated = ? WHERE symbol = ?
            `);
            stmt.run(newPrice, JSON.stringify(history), new Date().toISOString(), stock.symbol);
        }
    }

    buyStock(userId, guildId, symbol, quantity, price) {
        const user = this.getUser(userId, guildId);
        const totalCost = price * quantity;

        if (!user || user.balance < totalCost) {
            return { success: false, error: 'Insufficient balance' };
        }

        // Remove coins
        this.removeCoins(userId, guildId, totalCost);

        // Check if user already owns this stock
        const check = this.prepare(`
            SELECT * FROM user_stocks WHERE userId = ? AND guildId = ? AND stockSymbol = ?
        `);
        const existing = check.get(userId, guildId, symbol);

        if (existing) {
            // Update quantity
            const updateStmt = this.prepare(`
                UPDATE user_stocks SET quantity = quantity + ?, boughtPrice = ? 
                WHERE userId = ? AND guildId = ? AND stockSymbol = ?
            `);
            updateStmt.run(quantity, price, userId, guildId, symbol);
        } else {
            // Insert new
            const insertStmt = this.prepare(`
                INSERT INTO user_stocks (userId, guildId, stockSymbol, quantity, boughtPrice)
                VALUES (?, ?, ?, ?, ?)
            `);
            insertStmt.run(userId, guildId, symbol, quantity, price);
        }

        this.logTransaction(userId, guildId, -totalCost, 'STOCK_BUY', `Bought ${quantity} shares of ${symbol}`);
        return { success: true, totalCost };
    }

    sellStock(userId, guildId, symbol, quantity, currentPrice) {
        const check = this.prepare(`
            SELECT * FROM user_stocks WHERE userId = ? AND guildId = ? AND stockSymbol = ?
        `);
        const stock = check.get(userId, guildId, symbol);

        if (!stock || stock.quantity < quantity) {
            return { success: false, error: 'Insufficient shares' };
        }

        const totalReturn = currentPrice * quantity;
        this.addCoins(userId, guildId, totalReturn);

        if (stock.quantity === quantity) {
            // Delete entry
            const deleteStmt = this.prepare(`
                DELETE FROM user_stocks WHERE userId = ? AND guildId = ? AND stockSymbol = ?
            `);
            deleteStmt.run(userId, guildId, symbol);
        } else {
            // Update quantity
            const updateStmt = this.prepare(`
                UPDATE user_stocks SET quantity = quantity - ? WHERE userId = ? AND guildId = ? AND stockSymbol = ?
            `);
            updateStmt.run(quantity, userId, guildId, symbol);
        }

        const profit = (currentPrice - stock.boughtPrice) * quantity;
        this.logTransaction(userId, guildId, totalReturn, 'STOCK_SELL', `Sold ${quantity} shares of ${symbol} for ${profit > 0 ? '+' : ''}${profit.toFixed(0)} profit`);
        return { success: true, totalReturn, profit };
    }

    getPortfolio(userId, guildId) {
        const stmt = this.prepare(`
            SELECT * FROM user_stocks WHERE userId = ? AND guildId = ?
        `);
        return stmt.all(userId, guildId);
    }

    // Market state management for weekly cycle
    initializeMarketState() {
        const stmt = this.prepare(`
            INSERT OR IGNORE INTO market_state (id, currentDay, marketOpen, lastResetTime, lastResetDay)
            VALUES (1, 1, 1, ?, 1)
        `);
        stmt.run(new Date().toISOString());
    }

    getMarketState() {
        const stmt = this.prepare(`SELECT * FROM market_state WHERE id = 1`);
        return stmt.get();
    }

    updateMarketState(currentDay, marketOpen) {
        const stmt = this.prepare(`
            UPDATE market_state SET currentDay = ?, marketOpen = ?, lastResetTime = ? WHERE id = 1
        `);
        stmt.run(currentDay, marketOpen ? 1 : 0, new Date().toISOString());
    }

    // Check if market should update and determine day/open status
    checkMarketStatus() {
        // IST is UTC+5:30
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        
        const dayOfWeek = istTime.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const hour = istTime.getHours();
        
        let currentDay = 1; // Monday default
        let marketOpen = false;
        
        // Map day of week to market day (Mon=1, Tue=2, Wed=3, Thu=4, Fri=5)
        if (dayOfWeek === 1) currentDay = 1; // Monday
        else if (dayOfWeek === 2) currentDay = 2; // Tuesday
        else if (dayOfWeek === 3) currentDay = 3; // Wednesday
        else if (dayOfWeek === 4) currentDay = 4; // Thursday
        else if (dayOfWeek === 5) currentDay = 5; // Friday
        else if (dayOfWeek === 6) currentDay = 0; // Saturday - CLOSED
        else if (dayOfWeek === 0) currentDay = 0; // Sunday - CLOSED
        
        // Market is open Mon-Fri (weekdays)
        marketOpen = dayOfWeek >= 1 && dayOfWeek <= 5;
        
        // Check if reset needed (3 AM IST on Monday)
        let needsReset = false;
        if (dayOfWeek === 1 && hour === 3) { // Monday at 3 AM IST
            const state = this.getMarketState();
            if (state && state.lastResetDay !== currentDay) {
                needsReset = true;
            }
        }
        
        return { currentDay, marketOpen, dayOfWeek, hour, needsReset };
    }

    resetWeeklyMarket() {
        const state = this.checkMarketStatus();
        this.updateMarketState(state.currentDay, state.marketOpen);
    }
}

module.exports = UserDatabase;