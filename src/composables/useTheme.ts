import { ref, onMounted } from 'vue'
import type { Theme } from '@/types/theme'

const STORAGE_KEY = 'claudio-theme'

const currentTheme = ref<Theme>('light')

export function useTheme() {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }

  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null

    if (stored && (stored === 'light' || stored === 'dark')) {
      setTheme(stored)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme
  }
}
