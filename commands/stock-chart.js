const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'stock-chart',
    description: 'View stock price chart (30-day history)',
    aliases: ['stockchart', 'chart', 'stock-graph'],
    execute(message, args, db, config) {
        const symbol = (args[0] || '').toUpperCase();

        if (!symbol) {
            return message.reply('Usage: `,stock-chart <SYMBOL>` (e.g., `,stock-chart TECH`)');
        }

        const stock = db.getStock(symbol);
        if (!stock) {
            return message.reply(`❌ Stock **${symbol}** not found! Use \`,stocks\` to see available stocks.`);
        }

        let history = [];
        try {
            history = JSON.parse(stock.history || '[]');
        } catch (e) {
            history = [];
        }

        if (history.length === 0) {
            return message.reply(`No price history for **${symbol}** yet. Try again later!`);
        }

        // Create ASCII chart
        const chart = createChart(history, 20, 10);
        
        // Calculate statistics
        const minPrice = Math.min(...history);
        const maxPrice = Math.max(...history);
        const currentPrice = stock.currentPrice;
        const startPrice = history[0];
        const change = currentPrice - startPrice;
        const changePercent = (change / startPrice * 100).toFixed(2);
        const changeIcon = change >= 0 ? '📈' : '📉';
        const avgPrice = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor(change >= 0 ? '#00C851' : '#E74C3C')
            .setTitle(`📊 ${symbol} Stock Chart (30 Days)`)
            .setDescription(`\`\`\`${chart}\`\`\``)
            .addFields(
                { name: 'Current Price', value: `$${currentPrice.toFixed(2)}`, inline: true },
                { name: 'Change', value: `${changeIcon} ${changePercent}%\n(${change > 0 ? '+' : ''}$${change.toFixed(2)})`, inline: true },
                { name: 'High/Low', value: `$${maxPrice.toFixed(2)} / $${minPrice.toFixed(2)}`, inline: true },
                { name: 'Average Price', value: `$${avgPrice}`, inline: true },
                { name: 'History Points', value: `${history.length}/30 points\n(30-min updates)`, inline: true },
                { name: '30-Day Trend', value: getTrend(history), inline: true }
            )
            .setFooter({ text: 'Use /buy-stock or /sell-stock to trade • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        // Add refresh button
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`chart_refresh_${symbol}`)
                    .setLabel('🔄 Refresh Chart')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stock_refresh')
                    .setLabel('📊 Back to Stocks')
                    .setStyle(ButtonStyle.Secondary)
            );

        message.reply({ embeds: [embed], components: [row] });
    },

    async executeSlash(interaction, db, config, symbol) {
        // If symbol not provided, get from options
        if (!symbol) {
            symbol = interaction.options?.getString('symbol')?.toUpperCase();
        }

        if (!symbol) {
            return interaction.reply({ content: 'Usage: `/stock-chart <SYMBOL>` (e.g., `/stock-chart TECH`)', ephemeral: true });
        }

        const stock = db.getStock(symbol);
        if (!stock) {
            return interaction.reply({ content: `❌ Stock **${symbol}** not found! Use \`/stocks\` to see available stocks.`, ephemeral: true });
        }

        let history = [];
        try {
            history = JSON.parse(stock.history || '[]');
        } catch (e) {
            history = [];
        }

        if (history.length === 0) {
            return interaction.reply({ content: `No price history for **${symbol}** yet. Try again later!`, ephemeral: true });
        }

        // Create ASCII chart
        const chart = createChart(history, 20, 10);
        
        // Calculate statistics
        const minPrice = Math.min(...history);
        const maxPrice = Math.max(...history);
        const currentPrice = stock.currentPrice;
        const startPrice = history[0];
        const change = currentPrice - startPrice;
        const changePercent = (change / startPrice * 100).toFixed(2);
        const changeIcon = change >= 0 ? '📈' : '📉';
        const avgPrice = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor(change >= 0 ? '#00C851' : '#E74C3C')
            .setTitle(`📊 ${symbol} Stock Chart (30 Days)`)
            .setDescription(`\`\`\`${chart}\`\`\``)
            .addFields(
                { name: 'Current Price', value: `$${currentPrice.toFixed(2)}`, inline: true },
                { name: 'Change', value: `${changeIcon} ${changePercent}%\n(${change > 0 ? '+' : ''}$${change.toFixed(2)})`, inline: true },
                { name: 'High/Low', value: `$${maxPrice.toFixed(2)} / $${minPrice.toFixed(2)}`, inline: true },
                { name: 'Average Price', value: `$${avgPrice}`, inline: true },
                { name: 'History Points', value: `${history.length}/30 points\n(30-min updates)`, inline: true },
                { name: '30-Day Trend', value: getTrend(history), inline: true }
            )
            .setFooter({ text: 'Use /buy-stock or /sell-stock to trade • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        // Add refresh button
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`chart_refresh_${symbol}`)
                    .setLabel('🔄 Refresh Chart')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stock_refresh')
                    .setLabel('📊 Back to Stocks')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Check if interaction is deferred (from refresh button)
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: [row] });
        } else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};

function createChart(history, width, height) {
    if (history.length === 0) return 'No data';

    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);
    const range = maxPrice - minPrice || 1;

    // Sample history to fit width
    const sampled = [];
    const step = Math.max(1, Math.floor(history.length / width));
    for (let i = 0; i < history.length; i += step) {
        sampled.push(history[i]);
    }

    // Build chart from top to bottom
    let chart = '';
    for (let y = height - 1; y >= 0; y--) {
        const threshold = minPrice + (range / height) * y;
        let line = '';
        
        for (let x = 0; x < sampled.length; x++) {
            const price = sampled[x];
            if (price >= threshold) {
                line += '█';
            } else {
                line += ' ';
            }
        }
        
        chart += line.trimEnd() + '\n';
    }

    // Add x-axis
    chart += '─'.repeat(Math.min(sampled.length, width)) + '\n';

    // Add price labels
    chart += `$${minPrice.toFixed(0).padStart(5)} - $${maxPrice.toFixed(0).padStart(5)}`;

    return chart;
}

function getTrend(history) {
    if (history.length < 2) return '📊 Insufficient data';

    const first10 = history.slice(0, Math.ceil(history.length / 3)).reduce((a, b) => a + b) / Math.ceil(history.length / 3);
    const last10 = history.slice(-Math.ceil(history.length / 3)).reduce((a, b) => a + b) / Math.ceil(history.length / 3);

    if (last10 > first10 * 1.05) return '📈 Strong Uptrend';
    if (last10 > first10) return '📈 Mild Uptrend';
    if (last10 < first10 * 0.95) return '📉 Strong Downtrend';
    if (last10 < first10) return '📉 Mild Downtrend';
    return '➡️ Stable';
}
