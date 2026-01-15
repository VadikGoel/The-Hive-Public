const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vc',
    description: 'Check voice channel time stats',
    aliases: ['voicetime', 'vcstats'],
    execute(message, args, db, config) {
        // Get target user (mentioned user or command author)
        const target = message.mentions?.users?.first() || message.slashOptions?.user || message.author;
        const user = db.getUser(target.id, message.guild.id);

        if (!user) {
            return message.reply(`${target.username} hasn't been tracked yet!`);
        }

        const voiceTime = user.voiceTime || 0;
        
        // Convert seconds to readable format
        const hours = Math.floor(voiceTime / 3600);
        const minutes = Math.floor((voiceTime % 3600) / 60);
        const seconds = voiceTime % 60;

        // Calculate days if over 24 hours
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        let timeString = '';
        if (days > 0) {
            timeString = `${days}d ${remainingHours}h ${minutes}m`;
        } else if (hours > 0) {
            timeString = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            timeString = `${minutes}m ${seconds}s`;
        } else {
            timeString = `${seconds}s`;
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎤 Voice Channel Stats')
            .setDescription(`Voice time statistics for ${target.username}`)
            .addFields(
                { name: '⏱️ Total Time', value: timeString, inline: true },
                { name: '🕐 Hours', value: hours.toString(), inline: true },
                { name: '⏲️ Minutes', value: Math.floor(voiceTime / 60).toString(), inline: true }
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${target.username} • Level ${user.level} • created by VadikGoel (aka VYPER GAMER)`, iconURL: target.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
