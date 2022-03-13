import { Message, MessageEmbed } from 'discord.js';
import { GameInstance } from '../db/models/Game';

const wordEmoji = (word: string[]): string => {
  const emojis: string[] = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] === '$') {
      emojis.push(':blue_square:');
    } else if (word[i] === ' ') {
      emojis.push(':black_large_square:');
    } else {
      emojis.push(`:regional_indicator_${word[i].toLowerCase()}:`);
    }
  }
  return emojis.join(' ');
};

const messageEmbedInGame = (doc: GameInstance) => {
  // eslint-disable-next-line operator-linebreak
  const img =
    'https://media.istockphoto.com/illustrations/simple-illustration-of-hangman-game-illustration-id1196954772?k=20&m=1196954772&s=612x612&w=0&h=nzsr9bCwxp9xW3dp-nBJeXE7TVGqnWtdJpbaXvEyl3E=';

  let emmbed = new MessageEmbed()
    .addField('Palabra de', doc.challenger, true)
    .addField('Vidas', `${doc.lifes}`, true);
  if (doc.guesses.length > 0) {
    emmbed = emmbed.addField('Intentos', `\`${doc.guesses.join(', ')}\``);
  }
  emmbed = emmbed
    .addField('word', wordEmoji(doc.secretLetters))
    .setThumbnail(img);
  return emmbed;
};

const sendStateMessge = (message: Message, doc: GameInstance) => {
  const msgEmbed = messageEmbedInGame(doc);
  message.edit({ embeds: [msgEmbed] });
};

export default sendStateMessge;
