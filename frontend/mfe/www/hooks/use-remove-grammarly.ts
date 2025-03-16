import { useEffect } from 'react'

export function useRemoveGrammarly() {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const node = mutation.target as HTMLElement
          if (node.hasAttribute('data-gr-ext-installed') || 
              node.hasAttribute('data-new-gr-c-s-check-loaded') ||
              node.hasAttribute('data-new-gr-c-s-loaded')) {
            node.removeAttribute('data-gr-ext-installed')
            node.removeAttribute('data-new-gr-c-s-check-loaded')
            node.removeAttribute('data-new-gr-c-s-loaded')
          }
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])
}