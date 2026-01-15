const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setcounting',
  description: 'Set the counting channel for this server (Admin only)',
  aliases: ['countingchannel', 'setcount'],
  async execute(message, args, db, config) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply('❌ You need Manage Server permission to set the counting channel.');
    }

    // Support both slash (typed channel option) and prefix (mention/ID in args)
    const channel = message.mentions?.channels?.first() 
      || message.guild.channels.cache.get(args[0]) 
      || message.channel;
    if (!channel) return message.reply('❌ Provide a channel mention or ID.');

    db.setCountingChannel(message.guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setColor('#00b894')
      .setTitle('🔢 Counting Channel Set')
      .setDescription(`Counting channel is now <#${channel.id}>.
Only sequential numbers are allowed here. Wrong messages will be deleted and a hint will be sent.`)
      .addFields(
        { name: 'Auto Delete Hint', value: `${config.counting.wrongMsgDeleteSeconds}s`, inline: true },
        { name: 'Monthly Reset Day', value: `${config.counting.monthlyResetDay}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};
