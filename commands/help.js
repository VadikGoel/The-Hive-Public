const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Interactive help menu with navigation',
    aliases: ['h', 'menu', 'commands'],
    async execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = (guildSettings && guildSettings.prefix) ? guildSettings.prefix : config.prefix;
        const botOwner = config.ownerIds?.[0] || 'Bot Creator';

        // Define all pages
        const pages = [
            // Home Page
            new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🏠 WELCOME TO THE BOT')
                .setDescription(`> Prefix: \`${prefix}\`\n> Type the command to use it!`)
                .setThumbnail(message.client.user.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: '🤖 Bot Name', value: message.client.user.username, inline: true },
                    { name: '👑 Owner', value: `<@${botOwner}>`, inline: true },
                    { name: '🌐 Servers', value: `${message.client.guilds.cache.size}`, inline: true },
                    { name: '🎯 Features', value: '✅ Economy\n✅ Leveling\n✅ Casino\n✅ Fun Commands', inline: false },
                    { name: '📖 Total Pages', value: '8 Pages', inline: true },
                    { name: '⏱️ Uptime', value: formatUptime(process.uptime()), inline: true },
                    { name: '👥 Users Tracked', value: `${message.client.users.cache.size}`, inline: true }
                )
                .setImage((config.images && config.images.helpPages && config.images.helpPages[0] && config.images.helpPages[0].url) || 'https://media.discordapp.net/attachments/1459907365750182095/1459922490968248444/wmremove-transformed_1.jpeg?ex=69650a45&is=6963b8c5&hm=c78f867d4f3ca9ad60b66577d56d4de25db455946ee856a9c51de57ea6e05e37&=&format=webp&width=1280&height=543')
                .setFooter({ text: '📄 Page 1/6 • Click buttons to navigate • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setTimestamp(),

            // Economy Page
            new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('💰 ECONOMY COMMANDS')
                .setDescription(`Use: \`${prefix}<command>\`\n💡 **15% tax on all transfers & shop purchases!**`)
                .setThumbnail('https://cdn.discordapp.com/avatars/1309879612108701706/30a793722e2a9dbc9df3f083116a2458.webp?size=1024')
                .addFields(
                    { name: '💵 Balance Commands', value: `\`balance\` - Check wallet & bank\n\`daily\` - Claim 500 coins\n\`weekly\` - Claim 5,000 coins (7d cd)`, inline: true },
                    { name: '💼 Work & Earn', value: `\`work\` - 100-400 coins (15m cd)\n\`beg\` - 5-150 coins\n\`heist\` - Big payout (3h cd)`, inline: true },
                    { name: '➡️ Transfers', value: `\`pay <@user> <amt>\` - Transfer (15% tax)\n\`rob <@user>\` - Rob coins (risky)`, inline: true },
                    { name: '🏦 Banking', value: `\`deposit <amt>\` - Deposit to bank\n\`withdraw <amt>\` - From bank`, inline: true },
                    { name: '🎁 Shopping', value: `\`shop\` - View items\n\`buy <item_id>\` - Purchase (15% tax)\n\`inventory\` - Your items`, inline: true },
                    { name: '💎 Use Items', value: `\`use <item>\` - Activate an item`, inline: true },
                    { name: '📌 New! Investments', value: 'See **STOCKS** page for market trading!', inline: false },
                    { name: '💡 Tip', value: 'Keep coins in bank - safe from robbery!', inline: false }
                )
                .setFooter({ text: '📄 Page 2/8 • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[1] && config.images.helpPages[1].url) || null)
                .setTimestamp(),

            // Casino Page
            new EmbedBuilder()
                .setColor('#F39C12')
                .setTitle('🎰 CASINO & GAMES')
                .setDescription(`Use: \`${prefix}<command>\`\n🍀 **Get Lucky Charm for better odds!**`)
                .setThumbnail('https://cdn.discordapp.com/avatars/1309879612108701706/30a793722e2a9dbc9df3f083116a2458.webp?size=1024')
                .addFields(
                    { name: '🎲 Dice Games', value: `\`gamble <amt>\` - 50/50 coin flip\n\`rps <choice>\` - Rock Paper Scissors\n\`dice [sides]\` - Roll dice\n\`roll <sides>\` - Custom dice`, inline: true },
                    { name: '🎯 Card Games', value: `\`highlow <h/l> <amt>\` - Higher/lower\n\`blackjack <amt>\` - Card game`, inline: true },
                    { name: '🎪 Unique Games', value: `\`crash <amt>\` - Cash out before crash!\n\`plinko <amt>\` - Ball drop multipliers\n\`mines <mines> <amt>\` - Clear safes`, inline: true },
                    { name: '🏆 Tournaments', value: `\`trivia <amt>\` - Answer questions\n\`fight @user <amt>\` - Battle royale!\n\`cfpvp @user <amt>\` - Duel a user!`, inline: true },
                    { name: '🐴 Sports', value: `\`horse <amt>\` - Horse racing bets\n\`roulette <color> <amt>\` - Red/Black/Green\n\`wheel <amt>\` - Weighted wheel`, inline: true },
                    { name: '🎰 Slots & More', value: `\`slots <amt>\` - Slot machine`, inline: true },
                    { name: '🎊 Shop Items', value: '🔥 XP Boosters | 💰 Coin Multipliers | 🍀 Lucky Charm | 🛡️ Rob Protection | ✨ Profile Items', inline: false }
                )
                .setFooter({ text: '📄 Page 3/8 • Min bet: 50 coins • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[2] && config.images.helpPages[2].url) || null)
                .setTimestamp(),

            // Levels Page
            new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⭐ LEVELS & RANKING')
                .setDescription(`Use: \`${prefix}<command>\``)
                .setThumbnail('https://cdn.discordapp.com/avatars/1309879612108701706/30a793722e2a9dbc9df3f083116a2458.webp?size=1024')
                .addFields(
                    { name: '👤 Profile', value: `\`rank\` - View your profile\n\`rank <@user>\` - View user profile\n\`setbio <text>\` - Set custom bio`, inline: true },
                    { name: '🏅 Leaderboards', value: `\`leaderboard\` - Top by level\n\`leaderboard money\` - Richest players`, inline: true },
                    { name: '📊 Stats', value: `\`vc [@user]\` - Voice time stats\n\`msg [@user]\` - Message count stats`, inline: true },
                    { name: '📈 Leveling Info', value: `• Earn 3-8 XP per message\n• 60s cooldown per message\n• Level up = earn coins!\n• Unique profile customization!`, inline: false }
                )
                .setFooter({ text: '📄 Page 4/8 • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[3] && config.images.helpPages[3].url) || null)
                .setTimestamp(),

            // Fun Page
            new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🎪 FUN COMMANDS')
                .setDescription(`Use: \`${prefix}<command>\``)
                .setThumbnail('https://cdn.discordapp.com/avatars/1309879612108701706/30a793722e2a9dbc9df3f083116a2458.webp?size=1024')
                .addFields(
                    { name: '🎮 Games', value: `\`coinflip\` - Flip a coin (5m cd)\n\`dice [sides]\` - Roll dice (5m cd)\n\`roll <sides>\` - Custom roll\n\`8ball <question>\` - Magic 8ball`, inline: true },
                    { name: '😂 Humor', value: `\`joke\` - Random joke (5m cd)\n\`meme\` - Random meme\n\`fortune\` - Fortune cookie\n\`compliment\` - Get a compliment`, inline: true },
                    { name: '🐾 Animals', value: `\`cat\` - Random cat pic\n\`dog\` - Random dog pic`, inline: true },
                    { name: '👥 Interactions', value: `\`avatar [@user]\` - Show avatar\n\`hug [@user]\` - Send a hug GIF`, inline: true },
                    { name: '✨ Utilities', value: `\`emojify <text>\` - Emoji text\n\`bored\` - Activity ideas`, inline: true },
                    { name: '🎁 Events', value: `\`giveaway <prize> <secs> [winners]\` - Start giveaway\n\`invite\` - Bot invite link`, inline: true }
                )
                .setFooter({ text: '📄 Page 5/8 • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[4] && config.images.helpPages[4].url) || null)
                .setTimestamp(),

            // Management Page
            new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⚙️ SERVER SETTINGS')
                .setDescription(`Use: \`${prefix}<command>\` | ⚠️ Admin Only`)
                .setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '🔧 Configuration', value: `\`setup\` - View settings\n\`setup welcome\` - Set welcome channel\n\`setup prefix\` - Change prefix`, inline: true },
                    { name: '📋 Cleanup', value: `\`pure <amount>\` - Bulk delete messages\n\`welcome\` - Customize welcome`, inline: true },
                    { name: '📊 Info Commands', value: `\`serverinfo\` - Server info\n\`stats\` - Bot stats`, inline: true }
                )
                .setFooter({ text: '📄 Page 6/8 • Use ,welcome to customize welcome messages! • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[5] && config.images.helpPages[5].url) || null)
                .setTimestamp(),

            // Admin Economy Page
            new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('👨‍💼 ADMIN ECONOMY')
                .setDescription(`Use: \`${prefix}<command>\` | ⚠️ Admin Only`)
                .setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '💰 Money Management', value: `\`setmoney <@user> <amount>\` - Set user balance\n\`resetmoney <@user|all>\` - Reset all money`, inline: true },
                    { name: '⭐ Rank Management', value: `\`resetrank <@user|all>\` - Reset ranks/XP`, inline: true },
                    { name: '🎯 System Control', value: `\`blockcmd\` - Block cmds in channel\n\`unblockcmd\` - Unblock cmds in channel`, inline: true },
                    { name: '📌 Info', value: 'View admin commands from Settings page', inline: false }
                )
                .setFooter({ text: '📄 Page 7/8 • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[6] && config.images.helpPages[6].url) || null)
                .setTimestamp(),

            // Stocks Page
            new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('📈 STOCK MARKET | LIVE TRADING')
                .setDescription(`\n╔═══════════════════════════════════╗\n║    **🌟 TRADE LIKE A PRO 🌟**    ║\n╚═══════════════════════════════════╝\n\n> 💰 **Real-time market simulation**\n> 📊 **Updates every 30 minutes**\n> 🔄 **Monday-Friday trading**\n> 📉 **Realistic price fluctuations**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
                .setThumbnail('https://cdn.discordapp.com/avatars/1309879612108701706/30a793722e2a9dbc9df3f083116a2458.webp?size=1024')
                .addFields(
                    { 
                        name: '📊 MARKET OVERVIEW', 
                        value: `\`\`\`yaml\n${prefix}stocks - Live stock prices & market status\n${prefix}stock-chart <symbol> - Interactive price chart\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: '💵 TRADING COMMANDS', 
                        value: `\`\`\`fix\nBUY:  ${prefix}buy-stock <SYMBOL> <QUANTITY>\nSELL: ${prefix}sell-stock <SYMBOL> <QUANTITY>\n\nExample: ${prefix}buy-stock TECH 10\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: '💼 PORTFOLIO MANAGEMENT', 
                        value: `\`\`\`css\n[Your Holdings] ${prefix}portfolio\n[Check Others] ${prefix}portfolio @user\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: '🎯 AVAILABLE STOCKS (8 Total)', 
                        value: `\`\`\`ansi\n\u001b[1;36m🔹 TECH\u001b[0m   - Technology Sector\n\u001b[1;35m🌙 MOON\u001b[0m   - Crypto & Innovation\n\u001b[1;33m👁️ BUZZ\u001b[0m   - Social Media & Trends\n\u001b[1;34m🌊 WAVE\u001b[0m   - Entertainment & Media\n\u001b[1;32m⛰️ PEAK\u001b[0m   - Energy & Resources\n\u001b[1;31m🔄 FLOW\u001b[0m   - Finance & Banking\n\u001b[1;37m🚀 NEXUS\u001b[0m  - Aerospace & Defense\n\u001b[1;33m✨ SPARK\u001b[0m  - Retail & Consumer\n\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: '⚡ KEY FEATURES', 
                        value: `┣ 📈 **30-min price updates** (Mon-Fri only)\n┣ 📉 **±5-15% daily volatility**\n┣ 🔒 **Market closed weekends**\n┣ 💎 **No trading fees**\n┣ 📊 **30-day price history**\n┗ 🎯 **Real profit tracking**`, 
                        inline: false 
                    },
                    { 
                        name: '💡 PRO TIPS', 
                        value: `\`\`\`md\n# Watch for trends on charts\n# Buy during dips, sell at peaks\n# Diversify your portfolio\n# Check market status before trading\n# Weekend = Market closed (no trades)\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({ text: '📄 Page 8/8 • 🟢 Market: Mon-Fri | 🔴 Closed: Sat-Sun • created by VadikGoel (aka VYPER GAMER)', iconURL: message.author.displayAvatarURL() })
                .setImage((config.images && config.images.helpPages && config.images.helpPages[7] && config.images.helpPages[7].url) || null)
                .setTimestamp()
        ];

        let currentPage = 0;

        const createButtons = (page) => {
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('◀ PREV')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('home')
                        .setLabel('🏠 HOME')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('NEXT ▶')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === pages.length - 1)
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('eco')
                        .setLabel('💰 ECONOMY')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('casino')
                        .setLabel('🎰 CASINO')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('level')
                        .setLabel('⭐ LEVELS')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('fun')
                        .setLabel('🎪 FUN')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('stocks')
                        .setLabel('📈 STOCKS')
                        .setStyle(ButtonStyle.Secondary)
                );

            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('manage')
                        .setLabel('⚙️ MANAGE')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('admin-eco')
                        .setLabel('👨‍💼 ADMIN')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setLabel('GitHub')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://github.com/vadikgoel')
                        .setDisabled(page !== 0)
                );

            return page === 0 ? [row1, row2, row3] : [row1, row2];
        };

        try {
            const helpMsg = await message.reply({
                embeds: [pages[currentPage]],
                components: createButtons(currentPage),
                allowedMentions: { repliedUser: false }
            });

            const filter = (i) => i.user.id === message.author.id;
            const collector = helpMsg.createMessageComponentCollector({
                filter,
                time: 300000
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'prev') currentPage = Math.max(0, currentPage - 1);
                else if (interaction.customId === 'next') currentPage = Math.min(pages.length - 1, currentPage + 1);
                else if (interaction.customId === 'home') currentPage = 0;
                else if (interaction.customId === 'eco') currentPage = 1;
                else if (interaction.customId === 'casino') currentPage = 2;
                else if (interaction.customId === 'level') currentPage = 3;
                else if (interaction.customId === 'fun') currentPage = 4;
                else if (interaction.customId === 'manage') currentPage = 5;
                else if (interaction.customId === 'admin-eco') currentPage = 6;
                else if (interaction.customId === 'stocks') currentPage = 7;

                await interaction.update({
                    embeds: [pages[currentPage]],
                    components: createButtons(currentPage)
                }).catch(() => {});
            });

            collector.on('end', () => {
                helpMsg.edit({ components: [] }).catch(() => {});
            });
        } catch (error) {
            console.error('Help error:', error);
            message.reply('Error loading help menu!').catch(() => {});
        }
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600) % 24;
    const mins = Math.floor(seconds / 60) % 60;
    return `${days}d ${hours}h ${mins}m`;
}
