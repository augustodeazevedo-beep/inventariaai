import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, Copy, Download, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PETICAO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar-peticao`;

type TipoPeticao = "inventario_consensual" | "inventario_litigioso";

export default function GeradorPeticao() {
  const [tipo, setTipo] = useState<TipoPeticao>("inventario_consensual");
  const [contextoAdicional, setContextoAdicional] = useState("");
  const [peticaoGerada, setPeticaoGerada] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dados simplificados para entrada rápida (ou usar dados da triagem no futuro)
  const [nomeFalecido, setNomeFalecido] = useState("");
  const [dataFalecimento, setDataFalecimento] = useState("");

  const gerarPeticao = async () => {
    setIsLoading(true);
    setPeticaoGerada("");

    const dados = {
      falecido: {
        nome: nomeFalecido || "[PLACEHOLDER: nome do falecido]",
        cpf: "",
        dataFalecimento: dataFalecimento || "[PLACEHOLDER: data]",
        estadoCivil: "",
        regimeBens: "",
        possuiTestamento: null,
        localFalecimento: "",
        ufFalecimento: "",
        ultimoDomicilio: "",
        ufDomicilio: "",
        profissao: "",
      },
      herdeiros: [],
      bens: [],
      flags: {
        desconhecimentoPatrimonial: tipo === "inventario_litigioso",
        descricaoDesconhecimento: tipo === "inventario_litigioso" ? "Acervo hereditário desconhecido ou parcialmente conhecido" : "",
        ocultacaoPatrimonial: false, descricaoOcultacao: "",
        doacaoInoficiosa: false, descricaoDoacaoInoficiosa: "",
        simulacaoNegocioJuridico: false, descricaoSimulacao: "",
        alienacaoEmVida: false, descricaoAlienacao: "",
        posseExclusivaBens: false, possuidorExclusivo: "", descricaoPosseExclusiva: "",
        cobrancaFrutosAlugueis: false, descricaoFrutos: "",
        conflitosEntreHerdeiros: false, descricaoConflitos: "",
      },
      cessoes: [],
      herancasCumulativas: [],
      resultado: {
        via: "judicial",
        natureza: tipo === "inventario_litigioso" ? "litigioso" : "consensual",
        justificativa: "",
      },
      contextoAdicional,
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        setIsLoading(false);
        return;
      }
      const resp = await fetch(PETICAO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ dados }),
      });

      if (!resp.ok || !resp.body) {
        const reqId = resp.headers.get("x-request-id");
        const suffix = reqId ? ` (cód: ${reqId.slice(0, 8)})` : "";
        if (resp.status === 429) {
          toast.error("Limite de requisições excedido. Tente novamente em alguns minutos." + suffix);
        } else if (resp.status === 402) {
          toast.error("Créditos insuficientes. Adicione créditos ao seu workspace." + suffix);
        } else {
          toast.error("Erro ao gerar a petição. Tente novamente." + suffix);
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setPeticaoGerada(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setPeticaoGerada(fullText);
            }
          } catch { /* ignore */ }
        }
      }

      toast.success("Petição gerada com sucesso!");
    } catch {
      toast.error("Erro de conexão. Verifique sua rede e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const copiarTexto = () => {
    navigator.clipboard.writeText(peticaoGerada);
    toast.success("Texto copiado para a área de transferência!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Gerador de Petição Inicial
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gere rascunhos de petições iniciais de inventário via IA, com fundamentação jurídica e formatação técnico-forense.
        </p>
      </div>

      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-destructive">
          <strong>ATENÇÃO:</strong> A peça gerada é um RASCUNHO. Deve ser revisada, adaptada e assinada por advogado(a) responsável antes do protocolo.
          A IA pode alucinar — verifique todos os artigos de lei, jurisprudência e dados citados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Parâmetros</CardTitle>
            <CardDescription>Dados básicos para a petição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Petição</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoPeticao)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventario_consensual">Inventário Consensual</SelectItem>
                  <SelectItem value="inventario_litigioso">Inventário Litigioso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Falecido</Label>
              <Input value={nomeFalecido} onChange={(e) => setNomeFalecido(e.target.value)} placeholder="Nome completo" maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Data do Falecimento</Label>
              <Input type="date" value={dataFalecimento} onChange={(e) => setDataFalecimento(e.target.value)} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Contexto adicional / Instruções</Label>
              <Textarea
                value={contextoAdicional}
                onChange={(e) => setContextoAdicional(e.target.value.slice(0, 2000))}
                placeholder="Adicione detalhes relevantes: fatos específicos, pedidos especiais, particularidades do caso..."
                rows={6}
                maxLength={2000}
              />
              <p className="text-[10px] text-muted-foreground text-right">{contextoAdicional.length}/2000</p>
            </div>

            <Button onClick={gerarPeticao} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Petição via IA
                </>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              Powered by Lovable AI • Modelo: Gemini 3 Flash
            </p>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Petição Gerada</CardTitle>
                <CardDescription>Rascunho — revisar antes do protocolo</CardDescription>
              </div>
              {peticaoGerada && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copiarTexto}>
                    <Copy className="w-3 h-3 mr-1" /> Copiar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!peticaoGerada && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Preencha os parâmetros e clique em "Gerar Petição via IA"</p>
                <p className="text-xs mt-1">A petição será gerada em tempo real com streaming.</p>
              </div>
            )}
            {(peticaoGerada || isLoading) && (
              <div className="bg-muted/30 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                  {peticaoGerada}
                  {isLoading && <span className="animate-pulse">▌</span>}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
