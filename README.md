# nogi-ical

Serverless Cloudflare Workers that provides iCalendar(ICS format) for nogizaka46.com and motonogi.com schedules.

Currently only events of the current month is provided.

## Deployment

Deployed on nogi-ical.a64.work. Cache is enabled with expire time of 1 hour so you might not get latest events immediately.

You can get nogizaka46.com schedules from https://nogi-ical.a64.work/1.ics

motonogi.com schedules from https://nogi-ical.a64.work/2.ics

or calendar that merged the two sources from https://nogi-ical.a64.work/3.ics
