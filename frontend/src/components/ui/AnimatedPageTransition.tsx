
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface AnimatedPageTransitionProps {
  children: React.ReactNode
}

export function AnimatedPageTransition({ children }: AnimatedPageTransitionProps) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('page-enter')

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('page-exit')
      setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('page-enter')
      }, 300) // Match this with your CSS exit transition duration
    }
  }, [location, displayLocation])

  return (
    <div className={`${transitionStage}`}>
      {children}
    </div>
  )
}
