const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blockcmd',
    description: 'Block the bot from sending messages in this channel',
    aliases: ['blockbot', 'silence'],
    execute(message, args, db, config) {
        // Check if user has admin permissions
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need Administrator permission to use this command.');
        }

        const channelId = message.channel.id;
        const guildId = message.guild.id;
        const blockedBy = message.author.tag;

        // Check if already blocked
        if (db.isChannelBlacklisted(guildId, channelId)) {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Already Blocked')
                .setDescription(`This channel is already blocked from bot messages.\nUse \`${config.prefix}unblockcmd\` to unblock.`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Block the channel
        db.blockChannel(guildId, channelId, blockedBy);

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ Channel Blocked')
            .setDescription(`🤐 I've been silenced in <#${channelId}>.\nI won't send any messages or respond to commands here.`)
            .addFields(
                { name: 'Blocked By', value: blockedBy, inline: true },
                { name: 'To Unblock', value: `\`${config.prefix}unblockcmd\``, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
