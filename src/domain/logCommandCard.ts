import type { Card } from '@entities';
import { tempCommandCards } from '@sampleValues';

const logCommandCard = (commandCard: Card) => {
  const json = JSON.stringify(commandCard);
  // eslint-disable-next-line no-console
  console.log(json);
  return json;
};

for (const commandCard of tempCommandCards) {
  logCommandCard(commandCard);
}
