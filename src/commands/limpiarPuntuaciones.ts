import { Message } from 'discord.js';
import GameModel from '../db/models/Game';

const name = 'lp';

const execute = async (msg: Message) => {
  const game = await GameModel.findOne({
    channelID: msg.channelId,
    serverID: msg.guildId,
  });
  if (game) {
    game.clearLeaderBoard();
    await game.save();
  }
};

export default { name, execute };
