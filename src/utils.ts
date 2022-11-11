export function secondsToString(num: number) {
  num = Math.floor(num);
  var h = String(Math.floor(num / 3600)).padStart(2, '0');
  var m = String(Math.floor(num / 60)).padStart(2, '0');
  var s = String(Math.floor(num % 3600 % 60)).padStart(2, '0');

  return `${h}:${m}:${s}`
};

export function secondsToNumber(stmp: string): number {
  var nums = stmp.split(':').map(x => Number.parseInt(x));
  return nums[2] + nums[1] * 60 + nums[0] * 3600;
}
