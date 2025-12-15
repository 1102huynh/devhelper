import { track } from '@vercel/analytics'

export const useAnalytics = () => {
  // Track tool usage
  const trackToolUse = (toolName: string) => {
    track('Tool Used', { tool: toolName })
  }

  // Track feature interaction
  const trackFeature = (featureName: string, action: string) => {
    track('Feature Interaction', {
      feature: featureName,
      action: action
    })
  }

  // Track button clicks
  const trackButtonClick = (buttonName: string, location: string) => {
    track('Button Click', {
      button: buttonName,
      location: location
    })
  }

  // Track form submissions
  const trackFormSubmit = (formName: string, success: boolean) => {
    track('Form Submit', {
      form: formName,
      success: success
    })
  }

  // Track API calls
  const trackApiCall = (endpoint: string, success: boolean, duration?: number) => {
    track('API Call', {
      endpoint: endpoint,
      success: success,
      duration: duration
    })
  }

  // Track errors
  const trackError = (errorType: string, errorMessage: string) => {
    track('Error', {
      type: errorType,
      message: errorMessage
    })
  }

  // Track search
  const trackSearch = (searchTerm: string, resultsCount: number) => {
    track('Search', {
      term: searchTerm,
      results: resultsCount
    })
  }

  // Track file operations
  const trackFileOperation = (operation: 'upload' | 'download' | 'export', fileType: string) => {
    track('File Operation', {
      operation: operation,
      fileType: fileType
    })
  }

  // Track theme change
  const trackThemeChange = (theme: string) => {
    track('Theme Change', { theme: theme })
  }

  return {
    trackToolUse,
    trackFeature,
    trackButtonClick,
    trackFormSubmit,
    trackApiCall,
    trackError,
    trackSearch,
    trackFileOperation,
    trackThemeChange,
  }
}

