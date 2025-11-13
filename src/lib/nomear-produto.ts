export type TipoProduto = "colchao" | "baseBox" | "baseBoxBau"
export type TipoColchao =
  | "espumaD28"
  | "espumaD33"
  | "espumaD45"
  | "espumaD60"
  | "molasEnsacadas"
export type Medida =
  | "solteirinho"
  | "solteiro"
  | "solteiroKing"
  | "casal"
  | "queen"
  | "king"

export interface VariacaoBase {
  descricao: string
  cores: string[]
}

export interface DadosFormulario {
  tipoProduto: TipoProduto
  tipoColchao: TipoColchao
  nomeLinha: string
  marca: string
  medida: Medida
  variacoesBase: VariacaoBase[]
}

const mapaTipoColchao: Record<TipoColchao, string> = {
  espumaD28: "Espuma D28",
  espumaD33: "Espuma D33",
  espumaD45: "Espuma D45",
  espumaD60: "Espuma D60",
  molasEnsacadas: "Molas Ensacadas",
}

const mapaMedida: Record<Medida, string> = {
  solteirinho: "Solteirinho",
  solteiro: "Solteiro",
  solteiroKing: "Solteiro King",
  casal: "Casal",
  queen: "Queen",
  king: "King",
}

const mapaTipoProduto: Record<TipoProduto, string> = {
  colchao: "Colchão",
  baseBox: "Base Box",
  baseBoxBau: "Base Box Baú",
}

const normalizarEspacos = (texto: string) => texto.replace(/\s+/g, " ").trim()

export function montarNomeColchao(dados: DadosFormulario) {
  const tipoProduto = mapaTipoProduto.colchao
  const tipoColchao = mapaTipoColchao[dados.tipoColchao]
  const medida = mapaMedida[dados.medida]
  const nome = `${tipoProduto} de ${tipoColchao} ${dados.nomeLinha} da ${dados.marca} - ${medida}`
  return normalizarEspacos(nome)
}

export interface NomeKit {
  descricaoBase: string
  cor: string
  nomeCompleto: string
}

export function montarNomesKits(dados: DadosFormulario): NomeKit[] {
  const nomes: NomeKit[] = []
  const descricaoColchao = montarNomeColchao(dados).replace(/^Colchão de\s*/i, "Colchão de ")

  dados.variacoesBase.forEach((variacao) => {
    variacao.cores.forEach((cor) => {
      const nomeCompleto = normalizarEspacos(
        `${variacao.descricao} ${descricaoColchao} - ${cor}`,
      )
      nomes.push({
        descricaoBase: variacao.descricao,
        cor,
        nomeCompleto,
      })
    })
  })

  return nomes
}

export function montarDescricoesCompletas(dados: DadosFormulario) {
  return {
    nomeColchao: montarNomeColchao(dados),
    kits: montarNomesKits(dados),
  }
}
