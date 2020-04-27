/* eslint-disable @typescript-eslint/explicit-function-return-type */

import historyStore from 'part:@sanity/base/datastore/history'
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {from, Observable, Subscription} from 'rxjs'
import {map, tap} from 'rxjs/operators'
import {usePaneRouter} from '../../../contexts/PaneRouterContext'
import {mapLegacyEventsToEvents} from '../historyNavigator/mapLegacyEventsToEvents'
import {Doc} from '../types'
import {CURRENT_REVISION_FLAG} from './constants'
import {decodeRevisionRange, encodeRevisionRange, findHistoryEventByRev} from './helpers'
import {
  HistoryEventsState,
  HistoryRevisionState,
  HistorySelectionRange,
  HistoryTimelineEvent,
  LegacyHistoryEventType,
  RevisionRange
} from './types'

const INITIAL_REVISION: HistoryRevisionState = {
  isLoading: false,
  snapshot: null,
  prevSnapshot: null
}

const INITIAL_HISTORY_STATE: HistoryEventsState = {
  isLoading: false,
  isLoaded: false,
  error: null,
  events: []
}

function fetchRevision(documentId: string, rev: string): Observable<Doc> {
  return from(historyStore.getDocumentAtRevision(documentId, rev) as Promise<Doc>)
}

function loadRev(
  subRef: MutableRefObject<Subscription | null>,
  revRef: MutableRefObject<string | null>,
  event: HistoryTimelineEvent | null,
  rev: string | null,
  setRevision: Dispatch<SetStateAction<HistoryRevisionState>>,
  selectedHistoryEventIsLatest: boolean,
  isHistoryEventsLoaded: boolean
) {
  const prevRev = revRef.current

  if (!rev || selectedHistoryEventIsLatest) {
    if (prevRev) setRevision(INITIAL_REVISION)
    return
  }

  if (!isHistoryEventsLoaded) return

  // Check if the revision ID was changed
  if (rev !== prevRev) {
    revRef.current = rev

    if (!event) return
    if (event.type === 'unknown') return
    if (!event.displayDocumentId) return

    setRevision(val => ({
      ...val,
      snapshot: null,
      prevSnapshot: val.snapshot || val.prevSnapshot,
      isLoading: true
    }))

    if (subRef.current) {
      subRef.current.unsubscribe()
      subRef.current = null
    }

    subRef.current = fetchRevision(event.displayDocumentId, event.rev).subscribe({
      next(snapshot) {
        setRevision(val => ({
          ...val,
          isLoading: false,
          snapshot,
          prevSnapshot: null
        }))
      },
      error(err: Error) {
        setRevision(val => ({
          ...val,
          error: err,
          isLoading: false
        }))
      }
    })
  }
}

export function useDocumentHistory({
  documentId,
  urlParams
}: {
  documentId: string
  urlParams: {
    view: string
    rev: string
  }
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paneRouter: any = usePaneRouter()
  const [urlRev, setUrlRev] = useState<string | null>(urlParams.rev)

  // Refs
  const toRevRef = useRef<string | null>(null)
  const fromRevRef = useRef<string | null>(null)
  const toRevSubRef = useRef<Subscription | null>(null)
  const fromRevSubRef = useRef<Subscription | null>(null)
  const historyEventsSubscriptionRef = useRef<Subscription | null>(null)
  const documentRevisionSubscriptionRef = useRef<Subscription | null>(null)

  // States
  const [historyState, setHistoryEventsState] = useState<HistoryEventsState>({
    ...INITIAL_HISTORY_STATE
  })
  const [toRevision, setToRevision] = useState<HistoryRevisionState>(INITIAL_REVISION)
  const [fromRevision, setFromRevision] = useState<HistoryRevisionState>(INITIAL_REVISION)

  // Values
  const selection = useMemo(() => decodeRevisionRange(urlRev), [urlRev])
  const range = useMemo((): HistorySelectionRange => {
    const {events} = historyState
    const leftRev = selection && Array.isArray(selection) ? selection[0] : selection
    const rightRev = selection && Array.isArray(selection) ? selection[1] : selection
    const leftEvent = findHistoryEventByRev(leftRev, events)
    const rightEvent = findHistoryEventByRev(rightRev, events)
    const leftIndex = leftEvent ? events.indexOf(leftEvent) : -1
    const rightIndex = rightEvent ? events.indexOf(rightEvent) : -1

    if (leftIndex < rightIndex) {
      return {
        from: {index: rightIndex, rev: rightRev, event: rightEvent},
        to: {index: leftIndex, rev: leftRev, event: leftEvent}
      }
    }

    return {
      from: {index: leftIndex, rev: leftRev, event: leftEvent},
      to: {index: rightIndex, rev: rightRev, event: rightEvent}
    }
  }, [historyState.events, selection])

  const revision = useMemo(() => {
    if (range.from.rev === range.to.rev) {
      // `from` and `to` are the same
      return {from: toRevision, to: toRevision}
    }

    return {from: fromRevision, to: toRevision}
  }, [fromRevision, toRevision])

  const selectedHistoryEvent = useMemo(
    () => findHistoryEventByRev(range.to.rev, historyState.events),
    [range.to.rev, historyState.events]
  )
  const selectedHistoryEventIsLatest =
    range.to.rev === CURRENT_REVISION_FLAG && selectedHistoryEvent === historyState.events[0]

  // Callbacks

  const setSelection = useCallback(
    (selection: RevisionRange) => {
      if (selection) {
        setUrlRev(encodeRevisionRange(selection))
      } else {
        setUrlRev(null)
      }
    },
    [paneRouter, selection]
  )

  const openHistory = useCallback(() => {
    setUrlRev(CURRENT_REVISION_FLAG)
  }, [paneRouter])

  // Load `to` revision
  useEffect(() => {
    loadRev(
      toRevSubRef,
      toRevRef,
      range.to.event,
      range.to.rev,
      setToRevision,
      selectedHistoryEventIsLatest,
      historyState.isLoaded
    )
  }, [range, setToRevision, historyState.isLoaded, selectedHistoryEventIsLatest])

  // Load `from` revision
  useEffect(() => {
    if (range.from.rev === range.to.rev) {
      loadRev(
        fromRevSubRef,
        fromRevRef,
        null,
        null,
        setFromRevision,
        selectedHistoryEventIsLatest,
        historyState.isLoaded
      )
    } else {
      loadRev(
        fromRevSubRef,
        fromRevRef,
        range.from.event,
        range.from.rev,
        setFromRevision,
        selectedHistoryEventIsLatest,
        historyState.isLoaded
      )
    }
  }, [range, setFromRevision, historyState.isLoaded, selectedHistoryEventIsLatest])

  // Load history events
  useEffect(() => {
    if (range.to.rev && !historyState.isLoaded && !historyState.isLoading) {
      if (historyEventsSubscriptionRef.current) {
        historyEventsSubscriptionRef.current.unsubscribe()
      }

      setHistoryEventsState(val => ({...val, isLoading: true}))

      const legacyHistoryEvents$: Observable<LegacyHistoryEventType[]> = historyStore.historyEventsFor(
        documentId
      )

      const historyEvents$ = legacyHistoryEvents$.pipe(map(mapLegacyEventsToEvents))

      historyEventsSubscriptionRef.current = historyEvents$
        .pipe(
          tap(events =>
            setHistoryEventsState(val => ({...val, events, isLoaded: true, isLoading: false}))
          )
        )
        .subscribe()
    }

    if (!range.to.rev) {
      // reset history state
      setHistoryEventsState(INITIAL_HISTORY_STATE)

      if (historyEventsSubscriptionRef.current) {
        historyEventsSubscriptionRef.current.unsubscribe()
      }
    }
  }, [range.to.rev, historyState.isLoaded, historyState.isLoading, documentId])

  // Unsubscribe from observables on unmount
  useEffect(() => {
    return () => {
      if (historyEventsSubscriptionRef.current) {
        historyEventsSubscriptionRef.current.unsubscribe()
      }

      if (documentRevisionSubscriptionRef.current) {
        documentRevisionSubscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  // Update pane router param
  useEffect(() => {
    if (urlRev) {
      paneRouter.setParams({...paneRouter.params, rev: urlRev}, {recurseIfInherited: true})
    } else {
      const {rev: revParam, ...newParams} = paneRouter.params
      if (revParam) {
        paneRouter.setParams(newParams, {recurseIfInherited: true})
      }
    }
  }, [urlRev])

  return {
    historyState,
    openHistory,
    selectionRange: range,
    revision,
    selectedHistoryEvent,
    selectedHistoryEventIsLatest,
    selection,
    setSelection
  }
}
