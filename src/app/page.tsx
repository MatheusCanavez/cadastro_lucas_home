"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { montarDescricoesCompletas, type DadosFormulario } from "@/lib/nomear-produto"
import type { RegistroProduto } from "@/lib/csv"
import {
  opcoesCores,
  opcoesMedidas,
  opcoesTipoColchao,
  opcoesTipoProduto,
  opcoesPillow,
  opcoesMarcas,
  opcoesVariacoesBase,
  variacoesAuxiliares,
  variacoesBasePadrao,
} from "@/data/opcoes"
import type { ValorVariacaoBase } from "@/data/opcoes"
import { gerarEan13 } from "@/lib/ean"

const CODIGO_PADRAO = "XXX"
const POSIPI_COLCHAO = "94042900"
const POSIPI_KIT = "94042100"
const PADRAO_XPRDSKU = "1"
const PADRAO_XPRDPAI = ""

const criarGeradorSequencial = (ultimoNumero: number) => {
  let sequencia = Number.isFinite(ultimoNumero) ? ultimoNumero : 0
  return {
    proximo: () => {
      sequencia += 1
      return sequencia
    },
    atual: () => sequencia,
  }
}

const mapaVariacoesBase = opcoesVariacoesBase.reduce<
  Record<ValorVariacaoBase, (typeof opcoesVariacoesBase)[number]>
>((acc, variacao) => {
  acc[variacao.valor] = variacao
  return acc
}, {} as Record<ValorVariacaoBase, (typeof opcoesVariacoesBase)[number]>)

const valoresVariacoesAuxiliares = variacoesAuxiliares.map((opcao) => opcao.valor) as [
  ValorVariacaoBase,
  ...ValorVariacaoBase[],
]
const variacaoEnum = z.enum(valoresVariacoesAuxiliares)

const esquemaVariacao = z.object({
  variacaoId: variacaoEnum,
  cores: z.array(z.string()).min(1, "Selecione ao menos uma cor"),
})

const valoresMedidas = ["solteirinho", "solteiroKing", "solteiro", "casal", "queen", "king"] as const
const medidasEnum = z.enum(valoresMedidas)

const valoresPillow = opcoesPillow.map((opcao) => opcao.valor) as [string, ...string[]]
const pillowEnum = z.enum(valoresPillow)

const valoresMarcas = opcoesMarcas.map((marca) => marca.codigo) as [string, ...string[]]
const marcaEnum = z.enum(valoresMarcas)

const esquemaFormulario = z
  .object({
    tipoProduto: z.enum(["colchao", "baseBox", "baseBoxBau"]),
    corColchao: z.string().min(1, "Informe a cor do colchao"),
    tipoColchao: z.enum(["espuma", "espumaD28", "espumaD33", "espumaD45", "espumaD60", "molasEnsacadas"]),
    nomeLinha: z.string().min(1, "Informe o nome da linha"),
    marcaCodigo: marcaEnum,
    pillowOpcoes: z.array(pillowEnum),
    sequencialInicial: z.coerce.number().min(0, "Informe o ultimo codigo sequencial"),
    alturaColchao: z.coerce.number().min(5, "Informe a altura do colchao em cm"),
    medidas: z.array(medidasEnum).min(1, "Selecione ao menos uma medida"),
    usarCamaBox: z.boolean().default(false),
    usarCamaBoxBau: z.boolean().default(false),
    coresBasePadrao: z.array(z.string()),
    variacoesAuxiliares: z.array(esquemaVariacao),
  })
  .superRefine((dados, ctx) => {
    if ((dados.usarCamaBox || dados.usarCamaBoxBau) && dados.coresBasePadrao.length === 0) {
      ctx.addIssue({
        path: ["coresBasePadrao"],
        code: z.ZodIssueCode.custom,
        message: "Selecione ao menos uma cor para as bases",
      })
    }
  })

type ValoresFormulario = z.infer<typeof esquemaFormulario>

export default function PaginaCadastro() {
  const [estadoEnvio, setEstadoEnvio] = useState<"idle" | "enviando" | "ok" | "erro">("idle")
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      tipoProduto: "colchao",
      corColchao: opcoesCores[0]?.codigo ?? "",
      tipoColchao: "espumaD60",
      nomeLinha: "",
      marcaCodigo: opcoesMarcas[0]?.codigo ?? "",
      pillowOpcoes: [],
      sequencialInicial: 0,
      alturaColchao: 20,
      medidas: ["solteiro", "casal", "queen"],
      usarCamaBox: false,
      usarCamaBoxBau: false,
      coresBasePadrao: [],
      variacoesAuxiliares: [],
    },
  })

  const { fields: variacoesAuxFields, append, remove } = useFieldArray({
    control: form.control,
    name: "variacoesAuxiliares",
  })

  const dadosObservados = form.watch()

  const converterParaDadosNome = (valor: ValoresFormulario): DadosFormulario => {
    const { marcaCodigo, pillowOpcoes, ...restante } = valor
    const marcaInfo = opcoesMarcas.find((marca) => marca.codigo === marcaCodigo)
    const pillowTextos = pillowOpcoes
      .map((pillow) => opcoesPillow.find((item) => item.valor === pillow)?.texto)
      .filter(Boolean) as string[]
    return {
      ...restante,
      marca: marcaInfo?.rotulo ?? marcaCodigo,
      pillowOpcoes: pillowTextos,
    }
  }

  const descricoes = useMemo(() => {
    const validacao = esquemaFormulario.safeParse(dadosObservados)
    if (!validacao.success) {
      return null
    }
    return montarDescricoesCompletas(converterParaDadosNome(validacao.data))
  }, [dadosObservados])

  const baseSequencialPreview = Number.isFinite(Number(dadosObservados?.sequencialInicial))
    ? Number(dadosObservados.sequencialInicial)
    : 0
  const geradorSequencialPreview = criarGeradorSequencial(baseSequencialPreview)

  async function aoEnviar(dados: ValoresFormulario) {
    try {
      setEstadoEnvio("enviando")
      const nomes = montarDescricoesCompletas(converterParaDadosNome(dados))
      const marcaInfo = opcoesMarcas.find((marca) => marca.codigo === dados.marcaCodigo)
      const codigoMarca = marcaInfo?.codigo ?? ""
      const camposMarca = {
        B1_GRUPO: codigoMarca,
        B1_XMARCA: codigoMarca,
      }
      const geradorSequencial = criarGeradorSequencial(dados.sequencialInicial)
      const registrosColchoes = nomes.colchoes.map((colchao) => {
        const codigoAnt = geradorSequencial.proximo()
        return {
          tipo: "colchao",
          B1_DESC: colchao.nomeCompleto,
          B1_COD: CODIGO_PADRAO,
          B1_XCODANT: codigoAnt,
          B1_TIPO: "RC",
          B1_POSIPI: POSIPI_COLCHAO,
          B1_XPRDSKU: PADRAO_XPRDSKU,
          B1_XPRDPAI: PADRAO_XPRDPAI,
          B1_XSUBGRU: colchao.corCodigo,
          B1_CODBAR: gerarEan13(codigoAnt),
          cor: colchao.cor,
          medida: colchao.rotuloMedida,
          dimensoes: colchao.dimensoes,
          alturaColchao: colchao.alturaColchao,
          origem: "formulario",
          ...camposMarca,
        }
      })

      const registrosKits = nomes.kits.map((kit) => {
        const codigoAnt = geradorSequencial.proximo()
        return {
          tipo: "kit",
          B1_DESC: kit.nomeCompleto,
          B1_COD: CODIGO_PADRAO,
          B1_XCODANT: codigoAnt,
          B1_TIPO: "KT",
          B1_POSIPI: POSIPI_KIT,
          B1_XPRDSKU: PADRAO_XPRDSKU,
          B1_XPRDPAI: PADRAO_XPRDPAI,
          B1_XSUBGRU: kit.corCodigo,
          B1_CODBAR: gerarEan13(codigoAnt),
          variacaoId: kit.variacaoId,
          auxiliar: kit.auxiliarLabel ?? null,
          descricaoBase: kit.descricaoBase,
          cor: kit.cor,
          medida: kit.rotuloMedida,
          dimensoes: kit.dimensoes,
          alturaBase: kit.alturaBase,
          alturaTotal: kit.alturaTotal,
          ...camposMarca,
        }
      })

      const registros: RegistroProduto[] = [...registrosColchoes, ...registrosKits]

      const resposta = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registros),
      })

      if (!resposta.ok) {
        const mensagem = await resposta.text()
        throw new Error(mensagem || "Erro ao salvar no banco local")
      }

      setEstadoEnvio("ok")
      form.reset({
        ...dados,
        sequencialInicial: geradorSequencial.atual(),
      })
    } catch (erro) {
      console.error(erro)
      setEstadoEnvio("erro")
    }
  }

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="container mx-auto grid gap-6 px-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 space-y-1">
            <p className="text-xs uppercase text-muted-foreground">Cadastro</p>
            <h1 className="text-2xl font-semibold">Gerar descricoes</h1>
            <p className="text-sm text-muted-foreground">
              Preencha as informacoes para montar o nome dos produtos e suas variacoes.
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(aoEnviar)}>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="tipoProduto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {opcoesTipoProduto.map((opcao) => (
                            <SelectItem key={opcao.valor} value={opcao.valor}>
                              {opcao.rotulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="corColchao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do colchão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {opcoesCores.map((cor) => (
                            <SelectItem key={cor.codigo} value={cor.codigo}>
                              {cor.codigo} - {cor.rotulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alturaColchao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura do colchao (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tipoColchao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do colchao</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        {opcoesTipoColchao.map((opcao) => (
                          <FormItem
                            key={opcao.valor}
                            className="flex items-center space-x-3 space-y-0 rounded-lg border p-3"
                          >
                            <FormControl>
                              <RadioGroupItem value={opcao.valor} />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">{opcao.rotulo}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nomeLinha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da linha</FormLabel>
                      <FormControl>
                        <Input placeholder="Force Dream" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marcaCodigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {opcoesMarcas.map((marca) => (
                            <SelectItem key={marca.codigo} value={marca.codigo}>
                              {marca.codigo} - {marca.rotulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pillowOpcoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adicionais do colchão</FormLabel>
                    <FormDescription>Selecione os acabamentos que serão adicionados após o tipo do colchão.</FormDescription>
                    <div className="grid grid-cols-2 gap-3">
                      {opcoesPillow.map((opcao) => {
                        const selecionada = field.value?.includes(opcao.valor) ?? false
                        return (
                          <label
                            key={opcao.valor}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                          >
                            <Checkbox
                              checked={selecionada}
                              onCheckedChange={(checado) => {
                                const proximo = new Set(field.value ?? [])
                                if (checado === true) {
                                  proximo.add(opcao.valor)
                                } else {
                                  proximo.delete(opcao.valor)
                                }
                                field.onChange(Array.from(proximo))
                              }}
                            />
                            <span>{opcao.rotulo}</span>
                          </label>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
              <FormField
                control={form.control}
                name="sequencialInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código sequencial inicial (B1_XCODANT)</FormLabel>
                    <FormDescription>
                      Informe o último número já utilizado no ERP. Os próximos serão calculados automaticamente.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                        
              <FormField
                control={form.control}
                name="medidas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medidas</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {opcoesMedidas.map((opcao) => {
                        const selecionada = field.value?.includes(opcao.valor) ?? false
                        return (
                          <label
                            key={opcao.valor}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                          >
                            <Checkbox
                              checked={selecionada}
                              onCheckedChange={(checado) => {
                                const proximo = new Set(field.value ?? [])
                                if (checado === true) {
                                  proximo.add(opcao.valor)
                                } else {
                                  proximo.delete(opcao.valor)
                                }
                                field.onChange(Array.from(proximo))
                              }}
                            />
                            <span className="flex flex-col">
                              <span className="font-medium">{opcao.rotulo}</span>
                              <span className="text-xs text-muted-foreground">{opcao.dimensoes} cm</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <div className="space-y-4 rounded-xl border p-4">
                  <div>
                    <h2 className="text-lg font-semibold">Camas Box padrao</h2>
                    <p className="text-sm text-muted-foreground">
                      Marque quais modelos deseja gerar e escolha as cores. As mesmas cores serao aplicadas ao Cama Box
                      e Cama Box Bau.
                    </p>
                  </div>

                  {variacoesBasePadrao.map((variacao) => (
                    <FormField
                      key={variacao.valor}
                      control={form.control}
                      name={variacao.valor === "cama-box" ? "usarCamaBox" : "usarCamaBoxBau"}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel className="text-base">{variacao.rotulo}</FormLabel>
                            <FormDescription>{variacao.baseLabel}</FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checado) => field.onChange(checado === true)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    control={form.control}
                    name="coresBasePadrao"
                    render={({ field }) => {
                      const ativo = dadosObservados.usarCamaBox || dadosObservados.usarCamaBoxBau
                      return (
                        <FormItem>
                          <FormLabel>Cores das bases</FormLabel>
                          <FormDescription>
                            Essas cores serao usadas em todas as camas box selecionadas.
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-3">
                            {opcoesCores.map((cor) => {
                              const selecionada = field.value?.includes(cor.codigo) ?? false
                              return (
                                <label
                                  key={`base-${cor.codigo}`}
                                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm"
                                >
                                  <Checkbox
                                    checked={selecionada}
                                    disabled={!ativo}
                                    onCheckedChange={(checado) => {
                                      if (!ativo) return
                                      const proximo = new Set(field.value ?? [])
                                      if (checado === true) {
                                        proximo.add(cor.codigo)
                                      } else {
                                        proximo.delete(cor.codigo)
                                      }
                                      field.onChange(Array.from(proximo))
                                    }}
                                  />
                                  <span>
                                    {cor.codigo} - {cor.rotulo}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>

                <div className="space-y-4 rounded-xl border p-4">
                  <div>
                    <h2 className="text-lg font-semibold">Variacoes com auxiliar</h2>
                    <p className="text-sm text-muted-foreground">
                      Disponiveis apenas para medidas solteiro. Adicione apenas as combinacoes necessarias.
                    </p>
                  </div>

                  {variacoesAuxFields.map((fieldItem, index) => {
                    const info = mapaVariacoesBase[fieldItem.variacaoId as ValorVariacaoBase]
                    const coresDisponiveis = info?.coresPermitidas?.length
                      ? opcoesCores.filter((cor) => info.coresPermitidas?.includes(cor.codigo))
                      : opcoesCores

                    return (
                      <div key={fieldItem.id} className="space-y-4 rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-semibold">{info?.rotulo ?? `Variacao ${index + 1}`}</p>
                            {info?.auxiliarLabel && (
                              <p className="text-xs text-muted-foreground">
                                {info.auxiliarLabel}
                                {info.exigeMedidaSolteiro ? " · Disponivel apenas para medidas solteiro." : ""}
                              </p>
                            )}
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            Remover
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name={`variacoesAuxiliares.${index}.variacaoId`}
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <FormControl>
                                <input type="hidden" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variacoesAuxiliares.${index}.cores`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cores</FormLabel>
                              <div className="grid grid-cols-2 gap-3">
                                {coresDisponiveis.map((cor) => {
                                  const selecionada = field.value?.includes(cor.codigo) ?? false
                                  return (
                                    <label
                                      key={`${fieldItem.id}-${cor.codigo}`}
                                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm"
                                    >
                                      <Checkbox
                                        checked={selecionada}
                                        onCheckedChange={(checado) => {
                                          const proximo = new Set(field.value ?? [])
                                          if (checado === true) {
                                            proximo.add(cor.codigo)
                                          } else {
                                            proximo.delete(cor.codigo)
                                          }
                                          field.onChange(Array.from(proximo))
                                        }}
                                      />
                                      <span>
                                        {cor.codigo} - {cor.rotulo}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )
                  })}

                  <div className="space-y-2 pt-2">
                    {variacoesAuxiliares
                      .filter((opcao) => !variacoesAuxFields.some((item) => item.variacaoId === opcao.valor))
                      .map((opcao) => (
                        <Button
                          key={opcao.valor}
                          type="button"
                          variant="outline"
                          onClick={() => append({ variacaoId: opcao.valor, cores: [] })}
                        >
                          Adicionar {opcao.rotulo}
                        </Button>
                      ))}
                    {variacoesAuxiliares.every((opcao) =>
                      variacoesAuxFields.some((item) => item.variacaoId === opcao.valor),
                    ) && (
                      <p className="text-sm text-muted-foreground">
                        Todas as variacoes com auxiliar ja foram adicionadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={estadoEnvio === "enviando"}>
                  {estadoEnvio === "enviando" ? "Salvando..." : "Salvar no banco"}
                </Button>
                {estadoEnvio === "ok" && (
                  <p className="text-sm text-emerald-600">Produtos salvos com sucesso.</p>
                )}
                {estadoEnvio === "erro" && (
                  <p className="text-sm text-destructive">Erro ao salvar, tente novamente.</p>
                )}
              </div>
            </form>
          </Form>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pre-visualizacao</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Os nomes sao atualizados conforme o preenchimento do formulario.
          </p>

          {descricoes ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm uppercase text-muted-foreground">Colchoes avulsos</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {descricoes.colchoes.map((colchao) => (
                    <li key={`${colchao.medida}-${colchao.dimensoes}`} className="rounded-lg border p-3">
                      <p className="font-medium">{colchao.nomeCompleto}</p>
                      <p className="text-xs text-muted-foreground">
                        Código: {CODIGO_PADRAO} | B1_XCODANT: {geradorSequencialPreview.proximo()} | Altura: {colchao.alturaColchao} cm | Medida: {colchao.rotuloMedida} | Cor: {colchao.cor} ({colchao.corCodigo}) | EAN: {gerarEan13(geradorSequencialPreview.atual())}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm uppercase text-muted-foreground">Kits combinados</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {descricoes.kits.map((kit, index) => (
                    <li key={`${kit.descricaoBase}-${kit.cor}-${kit.medida}-${index}`} className="rounded-lg border p-3">
                      <p className="font-medium">{kit.nomeCompleto}</p>
                      <p className="text-xs text-muted-foreground">
                        Código: {CODIGO_PADRAO} | B1_XCODANT: {geradorSequencialPreview.proximo()} | Base: {kit.descricaoBase} ({kit.alturaBase} cm)
                        {kit.auxiliarLabel ? ` | ${kit.auxiliarLabel}` : ""} | Cor: {kit.cor} ({kit.corCodigo}) | Altura total:{" "} 
                        {kit.alturaTotal} cm | EAN: {gerarEan13(geradorSequencialPreview.atual())}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Preencha o formulario para ver os resultados.</p>
          )}
        </section>
      </div>
    </main>
  )
}
