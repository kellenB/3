import React from 'react'

import './styles.css'

type Props = {
  onClick?: any,
  className?: string,
  disabled?: boolean,
  children?: React.ReactNode,
  type?: 'submit' | 'reset' | 'button'
}


const Button: React.FC<Props> = props => {
  let className = 'Button'
  if (props.className !== undefined) className += ' ' + props.className
  return (
    <button type={props.type || undefined} className={className} disabled={props.disabled} onClick={props.onClick}>
      {
        props.children
      }
    </button>
  )
}

export default Button
