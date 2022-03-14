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
  if (!commands.has(command)) {
    message.reply(
      '¿Me hablaste? :face_with_raised_eyebrow:  :confused:, No entiendo el comando :neutral_face: ',
    );
    return;
  }
  commands.get(command)?.execute(message);
};

const messageCreate = async (message: Message) => {
  if (message.author.bot) return;
  const content = message.content.trim();
  if (content.startsWith(prefix)) {
    commandMessage(message);
    return;
  }
  const game = await GameModel.findOne({ serverID: message.guildId });
  if (!game) return;
  const txtMsg = message.content.trim();
  if (game.state === 'Waitting Word') {
    const channel = message.guild?.channels.cache.find(
      (c) => c.id === message.channelId,
    ) as TextChannel;
    if (channel.name === process.env.CHANNEL_NAME) {
      await game.setSecret(txtMsg);
    }
    return;
  }
  if (
    txtMsg.length === 1 &&
    game.state === 'In game' &&
    game.chanelID === message.channelId
  ) {
    if (game.challengerID === message.author.id) {
      message.reply(':shushing_face: shh, No des ideas :rolling_eyes: ');
      return;
    }
    await game.addLetterAttempt(txtMsg.toUpperCase());
    message.delete();
  }
};

export default messageCreate;
