import * as migration_20260201_070522 from './20260201_070522';

export const migrations = [
  {
    up: migration_20260201_070522.up,
    down: migration_20260201_070522.down,
    name: '20260201_070522'
  },
];
