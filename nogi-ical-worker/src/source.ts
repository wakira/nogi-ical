import { ICalEventData } from 'ical-generator'

export enum SourceTimeSpan{
  Day,
  Week,
  Month
}

export interface Source{
  name: string
  fetchSpan: SourceTimeSpan
  fetch(now: Date): Promise<ICalEventData[]>
}
