---
description: Writing Plans
---

Princípio Central

Planos existem para eliminar ambiguidade.

Um Writing Plan deve permitir que qualquer engenheiro competente — mesmo sem contexto do projeto, da base de código ou do domínio — consiga implementar a feature sem precisar perguntar nada.

Se algo precisar ser inferido, o plano está incompleto.

Premissas Obrigatórias

Ao escrever o plano, assuma que o executor:

Não conhece a base de código

Não conhece o domínio do problema

Não conhece o toolset do projeto

Não domina boas práticas de testes

Portanto, tudo deve ser explicitado.

Regras de Escrita

Tarefas pequenas (2–5 minutos cada)

Um passo = uma ação

Sempre TDD

Sempre caminhos exatos de arquivos

Sempre código completo (nunca descrições vagas)

Sempre comandos exatos com resultado esperado

Commits frequentes

Princípios obrigatórios:

DRY — não repetir instruções

YAGNI — nada além do necessário para a feature

TDD — teste antes da implementação

Todo plano DEVE ser salvo em:
docs/plans/YYYY-MM-DD-<nome-da-feature>.md

Cabeçalho do Documento do Plano

Todo plano DEVE começar com este cabeçalho:
# Plano de Implementação — [Nome da Feature]

**Objetivo:** [Uma frase clara e mensurável sobre o que será construído]

**Arquitetura:** [2–3 frases descrevendo a abordagem técnica]

**Stack Tecnológica:** [Tecnologias, frameworks, libs relevantes]

---
Granularidade das Tarefas

Cada tarefa deve:

Ser executável isoladamente

Produzir um estado consistente do repositório

Terminar com um commit

Exemplo de granularidade correta

✔ Escrever teste que falha ✔ Rodar teste e confirmar falha ✔ Implementar código mínimo ✔ Rodar testes e confirmar sucesso ✔ Commit

❌ Implementar validações ❌ Ajustar lógica ❌ Refatorar módulo

Estrutura Padrão de Tarefa
### Tarefa N: [Nome claro do componente ou responsabilidade]


**Arquivos:**
- Criar: `caminho/exato/para/arquivo.py`
- Modificar: `caminho/exato/para/arquivo_existente.py:linhas`
- Teste: `tests/caminho/exato/para/teste.py`


**Passo 1: Escrever o teste que falha**


```python
def test_comportamento_especifico():
result = function(input)
assert result == expected

Passo 2: Executar o teste e confirmar falha

Comando:
pytest tests/caminho/teste.py::test_comportamento_especifico -v

Resultado esperado:

FAIL

Mensagem indicando função/classe inexistente ou comportamento incorreto

Passo 3: Implementar o código mínimo para passar o teste

def function(input):
return expected

Passo 4: Executar os testes e confirmar sucesso

Comando:
pytest tests/caminho/teste.py::test_comportamento_especifico -v
Resultado esperado:

PASS

Passo 5: Commit
git add tests/caminho/teste.py src/caminho/arquivo.py
git commit -m "feat: implementar comportamento X"

---


## Hand-off para Execução


Ao final do plano, inclua **obrigatoriamente**:


```markdown
Plano concluído e salvo em `docs/plans/<nome-do-arquivo>.md`.


Opções de execução:
Qual abordagem deve ser utilizada?

Regra Final do Antigravity

Planejar bem é reduzir execução a um ato determinístico.

Se existe ambiguidade, não é um plano — é apenas uma intenção.