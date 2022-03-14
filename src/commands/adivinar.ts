import { Message } from 'discord.js';
import GameModel from '../db/models/Game';

const name = 'adivinar';

const execute = async (msg: Message) => {
  const serverID = msg.guildId as string;
  const chanelID = msg.channelId;
  const game = await GameModel.findOne({ serverID, chanelID });
  let guess = msg.content.trim().slice(`$${name}`.length);
  guess = guess
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[^a-zA-Z ]/g, '')
    .trim()
    .toUpperCase();
  if (game && game.state === 'In game' && game.word === guess) {
    await GameModel.findOneAndUpdate(
      { serverID, chanelID },
      { $set: { state: 'Finish', winnerID: msg.author.id } },
    );
    return;
  }
  if (game && game.state === 'In game' && game.word !== guess) {
    msg.reply(
      ':x: Nop, esa no es la palabra sigue intentando no te rindas :punch: ',
    );
    return;
  }

  if (game && game.state === 'In game' && guess === '') {
    msg.reply(
      ':rage: :rage: :rage: Tienes que poner la palabra que crees que esta en el ahorado asi:`$adivinar kimi no na wa`',
    );
  }
};

export default { name, execute };
