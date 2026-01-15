const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setsticky',
  description: 'Set a sticky note in a channel that rewrites after messages',
  aliases: ['sticky','stickynote'],
  async execute(message, args, db, config) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply('❌ You need Manage Server permission to configure sticky notes.');
    }

    // Support both slash (typed options) and prefix (args parsing)
    let channel, threshold, content;
    
    if (message.slashOptions) {
      // Slash command with typed options
      channel = message.slashOptions.channel || message.channel;
      threshold = message.slashOptions.threshold || config.stickyNotes?.defaultThreshold || 2;
      content = message.slashOptions.content;
    } else {
      // Prefix command
      channel = message.mentions?.channels?.first() || message.guild.channels.cache.get(args[0]) || message.channel;
      const thresholdArg = args.find(a => /^\d+$/.test(a));
      threshold = Number(thresholdArg) || config.stickyNotes?.defaultThreshold || 2;
      content = args.filter(a => a !== thresholdArg && a !== `<#${channel.id}>` && a !== channel.id).join(' ').trim();
    }
    if (!content) return message.reply('❌ Provide sticky note text. Example: `setsticky #general 2 Welcome to the server!`');

    db.setStickyNote(message.guild.id, channel.id, content, threshold);

    const embed = new EmbedBuilder()
      .setColor('#74b9ff')
      .setTitle('📌 Sticky Note Configured')
      .setDescription(`A sticky note will be kept visible in <#${channel.id}> and refreshed every **${threshold}** messages.`)
      .addFields(
        { name: 'Note', value: content }
      )
      .setTimestamp();

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};
