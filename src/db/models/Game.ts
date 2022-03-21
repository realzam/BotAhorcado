import { Schema, model, Document, Model, Types } from 'mongoose';

interface GameFunctions {
  setSecret(word: string): Promise<void>;
  addLetterAttempt(letter: string, guesser: string): Promise<boolean>;
}

export type Game = {
  messageID: string;
  chanelID: string;
  secretChanelID: string;
  serverID: string;
  lifes: number;
  word: string;
  secretLetters: string[];
  challenger: string;
  challengerID: string;
  guesses: string[];
  winnerID: string;
  state: 'In game' | 'Waitting Word' | 'Finish' | 'Stoped';
  messageOffset: number;
  modo: number;
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
    secretChanelID: String,
    lifes: Number,
    word: String,
    messageID: { type: String, required: true },
    challenger: String,
    challengerID: String,
    guesses: [String],
    state: {
      type: String,
      enum: ['In game', 'Waitting Word', 'Finish', 'Stoped'],
    },
    secretLetters: [String],
    winnerID: String,
    messageOffset: Number,
    modo: Number,
  },
  { versionKey: false },
);

ServerSchema.index({ chanelID: 1, serverID: 1 }, { unique: true });

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
  this.messageOffset = -1;
  await this.save();
};

ServerSchema.methods.addLetterAttempt = async function addLetterAttempt(
  this: GameInstance,
  letter: string,
  guesser: string,
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
  if (this.word === this.secretLetters.join('')) {
    this.state = 'Finish';
    this.winnerID = guesser;
  }
  if (decrementar) {
    this.$set('lifes', this.lifes - 1, {});
    if (this.lifes === 0) {
      this.state = 'Finish';
      this.winnerID = this.challengerID;
    }
  }

  await this.save();
  return decrementar;
};

const GameModel = model<Game, IGameModel>('Game', ServerSchema);

export default GameModel;
