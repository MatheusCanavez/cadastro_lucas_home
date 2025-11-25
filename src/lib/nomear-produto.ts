import type { TipoProduto, TipoColchao, Medida } from "@/types/produto"
import { opcoesCores, opcoesVariacoesBase, variacoesBasePadrao } from "@/data/opcoes"
import type { ValorVariacaoBase } from "@/data/opcoes"
import { pesoAuxiliares, pesoBaseCamaBox, pesoBaseCamaBoxBau } from "@/data/pesos"
export type { TipoProduto, TipoColchao, Medida } from "@/types/produto"

export interface VariacaoBase {
  variacaoId: ValorVariacaoBase
  cores: string[]
}

export interface DadosFormulario {
  tipoProduto: TipoProduto
  tipoColchao: TipoColchao
  nomeLinha: string
  marca: string
  corColchao: string
  medidas: Medida[]
  alturaColchao: number
  pillowOpcoes: string[]
  pesosColchao: Partial<Record<Medida, number>>
  usarCamaBox: boolean
  usarCamaBoxBau: boolean
  coresBasePadrao: string[]
  variacoesAuxiliares: VariacaoBase[]
}

const mapaTipoColchao: Record<TipoColchao, string> = {
  espuma: "Espuma",
  espumaD28: "Espuma D28",
  espumaD33: "Espuma D33",
  espumaD45: "Espuma D45",
  espumaD60: "Espuma D60",
  molasEnsacadas: "Molas Ensacadas",
}

const mapaMedidas: Record<
  Medida,
  {
    rotulo: string
    dimensoes: string
  }
> = {
  solteirinho: { rotulo: "Solteirinho", dimensoes: "78x188" },
  king: { rotulo: "King", dimensoes: "193x203" },
  solteiroKing: { rotulo: "Solteiro King", dimensoes: "96x203" },
  solteiro: { rotulo: "Solteiro", dimensoes: "88x188" },
  casal: { rotulo: "Casal", dimensoes: "138x188" },
  queen: { rotulo: "Queen", dimensoes: "158x198" },
}

const mapaTipoProduto: Record<TipoProduto, string> = {
  colchao: "Colchão",
  baseBox: "Base Box",
  baseBoxBau: "Base Box Baú",
}

const normalizarEspacos = (texto: string) => texto.replace(/\s+/g, " ").trim()

const descricaoBaseColchao = (dados: DadosFormulario) =>
  normalizarEspacos(
    `${mapaTipoProduto.colchao} de ${mapaTipoColchao[dados.tipoColchao]} ${
      dados.pillowOpcoes.length ? `${dados.pillowOpcoes.join(" ")} ` : ""
    }${dados.nomeLinha} da ${dados.marca}`,
  )

const mapaVariacoes = opcoesVariacoesBase.reduce<Record<string, (typeof opcoesVariacoesBase)[number]>>(
  (acc, variacao) => {
    acc[variacao.valor] = variacao
    return acc
  },
  {},
)

export interface NomeColchao {
  medida: Medida
  rotuloMedida: string
  dimensoes: string
  alturaColchao: number
  cor: string
  corCodigo: string
  peso: number
  nomeCompleto: string
}

const mapaCores = opcoesCores.reduce<Record<string, string>>((acc, cor) => {
  acc[cor.codigo] = cor.rotulo
  return acc
}, {})

export function montarNomesColchoes(dados: DadosFormulario): NomeColchao[] {
  const descricao = descricaoBaseColchao(dados)
  return dados.medidas.map((medida) => {
    const { rotulo, dimensoes } = mapaMedidas[medida]
    const corRotulo = mapaCores[dados.corColchao] ?? dados.corColchao
    const peso = Number(dados.pesosColchao?.[medida] ?? 0)
    const nomeCompleto = normalizarEspacos(
      `${descricao} ${rotulo} ${dimensoes}x${dados.alturaColchao}cm - ${corRotulo}`,
    )
    return {
      medida,
      rotuloMedida: rotulo,
      dimensoes,
      alturaColchao: dados.alturaColchao,
      cor: corRotulo,
      corCodigo: dados.corColchao,
      peso,
      nomeCompleto,
    }
  })
}

export interface NomeKit {
  descricaoBase: string
  cor: string
  corCodigo: string
  alturaBase: number
  alturaTotal: number
  auxiliarLabel?: string
  variacaoId: string
  medida: Medida
  rotuloMedida: string
  dimensoes: string
  pesoTotal: number
  nomeCompleto: string
}

export function montarNomesKits(dados: DadosFormulario): NomeKit[] {
  const nomes: NomeKit[] = []
  const descricao = descricaoBaseColchao(dados)
  const colchoes = montarNomesColchoes(dados)

  const adicionarVariacao = (info: (typeof opcoesVariacoesBase)[number], cores: string[]) => {
    if (!info || cores.length === 0) return
    const coresValidas = info.coresPermitidas?.length
      ? cores.filter((codigo) => info.coresPermitidas?.includes(codigo))
      : cores
    if (!coresValidas.length) return
    const colchoesValidos = info.exigeMedidaSolteiro
      ? colchoes.filter((colchao) => colchao.medida === "solteiro")
      : colchoes
    if (!colchoesValidos.length) {
      return
    }
    coresValidas.forEach((codigoCor) => {
      const corRotulo = mapaCores[codigoCor] ?? codigoCor
      colchoesValidos.forEach((colchao) => {
        const alturaTotal = info.altura + colchao.alturaColchao
        let pesoBase = 0
        if (info.categoria === "base") {
          if (info.valor === "cama-box") {
            pesoBase = pesoBaseCamaBox[colchao.medida] ?? 0
          } else if (info.valor === "cama-box-bau") {
            pesoBase = pesoBaseCamaBoxBau[colchao.medida] ?? 0
          }
        } else {
          pesoBase = pesoAuxiliares[info.valor] ?? 0
        }
        const pesoTotal = pesoBase + colchao.peso
        const auxiliarTexto = info.auxiliarLabel ? ` + ${info.auxiliarLabel}` : ""
        const nomeCompleto = normalizarEspacos(
          `${info.baseLabel} com ${descricao}${auxiliarTexto} ${colchao.rotuloMedida} ${colchao.dimensoes}x${alturaTotal}cm - ${corRotulo}`,
        )
        nomes.push({
          descricaoBase: info.rotulo,
          cor: corRotulo,
          corCodigo: codigoCor,
          alturaBase: info.altura,
          alturaTotal,
          auxiliarLabel: info.auxiliarLabel,
          variacaoId: info.valor,
          medida: colchao.medida,
          rotuloMedida: colchao.rotuloMedida,
          dimensoes: colchao.dimensoes,
          pesoTotal,
          nomeCompleto,
        })
      })
    })
  }

  if (dados.usarCamaBox) {
    adicionarVariacao(variacoesBasePadrao.find((item) => item.valor === "cama-box")!, dados.coresBasePadrao)
  }

  if (dados.usarCamaBoxBau) {
    adicionarVariacao(variacoesBasePadrao.find((item) => item.valor === "cama-box-bau")!, dados.coresBasePadrao)
  }

  dados.variacoesAuxiliares.forEach((variacao) => {
    const info = mapaVariacoes[variacao.variacaoId]
    if (!info) return
    adicionarVariacao(info, variacao.cores)
  })

  return nomes
}

export function montarDescricoesCompletas(dados: DadosFormulario) {
  return {
    colchoes: montarNomesColchoes(dados),
    kits: montarNomesKits(dados),
  }
}
