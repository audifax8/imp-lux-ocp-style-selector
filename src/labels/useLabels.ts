import { useContext } from 'react'
import { LabelsContext } from './LabelsProvider'

export const useLabels = () => useContext(LabelsContext)
