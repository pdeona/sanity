/* eslint-disable react/jsx-filename-extension */

import React from 'react'

const strokeStyle = {
  vectorEffect: 'non-scaling-stroke'
}

const TruncateIcon = () => (
  <svg
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    width="1em"
    height="1em"
  >
    <path d="M5 12.5H20" stroke="currentColor" style={strokeStyle} />
    <path d="M8.5 19.5L12.5 15.5L16.5 19.5" stroke="currentColor" style={strokeStyle} />
    <path d="M16.5 5.5L12.5 9.5L8.5 5.5" stroke="currentColor" style={strokeStyle} />
  </svg>
)

export default TruncateIcon
