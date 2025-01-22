import { Event } from '@/graphql/types';

export const parseEventResponse = (event: any): Event => {
  return {
    id: parseInt(event.id as string),
    user_id: parseInt(event.user_id as string),
    event_type: event.event_type,
    event_date: new Date(event.event_date),
    timezone: event.timezone,
    color: event.color,
  }
}
