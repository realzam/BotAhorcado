import { Message } from 'discord.js';
import { messageEmbedLeaderBoard } from '../controllers/sendStateMessage';
import GameModel from '../db/models/Game';

const name = 'puntuaciones';

const execute = async (msg: Message) => {
  const game = await GameModel.findOne({
    channelID: msg.channelId,
    serverID: msg.guildId,
  });
  if (game) {
    const msgEmbed = messageEmbedLeaderBoard(game);
    msg.channel.send({ embeds: [msgEmbed] });
  }
};

export default { name, execute };
