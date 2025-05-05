import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agentes de Conversão</h1>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#recursos" className="text-sm font-medium hover:underline">
              Recursos
            </Link>
            <Link href="#precos" className="text-sm font-medium hover:underline">
              Preços
            </Link>
            <Link href="#contato" className="text-sm font-medium hover:underline">
              Contato
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-12">
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Otimize suas conversões com inteligência artificial</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Agentes de Conversão utiliza IA avançada para aumentar suas taxas de conversão e maximizar seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/cadastro">Começar Gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demonstracao">Ver Demonstração</Link>
            </Button>
          </div>
        </section>

        <section id="recursos" className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Análise Inteligente</CardTitle>
              <CardDescription>Entenda o comportamento dos visitantes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Nossos agentes analisam padrões de comportamento para identificar oportunidades de conversão em tempo
                real.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização Dinâmica</CardTitle>
              <CardDescription>Conteúdo adaptado para cada visitante</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Personalize a experiência do usuário com base em dados comportamentais e históricos para aumentar
                engajamento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Otimização Contínua</CardTitle>
              <CardDescription>Melhoria constante dos resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Algoritmos de aprendizado de máquina que evoluem constantemente para maximizar suas taxas de conversão.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <p className="text-sm text-slate-500">© 2024 Agentes de Conversão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
