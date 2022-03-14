import 'dotenv/config';
import { Client, Intents, TextChannel } from 'discord.js';
import messageCreate from './controllers/messgeCreate';
import dbConnection from './db/config';
import GameModel, { GameInstance } from './db/models/Game';
import sendStateMessge from './controllers/sendStateMessage';
import limparRol from './utils/utils';

const main = async () => {
  const allIntents = new Intents(32767);
  const client = new Client({
    intents: allIntents,
  });

  client.on('ready', () => {
    console.log('bot listo');
  });

  client.on('messageCreate', messageCreate);
  await dbConnection();
  client.login(process.env.BOT_TOKEN);

  const changeStream = GameModel.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', async (change) => {
    const doc = change.fullDocument as GameInstance;
    if (change.operationType === 'update' && doc.state !== 'Waitting Word') {
      const channel = client.channels.cache.get(doc.chanelID) as TextChannel;
      const botmsg = await await channel.messages.fetch(doc.messageID);
      sendStateMessge(botmsg, doc);
      if (doc.state === 'Finish') {
        limparRol(channel.guild);
      }
    }
  });
};

main();
