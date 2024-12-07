import cls from '../../cls'
import getRandomHtmlId from '../../GetRandomString'
import './dropdown.css'
import { ReactNode, useEffect, useRef, useState, Dispatch } from 'react'

export interface DropdownProps{
  beforeDropdownClick?: (clickState: string, element: Element, setDropdownOpen: Dispatch<React.SetStateAction<boolean>>) => boolean,
  children?: ReactNode,
  buttonText?: string,
  className?: string,
  id?: string,
  angleIcon?: ReactNode,
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, dropdownOpen: boolean) => void,
  buttonTabIndex: number | undefined
}

export function Dropdown({beforeDropdownClick, buttonText, children, className, id, angleIcon, onKeyDown, buttonTabIndex}: DropdownProps){
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const buttonId = useRef(getRandomHtmlId())
  const contentId = useRef(getRandomHtmlId())

  useEffect(() =>{
    function clickEvent(e: MouseEvent){
      if (e.target == null) return
      const element = e.target as Element

      if (element.closest(`#${contentId.current}`) != null){
        if (beforeDropdownClick && beforeDropdownClick('content_click', element, setDropdownOpen)) return // return true to override default action
        //setDropdownOpen(false)
      } else if (element.closest(`#${buttonId.current}`) != null){
        if (beforeDropdownClick && beforeDropdownClick('button_click', element, setDropdownOpen)) return
        setDropdownOpen(prev => {
          return !prev
        })
      } else{
        if (beforeDropdownClick && beforeDropdownClick('other_click', element, setDropdownOpen)) return
        setDropdownOpen(false)
      }
    }

    document.addEventListener('click', clickEvent)

    return () => document.removeEventListener('click', clickEvent)
  }, [])

  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) =>{
    const target = e.target as HTMLDivElement
    if (e.key === 'Enter'){
      target.click()
    }
    onKeyDown(e, dropdownOpen)
  }

  const onBlur = (e: React.FocusEvent<HTMLDivElement, Element>) =>{
    if (e.relatedTarget && e.relatedTarget.closest(`#${contentId.current}`) != null) return
    setDropdownOpen(false)
  }

  return <div id={id} className={cls('sf-dropdown', className, dropdownOpen ? 'sf-dropdown-open' : 'sf-dropdown-closed')}>
    <div role="button" tabIndex={buttonTabIndex} onKeyDown={keyDown} className='sf-dropdown-button' id={buttonId.current} onBlur={onBlur}>
      <div className='sf-button-text'>
        {buttonText || ''}
      </div>
      <div className='sf-angle-box'>
        {angleIcon || <AngleDown width='15px'/>}
      </div>
      
    </div>
    <div className='sf-dropdown-content' id={contentId.current}>
      {children}
    </div>
  </div>
}

function AngleDown({width}: {width: string}){
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={width}>
    <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
  </svg>
}