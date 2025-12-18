import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-hextech-gradient p-8 text-gold-300 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <section className="text-center space-y-4">
                    <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-600 drop-shadow-sm">
                        Hextech Design System
                    </h1>
                    <p className="text-hextech-400 tracking-widest uppercase text-sm">Ultimate X1 Manager • V2.0</p>
                </section>

                {/* Buttons */}
                <section>
                    <h2 className="text-2xl font-display text-gold-500 mb-6 border-b border-gold-600/30 pb-2">Botões</h2>
                    <Card className="flex flex-wrap gap-4 items-center justify-center">
                        <Button variant="primary">Jogar Agora</Button>
                        <Button variant="primary" size="lg">INICIAR DUELO</Button>
                        <Button variant="secondary">Configurações</Button>
                        <Button variant="danger">Banir Rota</Button>
                        <Button variant="ghost">Cancelar</Button>
                        <Button disabled>Desabilitado</Button>
                    </Card>
                </section>

                {/* Cards & Inputs */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-display text-gold-500 mb-6 border-b border-gold-600/30 pb-2">Cards & Glow</h2>
                        <div className="space-y-4">
                            <Card>
                                <h3 className="text-xl font-display text-gold-300 mb-2">Card Padrão</h3>
                                <p className="text-gray-400 text-sm">
                                    Este é um card padrão com background semi-transparente e bordas decorativas nos cantos.
                                </p>
                            </Card>
                            <Card glow>
                                <h3 className="text-xl font-display text-hextech-400 mb-2 text-glow">Card em Destaque</h3>
                                <p className="text-gray-300 text-sm">
                                    Este card possui um brilho Hextech azul (glow) para chamar atenção. Ideal para itens selecionados.
                                </p>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-display text-gold-500 mb-6 border-b border-gold-600/30 pb-2">Inputs</h2>
                        <Card className="space-y-4">
                            <Input label="Nome do Invocador" placeholder="Ex: Faker#KR1" />
                            <Input label="Senha" type="password" placeholder="••••••••" />
                            <Input label="Com Erro" value="Inválido" error="Este campo é obrigatório." readOnly />
                        </Card>
                    </div>
                </section>

                {/* Typography */}
                <section>
                    <h2 className="text-2xl font-display text-gold-500 mb-6 border-b border-gold-600/30 pb-2">Tipografia</h2>
                    <Card className="space-y-4">
                        <h1 className="text-4xl font-display">Heading 1 (Cinzel)</h1>
                        <h2 className="text-3xl font-display text-gold-400">Heading 2 (Cinzel Gold)</h2>
                        <h3 className="text-2xl font-display text-hextech-400">Heading 3 (Cinzel Hextech)</h3>
                        <p className="font-sans text-lg">Body Text Large (Outfit) - A rápida raposa marrom pula sobre o cão preguiçoso.</p>
                        <p className="font-sans text-base text-gray-400">Body Text Base (Outfit) - Texto secundário com cor suavizada para melhor leitura em fundo escuro.</p>
                        <p className="font-sans text-sm text-gold-600 uppercase tracking-widest font-bold">Label / Caption</p>
                    </Card>
                </section>

            </div>
        </div>
    );
}
