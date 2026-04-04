import { DataProvider } from "../providers/data"
import StyleSelector from "../StyleSelector"

const AppStyleSelector = () => (
  <DataProvider>
    <StyleSelector />  
  </DataProvider>
)

export default AppStyleSelector
