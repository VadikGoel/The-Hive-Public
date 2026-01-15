# 🐝 THE HIVE Discord Bot

A feature-rich Discord bot with economy, leveling, stock trading, and welcome system!

**Author:** Vadik Goel (Gaming Name: VYPER GAMER)

## ✨ Features

### 🎉 Welcome System
- Automatic welcome messages with beautiful embeds
- Shows server member count
- Starting balance for new members
- Customizable welcome channel

### 💰 Economy System
- Full currency system with customizable coin name
- Daily rewards
- Work and beg commands to earn coins
- Gambling system
- Pay/transfer coins to other users
- Shop system with purchasable items
- Transaction history tracking

### 📊 Leveling System
- Earn XP by chatting
- Level up rewards (coins)
- XP cooldown to prevent spam
- Rank cards with progress bars
- Server leaderboards
- Level and money leaderboards
- Integrated with economy (earn coins on level up!)

### 📈 Stock Market System
- Real-time stock trading
- 8 tradable stocks (TECH, MOON, BUZZ, WAVE, PEAK, FLOW, NEXUS, SPARK)
- 30-minute price updates during market hours
- Portfolio tracking with profit/loss calculations
- Buy & sell commands with interactive buttons
- Market opens Monday-Friday, closes weekends
- Stock history and charts

### 👑 Admin Commands
- `/setlevel` - Manually set user levels with auto role rewards
- `/how-to-setup` - 6-page interactive setup guide
- Both commands include helpful permission error messages

---

## 📋 Full Command List

**Economy Commands:**
- `!balance` / `!bal` - Check your balance
- `!daily` - Claim daily reward (500 coins every 24h)
- `!work` - Work for coins (80-400 coins)
- `!beg` - Beg for coins (5-150 coins)
- `!pay @user <amount>` - Send coins to another user
- `!gamble <amount>` - Gamble your coins (50/50 chance)
- `!shop` - View the server shop
- `!buy <item>` - Buy an item from the shop

### Leveling Commands
- `!rank` / `!level` - View your rank card
- `!leaderboard` / `!lb` - View server leaderboard
- `!leaderboard money` - View richest users

### General Commands
- `!help` - Show all commands

## ⚙️ Configuration Options

Edit `config.json` to customize:

```json
{
  "prefix": "!",                    // Command prefix
  "currency": {
    "name": "Coins",                // Currency name
    "symbol": "💰",                 // Currency symbol
    "startingBalance": 1000         // Starting balance for new users
- `/leaderboard` - View money leaderboard
- `/stats` - View your stats
```
**Leveling Commands:**
- `/rank` - View your rank card
- `/levels` - View leveling leaderboard
- `/xp` - View XP info

**Stock Market Commands:**
- `/stocks` - View all stocks and market status
- `/stocks-chart` - Interactive stock chart with buy/sell buttons
- `/buy-stock <name> <quantity>` - Buy stocks
- `/sell-stock <name> <quantity>` - Sell stocks
- `/portfolio` - View your stock portfolio

**Admin Commands:**
- `/setlevel @user <level>` - Set user level (auto assigns roles)
- `/how-to-setup` - Interactive setup guide for admins
- `,help` or `/help` - Help menu with 8 pages

---

## 🔧 Features Breakdown

### Economy System
- Coin-based economy with persistent database
- Daily rewards with cooldown system
- Work/Beg commands with cooldowns
- Gambling with real money
- Shop with purchasable items
- Money leaderboard

### Leveling System
- XP earned per message (with cooldown)
- Customizable level-up bonuses
- Auto role assignment based on levels
- Beautiful rank cards
- Leaderboard rankings

### Stock Market
- 8 stocks with realistic price movements
- 30-minute update cycle
- Market closes weekends
- Portfolio tracking
- Profit/loss calculations
- Interactive trading interface

### Welcome System
- Auto-send messages to new members
- Display server info
- Give starting balance
- Customizable welcome channel

---

## ⚠️ Important Notice

**THE BOT CODE MAY NOT BE IN SYNC WITH GITHUB UPDATES**

The code in this repository may lag behind the actual bot version running on servers. Updates, bug fixes, and new features are deployed regularly but may not be immediately reflected in the public GitHub repository.

**For the latest features and fixes:**
- Use the bot on your Discord server
- Check the `/how-to-setup` guide for admin configuration
- Create an issue if you find bugs

---

## 📜 Legal & Privacy

This bot includes important legal documents:

- **[LICENSE](LICENSE)** - Restrictive license preventing unauthorized copying or modification
- **[TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)** - Terms users must accept when using THE HIVE Bot
- **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** - Privacy policy detailing data collection and GDPR/CCPA compliance

**By using THE HIVE Bot, you agree to these terms and acknowledge the privacy policy.**

---

## 🛡️ Code Protection

This code is protected under copyright law and is publicly available for:
- **Educational purposes** - Learn Discord.js development
- **Reference** - See implementation patterns and techniques
- **Suggestions** - Contribute improvements via issues

**NOT permitted:**
- Copying or forking the entire codebase
- Claiming the code as your own
- Modifying and redistributing
- Using for commercial purposes
- Hosting as your own bot

Violations will result in DMCA takedown notices and legal action.

---

## 📞 Support

- Create an issue on GitHub
- Contact the bot author
- Check `/help` command for bot-specific questions

---

**©2026 Vadik Goel (VYPER GAMER) - All Rights Reserved**
