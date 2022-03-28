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
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .toUpperCase();
  if (game && game.state === 'In game') {
    if (game.challengerID === msg.author.id) {
      msg.reply(
        ':clown: :clown:  No puedes adivinar tu propia palabra :thinking:',
      );
      return;
    }
    if (game.word === guess) {
      game.$set('state', 'Finish');
      game.$set('winnerID', msg.author.id);
      game.$set('messageOffset', -1);
      game.addLeaderBoard();
      await game.save();
      return;
    }
    if (game.word !== guess) {
      msg.reply(
        ':x: Nop, esa no es la palabra sigue intentando no te rindas :punch: ',
      );
      return;
    }

    if (guess === '') {
      msg.reply(
        ':rage: :rage: :rage: Tienes que poner la palabra que crees que esta en el ahorado asi:`$adivinar kimi no na wa`',
      );
    }
  }
};

export default { name, execute };
