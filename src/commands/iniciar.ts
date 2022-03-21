import { Message, Role, Guild, TextChannel } from 'discord.js';
import {
  messageEmbedSecretChannel,
  messageEmbedWaittingWord,
} from '../controllers/sendStateMessage';
import GameModel, { Game } from '../db/models/Game';
import limparRol from '../utils/utils';

const execute = async (msg: Message) => {
  const commandBody = msg.content
    .slice('$iniciar'.length)
    .replaceAll(/\s+/g, ' ')
    .trim();
  const args = commandBody.split(' ');
  let modo = 1;
  let lifes = 7;
  if (args[0] === '2' || args[1] === '2') {
    modo = 3;
    lifes = 14;
  }
  const role = msg.guild?.roles.cache.find(
    (r) => r.name === process.env.ROL_CHALLENGER_NAME,
  ) as Role;
  await limparRol(msg.guild as Guild);
  const user = msg.mentions.members?.first();
  const chanelSecret = msg.guild?.channels.cache.find(
    (c) => c.name === process.env.CHANNEL_NAME,
  ) as TextChannel;
  if (chanelSecret.id === msg.channelId) {
    msg.reply(
      ':rage: :rage: No se pude iniciar una partida aqui, esta canal es solo para ingresar la palabra a jugar :face_with_symbols_over_mouth: ',
    );
    return;
  }
  if (user) {
    if (user.user.bot) {
      msg.reply(':clown: :clown: Los robots no pueden jugar :laughing: ');
      return;
    }
    user.roles.add(role);
    let msgEmbed = messageEmbedWaittingWord(user.id);
    const { id } = await msg.channel.send({ embeds: [msgEmbed] });
    msgEmbed = messageEmbedSecretChannel(user.id);
    chanelSecret.send({ embeds: [msgEmbed] });
    const serverID = msg.guildId as string;
    const chanelID = msg.channelId;

    const update: Game = {
      messageID: id,
      serverID,
      chanelID,
      challenger: user.displayName,
      challengerID: user.id,
      guesses: [],
      lifes,
      state: 'Waitting Word',
      word: '',
      secretLetters: [],
      secretChanelID: chanelSecret.id,
      winnerID: '',
      messageOffset: 15,
      modo,
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await GameModel.findOneAndUpdate({ serverID, chanelID }, update, options);
  } else {
    msg.reply(
      `:rage: :rage: Es necesario que menciones a una persona para comenzar asi: \`$iniciar @${msg.author.username}\`, no roles ni bots ni nada raro :face_with_symbols_over_mouth: `,
    );
  }
};

const name = 'iniciar';

export default { name, execute };
