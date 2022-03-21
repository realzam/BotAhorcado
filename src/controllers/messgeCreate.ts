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
      '¿Me hablaste? :face_with_raised_eyebrow:  :confused:, No entiendo el comando :neutral_face: \n comandos disponibles: `$adivinar`, `$crear`, `$detener`, `$help`, `$iniciar`',
    );
    return;
  }
  commands.get(command)?.execute(message);
};

const messageCreate = async (message: Message) => {
  const content = message.content.trim();
  if (content.startsWith(prefix) && !message.author.bot) {
    commandMessage(message);
    return;
  }
  const game = await GameModel.findOne({ serverID: message.guildId });
  if (!game) return;
  if (
    game.state === 'Waitting Word' &&
    message.author.id === game.challengerID
  ) {
    const channel = message.guild?.channels.cache.find(
      (c) => c.id === message.channelId,
    ) as TextChannel;
    if (channel.name === process.env.CHANNEL_NAME) {
      await game.setSecret(content);
      return;
    }
  }
  if (
    content.length === 1 &&
    game.state === 'In game' &&
    game.chanelID === message.channelId &&
    !message.author.bot
  ) {
    if (game.challengerID === message.author.id) {
      message.reply(':shushing_face: shh, No des ideas :rolling_eyes: ');
      return;
    }
    await game.addLetterAttempt(content.toUpperCase(), message.author.id);
    message.delete();
    return;
  }
  if (
    (game.state === 'In game' || game.state === 'Waitting Word') &&
    game.chanelID === message.channelId
  ) {
    let breakLines = [...content.matchAll(/[^\r\n]+/g)].length;
    if (content.length !== 0) {
      breakLines = Math.max(2, breakLines);
    }
    if (Array.from(message.mentions.users).length > 0) {
      breakLines += 3;
    }
    if (
      message.embeds.length > 0 &&
      (message.author.id !== process.env.APPLICATION_ID ||
        message.embeds[0].title === 'Ayuda')
    ) {
      for (let i = 0; i < message.embeds.length; i += 1) {
        const embed = message.embeds[i];
        const lenEmbed = Math.trunc(embed.length / 50);
        breakLines += Math.max(3, lenEmbed);
      }
      const attachments = Array.from(message.attachments);
      for (let i = 0; i < attachments.length; i += 1) {
        breakLines += 6;
      }
    }
    await GameModel.findByIdAndUpdate(game.id, {
      $inc: { messageOffset: -breakLines },
    });
  }
};

export default messageCreate;
