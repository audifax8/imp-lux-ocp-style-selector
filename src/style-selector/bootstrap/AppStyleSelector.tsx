import { DataProvider } from '@/style-selector/context/data'
import StyleSelector from '@/style-selector/StyleSelector'

const AppStyleSelector = () => (
  <DataProvider>
    <StyleSelector />  
  </DataProvider>
)

export default AppStyleSelector
