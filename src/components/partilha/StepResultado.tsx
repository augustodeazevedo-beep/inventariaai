import { Button } from "@/components/ui/button";
import type { ResultadoPartilha } from "@/types/inventario";
import { formatCurrency } from "@/lib/partilha-calculator";
import { BarChart3, Download } from "lucide-react";

interface Props {
  resultado: ResultadoPartilha;
}

export function StepResultado({ resultado }: Props) {
  const exportar = () => {
    let text = "RESULTADO DA PARTILHA\n";
    text += "=".repeat(50) + "\n\n";
    text += "1. RESUMO PATRIMONIAL\n";
    text += `Monte-Mor: R$ ${formatCurrency(resultado.monteMor)}\n`;
    text += `Dívidas: R$ ${formatCurrency(resultado.dividas)}\n`;
    text += `Meação: R$ ${formatCurrency(resultado.meacao)}\n`;
    text += `Herança: R$ ${formatCurrency(resultado.heranca)}\n\n`;
    text += "2. QUADRO INDIVIDUAL DE PARTILHA\n";
    resultado.quadroIndividual.forEach((q) => {
      text += `${q.nome} (${q.parentesco}): R$ ${formatCurrency(q.totalRecebido)}`;
      if (q.itcmd > 0) text += ` | ITCMD: R$ ${formatCurrency(q.itcmd)}`;
      text += "\n";
    });
    if (resultado.estimativaItcmd > 0) {
      text += `\n3. ESTIMATIVA TOTAL DE ITCMD: R$ ${formatCurrency(resultado.estimativaItcmd)}\n`;
      text += `Base de cálculo: R$ ${formatCurrency(resultado.baseCalculoItcmd)}\n`;
    }
    text += "\n4. FUNDAMENTAÇÃO JURÍDICA E OBSERVAÇÕES\n";
    text += "MEAÇÃO: Decorre do Direito de Família (regime de bens). Não integra a herança e não sofre incidência de ITCMD.\n";
    text += "SUCESSÃO: Aplicado o Art. 1.829 do Código Civil.\n";
    text += "PREVIDÊNCIA: Valores em PGBL/VGBL foram excluídos do monte partilhável conforme entendimento consolidado.\n";
    text += "Este relatório é uma simulação técnica e não substitui a assessoria jurídica de um advogado especializado.\n";
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultado-partilha.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-serif">Resultado da Partilha</h2>
        </div>
        <Button onClick={exportar} variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
          <Download className="w-4 h-4 mr-1" /> Exportar Relatório
        </Button>
      </div>

      {/* 1. Resumo Patrimonial */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3">1. Resumo Patrimonial</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Monte-Mor", value: resultado.monteMor, variant: "dark" },
            { label: "Dívidas", value: resultado.dividas, variant: "dark" },
            { label: "Total Meação", value: resultado.meacao, variant: "dark" },
            { label: "Total Herança", value: resultado.heranca, variant: "dark" },
          ].map((item) => (
            <div key={item.label} className="result-card result-card-dark rounded-lg p-3">
              <p className="text-xs uppercase tracking-wide opacity-70">{item.label}</p>
              <p className="text-lg font-bold mt-1">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quadro Individual */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3">2. Quadro Individual de Partilha</h3>
        <div className="space-y-3">
          {resultado.quadroIndividual.map((q, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{q.nome}</p>
                  <p className="text-xs text-muted-foreground uppercase">{q.parentesco}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Recebido</p>
                  <p className="font-bold">{formatCurrency(q.totalRecebido)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Herança:</span>
                  <span className="font-medium">{formatCurrency(q.heranca)}</span>
                </div>
                {q.itcmd > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>ITCMD Estimado:</span>
                    <span className="font-medium">{formatCurrency(q.itcmd)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ITCMD */}
      {resultado.estimativaItcmd > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3">3. Estimativa Total de ITCMD</h3>
          <div className="result-card result-card-danger p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs uppercase font-semibold text-destructive">Estimativa Total de ITCMD</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(resultado.estimativaItcmd)}</p>
              </div>
              <div className="text-right text-sm">
                <p>Base de cálculo: <strong>{formatCurrency(resultado.baseCalculoItcmd)}</strong></p>
                <p className="text-xs text-muted-foreground italic">(Apenas herança, excluindo meação e previdência)</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-destructive/20">
              <p className="text-sm font-semibold">Distribuição individual do ITCMD:</p>
              {resultado.quadroIndividual.filter(q => q.itcmd > 0).map((q, i) => (
                <p key={i} className="text-sm">{q.nome}: <strong>{formatCurrency(q.itcmd)}</strong></p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Fundamentação */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3">4. Fundamentação Jurídica e Observações</h3>
        <div className="result-card result-card-warning p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong className="text-destructive">MEAÇÃO:</strong> Decorre do Direito de Família (regime de bens). Não integra a herança e não sofre incidência de ITCMD.</p>
              <p className="mt-2"><strong className="text-destructive">SUCESSÃO:</strong> Aplicado o Art. 1.829 do Código Civil conforme o regime de bens.</p>
            </div>
            <div>
              <p><strong className="text-destructive">PREVIDÊNCIA:</strong> Valores em PGBL/VGBL foram excluídos do monte partilhável conforme entendimento consolidado.</p>
              <p className="mt-2 italic text-muted-foreground">Este relatório é uma simulação técnica e não substitui a assessoria jurídica de um advogado especializado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
