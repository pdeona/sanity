import classNames from 'classnames'
import React, {useState} from 'react'
import {files} from './metadata'

import styles from './tool.css'

function CSSVariablesTool() {
  const [showDeprecated, setShowDeprecated] = useState(false)

  return (
    <div className={styles.root}>
      <button type="button" onClick={() => setShowDeprecated(val => !val)}>
        Toggle deprecated
      </button>

      <div>
        {files.map(file => (
          <div className={styles.file} key={file.name}>
            <div className={styles.fileName}>{file.name}</div>
            <div>
              {file.vars
                .filter(item => (showDeprecated ? true : !item.deprecated))
                .map(item => (
                  <div
                    className={classNames(styles.row, item.deprecated && styles.deprecated)}
                    data-name={item.name}
                    data-type={item.type}
                    key={item.name}
                  >
                    <div className={styles.value}>
                      <div />
                    </div>
                    <div className={styles.name}>{item.name}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  title: 'CSS variables',
  name: 'css-variables',
  component: CSSVariablesTool
}
