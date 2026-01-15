const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'stocks',
    description: 'View available stocks and their prices',
    aliases: ['stocklist', 'stockmarket'],
    execute(message, args, db, config) {
        // Initialize stocks on first run
        const allStocks = db.getAllStocks();
        if (allStocks.length === 0) {
            db.initializeStocks();
        }

        const stocks = db.getAllStocks();
        const marketStatus = db.checkMarketStatus();

        if (stocks.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ No Stocks Available')
                .setDescription('Stock market is not initialized yet.')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        // Determine market status
        let statusEmoji = '🟢';
        let statusText = `MARKET OPEN - Trading Day ${marketStatus.currentDay}/5`;
        let statusColor = '#00D166';

        if (!marketStatus.marketOpen) {
            statusEmoji = '🔴';
            statusText = marketStatus.dayOfWeek === 6 ? 'MARKET CLOSED - Saturday' : 'MARKET CLOSED - Sunday';
            statusColor = '#E74C3C';
        }

        // Sort stocks by symbol for consistency
        const sortedStocks = stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));

        // Build stock listings - simplified and clean
        let stockFields = [];
        
        for (const stock of sortedStocks) {
            const currentPrice = stock.currentPrice.toFixed(2);
            const change = ((stock.currentPrice - stock.basePrice) / stock.basePrice * 100);
            const changeStr = change.toFixed(2);
            const changeIcon = change >= 0 ? '📈' : '📉';
            const changeColor = change >= 0 ? '🟢' : '🔴';
            
            // Get stock description
            const descriptions = {
                'TECH': 'Technology & Software',
                'MOON': 'Crypto & Innovation',
                'BUZZ': 'Social Media',
                'WAVE': 'Entertainment',
                'PEAK': 'Energy Sector',
                'FLOW': 'Banking & Finance',
                'NEXUS': 'Aerospace',
                'SPARK': 'Retail & Consumer'
            };
            
            const stockName = `${changeColor} ${stock.symbol} - ${descriptions[stock.symbol] || 'Stock'}`;
            const stockInfo = `**Price:** $${currentPrice}\n**Change:** ${changeIcon} ${change >= 0 ? '+' : ''}${changeStr}%\n**Status:** ${change >= 0 ? 'Gaining' : 'Losing'}`;
            
            stockFields.push({
                name: stockName,
                value: stockInfo,
                inline: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(statusColor)
            .setTitle('📊 STOCK MARKET DASHBOARD')
            .setDescription(`${statusEmoji} **${statusText}**\n\n*Prices update every 30 minutes (Mon-Fri)*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ **Use slash command \`/stocks\` for interactive buttons!**`)
            .setThumbnail(message.client.user.displayAvatarURL({ size: 256 }))
            .addFields(stockFields)
            .addFields({
                name: '📚 Quick Commands',
                value: '`,buy-stock TECH 5` - Buy 5 shares\n`,sell-stock TECH 5` - Sell 5 shares\n`,stock-chart TECH` - View chart\n`,portfolio` - Your holdings',
                inline: false
            })
            .addFields({
                name: '💡 Trading Tips',
                value: '🟢 **Green/Up** = Stock is gaining (good to sell)\n🔴 **Red/Down** = Stock is losing (good to buy low)\n📊 **Use buttons below to trade quickly!**',
                inline: false
            })
            .setFooter({ text: 'Learn trading risk-free! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        // Create interactive buttons
        const tradingEnabled = marketStatus.marketOpen;
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stock_buy')
                    .setLabel('💰 Buy Stocks')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!tradingEnabled),
                new ButtonBuilder()
                    .setCustomId('stock_sell')
                    .setLabel('💵 Sell Stocks')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!tradingEnabled),
                new ButtonBuilder()
                    .setCustomId('stock_portfolio')
                    .setLabel('📂 My Portfolio')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stock_refresh')
                    .setLabel('🔄 Refresh')
                    .setStyle(ButtonStyle.Secondary)
            );

        message.reply({ embeds: [embed], components: [row] });
    },

    async executeSlash(interaction, db, config) {
        // Initialize stocks on first run
        const allStocks = db.getAllStocks();
        if (allStocks.length === 0) {
            db.initializeStocks();
        }

        const stocks = db.getAllStocks();
        const marketStatus = db.checkMarketStatus();

        if (stocks.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ No Stocks Available')
                .setDescription('Stock market is not initialized yet.')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Determine market status
        let statusEmoji = '🟢';
        let statusText = `MARKET OPEN - Trading Day ${marketStatus.currentDay}/5`;
        let statusColor = '#00D166';
        let tradingEnabled = true;

        if (!marketStatus.marketOpen) {
            statusEmoji = '🔴';
            statusText = marketStatus.dayOfWeek === 6 ? 'MARKET CLOSED - Saturday' : 'MARKET CLOSED - Sunday';
            statusColor = '#E74C3C';
            tradingEnabled = false;
        }

        // Sort stocks by symbol for consistency
        const sortedStocks = stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));

        // Build stock listings
        let stockFields = [];
        
        for (const stock of sortedStocks) {
            const currentPrice = stock.currentPrice.toFixed(2);
            const change = ((stock.currentPrice - stock.basePrice) / stock.basePrice * 100);
            const changeStr = change.toFixed(2);
            const changeIcon = change >= 0 ? '📈' : '📉';
            const changeColor = change >= 0 ? '🟢' : '🔴';
            
            // Get stock description
            const descriptions = {
                'TECH': 'Technology & Software',
                'MOON': 'Crypto & Innovation',
                'BUZZ': 'Social Media',
                'WAVE': 'Entertainment',
                'PEAK': 'Energy Sector',
                'FLOW': 'Banking & Finance',
                'NEXUS': 'Aerospace',
                'SPARK': 'Retail & Consumer'
            };
            
            const stockName = `${changeColor} ${stock.symbol} - ${descriptions[stock.symbol] || 'Stock'}`;
            const stockInfo = `**Price:** $${currentPrice}\n**Change:** ${changeIcon} ${change >= 0 ? '+' : ''}${changeStr}%\n**Status:** ${change >= 0 ? 'Gaining' : 'Losing'}`;
            
            stockFields.push({
                name: stockName,
                value: stockInfo,
                inline: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(statusColor)
            .setTitle('📊 STOCK MARKET DASHBOARD')
            .setDescription(`${statusEmoji} **${statusText}**\n\n*Prices update every 30 minutes (Mon-Fri)*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .addFields(stockFields)
            .addFields({
                name: '💡 Trading Tips',
                value: '🟢 **Green/Up** = Stock is gaining (good to sell)\n🔴 **Red/Down** = Stock is losing (good to buy low)\n📊 **Use buttons below to trade quickly!**',
                inline: false
            })
            .setFooter({ text: 'Learn trading risk-free! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        // Create interactive buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stock_buy')
                    .setLabel('💰 Buy Stocks')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!tradingEnabled),
                new ButtonBuilder()
                    .setCustomId('stock_sell')
                    .setLabel('💵 Sell Stocks')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!tradingEnabled),
                new ButtonBuilder()
                    .setCustomId('stock_portfolio')
                    .setLabel('📂 My Portfolio')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stock_refresh')
                    .setLabel('🔄 Refresh')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Check if this is a deferred update (from refresh button) or initial reply
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: [row] });
        } else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};
