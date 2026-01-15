const{SlashCommandBuilder}=require('discord.js');const _sec_check=()=>{const cfg=require('./config.json');if(!cfg.clientId||cfg.clientId.includes('YOUR')||!cfg.token||cfg.token.includes('YOUR')){throw new Error('[DEFS-LOCK] Invalid configuration')}};_sec_check();module.exports={
  'setup': new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure server settings (Admin only)'),

  'setcounting': new SlashCommandBuilder()
    .setName('setcounting')
    .setDescription('Set the counting channel for this server (Admin only)')
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('The channel for counting (optional, defaults to current)')
      .setRequired(false)
    ),
  
  'setsticky': new SlashCommandBuilder()
    .setName('setsticky')
    .setDescription('Set a sticky note in a channel that rewrites after messages')
    .addStringOption(opt => opt
      .setName('content')
      .setDescription('The sticky note text')
      .setRequired(true)
    )
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('The channel for the sticky note (optional, defaults to current)')
      .setRequired(false)
    )
    .addIntegerOption(opt => opt
      .setName('threshold')
      .setDescription('Number of messages before sticky refreshes (default: 2)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(50)
    ),

  'counter-leader': new SlashCommandBuilder()
    .setName('counter-leader')
    .setDescription('Show counting leaderboard (current or history)')
    .addStringOption(opt => opt
      .setName('mode')
      .setDescription('View mode')
      .setRequired(false)
      .addChoices(
        { name: 'Current Month', value: 'current' },
        { name: 'History', value: 'history' }
      )
    )
    .addIntegerOption(opt => opt
      .setName('page')
      .setDescription('History page number (1-5)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(5)
    ),

  'mines': new SlashCommandBuilder()
    .setName('mines')
    .setDescription('Play interactive minesweeper game')
    .addStringOption(opt => opt
      .setName('difficulty')
      .setDescription('Choose difficulty level')
      .setRequired(false)
      .addChoices(
        { name: 'Easy (4x4, 3 mines)', value: 'easy' },
        { name: 'Normal (4x4, 5 mines)', value: 'normal' },
        { name: 'Hard (4x4, 7 mines)', value: 'hard' },
        { name: 'Expert (5x5, 10 mines)', value: 'expert' }
      )
    ),

  'coinflip': new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin (no betting)')
    .addStringOption(opt => opt
      .setName('choice')
      .setDescription('Your prediction')
      .setRequired(false)
      .addChoices(
        { name: 'Heads', value: 'heads' },
        { name: 'Tails', value: 'tails' }
      )
    ),

  'coinflippvp': new SlashCommandBuilder()
    .setName('coinflippvp')
    .setDescription('Coin flip duel against another player')
    .addUserOption(opt => opt
      .setName('opponent')
      .setDescription('User to challenge')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'gamble': new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('50/50 coin flip gamble')
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'pay': new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer coins to another user (15% tax)')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to send coins to')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Amount to send')
      .setRequired(true)
      .setMinValue(1)
    ),

  'rank': new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your or another user\'s profile card')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to check (optional)')
      .setRequired(false)
    ),

  'leaderboard': new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View server leaderboard')
    .addStringOption(opt => opt
      .setName('type')
      .setDescription('Leaderboard type')
      .setRequired(false)
      .addChoices(
        { name: 'Levels', value: 'level' },
        { name: 'Money', value: 'money' }
      )
    ),

  'crash': new SlashCommandBuilder()
    .setName('crash')
    .setDescription('Cash out before the crash!')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'plinko': new SlashCommandBuilder()
    .setName('plinko')
    .setDescription('Ball drop with multipliers')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'slots': new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Classic slot machine')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'blackjack': new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play blackjack against the dealer')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'roulette': new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Spin the roulette wheel')
    .addStringOption(opt => opt
      .setName('color')
      .setDescription('Bet on a color')
      .setRequired(true)
      .addChoices(
        { name: 'Red', value: 'red' },
        { name: 'Black', value: 'black' },
        { name: 'Green', value: 'green' }
      )
    )
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'highlow': new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Guess if next card is higher or lower')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'wheel': new SlashCommandBuilder()
    .setName('wheel')
    .setDescription('Spin the lucky wheel')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'horse': new SlashCommandBuilder()
    .setName('horse')
    .setDescription('Bet on horse racing')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'fight': new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Fight another user')
    .addUserOption(opt => opt
      .setName('opponent')
      .setDescription('User to fight')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'trivia': new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer trivia questions for coins')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(50)
    ),

  'rps': new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock Paper Scissors')
    .addStringOption(opt => opt
      .setName('choice')
      .setDescription('Your choice')
      .setRequired(true)
      .addChoices(
        { name: '🪨 Rock', value: 'rock' },
        { name: '📄 Paper', value: 'paper' },
        { name: '✂️ Scissors', value: 'scissors' }
      )
    ),

  'deposit': new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins to your bank')
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Amount to deposit (or "all"/"max")')
      .setRequired(true)
      .setMinValue(1)
    ),

  'withdraw': new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from your bank')
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Amount to withdraw (or "all"/"max")')
      .setRequired(true)
      .setMinValue(1)
    ),

  'rob': new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to rob')
      .setRequired(true)
    ),

  'buy': new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the shop (15% tax)')
    .addStringOption(opt => opt
      .setName('item')
      .setDescription('Item ID to purchase')
      .setRequired(true)
    ),

  'use': new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use an item from your inventory')
    .addStringOption(opt => opt
      .setName('item')
      .setDescription('Item ID to use')
      .setRequired(true)
    ),

  'setbio': new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Set your profile bio')
    .addStringOption(opt => opt
      .setName('text')
      .setDescription('Your bio text (max 100 chars)')
      .setRequired(true)
      .setMaxLength(100)
    ),

  'dice': new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice')
    .addIntegerOption(opt => opt
      .setName('sides')
      .setDescription('Number of sides (default: 6)')
      .setRequired(false)
      .setMinValue(2)
      .setMaxValue(100)
    ),

  '8ball': new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(opt => opt
      .setName('question')
      .setDescription('Your question')
      .setRequired(true)
    ),

  'avatar': new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to get avatar from (optional)')
      .setRequired(false)
    ),

  'hug': new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Send a hug GIF to someone')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to hug')
      .setRequired(false)
    ),

  'pure': new SlashCommandBuilder()
    .setName('pure')
    .setDescription('Bulk delete messages in the current channel')
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Number of messages to delete (max 1000)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000)
    ),

  'levelroles': new SlashCommandBuilder()
    .setName('levelroles')
    .setDescription('Configure role rewards for level-ups (Admin only)')
    .addStringOption(opt => opt
      .setName('action')
      .setDescription('Action to perform')
      .setRequired(false)
      .addChoices(
        { name: 'Add Reward', value: 'add' },
        { name: 'Remove Reward', value: 'remove' }
      )
    )
    .addIntegerOption(opt => opt
      .setName('level')
      .setDescription('Level for the role reward')
      .setRequired(false)
      .setMinValue(1)
    )
    .addRoleOption(opt => opt
      .setName('role')
      .setDescription('Role to assign at this level')
      .setRequired(false)
    ),

  // Commands WITHOUT parameters (to avoid showing 'args:')
  'balance': new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current balance and bank'),

  'daily': new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins reward'),

  'weekly': new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('Claim your weekly coins reward'),

  'work': new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work for coins (bee-themed jobs)'),

  'beg': new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for coins'),

  'inventory': new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory items'),

  'shop': new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the items shop'),

  'stats': new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your game statistics'),

  'serverinfo': new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display server information'),

  'help': new SlashCommandBuilder()
    .setName('help')
    .setDescription('Interactive help menu with navigation'),

  'ping': new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and uptime'),

  'about': new SlashCommandBuilder()
    .setName('about')
    .setDescription('Learn about the bot'),

  'invite': new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link'),

  'joke': new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  'meme': new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),

  'cat': new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Get a random cat picture'),

  'dog': new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random dog picture'),

  'vc': new SlashCommandBuilder()
    .setName('vc')
    .setDescription('Check voice channel time stats')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check stats for')
        .setRequired(false)),

  'msg': new SlashCommandBuilder()
    .setName('msg')
    .setDescription('Check message count stats')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check stats for')
        .setRequired(false)),

  'fortune': new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Get your fortune'),

  'bored': new SlashCommandBuilder()
    .setName('bored')
    .setDescription('Get activity suggestions when bored'),

  'compliment': new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Get a random compliment'),

  'roll': new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a random number 1-100'),

  'emojify': new SlashCommandBuilder()
    .setName('emojify')
    .setDescription('Convert text to emojis')
    .addStringOption(opt => opt
      .setName('text')
      .setDescription('Text to emojify')
      .setRequired(true)
    ),

  'heist': new SlashCommandBuilder()
    .setName('heist')
    .setDescription('Attempt a risky heist for big rewards')
    .addIntegerOption(opt => opt
      .setName('bet')
      .setDescription('Amount to bet')
      .setRequired(true)
      .setMinValue(100)
    ),

  'welcome': new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome message settings (Admin only)')
    .addStringOption(opt => opt
      .setName('action')
      .setDescription('Action to perform')
      .setRequired(true)
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' },
        { name: 'Set Channel', value: 'setchannel' },
        { name: 'Set Message', value: 'setmessage' },
        { name: 'Test', value: 'test' }
      )
    ),

  'welcomeimage': new SlashCommandBuilder()
    .setName('welcomeimage')
    .setDescription('Customize welcome banner image')
    .addStringOption(opt => opt
      .setName('url')
      .setDescription('Image URL for welcome banner')
      .setRequired(false)
    ),

  'giveaway': new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway (Admin only)')
    .addStringOption(opt => opt
      .setName('prize')
      .setDescription('The prize for the giveaway')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('duration')
      .setDescription('Duration in seconds')
      .setRequired(true)
      .setMinValue(10)
      .setMaxValue(86400)
    )
    .addIntegerOption(opt => opt
      .setName('winners')
      .setDescription('Number of winners')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(10)
    ),

  'resetrank': new SlashCommandBuilder()
    .setName('resetrank')
    .setDescription('Reset rank/XP for a user or all users (Admin only)')
    .addStringOption(opt => opt
      .setName('target')
      .setDescription('Type "all" to reset everyone')
      .setRequired(false)
    )
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to reset rank for')
      .setRequired(false)
    ),

  'resetmoney': new SlashCommandBuilder()
    .setName('resetmoney')
    .setDescription('Reset balance/bank for a user or all users (Admin only)')
    .addStringOption(opt => opt
      .setName('target')
      .setDescription('Type "all" to reset everyone')
      .setRequired(false)
    )
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to reset money for')
      .setRequired(false)
    ),

  'missions': new SlashCommandBuilder()
    .setName('missions')
    .setDescription('View your daily missions/quests'),

  'claim-missions': new SlashCommandBuilder()
    .setName('claim-missions')
    .setDescription('Claim rewards from completed missions'),

  'blockcmd': new SlashCommandBuilder()
    .setName('blockcmd')
    .setDescription('Block the bot from sending messages in this channel (Admin only)'),

  'unblockcmd': new SlashCommandBuilder()
    .setName('unblockcmd')
    .setDescription('Unblock the bot from sending messages in this channel (Admin only)'),

  'accept': new SlashCommandBuilder()
    .setName('accept')
    .setDescription('Accept a duel or challenge'),

  'refreshslash': new SlashCommandBuilder()
    .setName('refreshslash')
    .setDescription('Refresh slash commands (Bot Owner only)'),

  'setmoney': new SlashCommandBuilder()
    .setName('setmoney')
    .setDescription('Give/set money for a user (Admin only)')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to give money to')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('Amount of money to give')
      .setRequired(true)
      .setMinValue(1)
    ),

  // ========== INTEREST FEATURE ==========
  'interest': new SlashCommandBuilder()
    .setName('interest')
    .setDescription('Claim your monthly bank interest (2-5%)'),

  // ========== LOTTERY FEATURE ==========
  'lottery': new SlashCommandBuilder()
    .setName('lottery')
    .setDescription('Buy a lottery ticket (100 coins)')
    .addStringOption(opt => opt
      .setName('type')
      .setDescription('Lottery type')
      .setRequired(false)
      .addChoices(
        { name: 'Daily Draw (1:10,000 odds, 1,000 prize)', value: 'daily' },
        { name: 'Weekly Draw (1:5,000 odds, 5,000 prize)', value: 'weekly' }
      )
    ),

  'lotto-check': new SlashCommandBuilder()
    .setName('lotto-check')
    .setDescription('Check your lottery tickets')
    .addStringOption(opt => opt
      .setName('type')
      .setDescription('Filter by lottery type')
      .setRequired(false)
      .addChoices(
        { name: 'Daily', value: 'daily' },
        { name: 'Weekly', value: 'weekly' }
      )
    ),

  // ========== STOCK MARKET FEATURE ==========
  'stocks': new SlashCommandBuilder()
    .setName('stocks')
    .setDescription('View available stocks and their prices'),

  'buy-stock': new SlashCommandBuilder()
    .setName('buy-stock')
    .setDescription('Buy shares of a stock')
    .addStringOption(opt => opt
      .setName('symbol')
      .setDescription('Stock symbol (e.g., TECH, MOON, BUZZ)')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('quantity')
      .setDescription('Number of shares to buy')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(10000)
    ),

  'sell-stock': new SlashCommandBuilder()
    .setName('sell-stock')
    .setDescription('Sell shares of a stock')
    .addStringOption(opt => opt
      .setName('symbol')
      .setDescription('Stock symbol')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('quantity')
      .setDescription('Number of shares to sell')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(10000)
    ),

  'portfolio': new SlashCommandBuilder()
    .setName('portfolio')
    .setDescription('View your stock portfolio')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to check portfolio for (optional)')
      .setRequired(false)
    ),

  'stock-chart': new SlashCommandBuilder()
    .setName('stock-chart')
    .setDescription('View 30-day stock price chart')
    .addStringOption(opt => opt
      .setName('symbol')
      .setDescription('Stock symbol (e.g., TECH, MOON)')
      .setRequired(true)
      .addChoices(
        { name: 'TECH', value: 'TECH' },
        { name: 'MOON', value: 'MOON' },
        { name: 'BUZZ', value: 'BUZZ' },
        { name: 'WAVE', value: 'WAVE' },
        { name: 'PEAK', value: 'PEAK' },
        { name: 'FLOW', value: 'FLOW' },
        { name: 'NEXUS', value: 'NEXUS' },
        { name: 'SPARK', value: 'SPARK' }
      )
    ),

  'setlevel': new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user\'s level manually (Admin only)')
    .addUserOption(opt => opt
      .setName('user')
      .setDescription('User to set level for')
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName('level')
      .setDescription('New level to set')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(1000)
    ),

  'how-to-setup': new SlashCommandBuilder()
    .setName('how-to-setup')
    .setDescription('View server setup guide for admins (Admin only)'),

};