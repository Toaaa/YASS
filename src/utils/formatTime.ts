import { format, fromUnixTime, isDate } from 'date-fns';

export const formatTime = (timestampOrDate: number | Date): string => {
  const date = isDate(timestampOrDate) ? timestampOrDate : fromUnixTime(timestampOrDate);
  const formattedDate = format(date, 'dd.MM.yyyy / HH:mm:ss');

  return formattedDate;
};

export default formatTime;