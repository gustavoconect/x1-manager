"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-hextech-gradient p-4">
            <Card className="max-w-md w-full text-center border-red-900/50">
                <h1 className="text-3xl font-display text-red-500 mb-4">Erro de Autenticação</h1>
                <p className="text-gray-400 mb-8">
                    Não foi possível verificar sua conta Discord. O código de autorização pode ter expirado ou ser inválido.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/login">
                        <Button variant="primary">Tentar Novamente</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost">Voltar ao Início</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
