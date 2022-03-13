import { Message, Permissions, Role } from 'discord.js';

const execute = async (msg: Message) => {
  const chanel = msg.guild?.channels.cache.find((c) => c.name === 'secret');
  const role = msg.guild?.roles.cache.find(
    (r) => r.name === 'ahorcador',
  ) as Role;
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
    await msg.guild?.channels.create('secret', {
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
