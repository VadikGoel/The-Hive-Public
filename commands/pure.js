const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'pure',
  description: 'Bulk delete recent messages in this channel',
  aliases: ['purge', 'clean'],
  async execute(message, args) {
    // Permissions
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You need Manage Messages permission to use this.');
    }

    // Amount from slash or args
    const amountOpt = message.slashOptions?.amount;
    let amount = amountOpt !== undefined ? parseInt(amountOpt) : parseInt(args[0]);
    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid number of messages to delete.');
    }

    // Discord bulkDelete caps at 100 per call; support up to 1000 in chunks
    amount = Math.min(amount, 1000);

    let remaining = amount;
    let deletedTotal = 0;

    while (remaining > 0) {
      const toDelete = Math.min(100, remaining);
      try {
        const deleted = await message.channel.bulkDelete(toDelete, true);
        deletedTotal += deleted.size;
        remaining -= deleted.size;
        if (deleted.size === 0) break;
      } catch (err) {
        await message.reply(`❌ Failed after deleting ${deletedTotal}. ${err?.message || err}`);
        return;
      }
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 900));
    }

    const embed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('🧹 Channel Cleaned')
      .setDescription(`Deleted **${deletedTotal}** messages in this channel.`)
      .setTimestamp();

    const confirm = await message.reply({ embeds: [embed] });
    setTimeout(() => { confirm.delete().catch(() => {}); }, 5000);
  }
};
