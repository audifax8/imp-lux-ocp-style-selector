import { LabelsProvider } from './labels/LabelsProvider'
import Wizard from './wizard/Wizard'

const App = () => (
  <LabelsProvider>
    <Wizard />
  </LabelsProvider>
)

export default App
