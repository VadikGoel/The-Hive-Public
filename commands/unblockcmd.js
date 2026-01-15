const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unblockcmd',
    description: 'Unblock the bot from sending messages in this channel',
    aliases: ['unblockbot', 'unsilence'],
    execute(message, args, db, config) {
        // Check if user has admin permissions
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need Administrator permission to use this command.');
        }

        const channelId = message.channel.id;
        const guildId = message.guild.id;

        // Check if channel is blocked
        if (!db.isChannelBlacklisted(guildId, channelId)) {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Not Blocked')
                .setDescription(`This channel is not blocked. I can already send messages here!\nUse \`${config.prefix}blockcmd\` to block.`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Unblock the channel
        db.unblockChannel(guildId, channelId);

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ Channel Unblocked')
            .setDescription(`🔊 I can now send messages in <#${channelId}> again!`)
            .addFields(
                { name: 'Unblocked By', value: message.author.tag, inline: true },
                { name: 'To Block Again', value: `\`${config.prefix}blockcmd\``, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
