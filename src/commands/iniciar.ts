import { Message, Role, Guild, TextChannel } from 'discord.js';
import {
  messageEmbedSecretChannel,
  messageEmbedWaittingWord,
} from '../controllers/sendStateMessage';
import GameModel, { Game } from '../db/models/Game';
import limparRol from '../utils/utils';

const execute = async (msg: Message) => {
  const role = msg.guild?.roles.cache.find(
    (r) => r.name === process.env.ROL_CHALLENGER_NAME,
  ) as Role;
  await limparRol(msg.guild as Guild);
  const user = msg.mentions.members?.first();
  const chanel = msg.guild?.channels.cache.find(
    (c) => c.name === process.env.CHANNEL_NAME,
  ) as TextChannel;
  if (user) {
    if (user.user.bot) {
      msg.reply(':clown: :clown: Los robots no pueden jugar :laughing: ');
      return;
    }
    user.roles.add(role);
    let msgEmbed = await messageEmbedWaittingWord(user.id);
    const { id } = await msg.channel.send({ embeds: [msgEmbed] });
    msgEmbed = await messageEmbedSecretChannel(user.id);
    chanel.send({ embeds: [msgEmbed] });
    const serverID = msg.guildId as string;
    const chanelID = msg.channelId;

    const update: Game = {
      messageID: id,
      serverID,
      chanelID,
      challenger: user.displayName,
      challengerID: user.id,
      guesses: [],
      lifes: 7,
      queueLetters: [],
      state: 'Waitting Word',
      word: '',
      secretLetters: [],
      secretChanelID: chanel.id,
      winnerID: '',
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
