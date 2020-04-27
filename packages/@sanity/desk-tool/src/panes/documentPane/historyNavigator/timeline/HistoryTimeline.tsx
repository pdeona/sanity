/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/no-multi-comp */

import QuestionIcon from 'part:@sanity/base/question-icon'
import PlusIcon from 'part:@sanity/base/plus-icon'
import PublishIcon from 'part:@sanity/base/publish-icon'
import TrashIcon from 'part:@sanity/base/trash-icon'
import TruncateIcon from 'part:@sanity/base/truncate-icon'
import UndoIcon from 'part:@sanity/base/undo-icon'
import UnpublishIcon from 'part:@sanity/base/unpublish-icon'
import * as React from 'react'
import {
  CURRENT_REVISION_FLAG,
  HistorySelectionRange,
  HistoryTimelineEvent,
  RevisionRange
} from '../../history'
import {EditSessionGroupEvent} from './EditSessionGroupEvent'
import {GenericEvent} from './GenericEvent'

import styles from './HistoryTimeline.css'

interface Props {
  events: HistoryTimelineEvent[]
  now: number
  selection: RevisionRange
  onSelect: (selection: RevisionRange) => void
  selectionRange: HistorySelectionRange
}

function HistoryTimelineEventResolver({
  event,
  isFirst,
  isLast,
  isSelected,
  now,
  onSelect,
  selection
}: {
  event: HistoryTimelineEvent
  isFirst: boolean
  isLast: boolean
  isSelected: boolean
  now: number
  onSelect: (selection: RevisionRange) => void
  selection: RevisionRange
}) {
  const handleGenericEventClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault()

    if (ev.shiftKey && selection) {
      const fromRev = Array.isArray(selection) ? selection[0] : selection
      const toRev = isFirst ? CURRENT_REVISION_FLAG : event.rev

      return onSelect([fromRev, toRev])
    }

    onSelect(isFirst ? CURRENT_REVISION_FLAG : event.rev)
  }

  if (event.type === 'create') {
    return (
      <GenericEvent
        icon={<PlusIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Created"
      />
    )
  }

  if (event.type === 'delete') {
    return (
      <GenericEvent
        icon={<TrashIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Deleted"
      />
    )
  }

  if (event.type === 'discardDraft') {
    return (
      <GenericEvent
        icon={<UndoIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Discarded drafts"
      />
    )
  }

  if (event.type === 'editSessionGroup') {
    return (
      <EditSessionGroupEvent
        event={event}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onSelect={onSelect}
        selection={selection}
      />
    )
  }

  if (event.type === 'publish') {
    return (
      <GenericEvent
        icon={<PublishIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Published"
      />
    )
  }

  if (event.type === 'unpublish') {
    return (
      <GenericEvent
        icon={<UnpublishIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Unpublished"
      />
    )
  }

  if (event.type === 'truncate') {
    return (
      <GenericEvent
        icon={<TruncateIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={isSelected}
        now={now}
        onClick={handleGenericEventClick}
        timestamp={event.timestamp}
        title="Truncated"
      >
        <div className={styles.truncatedInfo}>
          <p>
            <a
              href="https://www.sanity.io/docs/content-studio/history-experience"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about
              <br /> history retention &rarr;
            </a>
          </p>
        </div>
      </GenericEvent>
    )
  }

  return (
    <GenericEvent
      icon={<QuestionIcon />}
      isFirst={isFirst}
      isLast={isLast}
      isSelected={isSelected}
      now={now}
      onClick={handleGenericEventClick}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title={(event as any).type}
    />
  )
}

export const HistoryTimeline = React.memo((props: Props) => {
  const {events, onSelect, selection, selectionRange} = props
  const len = events.length
  const {from, to} = selectionRange

  return (
    <div className={styles.root}>
      {props.events.map((event, eventIndex) => {
        const isFirst = eventIndex === 0
        const isSelected = to.index <= eventIndex && eventIndex <= from.index

        return (
          <HistoryTimelineEventResolver
            event={event}
            isFirst={isFirst}
            isLast={eventIndex === len - 1}
            isSelected={isSelected}
            key={String(eventIndex)}
            now={props.now}
            onSelect={onSelect}
            selection={selection}
          />
        )
      })}
    </div>
  )
})

HistoryTimeline.displayName = 'HistoryTimeline'
