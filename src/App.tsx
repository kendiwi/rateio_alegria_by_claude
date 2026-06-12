import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/store/AppContext'
import Layout from './components/Layout'
import Index from './pages/Index'
import Participants from './pages/Participants'
import Expenses from './pages/Expenses'
import Settlement from './pages/Settlement'
import Donations from './pages/Donations'
import NotFound from './pages/NotFound'

const App = () => (
  <HashRouter>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/participantes" element={<Participants />} />
            <Route path="/despesas" element={<Expenses />} />
            <Route path="/rateio" element={<Settlement />} />
            <Route path="/doacoes" element={<Donations />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </TooltipProvider>
  </HashRouter>
)

export default App
