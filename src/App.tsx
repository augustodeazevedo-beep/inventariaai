import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import CalculadoraPartilha from "@/pages/CalculadoraPartilha";
import CalculadoraItcmd from "@/pages/CalculadoraItcmd";
import TriagemInventario from "@/pages/TriagemInventario";
import GeradorPeticao from "@/pages/GeradorPeticao";
import ComparadorDoacaoInventario from "@/pages/ComparadorDoacaoInventario";
import PlanejamentoHolding from "@/pages/PlanejamentoHolding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CalculadoraPartilha />} />
            <Route path="/itcmd" element={<CalculadoraItcmd />} />
            <Route path="/triagem" element={<TriagemInventario />} />
            <Route path="/peticao" element={<GeradorPeticao />} />
            <Route path="/comparador" element={<ComparadorDoacaoInventario />} />
            <Route path="/holding" element={<PlanejamentoHolding />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
