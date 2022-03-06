import { ICalEventData } from 'ical-generator'
import { dateAddHours, dateAddMinutes } from '../utils'

export function stripNogiResponse(resp: string): string {
  return resp.substring(4, resp.length - 2)
}

export function nogiResponseDataToEvents(data: any[]): ICalEventData[] {
  return data.map((entry) => {
    const [yearStr, monthStr, dayStr] = entry.date.split('/')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)

    const start = new Date(Date.UTC(year, month - 1, day))
    dateAddHours(start, -9)
    const end = new Date(Date.UTC(year, month - 1, day))
    dateAddHours(end, -9)

    let allDay = true
    if (entry.start_time && entry.end_time) {
      allDay = false

      const [startHoursStr, startMinutesStr] = entry.start_time.split(':')
      dateAddHours(start, parseInt(startHoursStr))
      dateAddMinutes(start, parseInt(startMinutesStr))

      const [endHoursStr, endMinutesStr] = entry.end_time.split(':')
      dateAddHours(end, parseInt(endHoursStr))
      dateAddMinutes(end, parseInt(endMinutesStr))
    } else {
      dateAddHours(end, 24)
    }
    return {
      summary: entry.title,
      description: entry.text,
      url: entry.link,
      start: start,
      end: end,
      allDay: allDay,
    }
  })
}
