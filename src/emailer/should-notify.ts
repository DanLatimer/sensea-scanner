import { getConfig } from '../config.js';
import { ChangedBookings } from '../persistence/persistence.js';
import { MonthAvailabilities } from '../types.js';

export function shouldNotify(newAvailabilities: ChangedBookings): boolean {
  const requirementOrClauses = [];

  const hasNewCancellations =
    Object.keys(newAvailabilities.newCancellations).length > 0;
  const newCancellationSlots = getTimeSlotAvailabilityCounts(
    newAvailabilities.newCancellations,
  );
  if (
    newCancellationSlots.find(
      ({ slotsAvailable }) =>
        slotsAvailable >= getConfig().notification.minimumSlotsToNotify,
    )
  ) {
    requirementOrClauses.push(hasNewCancellations);
  }

  const hasNewBookings = Object.keys(newAvailabilities.newBookings).length > 0;
  if (getConfig().notification.shouldNotifyOnNewBookings) {
    requirementOrClauses.push(hasNewBookings);
  }

  return requirementOrClauses.some((value) => value);
}

function getTimeSlotAvailabilityCounts(
  monthAvailabilities: MonthAvailabilities,
): { slotsAvailable: number }[] {
  const dayAvailabilitiesArray = Object.values(monthAvailabilities);
  return dayAvailabilitiesArray.flatMap((dayAvailablities) =>
    Object.values(dayAvailablities),
  );
}
