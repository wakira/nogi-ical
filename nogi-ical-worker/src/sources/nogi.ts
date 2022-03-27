import { ICalEventData } from 'ical-generator'
import { dateAddHours, dateAddMinutes } from '../utils'
import { SourceTimeSpan, Source } from '../source'

function stripNogiResponse(resp: string): string {
  return resp.substring(4, resp.length - 2)
}

function nogiResponseDataToEvents(data: any[]): ICalEventData[] {
  console.log(`num of entries to process: ${data.length}`)
  return data.map((entry) => {
    const [yearStr, monthStr, dayStr] = entry.date.split('/')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)

    const start = new Date(Date.UTC(year, month - 1, day))
    const end = new Date(Date.UTC(year, month - 1, day))

    let allDay = true
    if (entry.start_time) {
      allDay = false
      // adjust to UTC time
      dateAddHours(start, -9)
      dateAddHours(end, -9)

      const [startHoursStr, startMinutesStr] = entry.start_time.split(':')
      dateAddHours(start, parseInt(startHoursStr))
      dateAddMinutes(start, parseInt(startMinutesStr))

      if (entry.end_time) {
        const [endHoursStr, endMinutesStr] = entry.end_time.split(':')
        dateAddHours(end, parseInt(endHoursStr))
        dateAddMinutes(end, parseInt(endMinutesStr))
      } else {
        // for events without end_time, use start as end time
        dateAddHours(end, parseInt(startHoursStr))
        dateAddMinutes(end, parseInt(startMinutesStr))
      }
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

export const nogiSource: Source = {
  name: "Nogi",
  fetchSpan:  SourceTimeSpan.Month,
  fetch: async (now: Date) => {
    const jpDateStr = now.toLocaleDateString("ja-JP", {timeZone: 'Asia/Tokyo'})
    const splitted = jpDateStr.split('/')
    const yearStr = splitted[0]
    const monthStr = splitted[1].padStart(2, '0')

    const nogiResp = await fetch(
      `https://www.nogizaka46.com/s/n46/api/list/schedule?ima=0105&dy=${yearStr}${monthStr}`
    )

    const respText = await nogiResp.text()
    console.log("respText fetched")

    const data = JSON.parse(stripNogiResponse(respText)).data

    console.log("data parsed")

    return nogiResponseDataToEvents(data)
  }
}
