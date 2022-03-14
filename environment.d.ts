// declare global env variable to define types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_CNN_STRING: string;
      BOT_TOKEN: string;
      CHANNEL_NAME: string;
      ROL_CHALLENGER_NAME: string;
    }
  }
}

export {};
