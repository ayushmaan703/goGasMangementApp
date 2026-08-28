export const formattedDate = (date) => {
  const [month, day, year] = date.split(' ')[0].split('/');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};
