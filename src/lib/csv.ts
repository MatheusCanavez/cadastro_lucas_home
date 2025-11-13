import { Parser, ParserOptions, transforms } from "json2csv"

export type ValorCampo = string | number | boolean | null | undefined
export type RegistroProduto = Record<string, ValorCampo>

const opcoesPadrao: ParserOptions<RegistroProduto> = {
  withBOM: true,
  transforms: [transforms.flatten({ objects: true })],
}

export function gerarCsv(produtos: RegistroProduto[], opcoes?: ParserOptions<RegistroProduto>) {
  const parser = new Parser({
    ...opcoesPadrao,
    ...opcoes,
  })

  if (!produtos.length) {
    return ""
  }

  return parser.parse(produtos)
}

export function gerarArquivoCsv(produtos: RegistroProduto[], opcoes?: ParserOptions<RegistroProduto>) {
  const conteudo = gerarCsv(produtos, opcoes)
  return new Blob([conteudo], { type: "text/csv;charset=utf-8;" })
}
