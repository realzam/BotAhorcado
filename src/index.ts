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
    if (change.operationType === 'update' && doc.state !== 'Stoped') {
      const channel = client.channels.cache.get(doc.channelID) as TextChannel;
      let botmsg;
      try {
        botmsg = await channel.messages.fetch(doc.messageID);
      } catch (error) {
        console.log('No existe el mensaje, generando otro');
      }
      sendStateMessge(botmsg, doc, channel);
      if (doc.state === 'Finish') {
        limparRol(channel.guild);
      }
    }
  });
};

main();
