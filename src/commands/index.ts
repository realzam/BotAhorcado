import { Collection, Message } from 'discord.js';
import Crear from './crear';
import Iniciar from './iniciar';

type Ifunc = (msg: Message) => Promise<void>;

const commands = new Collection<string, { execute: Ifunc }>();
commands.set(Crear.name, { execute: Crear.execute });
commands.set(Iniciar.name, { execute: Iniciar.execute });

export default commands;
