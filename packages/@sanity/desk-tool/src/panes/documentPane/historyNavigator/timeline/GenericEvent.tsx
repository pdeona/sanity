/* eslint-disable @typescript-eslint/explicit-function-return-type */

import classNames from 'classnames'
import * as React from 'react'
import {formatDate} from '../format'

import styles from './GenericEvent.css'

interface Props {
  children?: React.ReactNode
  icon?: React.ReactNode
  isFirst: boolean
  isLast: boolean
  isSelected: boolean
  now: number
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  timestamp?: number
  title: string
}

export const GenericEvent = React.memo(
  ({children, icon, isFirst, isLast, isSelected, now, onClick, timestamp, title}: Props) => {
    return (
      <div
        className={classNames(
          isSelected ? styles.isSelected : styles.root,
          isFirst && styles.isFirst,
          isLast && styles.isLast
        )}
      >
        <button onClick={onClick} type="button">
          <div className={styles.iconContainer}>{icon}</div>
          <div className={styles.heading}>{title}</div>
          {timestamp && <div className={styles.dateline}>{formatDate(now, timestamp)}</div>}
        </button>
        {children && <div className={styles.content}>{children}</div>}
      </div>
    )
  }
)

GenericEvent.displayName = 'GenericEvent'
