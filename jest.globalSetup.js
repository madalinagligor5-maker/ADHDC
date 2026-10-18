// Run tests in a time zone with daylight saving time so date math is exercised across DST changes.
module.exports = async () => {
  process.env.TZ = 'Europe/Bucharest';
};
