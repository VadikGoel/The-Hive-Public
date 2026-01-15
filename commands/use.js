const { EmbedBuilder } = require('discord.js');
const shop = require('./shop.js');
const shopItems = shop.shopItems;

module.exports = {
    name: 'use',
    aliases: ['activate', 'consume'],
    description: 'Use an item from your inventory',
    execute(message, args, db, config) {
        const itemId = args[0]?.toLowerCase();

        if (!itemId) {
            return message.reply(`Please specify an item to use! Use \`${config.prefix}inventory\` to see your items.`);
        }

        const hasItem = db.hasItem(message.author.id, message.guild.id, itemId);

        if (!hasItem) {
            return message.reply('You don\'t have that item in your inventory!');
        }

        const item = shopItems.find(i => i.id === itemId);

        if (!item) {
            return message.reply('Invalid item!');
        }

        // Handle different item types
        if (item.type === 'booster') {
            // Check if already has this effect active
            const existingEffects = db.getActiveEffects(message.author.id, message.guild.id);
            const hasEffect = existingEffects.find(e => e.effectType === item.effect);

            if (hasEffect) {
                return message.reply(`You already have a ${item.effect} booster active!`);
            }

            // Activate booster
            db.addEffect(message.author.id, message.guild.id, item.effect, item.multiplier, item.duration);
            db.removeItem(message.author.id, message.guild.id, itemId, 1);

            const durationHours = item.duration / 3600000;

            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🔥 Booster Activated!')
                .setDescription(`**${item.name}** is now active!`)
                .addFields(
                    { name: 'Effect', value: `${item.multiplier}x ${item.effect.toUpperCase()}`, inline: true },
                    { name: 'Duration', value: `${durationHours} hour${durationHours > 1 ? 's' : ''}`, inline: true }
                )
                .setFooter({ text: 'Get grinding! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (item.type === 'protection') {
            const existingEffects = db.getActiveEffects(message.author.id, message.guild.id);
            const hasProtection = existingEffects.find(e => e.effectType === 'rob_protection');

            if (hasProtection) {
                return message.reply('You already have rob protection active!');
            }

            db.addEffect(message.author.id, message.guild.id, 'rob_protection', 1, item.duration);
            db.removeItem(message.author.id, message.guild.id, itemId, 1);

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('🛡️ Protection Activated!')
                .setDescription('You are now protected from robberies for **24 hours**!')
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (item.type === 'consumable' && itemId === 'cooldown_pass') {
            // Reset daily cooldown
            const user = db.getUser(message.author.id, message.guild.id);
            
            // Create a method call to database - we'll add it to database.js
            db.resetDailyCooldown(message.author.id, message.guild.id);
            
            db.removeItem(message.author.id, message.guild.id, itemId, 1);

            const embed = new EmbedBuilder()
                .setColor('#f39c12')
                .setTitle('⏰ Cooldown Reset!')
                .setDescription('Your daily cooldown has been reset! You can claim your daily reward now.')
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // Cosmetic and permanent items
        if (item.type === 'cosmetic' || item.type === 'item') {
            return message.reply(`**${item.name}** is equipped/active! It will show on your profile.`);
        }

        message.reply('This item cannot be used.');
    }
};
