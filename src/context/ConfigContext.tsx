import { createContext, useContext } from 'react'
import { CONFIG_FALLBACK } from '../hooks/useSheetConfig'
import type { SheetConfig } from '../hooks/useSheetConfig'

export const ConfigContext = createContext<SheetConfig>(CONFIG_FALLBACK)
export const useConfig = () => useContext(ConfigContext)
