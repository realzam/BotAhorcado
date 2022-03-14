import { Guild, Role } from 'discord.js';

const limparRol = async (guild: Guild) => {
  const g = await guild.fetch();
  const role = g.roles.cache.find(
    (r) => r.name === process.env.ROL_CHALLENGER_NAME,
  ) as Role;
  const members = await g.members.fetch();
  members.forEach((m) => {
    const isRole = m.roles.cache.find(
      (r) => r.name === process.env.ROL_CHALLENGER_NAME,
    );
    if (isRole) {
      m.roles.remove(role);
    }
  });
};

export default limparRol;
