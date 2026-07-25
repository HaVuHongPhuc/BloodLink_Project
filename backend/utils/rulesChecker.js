// Note: Business Rules - BR05 (đủ 12 tuần giữa các lần hiến), BR26 (đủ 16 tuổi), v.v.
const isAtLeastSixteen = (dateOfBirth, currentDate = new Date()) => {
  const birthDate = new Date(dateOfBirth);
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  const hadBirthday = currentDate >= new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  return age - (hadBirthday ? 0 : 1) >= 16;
};

const isEligibleAfterTwelveWeeks = (lastDonationDate, currentDate = new Date()) => {
  const differenceInDays = (currentDate - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
  return differenceInDays >= 84;
};

module.exports = { isAtLeastSixteen, isEligibleAfterTwelveWeeks };