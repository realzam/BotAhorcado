import moment from 'moment';
import { Schema, model, Document, Model, Types } from 'mongoose';

export type Player = {
  idDiscord: string;
  wins: number;
};

interface GameFunctions {
  setSecret(word: string): Promise<void>;
  addLetterAttempt(letter: string, guesser: string): Promise<void>;
  addLeaderBoard(): void;
  clearLeaderBoard(): void;
}

export type GameInputs = {
  messageID: string;
  channelID: string;
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
  mode: number;
  includeNumbers: boolean;
};

export type Game = GameInputs & {
  leaderBoard: Player[];
  leaderBoardExpiresOn: number;
};

export type GameInstance = Document<unknown, any, Game> &
  Game & {
    _id: Types.ObjectId;
  } & GameFunctions;

// eslint-disable-next-line @typescript-eslint/ban-types
type IGameModel = Model<Game, {}, GameFunctions>;

const ServerSchema = new Schema<Game, IGameModel, GameFunctions>(
  {
    channelID: { type: String, required: true },
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
    mode: Number,
    includeNumbers: Boolean,
    leaderBoardExpiresOn: { type: Number, default: 0 },
    leaderBoard: {
      type: [
        {
          idDiscord: String,
          wins: Number,
        },
      ],
      default: [],
    },
  },
  { versionKey: false },
);

ServerSchema.index({ chanelID: 1, serverID: 1 }, { unique: true });

ServerSchema.methods.setSecret = async function setSecret(
  this: GameInstance,
  word: string,
) {
  if (word.match(/\d+/g)) {
    this.includeNumbers = true;
  }
  this.word = word
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .toUpperCase();
  this.secretLetters = this.word.replaceAll(/[A-Z0-9]/g, '$').split('');
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
    return;
  }
  this.guesses.push(letter);
  let decrementar = true;
  for (let i = 0; i < this.secretLetters.length; i += 1) {
    if (this.word[i] === letter) {
      this.secretLetters[i] = letter;
      decrementar = false;
    }
  }
  if (this.word === this.secretLetters.join('') && this.winnerID === '') {
    this.state = 'Finish';
    this.winnerID = guesser;
    this.messageOffset = -1;
    this.addLeaderBoard();
  }
  if (decrementar) {
    this.$set('lifes', this.lifes - 1, {});
    if (this.lifes === 0) {
      this.state = 'Finish';
      this.winnerID = this.challengerID;
      this.messageOffset = -1;
      this.addLeaderBoard();
    }
  }

  await this.save();
};

ServerSchema.methods.addLeaderBoard = function addLeaderBoard(
  this: GameInstance,
) {
  this.clearLeaderBoard();
  if (this.winnerID !== '') {
    const player = this.leaderBoard.find((p) => p.idDiscord === this.winnerID);
    const playerIndex = this.leaderBoard.findIndex(
      (p) => p.idDiscord === this.winnerID,
    );
    if (player) {
      this.$set(`leaderBoard.${playerIndex}.wins`, player.wins + 1);
    } else {
      this.leaderBoard.push({
        wins: 1,
        idDiscord: this.winnerID,
      });
    }
  }
};

ServerSchema.methods.clearLeaderBoard = function clearLeaderBoard(
  this: GameInstance,
) {
  const expires = moment.unix(this.leaderBoardExpiresOn).unix();
  const now = moment().unix();
  if (expires < now) {
    console.log('clear leaderBoard');
    this.leaderBoard = [];
    this.leaderBoardExpiresOn = moment().add(6, 'hours').unix();
  }
};
const GameModel = model<Game, IGameModel>('Game', ServerSchema);

export default GameModel;
