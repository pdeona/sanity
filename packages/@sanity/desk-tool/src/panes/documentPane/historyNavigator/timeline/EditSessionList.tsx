/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as React from 'react'
import {EditSession} from '../../history'

import styles from './EditSessionList.css'

interface Props {
  isSelected: boolean
  sessions: EditSession[]
}

const EditSessionList = React.memo(({isSelected, sessions}: Props) => {
  return (
    <div className={isSelected ? styles.isSelected : styles.root}>
      {sessions.map((session, sessionIndex) => (
        <button className={styles.session} key={String(sessionIndex)} type="button">
          {session.edits.map((_, editIndex) => (
            <div key={String(editIndex)} />
          ))}
        </button>
      ))}
    </div>
  )
})

EditSessionList.displayName = 'EditSessionList'

export default EditSessionList
