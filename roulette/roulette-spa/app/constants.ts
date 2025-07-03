export const COLOR_MAP: Record<Color, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#27ae60',
  orange: '#ff9f30',
  blue_dark: '#024d78'
}

export const COLOR_TITLES: Record<Color, string> = {
  red: 'Rubis',
  blue: 'Topaze',
  orange: 'Ambre',
  green: 'Emeraude',
  blue_dark: 'Saphir'
}

export type Color = 'red' | 'blue' | 'green' | 'orange' | 'blue_dark'

export const defaultTitles: Record<number, string> = {
  403: 'Accès refusé',
  404: 'Page introuvable',
  500: 'Erreur interne'
}

export const defaultMessages: Record<number, string> = {
  403: "Vous n'avez pas la permission d’accéder à cette ressource.",
  404: "La page que vous recherchez n'existe pas ou a été déplacée.",
  500: 'Une erreur inattendue s’est produite. Veuillez réessayer plus tard.'
}
