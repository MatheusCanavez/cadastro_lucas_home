const PREFIXO = "7777"

const normalizarSequencial = (sequencial: string) => {
  const apenasNumeros = sequencial.replace(/\D/g, "")
  const tamanhoDesejado = 12 - PREFIXO.length
  const complemento = Math.max(0, tamanhoDesejado - apenasNumeros.length)
  return PREFIXO + "0".repeat(complemento) + apenasNumeros
}

const calcularDigitoVerificador = (codigo12: string) => {
  let soma = 0
  for (let i = 0; i < codigo12.length; i++) {
    const digito = Number(codigo12[i])
    const posicao = i + 1
    soma += posicao % 2 === 0 ? digito * 3 : digito
  }
  const resto = soma % 10
  return resto === 0 ? 0 : 10 - resto
}

export const gerarEan13 = (sequencial: number | string) => {
  const base = normalizarSequencial(String(sequencial))
  const digito = calcularDigitoVerificador(base)
  return `${base}${digito}`
}
