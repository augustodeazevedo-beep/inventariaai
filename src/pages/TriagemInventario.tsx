import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  FileSearch, UserCheck, Building2, ClipboardList, Route, CheckCircle2,
  Plus, Trash2, AlertTriangle, Scale, ChevronRight, ChevronLeft, Gavel
} from "lucide-react";
import {
  DadosFalecido, DadosHerdeiro, DadosBemTriagem,
  ChecklistItem, ViaInventario, TriagemState
} from "@/types/triagem";
import { determinarVia, gerarChecklist, ROTEIRO_ETAPAS } from "@/lib/triagem-utils";

const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const PARENTESCO_OPTIONS = [
  { value: "conjuge", label: "Cônjuge" },
  { value: "companheiro", label: "Companheiro(a)" },
  { value: "filho", label: "Filho(a)" },
  { value: "neto", label: "Neto(a)" },
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "irmao", label: "Irmão/Irmã" },
  { value: "sobrinho", label: "Sobrinho(a)" },
  { value: "outro", label: "Outro" },
];

const TIPO_BEM_OPTIONS = [
  { value: "imovel_urbano", label: "Imóvel Urbano" },
  { value: "imovel_rural", label: "Imóvel Rural" },
  { value: "veiculo", label: "Veículo" },
  { value: "conta_bancaria", label: "Conta Bancária" },
  { value: "investimento", label: "Investimento" },
  { value: "pis_fgts", label: "PIS/FGTS" },
  { value: "inss", label: "INSS" },
  { value: "outros", label: "Outros" },
];

const initialFalecido: DadosFalecido = {
  nome: "", cpf: "", dataFalecimento: "", estadoCivil: "",
  regimeBens: "", possuiTestamento: null, localFalecimento: "", ufFalecimento: "",
};

const STEPS = [
  { icon: UserCheck, label: "Falecido" },
  { icon: UserCheck, label: "Herdeiros" },
  { icon: Building2, label: "Bens" },
  { icon: Route, label: "Via" },
  { icon: ClipboardList, label: "Checklist" },
  { icon: FileSearch, label: "Roteiro" },
];

export default function TriagemInventario() {
  const [etapa, setEtapa] = useState(0);
  const [falecido, setFalecido] = useState<DadosFalecido>(initialFalecido);
  const [herdeiros, setHerdeiros] = useState<DadosHerdeiro[]>([]);
  const [bens, setBens] = useState<DadosBemTriagem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [roteiroStatus, setRoteiroStatus] = useState<boolean[]>(
    new Array(ROTEIRO_ETAPAS.length).fill(false)
  );

  const resultado = useMemo(() => {
    if (herdeiros.length === 0) return null;
    return determinarVia(falecido, herdeiros);
  }, [falecido, herdeiros]);

  const via: ViaInventario = resultado?.via ?? "indefinida";

  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklist.filter((c) => c.concluido).length / checklist.length) * 100);
  }, [checklist]);

  const roteiroProgress = useMemo(() => {
    const done = roteiroStatus.filter(Boolean).length;
    return Math.round((done / ROTEIRO_ETAPAS.length) * 100);
  }, [roteiroStatus]);

  // Herdeiro helpers
  const addHerdeiro = () => {
    setHerdeiros([...herdeiros, {
      id: crypto.randomUUID(), nome: "", cpf: "", parentesco: "",
      menor: false, incapaz: false, concorda: true,
      endereco: "", telefone: "", email: "", profissao: "", estadoCivil: "",
    }]);
  };

  const updateHerdeiro = (id: string, field: keyof DadosHerdeiro, value: any) => {
    setHerdeiros(herdeiros.map((h) => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHerdeiro = (id: string) => {
    setHerdeiros(herdeiros.filter((h) => h.id !== id));
  };

  // Bem helpers
  const addBem = () => {
    setBens([...bens, {
      id: crypto.randomUUID(), tipo: "imovel_urbano", descricao: "",
      localizacao: "", uf: "", municipio: "", matriculaRegistro: "",
      valorEstimado: 0, possuiDivida: false, valorDivida: 0,
    }]);
  };

  const updateBem = (id: string, field: keyof DadosBemTriagem, value: any) => {
    setBens(bens.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBem = (id: string) => {
    setBens(bens.filter((b) => b.id !== id));
  };

  // Gerar checklist ao entrar na etapa 4
  const avancar = () => {
    if (etapa === 3 && resultado) {
      setChecklist(gerarChecklist(resultado.via));
    }
    setEtapa(Math.min(etapa + 1, STEPS.length - 1));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <Gavel className="w-6 h-6 text-primary" />
          Triagem de Inventário
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Roteiro completo: análise de via, checklist documental e acompanhamento de diligências.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const active = i === etapa;
          const done = i < etapa;
          return (
            <button
              key={i}
              onClick={() => setEtapa(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Step 0: Falecido */}
      {etapa === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Falecido (De Cujus)</CardTitle>
            <CardDescription>Informações do autor da herança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={falecido.nome} onChange={(e) => setFalecido({ ...falecido, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={falecido.cpf} onChange={(e) => setFalecido({ ...falecido, cpf: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data do Falecimento</Label>
                <Input type="date" value={falecido.dataFalecimento} onChange={(e) => setFalecido({ ...falecido, dataFalecimento: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estado Civil</Label>
                <Select value={falecido.estadoCivil} onValueChange={(v) => setFalecido({ ...falecido, estadoCivil: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    <SelectItem value="uniao_estavel">União Estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(falecido.estadoCivil === "casado" || falecido.estadoCivil === "uniao_estavel") && (
                <div className="space-y-2">
                  <Label>Regime de Bens</Label>
                  <Select value={falecido.regimeBens} onValueChange={(v) => setFalecido({ ...falecido, regimeBens: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comunhao_parcial">Comunhão Parcial</SelectItem>
                      <SelectItem value="comunhao_universal">Comunhão Universal</SelectItem>
                      <SelectItem value="separacao_total">Separação Total</SelectItem>
                      <SelectItem value="separacao_obrigatoria">Separação Obrigatória</SelectItem>
                      <SelectItem value="participacao_final_aquestos">Participação Final nos Aquestos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>UF do Falecimento</Label>
                <Select value={falecido.ufFalecimento} onValueChange={(v) => setFalecido({ ...falecido, ufFalecimento: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Local do Falecimento</Label>
                <Input value={falecido.localFalecimento} onChange={(e) => setFalecido({ ...falecido, localFalecimento: e.target.value })} />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Possui testamento?</Label>
              <div className="flex gap-4">
                {[{ label: "Sim", val: true }, { label: "Não", val: false }, { label: "Não sei", val: null }].map(
                  (opt) => (
                    <Button
                      key={String(opt.val)}
                      variant={falecido.possuiTestamento === opt.val ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFalecido({ ...falecido, possuiTestamento: opt.val as boolean | null })}
                    >
                      {opt.label}
                    </Button>
                  )
                )}
              </div>
              {falecido.possuiTestamento === null && (
                <p className="text-xs text-warning flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  É necessário requisitar Certidão Negativa de Testamento para confirmar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Herdeiros */}
      {etapa === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Herdeiros</CardTitle>
            <CardDescription>Cadastre todos os herdeiros conhecidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {herdeiros.map((h, idx) => (
              <div key={h.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Herdeiro {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeHerdeiro(h.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input value={h.nome} onChange={(e) => updateHerdeiro(h.id, "nome", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CPF</Label>
                    <Input value={h.cpf} onChange={(e) => updateHerdeiro(h.id, "cpf", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Parentesco</Label>
                    <Select value={h.parentesco} onValueChange={(v) => updateHerdeiro(h.id, "parentesco", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {PARENTESCO_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefone</Label>
                    <Input value={h.telefone} onChange={(e) => updateHerdeiro(h.id, "telefone", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">E-mail</Label>
                    <Input value={h.email} onChange={(e) => updateHerdeiro(h.id, "email", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Profissão</Label>
                    <Input value={h.profissao} onChange={(e) => updateHerdeiro(h.id, "profissao", e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.menor} onCheckedChange={(v) => updateHerdeiro(h.id, "menor", !!v)} />
                    Menor de idade
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.incapaz} onCheckedChange={(v) => updateHerdeiro(h.id, "incapaz", !!v)} />
                    Incapaz
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.concorda} onCheckedChange={(v) => updateHerdeiro(h.id, "concorda", !!v)} />
                    Concorda com a partilha
                  </label>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addHerdeiro} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Herdeiro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Bens */}
      {etapa === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bens e Direitos</CardTitle>
            <CardDescription>Cadastre os bens a serem inventariados (conforme formulário DIT)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bens.map((b, idx) => (
              <div key={b.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Bem {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeBem(b.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={b.tipo} onValueChange={(v) => updateBem(b.id, "tipo", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPO_BEM_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Descrição</Label>
                    <Input value={b.descricao} onChange={(e) => updateBem(b.id, "descricao", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Matrícula / Registro</Label>
                    <Input value={b.matriculaRegistro} onChange={(e) => updateBem(b.id, "matriculaRegistro", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Município</Label>
                    <Input value={b.municipio} onChange={(e) => updateBem(b.id, "municipio", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">UF</Label>
                    <Select value={b.uf} onValueChange={(v) => updateBem(b.id, "uf", v)}>
                      <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor estimado (R$)</Label>
                    <Input type="number" value={b.valorEstimado || ""} onChange={(e) => updateBem(b.id, "valorEstimado", Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Possui dívida?</Label>
                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox checked={b.possuiDivida} onCheckedChange={(v) => updateBem(b.id, "possuiDivida", !!v)} />
                      <span className="text-xs text-muted-foreground">Sim</span>
                    </div>
                  </div>
                  {b.possuiDivida && (
                    <div className="space-y-1">
                      <Label className="text-xs">Valor da dívida (R$)</Label>
                      <Input type="number" value={b.valorDivida || ""} onChange={(e) => updateBem(b.id, "valorDivida", Number(e.target.value))} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addBem} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Bem
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Via */}
      {etapa === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Análise da Via do Inventário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resultado ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p>Cadastre pelo menos um herdeiro para analisar a via.</p>
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-lg border-2 ${
                  resultado.via === "extrajudicial"
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-orange-500/40 bg-orange-500/5"
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={resultado.via === "extrajudicial" ? "default" : "destructive"} className="text-sm px-3 py-1">
                      {resultado.via === "extrajudicial" ? "EXTRAJUDICIAL" : "JUDICIAL"}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">{resultado.justificativa}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Resumo da Triagem</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-muted-foreground">Herdeiros</p>
                      <p className="text-lg font-bold text-foreground">{herdeiros.length}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-muted-foreground">Menores</p>
                      <p className="text-lg font-bold text-foreground">{herdeiros.filter((h) => h.menor).length}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-muted-foreground">Bens cadastrados</p>
                      <p className="text-lg font-bold text-foreground">{bens.length}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-muted-foreground">Monte bruto</p>
                      <p className="text-lg font-bold text-foreground">
                        {bens.reduce((s, b) => s + b.valorEstimado, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Checklist */}
      {etapa === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Checklist Documental — {via === "extrajudicial" ? "Extrajudicial" : "Judicial"}
            </CardTitle>
            <CardDescription>
              <Progress value={checklistProgress} className="h-2 mt-2" />
              <span className="text-xs mt-1 inline-block">{checklistProgress}% concluído</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const categorias = [...new Set(checklist.map((c) => c.categoria))];
              return categorias.map((cat) => (
                <div key={cat} className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{cat}</h4>
                  <div className="space-y-2">
                    {checklist
                      .filter((c) => c.categoria === cat)
                      .map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                          <Checkbox
                            checked={item.concluido}
                            onCheckedChange={(v) =>
                              setChecklist(checklist.map((c) =>
                                c.id === item.id ? { ...c, concluido: !!v } : c
                              ))
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${item.concluido ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {item.descricao}
                            </p>
                            {item.obrigatorio && (
                              <Badge variant="outline" className="text-[10px] mt-1">Obrigatório</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              ));
            })()}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Roteiro */}
      {etapa === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Roteiro de Diligências
            </CardTitle>
            <CardDescription>
              <Progress value={roteiroProgress} className="h-2 mt-2" />
              <span className="text-xs mt-1 inline-block">{roteiroProgress}% concluído</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ROTEIRO_ETAPAS.map((etapaTexto, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  roteiroStatus[i]
                    ? "bg-primary/5 border-primary/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={roteiroStatus[i]}
                  onCheckedChange={(v) => {
                    const updated = [...roteiroStatus];
                    updated[i] = !!v;
                    setRoteiroStatus(updated);
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`text-sm ${roteiroStatus[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    <span className="font-semibold text-primary mr-2">{i + 1}.</span>
                    {etapaTexto}
                  </p>
                </div>
                {roteiroStatus[i] && <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setEtapa(Math.max(0, etapa - 1))}
          disabled={etapa === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <Button
          onClick={avancar}
          disabled={etapa === STEPS.length - 1}
        >
          Próximo <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
