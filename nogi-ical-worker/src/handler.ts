import { nogiSource } from './sources/nogi'
import { motoSource } from './sources/moto'
import { Source, SourceTimeSpan } from './source'
import ical from 'ical-generator'
import { ICalEventData } from 'ical-generator'
import { dateAddHours } from './utils'

enum Bitmask{
  NOGI = 1,
  MOTO = 2
}

const bitmaskOfSource: {[key in Bitmask]: Source} = {
  1: nogiSource,
  2: motoSource
}

function urlLastSegment(url: string): string {
  const parts = url.split("/")
  let i = parts.length - 1
  while (!parts[i]) {
    i--
  }
  return parts[i]
}

function parseSourcesFromUrl(url: string): Source[] {
  const lastSegment = urlLastSegment(url)
  const bitmap = parseInt(lastSegment)
  const sources = []
  if (bitmap && url.endsWith(".ics")) {
    for (const bms in bitmaskOfSource) {
      const bitmask: Bitmask = parseInt(bms)
      if (bitmap & bitmask) {
        sources.push(bitmaskOfSource[bitmask])
      }
    }
  }
  return sources
}

async function fetchFuture(source: Source): Promise<ICalEventData[]> {
  let now = new Date()
  const events = []
  switch (source.fetchSpan) {
    case SourceTimeSpan.Day:
      // get today and the next 6 days
      for (let i = 0; i < 7; i++) {
        const evs = await source.fetch(now)
        events.push(...evs)
        dateAddHours(now, 24) // add 7 days
      }
      break
    case SourceTimeSpan.Week:
      // get this week and the next 3 weeks
      for (let i = 0; i < 4; i++) {
        const evs = await source.fetch(now)
        events.push(...evs)
        dateAddHours(now, 24*7) // add 7 days
      }
      break
    case SourceTimeSpan.Month:
      // get this month
      const evs = await source.fetch(now)
      events.push(...evs)
      // get the next month
      now.setMonth(now.getMonth() + 1)
      const evsNxtMonth = await source.fetch(now)
      events.push(...evsNxtMonth)
      break
    default:
      console.error(`Impossible enum value for SourceTimeSpan: ${source.fetchSpan}`)
      break
  }
  return events
}

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const request = event.request
  const cache = caches.default
  const cacheResponse = await cache.match(request)
  if (cacheResponse) {
    console.log("Use cached response")
    return cacheResponse
  } else {
    console.log("Request not cached")

    const sources = parseSourcesFromUrl(request.url)

    const now = new Date()
    const events: ICalEventData[] = []
    let name = ""
    for (const source of sources) {
      console.log(`Fetch from source:${source.name}`)
      const evs = await fetchFuture(source)
      // we can further optimize by preallocating events
      events.push(...evs)
      name += source.name
    }

    const calendar = ical({ name: name })
    for (const ev of events) {
      calendar.createEvent(ev)
    }

    const response = new Response(calendar.toString(), {
      status: 200,
      headers: {
        'content-type': 'text/calendar;charset=utf-8',
        'Cache-Control': 'max-age=3600',
      },
    })

    event.waitUntil(cache.put(request, response.clone()));
    return response
  }
}
