import type { Army } from '@entities';
import type { PortableArmy } from '../portableTypes';

export function serializeArmy(army: Army): PortableArmy {
  return {
    id: army.id,
    units: army.units,
    commandCards: [...army.commandCards],
  };
}

export function deserializeArmy(serializedArmy: PortableArmy): Army {
  return {
    id: serializedArmy.id,
    units: serializedArmy.units,
    commandCards: new Set(serializedArmy.commandCards),
  };
}
