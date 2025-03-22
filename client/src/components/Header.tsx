import React from 'react'

const Header = ({title, subtitle, rightElement} : HeaderProps) => {
  return (
    <div>
        <div>
            <h1 className=''>{title}</h1>
            <p>{subtitle}</p>
        </div>        
        {rightElement && <div>{rightElement}</div>}
    </div>
  )
}

export default Header