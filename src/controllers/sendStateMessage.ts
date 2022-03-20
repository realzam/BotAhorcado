import { Message, MessageEmbed } from 'discord.js';
import GameModel, { GameInstance } from '../db/models/Game';

const wordEmoji = (word: string[]): string => {
  const emojis: string[] = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] === '$') {
      emojis.push(':blue_square:');
    } else if (word[i] === ' ') {
      emojis.push(':white_large_square:');
    } else {
      emojis.push(`:regional_indicator_${word[i].toLowerCase()}:`);
    }
  }
  return emojis.join(' ');
};

const messageEmbedInGame = (doc: GameInstance) => {
  const img = `http://129.153.74.97/${doc.modo}/${doc.lifes}.webp`;
  let emmbed = new MessageEmbed()
    .addField('Palabra de', doc.challenger, true)
    .addField('Vidas', `${doc.lifes}`, true)
    .setThumbnail(img);
  if (doc.guesses.length > 0) {
    emmbed = emmbed.addField('Intentos', `\`${doc.guesses.join(', ')}\``);
  }
  emmbed = emmbed.addField('Palabra:', wordEmoji(doc.secretLetters));

  return emmbed;
};

const messageEmbedWinAnyOne = (doc: GameInstance) => {
  const img = 'http://129.153.74.97/win.webp';
  const emmbed = new MessageEmbed()
    .setTitle('Game Over')
    .addField('Palabra de', doc.challenger, true)
    .addField('Ganador', `<@${doc.winnerID}>`, true)
    .setDescription(
      `Felicidades :partying_face: :partying_face:<@${doc.winnerID}> eres muy brillante :sunglasses:, has adividado la palabra`,
    )
    .addField('La palabra era:', `${doc.word}`)
    .setImage(img);
  return emmbed;
};

const messageEmbedWinChallenger = (doc: GameInstance) => {
  const img = `http://129.153.74.97/${doc.modo}/${doc.lifes}.webp`;
  const emmbed = new MessageEmbed()
    .setTitle('Game Over')
    .addField('Palabra de', doc.challenger, true)
    .addField('Ganador', `<@${doc.winnerID}>`, true)
    .setDescription(
      `Felicidades :partying_face: :partying_face:<@${doc.winnerID}> Nadie pudo adivinar tu palabra`,
    )
    .setImage(img)
    .addField('La palabra era:', `${doc.word}`);
  return emmbed;
};

export const messageEmbedWaittingWord = (challenger: string) => {
  const emmbed = new MessageEmbed().setDescription(
    `<@${challenger}> Es tu tunrno, dirigete al canal ${process.env.CHANNEL_NAME} e ingresa tu palabra a jugar`,
  );
  return emmbed;
};

export const messageEmbedSecretChannel = (challenger: string) => {
  const emmbed = new MessageEmbed().setDescription(
    `<@${challenger}> Envia aquí la palabra para jugar`,
  );
  return emmbed;
};

export const messageEmbedHelp = () => {
  const emmbed = new MessageEmbed()
    .setTitle('Ayuda')
    .addField(
      'Como Jugar',
      'El ahorcado es muy sencillo de jugar, para ganar tienes que adivinar la palabra que se muestra introduciendo letras en el chat para adivinar la palabra completa o ingresando el comando $adivinar <palabra> para adivinar la palabra completa',
    )
    .addField(
      'Paso 1',
      'Ingresar el comando `$crear` para crear el rol `ahorcador` el cual sera el que ingresa la palabra para juagar y crear el canal secreto `ahorcado` en que el ahorcador ingresara la palabra, solo el ahorcador',
    )
    .addField(
      'Paso 2',
      'Ingresar el comando `$iniciar @usuaro <modo>` el @usuario sera el `ahorcador` y tendra que ir al canal ahorcado para enviar la palabra a jugar. El modo es opcional, si no se escribe el juego sera con 7 vidas, si se escibe 2 ( `$iniciar @usuario 2` ) el juego contará con 14 vidas',
    )
    .addField(
      'Paso 3',
      'El juego iniciara en el canal donde se ingreso el comando `$iniciar`, envia UNA letra para ver si esta en la palabra a adividar, si ya sabes la palabra ingresa el comando `$adivinar <palabra>` para ver si es la palabra',
    )
    .addField(
      'Considaraciones',
      ' - Al inicio del juego se tiene 7 vidas, Si la letra no se encuentra en la palabra se restara una vida\n - El cuadro azul ( :blue_square: ) representa una letra que aun no a sido descubierta\n - El cuadro blanco ( :white_large_square: ) representa un espacio entre palabras\n - Puedes detener el juego con el comando `$detener`',
    );
  return emmbed;
};

const moveMessageToBottom = async (
  message: Message,
  doc: GameInstance,
  msgEmbed: MessageEmbed,
) => {
  const newMsg = await message.channel.send({ embeds: [msgEmbed] });
  await GameModel.findByIdAndUpdate(doc._id, {
    $set: { messageOffset: 15, messageID: newMsg.id },
  });
  message.delete();
};

const sendStateMessge = (message: Message, doc: GameInstance) => {
  let msgEmbed: MessageEmbed;
  if (doc.state === 'Finish' && doc.lifes === 0) {
    msgEmbed = messageEmbedWinChallenger(doc);
  } else if (doc.state === 'Finish' && doc.lifes > 0) {
    msgEmbed = messageEmbedWinAnyOne(doc);
  } else {
    msgEmbed = messageEmbedInGame(doc);
  }
  if (doc.messageOffset <= 0) {
    moveMessageToBottom(message, doc, msgEmbed);
  } else {
    message.edit({ embeds: [msgEmbed] });
  }
};

export default sendStateMessge;
