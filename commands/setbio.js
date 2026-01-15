const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setbio',
    description: 'Set your profile bio',
    execute(message, args, db, config) {
        const bio = args.join(' ');
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        if (!bio) {
            return message.reply(`Please provide a bio! Example: \`${prefix}setbio I love gaming!\``);
        }

        if (bio.length > 100) {
            return message.reply('Bio must be 100 characters or less!');
        }

        const stmt = db.db.prepare(`
            UPDATE users SET bio = ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(bio, message.author.id, message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('✅ Bio Updated!')
            .setDescription(`Your new bio:\n> ${bio}`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Your bio will appear on your rank card! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
