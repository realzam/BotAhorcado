import { Message, Role, TextChannel } from 'discord.js';
import GameModel, { Game } from '../db/models/Game';

const execute = async (msg: Message) => {
  const role = msg.guild?.roles.cache.find(
    (r) => r.name === 'ahorcador',
  ) as Role;
  const chanel = msg.guild?.channels.cache.find(
    (c) => c.name === 'secret',
  ) as TextChannel;
  chanel?.members.forEach((m) => {
    const isRole = m.roles.cache.find((r) => r.name === 'ahorcador');
    if (isRole) {
      m.roles.remove(role);
    }
  });

  const user = msg.mentions.members?.first();
  if (user) {
    user.roles.add(role);
    const query = {};
    const { id } = await msg.channel.send('Esperando palabra...');
    const update: Game = {
      messageID: id,
      serverID: msg.guildId as string,
      chanelID: msg.channelId,
      challenger: user.displayName,
      guesses: [],
      lifes: 8,
      queueLetters: [],
      state: 'Waitting Word',
      word: '',
      secretLetters: [],
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await GameModel.findOneAndUpdate(query, update, options);
  }
};

const name = 'iniciar';

export default { name, execute };
