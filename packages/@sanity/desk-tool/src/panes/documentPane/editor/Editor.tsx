/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-multi-comp */

import * as React from 'react'
import {PreviewFields} from 'part:@sanity/base/preview'
import schema from 'part:@sanity/base/schema'
import Spinner from 'part:@sanity/components/loading/spinner'
import TabbedPane from 'part:@sanity/components/panes/tabbed'
import Snackbar from 'part:@sanity/components/snackbar/default'
import LanguageFilter from 'part:@sanity/desk-tool/language-select-component?'
import Delay from '../../../utils/Delay'
import {HistoryEventsState, HistoryRevisionState, HistoryTimelineEvent} from '../history'
import {Doc, DocumentViewType, MenuAction} from '../types'
import {DocumentOperationResults} from './DocumentOperationResults'
import InspectHistory from './InspectHistory'
import InspectView from './InspectView'
import {Validation} from './Validation'
import {DocumentStatusBar, HistoryStatusBar} from './statusBar'
import FormView from './FormView'
import {getHistoryEventDateString} from './helpers'

import styles from './Editor.css'

interface Props {
  activeViewId: string
  connectionState: 'connecting' | 'connected' | 'reconnecting'
  documentId: string
  documentType: string
  formRef: React.RefObject<any>
  hasSiblings: boolean
  historyState: HistoryEventsState
  initialValue: Doc
  inspect: boolean
  isClosable: boolean
  isCollapsed: boolean
  isHistoryOpen: boolean
  isSelected: boolean
  markers: any
  menuItemGroups: {id: string}[]
  menuItems: MenuAction[]
  onAction: (item: MenuAction) => boolean
  onChange: (patches: any[]) => void
  onCloseValidationResults: () => void
  onCloseView: () => void
  onCollapse?: () => void
  onExpand?: () => void
  onHideInspector: () => void
  onOpenHistory: () => void
  onSetActiveView: () => void
  onSetFocus: (path: any) => void
  onSplitPane?: () => void
  onToggleValidationResults: () => void
  paneKey: string
  paneTitle?: string
  revision: HistoryRevisionState
  selectedHistoryEvent: HistoryTimelineEvent | null
  selectedHistoryEventIsLatest: boolean
  showValidationTooltip: boolean
  value: Doc | null
  views: DocumentViewType[]
}

const HistorySpinner = React.memo(
  ({selectedHistoryEvent}: {selectedHistoryEvent: HistoryTimelineEvent | null}) => {
    console.log('<HistorySpinner />')

    const historyEventStr = selectedHistoryEvent
      ? getHistoryEventDateString(selectedHistoryEvent)
      : null

    return (
      <Delay ms={600}>
        <div className={styles.spinnerContainer}>
          <Spinner
            center
            message={`Loading revision${historyEventStr ? ` from ${historyEventStr}` : ''}…`}
          />
        </div>
      </Delay>
    )
  }
)

HistorySpinner.displayName = 'HistorySpinner'

const PaneHeaderActions = React.memo(
  (props: {
    documentId: string
    documentType: string
    markers: any
    onCloseValidationResults: () => void
    onSetFocus: (path: any) => void
    onToggleValidationResults: () => void
    showValidationTooltip: boolean
  }) => {
    console.log('<PaneHeaderActions />')

    const {
      documentId,
      documentType,
      markers,
      onCloseValidationResults,
      onSetFocus,
      onToggleValidationResults,
      showValidationTooltip
    } = props

    return (
      <div className={styles.paneFunctions}>
        {LanguageFilter && <LanguageFilter />}
        <Validation
          id={documentId}
          type={documentType}
          markers={markers}
          showValidationTooltip={showValidationTooltip}
          onCloseValidationResults={onCloseValidationResults}
          onToggleValidationResults={onToggleValidationResults}
          onFocus={onSetFocus}
        />
      </div>
    )
  }
)

PaneHeaderActions.displayName = 'PaneHeaderActions'

const EditorFooter = React.memo(
  ({
    documentId,
    documentType,
    initialValue,
    isHistoryOpen,
    onOpenHistory,
    selectedHistoryEvent,
    selectedHistoryEventIsLatest,
    value: valueProp
  }: {
    documentId: string
    documentType: string
    initialValue: Doc
    isHistoryOpen: boolean
    onOpenHistory: () => void
    selectedHistoryEvent: HistoryTimelineEvent | null
    selectedHistoryEventIsLatest: boolean
    value: Doc | null
  }) => {
    console.log('<EditorFooter />')

    if (isHistoryOpen && !selectedHistoryEventIsLatest && selectedHistoryEvent) {
      return (
        <HistoryStatusBar
          id={documentId}
          type={documentType}
          selectedEvent={selectedHistoryEvent}
          isLatestEvent={selectedHistoryEventIsLatest}
        />
      )
    }

    const value = valueProp || initialValue

    return (
      <DocumentStatusBar
        id={documentId}
        type={documentType}
        lastUpdated={value && value._updatedAt}
        onLastUpdatedButtonClick={onOpenHistory}
      />
    )
  }
)

EditorFooter.displayName = 'EditorFooter'

const DocumentView = React.memo(
  ({
    activeViewId,
    connectionState,
    documentId,
    documentType,
    formRef,
    revision,
    initialValue,
    isHistoryOpen,
    markers,
    onChange,
    selectedHistoryEvent,
    selectedHistoryEventIsLatest,
    value,
    views
  }: {
    activeViewId: string
    connectionState: string
    documentId: string
    documentType: string
    formRef: React.RefObject<any>
    revision: HistoryRevisionState
    initialValue: Doc
    isHistoryOpen: boolean
    markers: any
    onChange: (patches: any[]) => void
    selectedHistoryEvent: HistoryTimelineEvent | null
    selectedHistoryEventIsLatest: boolean
    value: Doc | null
    views: {
      type: string
      id: string
      title: string
      options: {}
      component: React.ComponentType<any>
    }[]
  }) => {
    console.log('<DocumentView />')

    const schemaType = schema.get(documentType)
    const activeView = views.find(view => view.id === activeViewId) || views[0] || {type: 'form'}

    // Should be null if not displaying a revision revision
    const revisionSnapshot = selectedHistoryEventIsLatest
      ? value
      : revision.snapshot || revision.prevSnapshot

    const viewProps = {
      // "Documents"
      document: {
        published: value,
        draft: value,
        revision: revisionSnapshot,
        displayed: revisionSnapshot || value || initialValue
      },

      // Other stuff
      documentId,
      options: activeView.options,
      schemaType
    }

    const formProps = {
      ...viewProps,
      value: value,
      connectionState,
      initialValue,
      isHistoryOpen,
      markers,
      onChange,
      selectedHistoryEvent,
      selectedHistoryEventIsLatest: selectedHistoryEventIsLatest
    }

    switch (activeView.type) {
      case 'form':
        return <FormView {...formProps} id={documentId} ref={formRef} />
      case 'component':
        return <activeView.component {...viewProps} />
      default:
        return null
    }
  }
)

DocumentView.displayName = 'DocumentView'

const DocumentHeaderTitle = React.memo(
  ({
    documentType,
    paneTitle,
    value
  }: {
    documentType: string
    paneTitle?: string
    value: Doc | null
  }) => {
    console.log('<DocumentHeaderTitle />')

    const type = schema.get(documentType)

    if (paneTitle) {
      return <span>{paneTitle}</span>
    }

    if (!value) {
      return <>New {type.title || type.name}</>
    }

    return (
      <PreviewFields document={value} type={type} fields={['title']}>
        {({title}) => (title ? <span>{title}</span> : <em>Untitled</em>)}
      </PreviewFields>
    )
  }
)

DocumentHeaderTitle.displayName = 'DocumentHeaderTitle'

const Editor = React.memo((props: Props) => {
  console.log('<Editor />')

  const {
    activeViewId,
    connectionState,
    documentId,
    documentType,
    formRef,
    hasSiblings,
    initialValue,
    inspect,
    isClosable,
    isCollapsed,
    isHistoryOpen,
    isSelected,
    markers,
    menuItemGroups,
    menuItems,
    onAction,
    onChange,
    onCloseValidationResults,
    onCloseView,
    onCollapse,
    onExpand,
    onHideInspector,
    onOpenHistory,
    onSetActiveView,
    onSetFocus,
    onSplitPane,
    onToggleValidationResults,
    paneKey,
    paneTitle,
    revision,
    selectedHistoryEvent,
    selectedHistoryEventIsLatest,
    showValidationTooltip,
    value,
    views
  } = props

  const paneHeaderTitle = (
    <DocumentHeaderTitle documentType={documentType} paneTitle={paneTitle} value={value} />
  )

  const renderPaneHeaderActions = React.useCallback(
    () =>
      isHistoryOpen ? null : (
        <PaneHeaderActions
          documentId={documentId}
          documentType={documentType}
          markers={markers}
          onCloseValidationResults={onCloseValidationResults}
          onSetFocus={onSetFocus}
          onToggleValidationResults={onToggleValidationResults}
          showValidationTooltip={showValidationTooltip}
        />
      ),
    [
      isHistoryOpen,
      documentId,
      markers,
      onCloseValidationResults,
      onSetFocus,
      onToggleValidationResults,
      // options,
      showValidationTooltip
    ]
  )

  const paneFooter = (
    <EditorFooter
      documentId={documentId}
      documentType={documentType}
      initialValue={initialValue}
      isHistoryOpen={isHistoryOpen}
      onOpenHistory={onOpenHistory}
      selectedHistoryEvent={selectedHistoryEvent}
      selectedHistoryEventIsLatest={selectedHistoryEventIsLatest}
      value={value}
    />
  )

  return (
    <TabbedPane
      key="pane"
      idPrefix={paneKey}
      title={paneHeaderTitle}
      views={views}
      activeView={activeViewId}
      onSetActiveView={onSetActiveView}
      onSplitPane={onSplitPane}
      onCloseView={onCloseView}
      menuItemGroups={menuItemGroups}
      isSelected={isSelected}
      isCollapsed={isCollapsed}
      onCollapse={onCollapse}
      onExpand={onExpand}
      onAction={onAction}
      menuItems={menuItems}
      footer={paneFooter}
      renderActions={renderPaneHeaderActions}
      isClosable={isClosable}
      hasSiblings={hasSiblings}
    >
      {revision.isLoading && <HistorySpinner selectedHistoryEvent={selectedHistoryEvent} />}

      <DocumentView
        activeViewId={activeViewId}
        connectionState={connectionState}
        documentId={documentId}
        documentType={documentType}
        formRef={formRef}
        revision={revision}
        initialValue={initialValue}
        isHistoryOpen={isHistoryOpen}
        markers={markers}
        onChange={onChange}
        selectedHistoryEvent={selectedHistoryEvent}
        selectedHistoryEventIsLatest={selectedHistoryEventIsLatest}
        value={value}
        views={views}
      />

      {inspect && isHistoryOpen && revision && (
        <InspectHistory document={revision} onClose={onHideInspector} />
      )}

      {inspect && !isHistoryOpen && value && (
        <InspectView value={value} onClose={onHideInspector} />
      )}

      {connectionState === 'reconnecting' && (
        <Snackbar kind="warning" isPersisted title="Connection lost. Reconnecting…" />
      )}

      <DocumentOperationResults id={documentId} type={documentType} />
    </TabbedPane>
  )
})

Editor.displayName = 'Editor'

export default Editor
