import { Guild, Message, Permissions, Role } from 'discord.js';
import limparRol from '../utils/utils';

const execute = async (msg: Message) => {
  let role = msg.guild?.roles.cache.find(
    (r) => r.name === process.env.ROL_CHALLENGER_NAME,
  ) as Role;
  if (!role) {
    role = (await msg.guild?.roles.create({
      reason: 'Persona que intentará ahorcar en el juego de ahorcado',
      name: process.env.ROL_CHALLENGER_NAME,
      color: 'GREEN',
    })) as Role;
  } else {
    await limparRol(msg.guild as Guild);
  }
  const chanel = msg.guild?.channels.cache.find(
    (c) => c.name === process.env.CHANNEL_NAME,
  );

  const roleEvery = msg.guild?.roles.cache.find(
    (r) => r.name === '@everyone',
  ) as Role;
  if (chanel) {
    chanel.edit({
      permissionOverwrites: [
        {
          id: role.id,
          deny: Permissions.ALL,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: roleEvery.id,
          deny: Permissions.ALL,
        },
      ],
    });
  } else {
    await msg.guild?.channels.create(process.env.CHANNEL_NAME, {
      reason: 'Needed a cool new channel',
      permissionOverwrites: [
        {
          id: role.id,
          deny: Permissions.ALL,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: roleEvery.id,
          deny: Permissions.ALL,
        },
      ],
    });
  }
};

const name = 'crear';

export default { name, execute };
