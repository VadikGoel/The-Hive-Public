const { EmbedBuilder } = require('discord.js');

function monthKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

module.exports = {
  name: 'counter-leader',
  description: 'Show counting leaderboard (current or history up to 5 months)',
  aliases: ['countleader','countlb'],
  async execute(message, args, db, config) {
    const guildId = message.guild.id;

    let showHistory, pageIdx;
    
    if (message.slashOptions) {
      // Slash command with typed options
      const mode = message.slashOptions.mode || 'current';
      showHistory = mode === 'history';
      pageIdx = showHistory ? Math.max(0, (message.slashOptions.page || 1) - 1) : 0;
    } else {
      // Prefix command
      showHistory = args[0] && args[0].toLowerCase() === 'history';
      pageIdx = 0;
      if (showHistory && args[1]) pageIdx = Math.max(0, parseInt(args[1]) - 1 || 0);
    }

    if (showHistory) {
      const history = db.getCounterHistory(guildId, 5);
      if (!history.length) return message.reply('📭 No history yet. Start counting to build stats!');

      const entry = history[Math.min(pageIdx, history.length - 1)];
      const top = entry.top;
      const embed = new EmbedBuilder()
        .setColor('#fdcb6e')
        .setTitle(`📚 Counting History — ${entry.monthKey}`)
        .setDescription('Top counters for the month (max 10 shown).')
        .addFields(top.map((r, i) => ({
          name: `${i+1}. <@${r.userId}>`,
          value: `Counts: **${r.count}**`,
          inline: false
        })))
        .setFooter({ text: `Page ${Math.min(pageIdx+1, history.length)}/${history.length} • created by VadikGoel (aka VYPER GAMER)` })
        .setTimestamp();
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    // Current month leaderboard
    const now = new Date();
    const monthKey = monthKeyFromDate(now);
    const top = db.getCounterLeaderboard(guildId, monthKey, 10);

    const embed = new EmbedBuilder()
      .setColor('#ffeaa7')
      .setTitle('🏆 Counting Leaderboard — This Month')
      .setDescription('Top counters for the current month.')
      .addFields(top.map((r, i) => ({
        name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹'} ${i+1}. <@${r.userId}>`,
        value: `Total Counts: **${r.count}**`,
        inline: false
      })))
      .setImage((config.images && config.images.leaderboardBannerUrl) || null)
      .setTimestamp();

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};
