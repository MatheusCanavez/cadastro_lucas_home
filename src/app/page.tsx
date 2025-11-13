"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  opcoesCoresBase,
  opcoesMedidas,
  opcoesTipoColchao,
  opcoesTipoProduto,
  opcoesVariacoesBase,
} from "@/data/opcoes"
import { montarDescricoesCompletas, type DadosFormulario } from "@/lib/nomear-produto"
import type { RegistroProduto } from "@/lib/csv"

const esquemaVariacao = z.object({
  descricao: z.string().min(1, "Informe a descrição da base"),
  cores: z.array(z.string()).min(1, "Selecione ao menos uma cor"),
})

const esquemaFormulario = z.object({
  tipoProduto: z.enum(["colchao", "baseBox", "baseBoxBau"]),
  tipoColchao: z.enum(["espumaD28", "espumaD33", "espumaD45", "espumaD60", "molasEnsacadas"]),
  nomeLinha: z.string().min(1, "Informe o nome da linha"),
  marca: z.string().min(1, "Informe a marca"),
  medida: z.enum(["solteirinho", "solteiro", "solteiroKing", "casal", "queen", "king"]),
  variacoesBase: z.array(esquemaVariacao).min(1, "Adicione ao menos uma variação"),
})

type ValoresFormulario = z.infer<typeof esquemaFormulario>

export default function PaginaCadastro() {
  const [estadoEnvio, setEstadoEnvio] = useState<"idle" | "enviando" | "ok" | "erro">("idle")
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      tipoProduto: "colchao",
      tipoColchao: "espumaD60",
      nomeLinha: "",
      marca: "",
      medida: "solteiro",
      variacoesBase: [
        { descricao: "Cama Box Baú com Auxiliar", cores: ["Branco", "Marrom", "Preto"] },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variacoesBase",
  })

  const dadosObservados = form.watch()

  const descricoes = useMemo(() => {
    const validacao = esquemaFormulario.safeParse(dadosObservados)
    if (!validacao.success) {
      return null
    }
    return montarDescricoesCompletas(validacao.data as DadosFormulario)
  }, [dadosObservados])

  async function aoEnviar(dados: ValoresFormulario) {
    try {
      setEstadoEnvio("enviando")
      const nomes = montarDescricoesCompletas(dados)
      const registros: RegistroProduto[] = [
        { tipo: "colchao", B1_DESC: nomes.nomeColchao, origem: "formulario" },
        ...nomes.kits.map((kit) => ({
          tipo: "kit",
          B1_DESC: kit.nomeCompleto,
          descricaoBase: kit.descricaoBase,
          cor: kit.cor,
        })),
      ]

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
      form.reset(form.getValues())
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
            <h1 className="text-2xl font-semibold">Gerar descrições</h1>
            <p className="text-sm text-muted-foreground">
              Preencha as informações para gerar o nome do colchão e as variações de kits.
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(aoEnviar)}>
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
                name="tipoColchao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do colchão</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-3"
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
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ortobom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="medida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medidas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a medida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opcoesMedidas.map((opcao) => (
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

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Variações de base</h2>
                  <p className="text-sm text-muted-foreground">
                    Escolha os tipos de base e as cores disponíveis para cada combinação.
                  </p>
                </div>

                {fields.map((fieldItem, index) => (
                  <div key={fieldItem.id} className="rounded-xl border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Variação #{index + 1}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        Remover
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`variacoesBase.${index}.descricao`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha uma variação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {opcoesVariacoesBase.map((opcao) => (
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
                      name={`variacoesBase.${index}.cores`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cores</FormLabel>
                          <div className="grid grid-cols-2 gap-3">
                            {opcoesCoresBase.map((cor) => {
                              const marcado = field.value?.includes(cor.rotulo) ?? false
                              return (
                                <label
                                  key={`${fieldItem.id}-${cor.valor}`}
                                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm"
                                >
                                  <Checkbox
                                    checked={marcado}
                                    onCheckedChange={(checado) => {
                                      const valores = new Set(field.value ?? [])
                                      if (checado === true) {
                                        valores.add(cor.rotulo)
                                      } else {
                                        valores.delete(cor.rotulo)
                                      }
                                      field.onChange(Array.from(valores))
                                    }}
                                  />
                                  <span>{cor.rotulo}</span>
                                </label>
                              )
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      descricao: "",
                      cores: [],
                    })
                  }
                >
                  Adicionar variação
                </Button>
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
          <h2 className="text-xl font-semibold">Pré-visualização</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Os nomes são atualizados automaticamente conforme o preenchimento.
          </p>

          {descricoes ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm uppercase text-muted-foreground">Colchão avulso</h3>
                <p className="font-medium">{descricoes.nomeColchao}</p>
              </div>

              <div>
                <h3 className="text-sm uppercase text-muted-foreground">Kits gerados</h3>
                <ul className="space-y-2 text-sm">
                  {descricoes.kits.map((kit) => (
                    <li key={`${kit.descricaoBase}-${kit.cor}`} className="rounded-lg border p-3">
                      {kit.nomeCompleto}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preencha o formulário para ver os resultados.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
