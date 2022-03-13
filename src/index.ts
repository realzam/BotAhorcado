import 'dotenv/config';
import { Client, TextChannel } from 'discord.js';
import messageCreate from './controllers/messgeCreate';
import dbConnection from './db/config';
import GameModel, { GameInstance } from './db/models/Game';
import sendStateMessge from './controllers/sendStateMessage';

const main = async () => {
  const client = new Client({
    intents: 32767,
  });

  client.on('ready', () => {
    console.log('bot listo');
  });

  client.on('messageCreate', messageCreate);
  await dbConnection();
  client.login(process.env.BOT_TOKEN);

  const changeStream = GameModel.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', async (change) => {
    if (change.operationType === 'update') {
      const doc = change.fullDocument as GameInstance;
      if (doc.lifes === 0 && doc.state === 'In game') {
        console.log('game over', doc._id);
        await (await GameModel.findById(doc._id))?.gameOver();
        return;
      }
      const channel = client.channels.cache.get(doc.chanelID) as TextChannel;
      const botmsg = await await channel.messages.fetch(doc.messageID);
      sendStateMessge(botmsg, doc);
    }
  });
};

main();
