import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FileSearch, UserCheck, Building2, ClipboardList, Route, CheckCircle2,
  Plus, Trash2, AlertTriangle, Scale, ChevronRight, ChevronLeft, Gavel,
  Search, Shield, Link2
} from "lucide-react";
import {
  DadosFalecido, DadosHerdeiro, DadosBemTriagem,
  ChecklistItem, ViaInventario, FlagsLitigio,
  CessaoDireitosHereditarios, HerancaCumulativa, DiligenciaInvestigativa
} from "@/types/triagem";
import { determinarVia, gerarChecklist, ROTEIRO_ETAPAS } from "@/lib/triagem-utils";
import { gerarDiligencias, CATEGORIAS_DILIGENCIA } from "@/lib/diligencias-investigativas";

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
  { value: "tio", label: "Tio(a)" },
  { value: "primo", label: "Primo(a)" },
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
  { value: "quotas_acoes", label: "Quotas/Ações Societárias" },
  { value: "outros", label: "Outros" },
];

const initialFalecido: DadosFalecido = {
  nome: "", cpf: "", dataFalecimento: "", estadoCivil: "",
  regimeBens: "", possuiTestamento: null, localFalecimento: "", ufFalecimento: "",
  ultimoDomicilio: "", ufDomicilio: "", profissao: "",
};

const initialFlags: FlagsLitigio = {
  posseExclusivaBens: false, possuidorExclusivo: "", descricaoPosseExclusiva: "",
  ocultacaoPatrimonial: false, descricaoOcultacao: "",
  doacaoInoficiosa: false, descricaoDoacaoInoficiosa: "",
  simulacaoNegocioJuridico: false, descricaoSimulacao: "",
  alienacaoEmVida: false, descricaoAlienacao: "",
  cobrancaFrutosAlugueis: false, descricaoFrutos: "",
  conflitosEntreHerdeiros: false, descricaoConflitos: "",
  desconhecimentoPatrimonial: false, descricaoDesconhecimento: "",
};

const STEPS = [
  { icon: UserCheck, label: "Falecido" },
  { icon: UserCheck, label: "Herdeiros" },
  { icon: Building2, label: "Bens" },
  { icon: Shield, label: "Litígio" },
  { icon: Link2, label: "Cessões / Heranças" },
  { icon: Scale, label: "Análise" },
  { icon: ClipboardList, label: "Checklist" },
  { icon: Search, label: "Diligências" },
  { icon: Route, label: "Roteiro" },
];

export default function TriagemInventario() {
  const [etapa, setEtapa] = useState(0);
  const [falecido, setFalecido] = useState<DadosFalecido>(initialFalecido);
  const [herdeiros, setHerdeiros] = useState<DadosHerdeiro[]>([]);
  const [bens, setBens] = useState<DadosBemTriagem[]>([]);
  const [flags, setFlags] = useState<FlagsLitigio>(initialFlags);
  const [cessoes, setCessoes] = useState<CessaoDireitosHereditarios[]>([]);
  const [herancasCumulativas, setHerancasCumulativas] = useState<HerancaCumulativa[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [diligencias, setDiligencias] = useState<DiligenciaInvestigativa[]>([]);
  const [roteiroStatus, setRoteiroStatus] = useState<boolean[]>(
    new Array(ROTEIRO_ETAPAS.length).fill(false)
  );

  const resultado = useMemo(() => {
    if (herdeiros.length === 0) return null;
    return determinarVia(falecido, herdeiros, flags);
  }, [falecido, herdeiros, flags]);

  const via: ViaInventario = resultado?.via ?? "indefinida";

  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklist.filter((c) => c.concluido).length / checklist.length) * 100);
  }, [checklist]);

  const diligenciasProgress = useMemo(() => {
    if (diligencias.length === 0) return 0;
    return Math.round((diligencias.filter((d) => d.concluido).length / diligencias.length) * 100);
  }, [diligencias]);

  const roteiroProgress = useMemo(() => {
    const done = roteiroStatus.filter(Boolean).length;
    return Math.round((done / ROTEIRO_ETAPAS.length) * 100);
  }, [roteiroStatus]);

  const addHerdeiro = () => {
    setHerdeiros([...herdeiros, {
      id: crypto.randomUUID(), nome: "", cpf: "", parentesco: "",
      menor: false, incapaz: false, concorda: true,
      endereco: "", telefone: "", email: "", profissao: "", estadoCivil: "",
      representante: false, representaDe: "", falecido: false, renunciou: false,
    }]);
  };

  const updateHerdeiro = (id: string, field: keyof DadosHerdeiro, value: any) => {
    setHerdeiros(herdeiros.map((h) => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHerdeiro = (id: string) => {
    setHerdeiros(herdeiros.filter((h) => h.id !== id));
  };

  const addBem = () => {
    setBens([...bens, {
      id: crypto.randomUUID(), tipo: "imovel_urbano", descricao: "",
      localizacao: "", uf: "", municipio: "", matriculaRegistro: "",
      valorEstimado: 0, possuiDivida: false, valorDivida: 0,
      formaAquisicao: "", adquiridoNaConstancia: false, emNomeDe: "",
    }]);
  };

  const updateBem = (id: string, field: keyof DadosBemTriagem, value: any) => {
    setBens(bens.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBem = (id: string) => {
    setBens(bens.filter((b) => b.id !== id));
  };

  const addCessao = () => {
    setCessoes([...cessoes, {
      id: crypto.randomUUID(), cedente: "", cessionario: "",
      percentual: 0, formalizada: false, datacessao: "", observacoes: "",
    }]);
  };

  const addHerancaCumulativa = () => {
    setHerancasCumulativas([...herancasCumulativas, {
      id: crypto.randomUUID(), nomeFalecido: "", dataFalecimento: "",
      parentescoComDeCujus: "", inventarioAberto: false, numeroProcesso: "", observacoes: "",
    }]);
  };

  const avancar = () => {
    if (etapa === 5 && resultado) {
      setChecklist(gerarChecklist(resultado.via));
      setDiligencias(gerarDiligencias(resultado.natureza, flags));
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
          Roteiro completo: análise de via, natureza (consensual/litigiosa), checklist documental, diligências investigativas e acompanhamento.
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
                <Label>Profissão</Label>
                <Input value={falecido.profissao} onChange={(e) => setFalecido({ ...falecido, profissao: e.target.value })} />
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
                <Label>Último Domicílio</Label>
                <Input value={falecido.ultimoDomicilio} onChange={(e) => setFalecido({ ...falecido, ultimoDomicilio: e.target.value })} placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label>UF do Domicílio</Label>
                <Select value={falecido.ufDomicilio} onValueChange={(v) => setFalecido({ ...falecido, ufDomicilio: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            <CardDescription>Cadastre todos os herdeiros conhecidos — inclua vocação hereditária e representação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {herdeiros.map((h, idx) => (
              <div key={h.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Herdeiro {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeHerdeiro(h.id)} aria-label="Excluir herdeiro">
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
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.renunciou} onCheckedChange={(v) => updateHerdeiro(h.id, "renunciou", !!v)} />
                    Renunciou à herança
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.falecido} onCheckedChange={(v) => updateHerdeiro(h.id, "falecido", !!v)} />
                    Pré-morto
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={h.representante} onCheckedChange={(v) => updateHerdeiro(h.id, "representante", !!v)} />
                    Herda por representação
                  </label>
                </div>
                {h.representante && (
                  <div className="space-y-1">
                    <Label className="text-xs">Representa (nome do herdeiro pré-morto)</Label>
                    <Input value={h.representaDe} onChange={(e) => updateHerdeiro(h.id, "representaDe", e.target.value)} placeholder="Nome do herdeiro que representa" />
                  </div>
                )}
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
            <CardDescription>Cadastre os bens a serem inventariados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bens.map((b, idx) => (
              <div key={b.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Bem {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeBem(b.id)} aria-label="Excluir bem">
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
                    <Label className="text-xs">Em nome de</Label>
                    <Input value={b.emNomeDe} onChange={(e) => updateBem(b.id, "emNomeDe", e.target.value)} placeholder="Titular do bem" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Forma de aquisição</Label>
                    <Select value={b.formaAquisicao} onValueChange={(v) => updateBem(b.id, "formaAquisicao", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compra_onerosa">Compra onerosa</SelectItem>
                        <SelectItem value="doacao">Doação</SelectItem>
                        <SelectItem value="heranca">Herança</SelectItem>
                        <SelectItem value="usucapiao">Usucapião</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor estimado (R$)</Label>
                    <Input type="number" value={b.valorEstimado || ""} onChange={(e) => updateBem(b.id, "valorEstimado", Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={b.adquiridoNaConstancia} onCheckedChange={(v) => updateBem(b.id, "adquiridoNaConstancia", !!v)} />
                    Adquirido na constância do casamento
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={b.possuiDivida} onCheckedChange={(v) => updateBem(b.id, "possuiDivida", !!v)} />
                    Possui dívida vinculada
                  </label>
                </div>
                {b.possuiDivida && (
                  <div className="space-y-1">
                    <Label className="text-xs">Valor da dívida (R$)</Label>
                    <Input type="number" value={b.valorDivida || ""} onChange={(e) => updateBem(b.id, "valorDivida", Number(e.target.value))} />
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addBem} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Bem
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Flags de Litígio */}
      {etapa === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Análise de Litigiosidade
            </CardTitle>
            <CardDescription>
              Identifique elementos que indicam inventário litigioso — ocultação, doações inoficiosas, posse exclusiva, conflitos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { key: "desconhecimentoPatrimonial" as const, label: "Desconhecimento total ou parcial do acervo hereditário", descKey: "descricaoDesconhecimento" as const, placeholder: "Descreva o que se sabe e o que falta apurar..." },
              { key: "conflitosEntreHerdeiros" as const, label: "Conflito declarado entre herdeiros", descKey: "descricaoConflitos" as const, placeholder: "Descreva a natureza do conflito..." },
              { key: "ocultacaoPatrimonial" as const, label: "Indícios de ocultação patrimonial", descKey: "descricaoOcultacao" as const, placeholder: "Descreva os indícios de ocultação..." },
              { key: "doacaoInoficiosa" as const, label: "Possível doação inoficiosa (Art. 2.002, CC)", descKey: "descricaoDoacaoInoficiosa" as const, placeholder: "Descreva a doação e os envolvidos..." },
              { key: "simulacaoNegocioJuridico" as const, label: "Simulação de negócio jurídico (Art. 167, CC)", descKey: "descricaoSimulacao" as const, placeholder: "Descreva o negócio simulado..." },
              { key: "alienacaoEmVida" as const, label: "Alienações em vida pelo de cujus (para análise de colação)", descKey: "descricaoAlienacao" as const, placeholder: "Descreva as alienações e beneficiários..." },
              { key: "posseExclusivaBens" as const, label: "Posse exclusiva de bens por herdeiro ou terceiro", descKey: "descricaoPosseExclusiva" as const, placeholder: "Descreva quem possui e quais bens..." },
              { key: "cobrancaFrutosAlugueis" as const, label: "Cobrança de frutos civis / aluguéis por posse exclusiva", descKey: "descricaoFrutos" as const, placeholder: "Descreva os frutos, valores estimados e marco temporal..." },
            ].map((item) => (
              <div key={item.key} className="space-y-2 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{item.label}</Label>
                  <Switch
                    checked={flags[item.key]}
                    onCheckedChange={(v) => setFlags({ ...flags, [item.key]: v })}
                  />
                </div>
                {flags[item.key] && (
                  <Textarea
                    value={flags[item.descKey]}
                    onChange={(e) => setFlags({ ...flags, [item.descKey]: e.target.value })}
                    placeholder={item.placeholder}
                    className="text-sm"
                    rows={3}
                  />
                )}
                {item.key === "posseExclusivaBens" && flags.posseExclusivaBens && (
                  <div className="space-y-1">
                    <Label className="text-xs">Nome do possuidor exclusivo</Label>
                    <Input
                      value={flags.possuidorExclusivo}
                      onChange={(e) => setFlags({ ...flags, possuidorExclusivo: e.target.value })}
                      placeholder="Nome do herdeiro ou terceiro"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Cessões e Heranças Cumulativas */}
      {etapa === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Cessões de Direitos Hereditários e Heranças Cumulativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cessões */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Cessões de Direitos Hereditários</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Registre cessões realizadas entre herdeiros ou a terceiros (Art. 1.793, CC). A cessão deve ser feita por escritura pública.
              </p>
              {cessoes.map((c, idx) => (
                <div key={c.id} className="border border-border rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Cessão {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => setCessoes(cessoes.filter(x => x.id !== c.id))} aria-label="Excluir cessão">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Cedente</Label>
                      <Input value={c.cedente} onChange={(e) => setCessoes(cessoes.map(x => x.id === c.id ? { ...x, cedente: e.target.value } : x))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cessionário</Label>
                      <Input value={c.cessionario} onChange={(e) => setCessoes(cessoes.map(x => x.id === c.id ? { ...x, cessionario: e.target.value } : x))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Percentual (%)</Label>
                      <Input type="number" value={c.percentual || ""} onChange={(e) => setCessoes(cessoes.map(x => x.id === c.id ? { ...x, percentual: Number(e.target.value) } : x))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={c.formalizada} onCheckedChange={(v) => setCessoes(cessoes.map(x => x.id === c.id ? { ...x, formalizada: !!v } : x))} />
                    <span className="text-xs">Formalizada por escritura pública</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCessao}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar Cessão
              </Button>
            </div>

            <Separator />

            {/* Heranças Cumulativas */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Heranças Cumulativas</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Registre falecimentos anteriores que geram acervos hereditários vinculados (heranças jacentes, acumuladas).
              </p>
              {herancasCumulativas.map((hc, idx) => (
                <div key={hc.id} className="border border-border rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Herança Cumulativa {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => setHerancasCumulativas(herancasCumulativas.filter(x => x.id !== hc.id))} aria-label="Excluir herança cumulativa">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome do falecido</Label>
                      <Input value={hc.nomeFalecido} onChange={(e) => setHerancasCumulativas(herancasCumulativas.map(x => x.id === hc.id ? { ...x, nomeFalecido: e.target.value } : x))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Data do falecimento</Label>
                      <Input type="date" value={hc.dataFalecimento} onChange={(e) => setHerancasCumulativas(herancasCumulativas.map(x => x.id === hc.id ? { ...x, dataFalecimento: e.target.value } : x))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Parentesco com de cujus</Label>
                      <Input value={hc.parentescoComDeCujus} onChange={(e) => setHerancasCumulativas(herancasCumulativas.map(x => x.id === hc.id ? { ...x, parentescoComDeCujus: e.target.value } : x))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox checked={hc.inventarioAberto} onCheckedChange={(v) => setHerancasCumulativas(herancasCumulativas.map(x => x.id === hc.id ? { ...x, inventarioAberto: !!v } : x))} />
                      Inventário já aberto
                    </label>
                    {hc.inventarioAberto && (
                      <Input
                        className="text-xs max-w-[200px]"
                        value={hc.numeroProcesso}
                        onChange={(e) => setHerancasCumulativas(herancasCumulativas.map(x => x.id === hc.id ? { ...x, numeroProcesso: e.target.value } : x))}
                        placeholder="Nº do processo"
                      />
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addHerancaCumulativa}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar Herança Cumulativa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Análise da Via */}
      {etapa === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Análise da Via e Natureza do Inventário
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
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {resultado.natureza === "litigioso" ? "LITIGIOSO" : "CONSENSUAL"}
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
                      <p className="text-lg font-bold text-foreground">{herdeiros.filter(h => !h.falecido && !h.renunciou).length}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-muted-foreground">Menores/Incapazes</p>
                      <p className="text-lg font-bold text-foreground">{herdeiros.filter((h) => h.menor || h.incapaz).length}</p>
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

                {/* Flags ativos */}
                {resultado.natureza === "litigioso" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Elementos de Litigiosidade Identificados</h4>
                    <div className="space-y-1">
                      {flags.desconhecimentoPatrimonial && <Badge variant="outline" className="mr-1">Desconhecimento patrimonial</Badge>}
                      {flags.ocultacaoPatrimonial && <Badge variant="destructive" className="mr-1">Ocultação patrimonial</Badge>}
                      {flags.doacaoInoficiosa && <Badge variant="destructive" className="mr-1">Doação inoficiosa</Badge>}
                      {flags.simulacaoNegocioJuridico && <Badge variant="destructive" className="mr-1">Simulação</Badge>}
                      {flags.conflitosEntreHerdeiros && <Badge variant="outline" className="mr-1">Conflito entre herdeiros</Badge>}
                      {flags.posseExclusivaBens && <Badge variant="outline" className="mr-1">Posse exclusiva</Badge>}
                      {flags.alienacaoEmVida && <Badge variant="outline" className="mr-1">Alienação em vida</Badge>}
                      {flags.cobrancaFrutosAlugueis && <Badge variant="outline" className="mr-1">Cobrança de frutos</Badge>}
                    </div>
                  </div>
                )}

                {cessoes.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Cessões Registradas: {cessoes.length}</h4>
                  </div>
                )}

                {herancasCumulativas.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Heranças Cumulativas: {herancasCumulativas.length}</h4>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 6: Checklist */}
      {etapa === 6 && (
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

      {/* Step 7: Diligências Investigativas */}
      {etapa === 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Diligências Investigativas
            </CardTitle>
            <CardDescription>
              Diligências classificadas por categoria, com fundamento legal e órgão destinatário.
              <Progress value={diligenciasProgress} className="h-2 mt-2" />
              <span className="text-xs mt-1 inline-block">{diligenciasProgress}% concluído</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(CATEGORIAS_DILIGENCIA).map(([cat, catLabel]) => {
              const items = diligencias.filter((d) => d.categoria === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-5">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    {catLabel}
                  </h4>
                  <div className="space-y-2">
                    {items.map((d) => (
                      <div key={d.id} className={`p-3 rounded-lg border transition-colors ${
                        d.concluido ? "bg-primary/5 border-primary/30" : "border-border hover:bg-muted/50"
                      }`}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={d.concluido}
                            onCheckedChange={(v) =>
                              setDiligencias(diligencias.map((x) =>
                                x.id === d.id ? { ...x, concluido: !!v } : x
                              ))
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm ${d.concluido ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {d.descricao}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-[10px]">{d.fundamentoLegal}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{d.orgaoDestinatario}</Badge>
                              <Badge variant={d.prioridade === "alta" ? "destructive" : d.prioridade === "media" ? "default" : "outline"} className="text-[10px]">
                                {d.prioridade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              );
            })}
            {diligencias.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Volte à etapa de Análise para gerar as diligências automaticamente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 8: Roteiro */}
      {etapa === 8 && (
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
