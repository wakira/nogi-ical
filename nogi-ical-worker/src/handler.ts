import { stripNogiResponse, nogiResponseDataToEvents } from './sources/nogi'
import ical from 'ical-generator'

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const request = event.request
  const cache = caches.default
  const cacheResponse = await cache.match(request)
  if (cacheResponse) {
    console.log("Use cached response")
    return cacheResponse
  } else {
    console.log("Request not cached")
    const url = request.url
    if (url.endsWith("nogi.ics")) {
      console.log("nogi")
    } else if (url.endsWith("moto.ics")) {
      console.log("moto")
    }

    const now = new Date()
    const month = now.getMonth() + 1
    const monthStr = month < 10 ? '0' + month.toString() : month.toString()
    const nogiResponse = await fetch(
      'https://www.nogizaka46.com/s/n46/api/list/schedule?ima=0105&dy=2022' +
        monthStr,
    )
    const x = await nogiResponse.text()
    const data = JSON.parse(stripNogiResponse(x)).data
    const nogiEvents = nogiResponseDataToEvents(data)

    const calendar = ical({ name: 'Nogi' })

    for (const ev of nogiEvents) {
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
