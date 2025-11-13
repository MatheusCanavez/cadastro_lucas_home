import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { RegistroProduto } from "@/lib/csv"

const caminhoBanco = path.join(process.cwd(), "data", "produtos.json")

async function lerBanco(): Promise<RegistroProduto[]> {
  try {
    const conteudo = await fs.readFile(caminhoBanco, "utf-8")
    const json = JSON.parse(conteudo) as RegistroProduto[]
    if (Array.isArray(json)) {
      return json
    }
    return []
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw erro
  }
}

async function salvarBanco(registros: RegistroProduto[]) {
  await fs.mkdir(path.dirname(caminhoBanco), { recursive: true })
  await fs.writeFile(caminhoBanco, JSON.stringify(registros, null, 2), "utf-8")
}

export async function GET() {
  const registros = await lerBanco()
  return NextResponse.json(registros, { status: 200 })
}

export async function POST(request: Request) {
  const corpo = (await request.json()) as RegistroProduto | RegistroProduto[]
  const registrosAtuais = await lerBanco()
  const novosRegistros = Array.isArray(corpo) ? corpo : [corpo]
  const bancoAtualizado = [...registrosAtuais, ...novosRegistros]
  await salvarBanco(bancoAtualizado)
  return NextResponse.json({ sucesso: true, total: bancoAtualizado.length }, { status: 201 })
}
