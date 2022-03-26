import { ICalEventData } from 'ical-generator'
import { dateAddHours } from '../utils'
import { SourceTimeSpan, Source } from '../source'

function parseISOLocal(s: string): Date {
  var b = s.split(/\D/)
  return new Date(Date.UTC(parseInt(b[0]), parseInt(b[1])-1, parseInt(b[2]), parseInt(b[3]), parseInt(b[4]), parseInt(b[5])))
}

function motoResponseDataToEvents(data: any[]): ICalEventData[] {
  console.log(`num of entries to process: ${data.length}`)
  return data.map((entry) => {
    const start = parseISOLocal(entry.start)
    const end = parseISOLocal(entry.end)

    dateAddHours(start, -9)
    dateAddHours(end, -9)

    return {
      summary: entry.title,
      description: entry.description,
      url: entry.url,
      start: start,
      end: end,
      allDay: entry.allDay,
    }
  })
}

// https://motonogi.com/wp-admin/admin-ajax.php?action=eo_widget_agenda&instance_number=1&direction=1&start=2022-03-26&end=2022-03-26

export const motoSource: Source = {
  name: "Moto",
  fetchSpan:  SourceTimeSpan.Month,
  fetch: async (now: Date) => {
    const jpDateStr = now.toLocaleDateString("ja-JP", {timeZone: 'Asia/Tokyo'})
    const splitted = jpDateStr.split('/')
    const yearStr = splitted[0]
    const monthStr = splitted[1].padStart(2, '0')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)

    const yearNextStr = month == 12? (year + 1).toString(): yearStr
    const monthNextStr = month == 12? '01': (month + 1).toString().padStart(2, '0')

    const url =       `https://https://motonogi.com/wp-admin/admin-ajax.php?action=eventorganiser-fullcal&start=${yearStr}-${monthStr}-01&end=${yearNextStr}-${monthNextStr}-01&timeformat=`
    console.log(url)
    const nogiResp = await fetch(
      `https://motonogi.com/wp-admin/admin-ajax.php?action=eventorganiser-fullcal&start=${yearStr}-${monthStr}-01&end=${yearNextStr}-${monthNextStr}-01&timeformat=`
    )

    const respText = await nogiResp.text()
    console.log("respText fetched")

    const data = JSON.parse(respText)

    console.log("data parsed")

    return motoResponseDataToEvents(data)
  }
}
