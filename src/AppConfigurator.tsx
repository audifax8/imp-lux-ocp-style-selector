import { LabelsProvider } from './labels/LabelsProvider'
import Configurator from './configurator/Configurator'

const AppConfigurator = () => (
  <LabelsProvider>
    <Configurator />
  </LabelsProvider>
)

export default AppConfigurator
