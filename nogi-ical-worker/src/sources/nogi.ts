import { ICalEventData } from 'ical-generator'
import { dateAddHours, dateAddMinutes } from '../utils'
import { SourceTimeSpan, Source } from '../source'

function stripNogiResponse(resp: string): string {
  return resp.substring(4, resp.length - 2)
}

function nogiResponseDataToEvents(data: any[]): ICalEventData[] {
  console.log(`num of entries to process: ${data.length}`)
  // if (data.length > 100) {
  //   data = data.slice(0, 100)
  // }
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

export const nogiSource: Source = {
  name: "nogi",
  fetchSpan:  SourceTimeSpan.Month,
  fetch: async (now: Date) => {
    const yearStr = now.getFullYear().toString()
    const month = now.getMonth() + 1
    const monthStr = month < 10 ? '0' + month.toString() : month.toString()
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
