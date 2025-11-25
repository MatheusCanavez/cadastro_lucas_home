import type { Medida } from "@/types/produto"
import type { ValorVariacaoBase } from "@/data/opcoes"

export const pesoBaseCamaBox: Partial<Record<Medida, number>> = {
  solteirinho: 18.6,
  solteiro: 22.1,
  solteiroKing: 24.1,
  casal: 30,
  queen: 39,
  king: 48.2,
}

export const pesoBaseCamaBoxBau: Partial<Record<Medida, number>> = {
  solteirinho: 40.2,
  solteiro: 42.9,
  solteiroKing: 44.5,
  casal: 58.5,
  queen: 73,
  king: 80.4,
}

export const pesoAuxiliares: Partial<Record<ValorVariacaoBase, number>> = {
  "cama-box-aux-espuma": 30,
  "cama-box-aux-molas": 35,
  "cama-box-bau-aux-espuma": 43.9,
  "cama-box-bau-aux-molas": 57.9,
}
