/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as React from 'react'
import {HistoryNavigatorProps} from './__legacy'
import {HistoryNavigator} from './HistoryNavigator'
import {HistoryTimelineEvent, HistoryTimelineUnknownEvent} from './types'

export function HistoryNavigatorCompat(props: HistoryNavigatorProps) {
  // console.log('HistoryNavigatorCompat', props)

  const eventsIncludingUnknowns: Array<
    HistoryTimelineEvent | HistoryTimelineUnknownEvent
  > = props.events.map(event => {
    if (event.type === 'created') {
      return {
        type: 'create',
        timestamp: Date.parse(event.endTime),
        userId: event.userIds[0],
        offset: 0,
        rev: event.rev
      }
    }

    if (event.type === 'edited') {
      return {
        type: 'editSessionGroup',
        sessions: [
          {
            type: 'editSession',
            edits: ['cf', 'cf', 'cf', 'cf', 'cf'],
            length: 5,
            offset: 1
          },
          {
            type: 'editSession',
            edits: ['cf', 'cf', 'cf', 'cf', 'cf', 'cf', 'cf'],
            length: 7,
            offset: 6
          },
          {
            type: 'editSession',
            edits: ['as', 'as', 'as', 'as', 'as'],
            length: 5,
            offset: 13
          },
          {
            type: 'editSession',
            edits: ['eh', 'eh'],
            length: 2,
            offset: 18
          }
        ],
        length: 19,
        offset: 1,
        timestamp: Date.parse(event.endTime),
        userIds: event.userIds,
        rev: event.rev
      }
    }

    if (event.type === 'deleted') {
      return {
        type: 'delete',
        timestamp: Date.parse(event.endTime),
        userId: event.userIds[0],
        offset: 0,
        rev: event.rev
      }
    }

    if (event.type === 'discardDraft') {
      return {
        type: 'discardDraft',
        timestamp: Date.parse(event.endTime),
        userId: event.userIds[0],
        offset: 0,
        rev: event.rev
      }
    }

    if (event.type === 'published') {
      return {
        type: 'publish',
        timestamp: Date.parse(event.endTime),
        userId: event.userIds[0],
        offset: 0,
        rev: event.rev
      }
    }

    if (event.type === 'unpublished') {
      return {
        type: 'unpublish',
        timestamp: Date.parse(event.endTime),
        userId: event.userIds[0],
        offset: 0,
        rev: event.rev
      }
    }

    if (event.type === 'truncated') {
      return {
        type: 'truncate',
        timestamp: Date.parse(event.endTime),
        userIds: event.userIds,
        offset: 0,
        rev: event.rev
      }
    }

    console.warn('unknown event', event)

    return {
      type: 'unknown',
      message: `unknown type: ${event.type}`,
      rev: event.rev
    }
  })

  const events = eventsIncludingUnknowns.filter(e => e.type !== 'unknown') as HistoryTimelineEvent[]

  const handleOpenRevision = (rev: string) => {
    const item = props.events.find(e => e.rev === rev)

    if (item) props.onItemSelect(item)
  }

  return (
    <HistoryNavigator
      currentRev={props.selectedEvent && props.selectedEvent.rev}
      events={events}
      onOpenRevision={handleOpenRevision}
    />
  )
}
