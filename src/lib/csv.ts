export type ValorCampo = string | number | boolean | null | undefined
export type RegistroProduto = Record<string, ValorCampo>

const SEPARADOR = ";"
const precisaAspas = (valor: string) => /[\"\r\n;]/.test(valor)

const prepararValor = (valor: ValorCampo) => {
  if (valor === null || valor === undefined) {
    return ""
  }
  const texto = String(valor)
  if (!precisaAspas(texto)) {
    return texto
  }
  return `"${texto.replace(/"/g, '""')}"`
}

const resolverColunas = (registros: RegistroProduto[], colunas?: string[]) => {
  if (colunas?.length) {
    return colunas
  }
  const set = new Set<string>()
  registros.forEach((registro) => {
    Object.keys(registro).forEach((campo) => set.add(campo))
  })
  return Array.from(set)
}

export function gerarCsv(produtos: RegistroProduto[], colunas?: string[]) {
  if (!produtos.length) {
    return ""
  }

  const campos = resolverColunas(produtos, colunas)
  const linhas = [campos.join(SEPARADOR)]

  produtos.forEach((registro) => {
    const linha = campos.map((campo) => prepararValor(registro[campo]))
    linhas.push(linha.join(SEPARADOR))
  })

  return `\ufeff${linhas.join("\r\n")}`
}

export function gerarArquivoCsv(produtos: RegistroProduto[], colunas?: string[]) {
  const conteudo = gerarCsv(produtos, colunas)
  return new Blob([conteudo], { type: "text/csv;charset=utf-8;" })
}
