import { Message } from 'discord.js';
import { messageEmbedHelp } from '../controllers/sendStateMessage';

const name = 'help';

const execute = async (msg: Message) => {
  const msgEmbed = messageEmbedHelp();
  msg.channel.send({ embeds: [msgEmbed] });
};

export default { name, execute };
