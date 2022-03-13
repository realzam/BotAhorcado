import { Message, TextChannel } from 'discord.js';
import botCommands from '../commands/index';
import GameModel from '../db/models/Game';

const prefix = '$';
const commands = botCommands;

const commandMessage = (message: Message) => {
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift()?.toLowerCase();
  if (!command) return;
  if (!commands.has(command)) return;
  commands.get(command)?.execute(message);
};

const messageCreate = async (message: Message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
    commandMessage(message);
    return;
  }
  const game = await GameModel.findOne({ serverID: message.guildId });
  if (!game) return;
  const txtMsg = message.content;
  if (game.state === 'Waitting Word') {
    const channel = message.guild?.channels.cache.find(
      (c) => c.id === message.channelId,
    ) as TextChannel;
    if (channel.name === 'secret') {
      await game.setSecret(txtMsg);
    }
    return;
  }
  if (
    txtMsg.length === 1 &&
    game.state === 'In game' &&
    game.chanelID === message.channelId
  ) {
    console.log('messageCreate try discover', txtMsg);
    const decrementar = await game.addLetterAttempt(txtMsg.toUpperCase());
    if (decrementar) {
      await GameModel.findByIdAndUpdate(game.id, {
        $inc: { lifes: -1 },
      });
    }
    await message.delete();
  }
};

export default messageCreate;
