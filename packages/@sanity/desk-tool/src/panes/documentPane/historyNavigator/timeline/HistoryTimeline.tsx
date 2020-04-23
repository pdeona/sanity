/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-multi-comp */

import QuestionIcon from 'part:@sanity/base/question-icon'
import PlusIcon from 'part:@sanity/base/plus-icon'
import PublishIcon from 'part:@sanity/base/publish-icon'
import TrashIcon from 'part:@sanity/base/trash-icon'
import TruncateIcon from 'part:@sanity/base/truncate-icon'
import UndoIcon from 'part:@sanity/base/undo-icon'
import UnpublishIcon from 'part:@sanity/base/unpublish-icon'
import * as React from 'react'
import {HistoryTimelineEvent} from '../types'
import {EditSessionGroupEvent} from './EditSessionGroupEvent'
import {GenericEvent} from './GenericEvent'

import styles from './HistoryTimeline.css'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  events: HistoryTimelineEvent[]
  now: number
  onOpenRevision: (rev: string) => void
  selectedRev?: string
}

function HistoryTimelineEventResolver({
  event,
  isFirst,
  isLast,
  now,
  onOpenRevision,
  selectedRev
}: {
  event: HistoryTimelineEvent
  isFirst: boolean
  isLast: boolean
  now: number
  onOpenRevision: (rev: string) => void
  selectedRev?: string
}) {
  if (event.type === 'create') {
    return (
      <GenericEvent
        icon={<PlusIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
        now={now}
        onOpenRevision={onOpenRevision}
        selectedRev={selectedRev}
      />
    )
  }

  if (event.type === 'publish') {
    return (
      <GenericEvent
        icon={<PublishIcon />}
        isFirst={isFirst}
        isLast={isLast}
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
        isSelected={event.rev === selectedRev}
        now={now}
        onClick={() => onOpenRevision(event.rev)}
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
      isSelected={(event as any).rev === selectedRev}
      now={now}
      onClick={() => onOpenRevision((event as any).rev)}
      title={(event as any).type}
    />
  )
}

export function HistoryTimeline(props: Props) {
  // console.log('HistoryTimeline', props)

  const len = props.events.length

  return (
    <div className={styles.root}>
      {props.events.map((event, idx) => (
        <HistoryTimelineEventResolver
          event={event}
          isFirst={idx === 0}
          isLast={idx === len - 1}
          key={idx}
          now={props.now}
          onOpenRevision={props.onOpenRevision}
          selectedRev={props.selectedRev}
        />
      ))}
    </div>
  )
}
