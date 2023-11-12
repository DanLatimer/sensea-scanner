//'2023-10-13T10:20:00-0300'
export type DateWithTime = string;
export type DateYYYYMMDD = string;
export interface TimeSlot {
  time: DateWithTime;
  slotsAvailable: number;
}
export type AvailabilitiesForDates = { [date: DateYYYYMMDD]: TimeSlot[] };

// {
//     '2023-10-16': {
//       '2023-10-16T12:20:00-0300': { slotsAvailable: 1 },
//       '2023-10-16T12:40:00-0300': { slotsAvailable: 1 }
//     },
//     '2023-10-25': { '2023-10-25T15:00:00-0300': { slotsAvailable: 2 } }
//   }
export type DBDateAvailabilities = {
  [datetime: DateWithTime]: { slotsAvailable: number };
};
export type DBDatesAvailabilities = {
  [date: DateYYYYMMDD]: DBDateAvailabilities;
};

export interface Config {
  auth: {
    fromEmail: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  notification: {
    toEmail: string;
    minimumSlotsToNotify: number;
    shouldNotifyOnNewBookings: boolean;
  };
  datesInterested: DateYYYYMMDD[];
  pollIntervalInSeconds: number;
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};
