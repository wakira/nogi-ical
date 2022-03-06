export function dateAddHours(date: Date, hours: number) {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000)
}

export function dateAddMinutes(date: Date, minutes: number) {
  date.setTime(date.getTime() + minutes * 60 * 1000)
}
