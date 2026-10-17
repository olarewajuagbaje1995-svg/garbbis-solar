import { useEffect } from 'react'

const BASE = 'Garbbis Electrical And Maintenance Limited'

export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Garbbis` : BASE
    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', description)
    }
  }, [title, description])
}