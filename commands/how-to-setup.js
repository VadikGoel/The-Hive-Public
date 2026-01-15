const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'how-to-setup',
    description: 'Server setup guide for admins',
    aliases: ['setupguide', 'guide', 'howtosetup'],
    async execute(message, args, db, config) {
        // Check admin permission
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to view setup guides!');
        }

        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        // Page 1: Welcome System Setup
        const page1 = new EmbedBuilder()
            .setColor('#FF6B9D')
            .setTitle('🎉 Welcome System Setup')
            .setDescription('```ansi\n\u001b[1;36m╔════════════════════════════════╗\n\u001b[1;36m║  Create Amazing Welcome Cards  ║\n\u001b[1;36m╚════════════════════════════════╝\u001b[0m\n```\n**Make new members feel special with beautiful welcome messages!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🔹 **STEP 1** › Enable Welcome System',
                    value: `\`\`\`yaml\nCommand: ${prefix}setup\n\`\`\`\n➜ Click **🎉 Toggle Welcome** button\n➜ Status will change to ✅ Enabled\n\n💡 *This activates the welcome system for your server*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 2** › Choose Welcome Channel',
                    value: `\`\`\`yaml\nButton: 📝 Set Welcome Channel\n\`\`\`\n➜ Select from dropdown menu\n➜ Pick your #welcome or #general channel\n\n💡 *Messages will appear in this channel when users join*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 3** › Customize Message',
                    value: `\`\`\`yaml\nCommand: ${prefix}welcome <your message>\n\`\`\`\n**Magic Variables:**\n\`{user}\` → @mentions the new member\n\`{server}\` → Your server name\n\`{count}\` → Total member count\n\n**Example:**\n\`${prefix}welcome Welcome {user} to {server}! You're member #{count}!\`\n\n💡 *Make it unique and welcoming!*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 4** › Add Welcome Image (Optional)',
                    value: `\`\`\`yaml\nCommand: ${prefix}welcomeimage <image URL>\n\`\`\`\n➜ Use a direct image link (.png, .jpg, .gif)\n➜ Creates beautiful welcome cards with backgrounds\n\n💡 *Pro tip: Use imgur or discord CDN links*`,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '✅ Ready to Test?',
                    value: '```\n• Use an alt account to join\n• Ask a friend to leave & rejoin\n• Check your welcome channel\n```',
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 1 of 6  •  Navigate with buttons below  •  Setup Guide' })
            .setTimestamp();

        // Page 2: Leveling System Setup
        const page2 = new EmbedBuilder()
            .setColor('#A855F7')
            .setTitle('⚡ Leveling System Setup')
            .setDescription('```ansi\n\u001b[1;35m╔════════════════════════════════╗\n\u001b[1;35m║   Reward Active Members!       ║\n\u001b[1;35m╚════════════════════════════════╝\u001b[0m\n```\n**Create a progression system that keeps members engaged!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🔹 **STEP 1** › Enable Level-Up Notifications',
                    value: `\`\`\`yaml\nCommand: ${prefix}setup\n\`\`\`\n➜ Click **🏆 Enable Levelup** button\n➜ Users get notified when they level up\n\n💡 *Motivates members to stay active and chat*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 2** › Configure Notification Channel',
                    value: `\`\`\`yaml\nButton: 🎯 Set Levelup Channel\n\`\`\`\n**Options:**\n➜ Leave unset = notifications in same channel (recommended)\n➜ Set channel = all level-ups go to one place\n\n💡 *Same-channel feels more personal!*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 3** › Setup Role Rewards',
                    value: `\`\`\`yaml\nCommand: ${prefix}levelroles add <level> @role\n\`\`\`\n**Examples:**\n\`${prefix}levelroles add 5 @Active\`\n\`${prefix}levelroles add 10 @Veteran\`\n\`${prefix}levelroles add 25 @Elite\`\n\n**View rewards:** \`${prefix}levelroles\`\n**Remove reward:** \`${prefix}levelroles remove 5\`\n\n💡 *Create progression milestones at levels 5, 10, 20, 50*`,
                    inline: false
                },
                {
                    name: '🔹 **STEP 4** › Restore Lost Levels',
                    value: `\`\`\`yaml\nCommand: ${prefix}setlevel @user <level>\n\`\`\`\n➜ Manually set someone's level\n➜ Auto-assigns all earned role rewards\n➜ Perfect for recovering lost progress\n\n💡 *Roles sync automatically when you set levels*`,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '⚠️ **CRITICAL** › Bot Permissions Required',
                    value: '```diff\n+ Bot needs "Manage Roles" permission\n+ Bot role must be ABOVE reward roles\n+ Drag bot role higher in Server Settings > Roles\n```\n\n**Without proper permissions:**\n❌ Role rewards won\'t be assigned\n❌ Level-up messages show warning\n✅ Bot tells you exactly what to fix\n\n📖 Check Server Settings > Roles > Drag bot role up!',
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 2 of 6  •  Navigate with buttons below  •  Setup Guide' })
            .setTimestamp();

        // Page 3: Economy System Setup
        const page3 = new EmbedBuilder()
            .setColor('#10B981')
            .setTitle('💰 Economy System Setup')
            .setDescription('```ansi\n\u001b[1;32m╔════════════════════════════════╗\n\u001b[1;32m║   Build Your Virtual Economy   ║\n\u001b[1;32m╚════════════════════════════════╝\u001b[0m\n```\n**Let members earn, spend, and compete with server currency!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '💵 **Your Currency**',
                    value: `\`\`\`ini\n[Currency Name] = ${config.currency.name}\n[Symbol] = ${config.currency.symbol}\n\`\`\`\n💡 *Users earn this by being active in your server!*`,
                    inline: false
                },
                {
                    name: '🔹 **How Users Earn Money**',
                    value: '```yaml\nAutomatic Earning:\n  • Chat messages = XP + coins\n  • Voice chat time = bonus coins\n  • Level up = coin rewards\n\nManual Earning:\n  • Daily reward (24h cooldown)\n  • Weekly bonus (7d cooldown)\n  • Work command for random earnings\n```',
                    inline: false
                },
                {
                    name: '🔹 **Setup Shop System**',
                    value: `\`\`\`yaml\nView Shop: ${prefix}shop\n\`\`\`\n**Users can buy:**\n🛍️ Custom items\n🎭 Special roles\n🎨 Profile customizations\n\n💡 *Shop items are configured in config.json*`,
                    inline: false
                },
                {
                    name: '🔹 **Admin Money Management**',
                    value: `\`\`\`yaml\nAdjust Balance: ${prefix}setmoney @user <amount>\n\`\`\`\n**Use cases:**\n➜ Give starting bonus to new members\n➜ Fix economy issues\n➜ Reward event winners\n➜ Reset someone\'s balance\n\n**Example:** \`${prefix}setmoney @user 5000\``,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🎰 **Casino & Gambling**',
                    value: '```md\n# Available Games\n• Slots      → Classic slot machine\n• Blackjack  → Card game vs dealer\n• Crash      → Multiplier risk game\n• Mines      → Minesweeper gambling\n• Wheel      → Spin to win prizes\n• Coinflip   → 50/50 head or tails\n```\n💡 *All games use server currency - risk-free fun!*',
                    inline: false
                },
                {
                    name: '📊 **Economy Commands**',
                    value: `\`${prefix}balance\` - Check wallet & bank\n\`${prefix}daily\` - Claim daily reward\n\`${prefix}weekly\` - Claim weekly bonus\n\`${prefix}work\` - Work for money\n\`${prefix}deposit\` / \`${prefix}withdraw\` - Bank management\n\`${prefix}leaderboard\` - Top richest users`,
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 3 of 6  •  Navigate with buttons below  •  Setup Guide' })
            .setTimestamp();

        // Page 4: Stock Market Setup
        const page4 = new EmbedBuilder()
            .setColor('#3B82F6')
            .setTitle('📈 Stock Market System')
            .setDescription('```ansi\n\u001b[1;34m╔════════════════════════════════╗\n\u001b[1;34m║  Teach Real Trading Skills!    ║\n\u001b[1;34m╚════════════════════════════════╝\u001b[0m\n```\n**Risk-free stock trading education with realistic market mechanics!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🎯 **How It Works**',
                    value: '```yaml\nMarket Status: Fully Automated\nPrice Updates: Every 30 minutes\nMarket Hours: Monday - Friday\nWeekend Status: Closed (Sat-Sun)\nWeekly Reset: Monday 3 AM IST\n```\n💡 *Realistic market simulation - no setup needed!*',
                    inline: false
                },
                {
                    name: '📊 **Available Stocks**',
                    value: '```ml\nTECH   → Technology & Software\nMOON   → Crypto & Innovation  \nBUZZ   → Social Media\nWAVE   → Entertainment\nPEAK   → Energy Sector\nFLOW   → Banking & Finance\nNEXUS  → Aerospace\nSPARK  → Retail & Consumer\n```\n💡 *Each stock has unique volatility and trading patterns*',
                    inline: false
                },
                {
                    name: '🔹 **Trading Commands**',
                    value: `\`\`\`yaml\nView Market: ${prefix}stocks or /stocks\n\`\`\`\n**Interactive Features:**\n🔘 **💰 Buy Stocks** - Click to purchase\n🔘 **💵 Sell Stocks** - Click to sell\n🔘 **📂 My Portfolio** - View holdings & P/L\n🔘 **🔄 Refresh** - Update market data\n\n**Chart Analysis:**\n\`${prefix}stock-chart TECH\` - View 30-day price history\n🔘 **🔄 Refresh Chart** - Real-time updates\n🔘 **📊 Back to Stocks** - Return to dashboard`,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '📚 **Trading Education**',
                    value: '```diff\n+ Green/Up Arrow   = Stock gaining value\n+ Red/Down Arrow   = Stock losing value\n\n# Trading Strategy\n- Buy Low  → When prices are RED (down)\n- Sell High → When prices are GREEN (up)\n\n# Portfolio Management\n- Diversify across multiple stocks\n- Check charts for trends\n- Monitor profit/loss regularly\n```',
                    inline: false
                },
                {
                    name: '⏰ **Market Schedule**',
                    value: '```yaml\nMonday    : Day 1/5 - OPEN\nTuesday   : Day 2/5 - OPEN\nWednesday : Day 3/5 - OPEN\nThursday  : Day 4/5 - OPEN\nFriday    : Day 5/5 - OPEN\nSaturday  : Weekend - CLOSED\nSunday    : Weekend - CLOSED\n```\n💡 *Buttons automatically disable on weekends*',
                    inline: false
                },
                {
                    name: '🎓 **Educational Value**',
                    value: '```\n• Learn supply & demand\n• Practice risk management  \n• Understand market volatility\n• Track performance metrics\n• NO REAL MONEY - Safe learning!\n```',
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 4 of 6  •  Navigate with buttons below  •  Setup Guide' })
            .setTimestamp();

        // Page 5: Moderation & Permissions
        const page5 = new EmbedBuilder()
            .setColor('#EF4444')
            .setTitle('🛡️ Bot Permissions & Security')
            .setDescription('```ansi\n\u001b[1;31m╔════════════════════════════════╗\n\u001b[1;31m║  Essential Setup Requirements  ║\n\u001b[1;31m╚════════════════════════════════╝\u001b[0m\n```\n**Configure bot permissions correctly for full functionality!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '✅ **Required Bot Permissions**',
                    value: '```diff\n+ ESSENTIAL (Must Have)\n  • Send Messages\n  • Embed Links\n  • Attach Files\n  • Read Message History\n  • Add Reactions\n  • Use External Emojis\n\n+ FOR FULL FEATURES\n  • Manage Roles      → Level role rewards\n  • Manage Messages   → Sticky notes, moderation\n  • Kick Members      → Moderation tools\n  • Ban Members       → Moderation tools\n  • Manage Channels   → Advanced features\n```',
                    inline: false
                },
                {
                    name: '⚠️ **CRITICAL: Role Hierarchy**',
                    value: '```yaml\nProblem:\n  Bot cannot assign roles that are above its own role\n\nSolution:\n  1. Go to Server Settings\n  2. Click on "Roles"\n  3. DRAG bot role ABOVE all reward roles\n  4. DRAG bot role ABOVE moderation roles\n  5. Save changes\n```\n**Visual Guide:**\n```diff\n+ ✅ CORRECT HIERARCHY\n  @Administrator\n  @Bot Role          ← Must be here!\n  @Elite Member      ← Can assign ✓\n  @Veteran          ← Can assign ✓\n  @Active           ← Can assign ✓\n  @everyone\n\n- ❌ WRONG HIERARCHY  \n  @Administrator\n  @Elite Member\n  @Veteran\n  @Bot Role          ← Too low!\n  @Active\n  @everyone\n```',
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '👑 **Admin Commands Reference**',
                    value: `\`\`\`yaml\nEconomy Management:\n  ${prefix}setmoney @user <amount>\n  \nLevel Management:\n  ${prefix}setlevel @user <level>\n  ${prefix}levelroles add <level> @role\n  ${prefix}levelroles remove <level>\n\nServer Settings:\n  ${prefix}setup\n  ${prefix}setsticky <message>\n  ${prefix}setcounting #channel\n  ${prefix}setbio <bio text>\n\nCommand Control:\n  ${prefix}blockcmd <command>\n  ${prefix}unblockcmd <command>\n\`\`\``,
                    inline: false
                },
                {
                    name: '🔧 **Quick Setup Dashboard**',
                    value: `\`\`\`fix\nUse ${prefix}setup for interactive setup!\n\`\`\`\n**Features:**\n🔘 Toggle welcome system\n🔘 Set channels with dropdowns\n🔘 Enable/disable features\n🔘 View current configuration\n🔘 One-click settings changes\n\n💡 *Easiest way to configure your server!*`,
                    inline: false
                },
                {
                    name: '📋 **Permission Checklist**',
                    value: '```md\n[ ] Bot invited with correct permissions\n[ ] Bot role positioned correctly in hierarchy\n[ ] Bot has Manage Roles permission\n[ ] Bot role is above reward roles\n[ ] Welcome channel is accessible to bot\n[ ] Level-up channel is accessible to bot\n[ ] Counting channel is accessible to bot\n```',
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 5 of 6  •  Navigate with buttons below  •  Setup Guide' })
            .setTimestamp();

        // Page 6: Fun & Engagement Features
        const page6 = new EmbedBuilder()
            .setColor('#14B8A6')
            .setTitle('🎮 Engagement & Fun Features')
            .setDescription('```ansi\n\u001b[1;36m╔════════════════════════════════╗\n\u001b[1;36m║  Boost Server Activity!        ║\n\u001b[1;36m╚════════════════════════════════╝\u001b[0m\n```\n**Keep your community active with interactive features and games!**')
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🎤 **Voice Channel Rewards**',
                    value: `\`\`\`yaml\nCommand: ${prefix}vc\n\`\`\`\n**Features:**\n➜ Users earn coins for VC time\n➜ Track total voice activity\n➜ Leaderboard for voice stats\n➜ Encourages voice engagement\n\n💡 *Passive income while hanging out with friends!*`,
                    inline: false
                },
                {
                    name: '🔢 **Counting Game**',
                    value: `\`\`\`yaml\nSetup: ${prefix}setcounting #channel\n\`\`\`\n**How It Works:**\n1️⃣ Users count sequentially (1, 2, 3...)\n2️⃣ Wrong number = reset to 0\n3️⃣ Same user twice = reset\n4️⃣ Track highest count achieved\n\n**Leaderboard:** \`${prefix}counter-leader\`\n\n💡 *Simple but highly addictive engagement tool!*`,
                    inline: false
                },
                {
                    name: '🎁 **Giveaway System**',
                    value: `\`\`\`yaml\nCreate: ${prefix}giveaway <duration> <prize>\n\`\`\`\n**Example:**\n\`${prefix}giveaway 1h Discord Nitro\`\n\`${prefix}giveaway 30m 1000 coins\`\n\n**Features:**\n🔘 **Join** - Enter giveaway\n🔘 **Leave** - Exit giveaway\n➜ Auto-ends and picks winner\n➜ Button-based entry system\n➜ Shows participant count\n\n💡 *Perfect for events and milestones!*`,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '🎰 **Casino Games Collection**',
                    value: '```ml\n🎰 Slots\n   Classic 3-reel slot machine\n   Multiple winning combinations\n   Progressive jackpots\n\n🃏 Blackjack\n   Play against dealer\n   Hit, Stand, Double Down\n   Real blackjack rules\n\n💥 Crash\n   Multiplier betting game\n   Cash out before crash\n   High risk, high reward\n\n💣 Mines\n   Minesweeper gambling\n   Click to reveal safe tiles\n   Multiple difficulty levels\n\n🎡 Wheel\n   Spin the prize wheel\n   Different multipliers\n   Instant results\n\n🪙 Coinflip\n   Classic heads or tails\n   50/50 odds\n   Quick & simple\n```\n💡 *All games use server currency - safe gambling!*',
                    inline: false
                },
                {
                    name: '📊 **Statistics & Leaderboards**',
                    value: `\`\`\`yaml\nServer Stats: ${prefix}stats\nLeaderboard:  ${prefix}leaderboard\nUser Profile: ${prefix}profile [@user]\nVC Stats:     ${prefix}vc\nPortfolio:    ${prefix}portfolio\n\`\`\`\n**Track:**\n📈 Level rankings\n💰 Richest members\n🎤 Voice activity\n📊 Stock holdings\n🏆 Counting records`,
                    inline: false
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '** **',
                    inline: false
                },
                {
                    name: '💡 **Pro Tips for Server Growth**',
                    value: '```diff\n+ Create dedicated channels\n  #economy    → Balance, shop, trading\n  #stocks     → Market discussions\n  #counting   → Counting game\n  #casino     → Gambling games\n  #giveaways  → Host events\n\n+ Reward active members\n  → Set up level role rewards\n  → Host regular giveaways\n  → Bonus coins for events\n  → Recognize top contributors\n\n+ Announce new features  \n  → Post in announcements\n  → Create tutorial videos\n  → Host launch events\n  → Give launch bonuses\n\n+ Create progression system\n  → Level 5, 10, 20, 50 roles\n  → Exclusive perks per tier\n  → VIP channels for high levels\n  → Special economy bonuses\n```',
                    inline: false
                },
                {
                    name: '🚀 **Quick Start Checklist**',
                    value: '```md\n[ ] Setup welcome system\n[ ] Enable leveling & set role rewards\n[ ] Configure economy & shop\n[ ] Create dedicated bot channels\n[ ] Announce features to members\n[ ] Host launch giveaway\n[ ] Monitor & adjust settings\n```\n\n**🎉 Your server is ready to grow!**',
                    inline: false
                }
            )
            .setFooter({ text: '📄 Page 6 of 6  •  You\'re all set!  •  created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        const pages = [page1, page2, page3, page4, page5, page6];
        let currentPage = 0;

        // Create navigation buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setup_guide_first')
                    .setLabel('⏮️ First')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('setup_guide_prev')
                    .setLabel('◀️ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('setup_guide_next')
                    .setLabel('Next ▶️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('setup_guide_last')
                    .setLabel('Last ⏭️')
                    .setStyle(ButtonStyle.Secondary)
            );

        const msg = await message.reply({ embeds: [pages[0]], components: [row] });

        // Button collector
        const collector = msg.createMessageComponentCollector({ time: 300000 }); // 5 minutes

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: '❌ Only the command user can navigate!', ephemeral: true });
            }

            if (interaction.customId === 'setup_guide_first') {
                currentPage = 0;
            } else if (interaction.customId === 'setup_guide_prev') {
                currentPage = Math.max(0, currentPage - 1);
            } else if (interaction.customId === 'setup_guide_next') {
                currentPage = Math.min(pages.length - 1, currentPage + 1);
            } else if (interaction.customId === 'setup_guide_last') {
                currentPage = pages.length - 1;
            }

            // Update button states
            const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_guide_first')
                        .setLabel('⏮️ First')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_prev')
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_next')
                        .setLabel('Next ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === pages.length - 1),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_last')
                        .setLabel('Last ⏭️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === pages.length - 1)
                );

            await interaction.update({ embeds: [pages[currentPage]], components: [newRow] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_guide_first')
                        .setLabel('⏮️ First')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_prev')
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_next')
                        .setLabel('Next ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('setup_guide_last')
                        .setLabel('Last ⏭️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
            msg.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
