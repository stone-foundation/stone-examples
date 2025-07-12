import clsx from 'clsx'
import React from 'react'
import { StoneLink } from '@stone-js/use-react'

export interface TabItem {
  path: string
  label: string
}

interface TabNavigationProps {
  readonly tabs: TabItem[]
  readonly basePath?: string
  readonly className?: string
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  basePath,
  className
}) => {
  const currentPath = location.pathname

  return (
    <nav
      className={clsx(
        'flex overflow-x-auto gap-2 border-b border-white/10 mb-6 scrollbar-hide',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = currentPath.startsWith(basePath + tab.path)

        return (
          <StoneLink
            to={tab.path}
            key={tab.path}
            className={clsx(
              'whitespace-nowrap px-4 py-2 rounded-t-md text-sm transition page-tab',
              isActive
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/60 hover:bg-white/5'
            )}
          >
            {tab.label}
          </StoneLink>
        )
      })}
    </nav>
  )
}
