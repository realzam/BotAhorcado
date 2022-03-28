import { Message, Guild } from 'discord.js';
import GameModel from '../db/models/Game';
import limparRol from '../utils/utils';

const execute = async (msg: Message) => {
  const game = await GameModel.findOne({
    serverID: msg.guildId,
    chanelID: msg.channelId,
  });
  if (game) {
    const botmsg = await msg.channel.messages.fetch(game.messageID);
    try {
      await botmsg.delete();
    } catch (error) {
      console.log('no se pudo eliminar el mensaje');
    }
    await limparRol(msg.guild as Guild);
    await GameModel.findOneAndUpdate(
      {
        serverID: msg.guildId,
        chanelID: msg.channelId,
      },
      { $set: { state: 'Stoped' } },
    );
  }
};

const name = 'detener';

export default { name, execute };
