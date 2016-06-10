import FormBuilderPropTypes from '../../../src/FormBuilderPropTypes'
import React from 'react'
import styles from './styles/ValidationList.css'

class ValidationList extends React.Component {
  static propTypes = FormBuilderPropTypes.validation

  render() {
    const {messages} = this.props
    return (
      <ul className={styles.validationList}>
        {messages.map((msg, i) =>
          <li key={i} className={styles[msg.type]}>
            {msg.message}
          </li>
        )}
      </ul>
    )
  }
}

export default ValidationList
