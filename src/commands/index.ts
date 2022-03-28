import { Collection, Message } from 'discord.js';
import Crear from './crear';
import Iniciar from './iniciar';
import Adivinar from './adivinar';
import Help from './help';
import Stop from './detener';
import Board from './puntuaciones';
import LP from './limpiarPuntuaciones';

type Ifunc = (msg: Message) => Promise<void>;

const commands = new Collection<string, { execute: Ifunc }>();
commands.set(Crear.name, { execute: Crear.execute });
commands.set(Iniciar.name, { execute: Iniciar.execute });
commands.set(Adivinar.name, { execute: Adivinar.execute });
commands.set(Help.name, { execute: Help.execute });
commands.set(Stop.name, { execute: Stop.execute });
commands.set(Board.name, { execute: Board.execute });
commands.set(LP.name, { execute: LP.execute });

export const comandos = Array.from(commands.keys());
export default commands;
