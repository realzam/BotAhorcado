import { Message, MessageEmbed, TextChannel } from 'discord.js';
import GameModel, { GameInstance } from '../db/models/Game';

const numberEmoji = (num: string): string => {
  switch (num) {
    case '0':
      return ':zero:';
    case '1':
      return ':one:';
    case '2':
      return ':two:';
    case '3':
      return ':three:';
    case '4':
      return ':four:';
    case '5':
      return ':five:';
    case '6':
      return ':six:';
    case '7':
      return ':seven:';
    case '8':
      return ':eight:';
    case '9':
      return ':nine:';
    default:
      return '';
  }
};

const wordEmoji = (word: string[]): string => {
  const emojis: string[] = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] === '$') {
      emojis.push(':blue_square:');
    } else if (word[i] === ' ') {
      emojis.push(':white_large_square:');
    } else if (word[i].match(/\d/g)) {
      emojis.push(numberEmoji(word[i]));
    } else {
      emojis.push(`:regional_indicator_${word[i].toLowerCase()}:`);
    }
  }
  return emojis.join(' ');
};

const messageEmbedInGame = (doc: GameInstance) => {
  const img = `http://129.153.74.97/${doc.mode}/${doc.lifes}.webp`;
  let emmbed = new MessageEmbed()
    .addField('Palabra de', doc.challenger, true)
    .addField('Vidas', `${doc.lifes}`, true)
    .setThumbnail(img);
  if (doc.guesses.length > 0) {
    emmbed = emmbed.addField('Intentos', `\`${doc.guesses.join(', ')}\``);
  }
  if (doc.includeNumbers) {
    emmbed = emmbed.addField('Consejo', 'La palabra contine numero(s)');
  }
  emmbed = emmbed.setDescription(
    `**Palabra**:\n\n${wordEmoji(doc.secretLetters)}`,
  );
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
  const img = `http://129.153.74.97/${doc.mode}/${doc.lifes}.webp`;
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

export const messageEmbedSecretTooLong = () => {
  const emmbed = new MessageEmbed().setDescription(
    ':x: La palabra no puede tener mas de 30 carácteres',
  );
  return emmbed;
};

export const messageEmbedSecretTooShort = () => {
  const emmbed = new MessageEmbed().setDescription(
    ':x: La palabra debe al menos 3 carácteres',
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
      ' - Al inicio del juego se tiene 7 vidas, Si la letra no se encuentra en la palabra se restara una vida\n - El cuadro azul ( :blue_square: ) representa una letra que aun no a sido descubierta\n - El cuadro blanco ( :white_large_square: ) representa un espacio entre palabras\n - Puedes detener el juego con el comando `$detener`\n - El comando `$puntuaciones` muestra los puntos que tiene un jugador, se obtiene 1 punto por adivinar una palabra o por que no adivinen tu palabra\n - El comando `$lp` limpia las puntuaciones',
    );
  return emmbed;
};

export const messageEmbedLeaderBoard = (doc: GameInstance) => {
  let emmbed = new MessageEmbed().setTitle('Puntuaciones');
  const players = doc.leaderBoard.slice(0);
  players.sort((aPlayer, bPlayer) => bPlayer.wins - aPlayer.wins);
  let description = '';
  const mapPlayers = new Map<number, string[]>();
  if (players.length === 0) {
    emmbed = emmbed.setDescription(':sleeping: No hay puntuaciones');
    return emmbed;
  }
  for (let i = 0; i < players.length; i += 1) {
    const player = players[i];
    const listPlayers = mapPlayers.get(player.wins);
    let playerTxt = '';

    if (i === 0) {
      playerTxt = ':crown: Primer lugar : ';
    }
    if (i === 1) {
      playerTxt = ':sunglasses: Segundo lugar : ';
    }

    if (i === 2) {
      playerTxt = ':muscle: Tercer lugar : ';
    }

    playerTxt += `<@${player.idDiscord}>`;

    if (!listPlayers) {
      mapPlayers.set(player.wins, [playerTxt]);
    } else {
      mapPlayers.set(player.wins, [...listPlayers, playerTxt]);
    }
  }

  for (const puntos of mapPlayers.keys()) {
    const listPlayers = mapPlayers.get(puntos);
    if (listPlayers) {
      const playersTxt = listPlayers.join(', ').replace(/,(?=[^,]*$)/, ' y');
      const puntosTxt = puntos > 1 ? 'puntos' : 'punto';
      description += `${playersTxt} ${puntos} ${puntosTxt} \n`;
    }
  }
  emmbed = emmbed.setDescription(description);
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
  try {
    await message.delete();
  } catch (error) {
    console.log('No se enconrtro el mensaje a eliminar');
  }
};

const sendStateMessge = async (
  message: Message | undefined,
  doc: GameInstance,
  channel: TextChannel,
) => {
  let msgEmbed: MessageEmbed;
  if (doc.state === 'Waitting Word') {
    msgEmbed = messageEmbedWaittingWord(doc.challengerID);
  } else if (doc.state === 'Finish' && doc.lifes === 0) {
    msgEmbed = messageEmbedWinChallenger(doc);
  } else if (doc.state === 'Finish' && doc.lifes > 0) {
    msgEmbed = messageEmbedWinAnyOne(doc);
  } else {
    msgEmbed = messageEmbedInGame(doc);
  }
  if (!message) {
    const newMsg = await channel.send({ embeds: [msgEmbed] });
    await GameModel.findByIdAndUpdate(doc._id, {
      $set: { messageOffset: 15, messageID: newMsg.id },
    });
    return;
  }
  if (doc.messageOffset <= 0) {
    moveMessageToBottom(message, doc, msgEmbed);
  } else if (doc.state !== 'Waitting Word') {
    message.edit({ embeds: [msgEmbed] });
  }
};

export default sendStateMessge;
