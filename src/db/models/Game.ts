import { Schema, model, Document, Model, Types } from 'mongoose';

interface GameFunctions {
  setSecret(word: string): Promise<void>;
  addLetterAttempt(letter: string): Promise<boolean>;
  gameOver(): Promise<void>;
}

export type Game = {
  messageID: string;
  chanelID: string;
  serverID: string;
  lifes: number;
  word: string;
  secretLetters: string[];
  challenger: string;
  guesses: string[];
  queueLetters: string[];
  state: 'In game' | 'Waitting Word' | 'Finish';
};

export type GameInstance = Document<unknown, any, Game> &
  Game & {
    _id: Types.ObjectId;
  } & GameFunctions;

// eslint-disable-next-line @typescript-eslint/ban-types
type IGameModel = Model<Game, {}, GameFunctions>;

const ServerSchema = new Schema<Game, IGameModel, GameFunctions>(
  {
    chanelID: { type: String, required: true },
    serverID: { type: String, required: true },
    lifes: { type: Number, default: 8 },
    word: String,
    messageID: { type: String, required: true },
    challenger: String,
    guesses: [String],
    queueLetters: [String],
    state: { type: String, enum: ['In game', 'Waitting Word', 'Finish'] },
    secretLetters: [String],
  },
  { versionKey: false },
);

ServerSchema.methods.setSecret = async function setSecret(
  this: GameInstance,
  word: string,
) {
  this.word = word
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[^a-zA-Z ]/g, '')
    .trim()
    .toUpperCase();
  this.secretLetters = this.word.replaceAll(/[A-Z]/g, '$').split('');
  this.state = 'In game';
  await this.save();
};

ServerSchema.methods.addLetterAttempt = async function addLetterAttempt(
  this: GameInstance,
  letter: string,
) {
  if (
    this.guesses.includes(letter) ||
    this.state === 'Finish' ||
    this.lifes < 1
  ) {
    return false;
  }
  this.guesses.push(letter);
  let decrementar = true;
  for (let i = 0; i < this.secretLetters.length; i += 1) {
    if (this.word[i] === letter) {
      this.secretLetters[i] = letter;
      decrementar = false;
    }
  }
  await this.save();
  return decrementar;
};

ServerSchema.methods.gameOver = async function gameOver(this: GameInstance) {
  console.log('schema game over');

  this.state = 'Finish';
  await this.save();
};
const GameModel = model<Game, IGameModel>('Game', ServerSchema);

export default GameModel;
