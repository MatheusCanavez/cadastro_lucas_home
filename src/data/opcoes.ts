import type { Medida, TipoColchao, TipoProduto } from "@/lib/nomear-produto"

export interface OpcaoFormulario<T extends string = string> {
  valor: T
  rotulo: string
}

export const opcoesTipoProduto: OpcaoFormulario<TipoProduto>[] = [
  { valor: "colchao", rotulo: "Colchão" },
  { valor: "baseBox", rotulo: "Base Box" },
  { valor: "baseBoxBau", rotulo: "Base Box Baú" },
]

export const opcoesTipoColchao: OpcaoFormulario<TipoColchao>[] = [
  { valor: "espumaD28", rotulo: "Espuma D28" },
  { valor: "espumaD33", rotulo: "Espuma D33" },
  { valor: "espumaD45", rotulo: "Espuma D45" },
  { valor: "espumaD60", rotulo: "Espuma D60" },
  { valor: "molasEnsacadas", rotulo: "Molas Ensacadas" },
]

export const opcoesMedidas: OpcaoFormulario<Medida>[] = [
  { valor: "solteirinho", rotulo: "Solteirinho" },
  { valor: "solteiro", rotulo: "Solteiro" },
  { valor: "solteiroKing", rotulo: "Solteiro King" },
  { valor: "casal", rotulo: "Casal" },
  { valor: "queen", rotulo: "Queen" },
  { valor: "king", rotulo: "King" },
]

export interface OpcaoCorBase extends OpcaoFormulario {
  hex?: string
}

export const opcoesCoresBase: OpcaoCorBase[] = [
  { valor: "Branco", rotulo: "Branco", hex: "#f5f5f5" },
  { valor: "Preto", rotulo: "Preto", hex: "#0f0f0f" },
  { valor: "Marrom", rotulo: "Marrom", hex: "#6b3f24" },
  { valor: "Cinza", rotulo: "Cinza", hex: "#8C8C8C" },
  { valor: "Bege", rotulo: "Bege", hex: "#d9c3a3" },
  { valor: "Multicolor", rotulo: "Multicolor" },
]

export interface OpcaoVariacaoBase {
  valor: string
  rotulo: string
}

export const opcoesVariacoesBase: OpcaoVariacaoBase[] = [
  { valor: "Cama Box", rotulo: "Cama Box" },
  { valor: "Cama Box Baú", rotulo: "Cama Box Baú" },
  { valor: "Cama Box com Auxiliar", rotulo: "Cama Box com Auxiliar" },
  { valor: "Cama Box Baú com Auxiliar", rotulo: "Cama Box Baú com Auxiliar" },
]
