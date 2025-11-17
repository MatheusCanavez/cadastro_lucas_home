import type { Medida, TipoColchao, TipoProduto } from "@/lib/nomear-produto"

export interface OpcaoFormulario<T extends string = string> {
  valor: T
  rotulo: string
}

export const opcoesTipoProduto: OpcaoFormulario<TipoProduto>[] = [
  { valor: "colchao", rotulo: "Colchao" },
  { valor: "baseBox", rotulo: "Base Box" },
  { valor: "baseBoxBau", rotulo: "Base Box Bau" },
]

export const opcoesTipoColchao: OpcaoFormulario<TipoColchao>[] = [
  { valor: "espuma", rotulo: "Espuma" },
  { valor: "espumaD28", rotulo: "Espuma D28" },
  { valor: "espumaD33", rotulo: "Espuma D33" },
  { valor: "espumaD45", rotulo: "Espuma D45" },
  { valor: "espumaD60", rotulo: "Espuma D60" },
  { valor: "molasEnsacadas", rotulo: "Molas Ensacadas" },
]

export interface OpcaoMedida extends OpcaoFormulario<Medida> {
  dimensoes: string
}

export const opcoesMedidas: OpcaoMedida[] = [
  { valor: "solteiro", rotulo: "Solteiro", dimensoes: "88x188" },
  { valor: "solteirinho", rotulo: "Solteirinho", dimensoes: "78x188" },
  { valor: "casal", rotulo: "Casal", dimensoes: "138x188" },
  { valor: "solteiroKing", rotulo: "Solteiro King", dimensoes: "96x203" },
  { valor: "queen", rotulo: "Queen", dimensoes: "158x198" },
  { valor: "king", rotulo: "King", dimensoes: "193x203" },
]

export interface OpcaoCor {
  codigo: string
  rotulo: string
}

export const opcoesCores: OpcaoCor[] = [
  { codigo: "00", rotulo: "Preto" },
  { codigo: "01", rotulo: "Branco" },
  { codigo: "02", rotulo: "Marrom" },
  { codigo: "03", rotulo: "Cinza" },
  { codigo: "04", rotulo: "Multicolor" },
  { codigo: "18", rotulo: "Bege" },
]

export interface OpcaoPillow extends OpcaoFormulario {
  texto: string
}

export const opcoesPillow: OpcaoPillow[] = [
  { valor: "pillowIn", rotulo: "Pillow In", texto: "Pillow In" },
  { valor: "pillowTop", rotulo: "Pillow Top", texto: "Pillow Top" },
  { valor: "euroPillow", rotulo: "Euro Pillow", texto: "Euro Pillow" },
  { valor: "doubleFace", rotulo: "Double Face", texto: "Double Face" },
  { valor: "oneFace", rotulo: "One Face", texto: "One Face" },
]

export interface OpcaoMarca {
  codigo: string
  rotulo: string
}

export const opcoesMarcas: OpcaoMarca[] = [
  { codigo: "0001", rotulo: "Ortobom" },
  { codigo: "0002", rotulo: "Probel" },
  { codigo: "0003", rotulo: "Castor" },
  { codigo: "0004", rotulo: "Anjos" },
  { codigo: "0007", rotulo: "Confort Prime" },
  { codigo: "0041", rotulo: "Gazin" },
  { codigo: "0042", rotulo: "Lucas Home" },
  { codigo: "0045", rotulo: "Umaflex" },
  { codigo: "0049", rotulo: "Hellen" },
  { codigo: "0060", rotulo: "Damassu" },
  { codigo: "0061", rotulo: "Tsm" },
  { codigo: "0062", rotulo: "Polar" },
  { codigo: "0063", rotulo: "Cristalflex" },
  { codigo: "0065", rotulo: "SMP" },
  { codigo: "0066", rotulo: "Demonstração Amostra" },
  { codigo: "0067", rotulo: "Bed'S" },
  { codigo: "0068", rotulo: "Topazio" },
]

export type CategoriaVariacao = "base" | "auxiliar"

export interface OpcaoVariacaoBase {
  valor: string
  rotulo: string
  baseLabel: string
  altura: number
  auxiliarLabel?: string
  exigeMedidaSolteiro?: boolean
  coresPermitidas?: string[]
  categoria: CategoriaVariacao
}

export const opcoesVariacoesBase = [
  {
    valor: "cama-box",
    rotulo: "Cama Box",
    baseLabel: "Cama Box",
    altura: 39,
    categoria: "base",
  },
  {
    valor: "cama-box-bau",
    rotulo: "Cama Box Bau",
    baseLabel: "Cama Box Bau",
    altura: 42,
    categoria: "base",
  },
  {
    valor: "cama-box-aux-espuma",
    rotulo: "Cama Box com Auxiliar de Espuma",
    baseLabel: "Cama Box",
    altura: 49,
    auxiliarLabel: "Auxiliar de Espuma",
    exigeMedidaSolteiro: true,
    coresPermitidas: ["01", "02", "03", "18"],
    categoria: "auxiliar",
  },
  {
    valor: "cama-box-aux-molas",
    rotulo: "Cama Box com Auxiliar de Molas",
    baseLabel: "Cama Box",
    altura: 49,
    auxiliarLabel: "Auxiliar de Molas",
    exigeMedidaSolteiro: true,
    coresPermitidas: ["01", "02", "03", "18"],
    categoria: "auxiliar",
  },
  {
    valor: "cama-box-bau-aux-espuma",
    rotulo: "Cama Box Bau com Auxiliar de Espuma",
    baseLabel: "Cama Box Bau",
    altura: 44,
    auxiliarLabel: "Auxiliar de Espuma",
    exigeMedidaSolteiro: true,
    coresPermitidas: ["00", "01", "02", "03"],
    categoria: "auxiliar",
  },
  {
    valor: "cama-box-bau-aux-molas",
    rotulo: "Cama Box Bau com Auxiliar de Molas",
    baseLabel: "Cama Box Bau",
    altura: 44,
    auxiliarLabel: "Auxiliar de Molas",
    exigeMedidaSolteiro: true,
    coresPermitidas: ["00", "01", "02", "03"],
    categoria: "auxiliar",
  },
] as const satisfies ReadonlyArray<OpcaoVariacaoBase>

export type ValorVariacaoBase = (typeof opcoesVariacoesBase)[number]["valor"]

export const variacoesBasePadrao = opcoesVariacoesBase.filter((item) => item.categoria === "base")
export const variacoesAuxiliares = opcoesVariacoesBase.filter((item) => item.categoria === "auxiliar")
