#!/usr/bin/env python3
"""
Cria a página de documentação do PsiDash no Notion via API.

Uso:
    pip install requests
    python3 create_notion_page.py

Você será solicitado a informar:
  - NOTION_TOKEN   : seu Internal Integration Token (secret_...)
  - PARENT_PAGE_ID : ID da página pai onde a nova página será criada

Como obter o ID da página pai:
    Abra a página no Notion → copie a URL → o ID são os últimos 32 caracteres
    Exemplo: https://notion.so/Meu-Workspace-abc123def456... → abc123def456...
"""

import sys
import json
import getpass

try:
    import requests
except ImportError:
    print("Instalando dependência: requests")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests


# ─── Helpers ──────────────────────────────────────────────────────────────────

def h(text):
    return {"object": "block", "type": "heading_1",
            "heading_1": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def h2(text):
    return {"object": "block", "type": "heading_2",
            "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def h3(text):
    return {"object": "block", "type": "heading_3",
            "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def p(text, bold=False, color="default"):
    rt = {"type": "text", "text": {"content": text}}
    if bold:
        rt["annotations"] = {"bold": True}
    if color != "default":
        rt.setdefault("annotations", {})["color"] = color
    return {"object": "block", "type": "paragraph",
            "paragraph": {"rich_text": [rt]}}

def p_rich(*parts):
    """parts = list of (text, bold, code, color)"""
    rich_text = []
    for part in parts:
        text, bold, code, color = (part + (False, False, "default"))[:4]
        rt = {"type": "text", "text": {"content": text},
              "annotations": {"bold": bold, "code": code, "color": color}}
        rich_text.append(rt)
    return {"object": "block", "type": "paragraph",
            "paragraph": {"rich_text": rich_text}}

def code(text, lang="bash"):
    return {"object": "block", "type": "code",
            "code": {"rich_text": [{"type": "text", "text": {"content": text}}],
                     "language": lang}}

def bullet(text, bold_prefix=None):
    if bold_prefix:
        rt = [
            {"type": "text", "text": {"content": bold_prefix},
             "annotations": {"bold": True}},
            {"type": "text", "text": {"content": text}},
        ]
    else:
        rt = [{"type": "text", "text": {"content": text}}]
    return {"object": "block", "type": "bulleted_list_item",
            "bulleted_list_item": {"rich_text": rt}}

def divider():
    return {"object": "block", "type": "divider", "divider": {}}

def callout(text, emoji="💡", color="blue_background"):
    return {"object": "block", "type": "callout",
            "callout": {
                "rich_text": [{"type": "text", "text": {"content": text}}],
                "icon": {"type": "emoji", "emoji": emoji},
                "color": color
            }}

def toggle(title, children):
    return {"object": "block", "type": "toggle",
            "toggle": {
                "rich_text": [{"type": "text", "text": {"content": title},
                               "annotations": {"bold": True}}],
                "children": children
            }}

def table_of_2(rows):
    """rows = list of (cell1, cell2)"""
    cells = []
    for r in rows:
        cells.append([
            [{"type": "text", "text": {"content": r[0]}, "annotations": {"bold": True}}],
            [{"type": "text", "text": {"content": r[1]}}],
        ])
    return {"object": "block", "type": "table",
            "table": {
                "table_width": 2,
                "has_column_header": True,
                "has_row_header": False,
                "children": [{"object": "block", "type": "table_row",
                               "table_row": {"cells": row}} for row in cells]
            }}


# ─── Conteúdo da página ────────────────────────────────────────────────────────

def build_blocks():
    blocks = []

    # Callout de acesso demo
    blocks.append(callout(
        "Acesso demo  →  demo@psi.com  /  demo123   |   http://localhost:5000",
        emoji="🔑", color="green_background"
    ))
    blocks.append(p(""))

    # Como rodar
    blocks.append(h2("Como rodar"))
    blocks.append(code(
        "cd psi_dashboard\npip install -r requirements.txt\npython3 app.py\n# Acesse: http://localhost:5000",
        lang="bash"
    ))
    blocks.append(p(""))

    # Stack técnico
    blocks.append(h2("Stack técnico"))
    blocks.append(table_of_2([
        ("Componente", "Tecnologia"),
        ("Backend", "Flask 3.0 + Python 3"),
        ("Banco de dados", "SQLite com SQLAlchemy ORM"),
        ("Autenticação", "Flask-Login + Werkzeug (bcrypt)"),
        ("Frontend", "Bootstrap 5 — dark theme"),
        ("Fontes", "Inter via Google Fonts"),
        ("Ícones", "Bootstrap Icons"),
        ("ORM", "Flask-SQLAlchemy 3.1"),
    ]))
    blocks.append(p(""))

    # Estrutura de arquivos
    blocks.append(h2("Estrutura de arquivos"))
    blocks.append(code(
        "psi_dashboard/\n"
        "├── app.py               # Flask — modelos, rotas, seed\n"
        "├── extensions.py        # SQLAlchemy + LoginManager\n"
        "├── requirements.txt\n"
        "├── instance/\n"
        "│   └── psi_dashboard.db # SQLite (gerado automaticamente)\n"
        "├── static/css/\n"
        "│   └── custom.css       # Tema dark completo\n"
        "└── templates/\n"
        "    ├── base.html        # Layout com sidebar\n"
        "    ├── login.html\n"
        "    ├── dashboard.html\n"
        "    ├── agenda.html\n"
        "    ├── pacientes.html\n"
        "    ├── paciente.html    # Página individual\n"
        "    └── config.html",
        lang="bash"
    ))
    blocks.append(p(""))

    # Rotas
    blocks.append(h2("Rotas da aplicação"))
    blocks.append(table_of_2([
        ("Rota", "Descrição"),
        ("/", "Redireciona para /dashboard ou /login"),
        ("/login  GET/POST", "Autenticação com email e senha"),
        ("/logout  GET", "Encerra a sessão"),
        ("/dashboard  GET", "KPIs, próximas consultas, últimos pacientes"),
        ("/agenda  GET/POST", "Lista e CRUD de consultas"),
        ("/pacientes  GET/POST", "Lista paginada e cadastro de pacientes"),
        ("/paciente/<id>  GET", "Ficha individual do paciente"),
        ("/paciente/<id>/sessao  POST", "Registrar sessão no prontuário"),
        ("/paciente/<id>/nota  POST", "Adicionar nota interna"),
        ("/config  GET/POST", "Configurações do psicólogo"),
    ]))
    blocks.append(p(""))

    # Funcionalidades
    blocks.append(h2("Funcionalidades"))

    blocks.append(h3("Autenticação"))
    blocks.append(bullet("Login com email/senha e opção manter conectado (remember_me)"))
    blocks.append(bullet("Senhas em hash via Werkzeug (pbkdf2:sha256)"))
    blocks.append(bullet("Todas as rotas privadas protegidas por @login_required"))
    blocks.append(p(""))

    blocks.append(h3("Dashboard"))
    blocks.append(bullet("Card: Total de pacientes cadastrados"))
    blocks.append(bullet("Card: Consultas agendadas para hoje"))
    blocks.append(bullet("Card: Consultas da semana corrente"))
    blocks.append(bullet("Card: Receita estimada do mês (consultas realizadas × valor)"))
    blocks.append(bullet("Tabela com as próximas 5 consultas (data, hora, paciente, tipo, status)"))
    blocks.append(bullet("Lista dos 3 últimos pacientes cadastrados com link para ficha"))
    blocks.append(p(""))

    blocks.append(h3("Agenda"))
    blocks.append(bullet("Lista das próximas 20 consultas ordenadas por data"))
    blocks.append(bullet("Busca por nome do paciente"))
    blocks.append(bullet("Modal: adicionar consulta (paciente, data, hora, modalidade, status)"))
    blocks.append(bullet("Modal: editar consulta existente (pré-preenchido via JavaScript)"))
    blocks.append(bullet("Excluir consulta com confirmação"))
    blocks.append(bullet("Status: agendada | confirmada | cancelada | realizada"))
    blocks.append(bullet("Modalidade: presencial | online"))
    blocks.append(p(""))

    blocks.append(h3("Pacientes"))
    blocks.append(bullet("Lista paginada (15 por página) com busca por nome"))
    blocks.append(bullet("Modal de cadastro: nome, telefone, e-mail, nascimento, CPF, endereço, observações"))
    blocks.append(bullet("Botão 'Ver' leva à página individual do paciente"))
    blocks.append(p(""))

    blocks.append(h3("Ficha Individual do Paciente"))
    blocks.append(bullet("Dados pessoais completos com cálculo automático de idade"))
    blocks.append(bullet("Prontuário em timeline: sessões ordenadas por data decrescente"))
    blocks.append(bullet("Cada sessão: data, tema principal, evolução clínica, humor (1–5), objetivos"))
    blocks.append(bullet("Notas internas: assunto + texto + timestamp (visível só para o psicólogo)"))
    blocks.append(bullet("Data da sessão pré-preenchida com hoje no modal"))
    blocks.append(p(""))

    blocks.append(h3("Configurações"))
    blocks.append(bullet("Nome completo, CRP, especialização"))
    blocks.append(bullet("E-mail de contato e telefone para lembretes"))
    blocks.append(bullet("Horário de funcionamento (início e fim do expediente)"))
    blocks.append(bullet("Alteração de senha (campo opcional — em branco mantém a atual)"))
    blocks.append(p(""))

    # Modelos de banco de dados
    blocks.append(h2("Modelos do banco de dados"))
    blocks.append(toggle("User (psicólogo)", [
        code("id, name, email, password_hash\ncrp, specialization, contact_email\nphone, work_start, work_end", lang="plain text"),
    ]))
    blocks.append(toggle("Patient (paciente)", [
        code("id, user_id (FK)\nname, phone, email\nbirth_date, cpf, address, notes\ncreated_at", lang="plain text"),
    ]))
    blocks.append(toggle("Appointment (consulta)", [
        code("id, user_id (FK), patient_id (FK)\ndatetime_appt, appt_type, status\ncreated_at", lang="plain text"),
    ]))
    blocks.append(toggle("SessionRecord (prontuário)", [
        code("id, patient_id (FK)\nsession_date, tema, evolucao\nhumor (1–5), objetivos\ncreated_at", lang="plain text"),
    ]))
    blocks.append(toggle("InternalNote (notas internas)", [
        code("id, patient_id (FK)\nassunto, texto\ncreated_at", lang="plain text"),
    ]))
    blocks.append(p(""))

    # Design
    blocks.append(h2("Design System"))
    blocks.append(table_of_2([
        ("Token", "Valor"),
        ("--bg-base", "#0f0f1a  (fundo global)"),
        ("--bg-surface", "#1a1a2e  (cards e sidebar)"),
        ("--bg-elevated", "#22223a  (inputs e tabelas)"),
        ("--accent", "#5b8dee  (azul principal)"),
        ("--text-primary", "#e8e8f0"),
        ("--text-secondary", "#9898b8"),
        ("--success", "#34c77b"),
        ("--danger", "#ef4444"),
        ("--radius", "10px"),
    ]))
    blocks.append(p(""))

    # Responsividade
    blocks.append(h2("Responsividade"))
    blocks.append(bullet("Mobile-first — funciona de 320px até desktop ultrawide"))
    blocks.append(bullet("Sidebar oculta em mobile com menu hamburger e overlay"))
    blocks.append(bullet("Tabelas com scroll horizontal em telas pequenas"))
    blocks.append(bullet("Cards KPI em grid 2×2 no mobile, 1×4 no desktop"))
    blocks.append(bullet("Breakpoint principal: 992px (Bootstrap lg)"))
    blocks.append(p(""))

    # Dados de demonstração
    blocks.append(h2("Dados de demonstração (seed)"))
    blocks.append(callout(
        "O banco é populado automaticamente na primeira execução com:\n"
        "• 5 pacientes com dados completos\n"
        "• 7 consultas (passadas e futuras)\n"
        "• 3 sessões de prontuário com evoluções clínicas\n"
        "• 2 notas internas de exemplo",
        emoji="🗄️", color="gray_background"
    ))
    blocks.append(p(""))

    # Requirements
    blocks.append(h2("requirements.txt"))
    blocks.append(code(
        "flask==3.0.3\nflask-sqlalchemy==3.1.1\nflask-login==0.6.3\nwerkzeug==3.0.3",
        lang="plain text"
    ))
    blocks.append(p(""))

    blocks.append(divider())
    blocks.append(p("Gerado automaticamente via script Python + Notion API", color="gray"))

    return blocks


# ─── Criação da página ─────────────────────────────────────────────────────────

def create_page(token: str, parent_id: str) -> dict:
    parent_id = parent_id.replace("-", "")
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }

    blocks = build_blocks()

    # A API aceita no máximo 100 blocos por request de criação
    first_batch = blocks[:100]
    rest = blocks[100:]

    payload = {
        "parent": {"type": "page_id", "page_id": parent_id},
        "icon": {"type": "emoji", "emoji": "🧠"},
        "cover": {"type": "external", "external": {
            "url": "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200"
        }},
        "properties": {
            "title": {
                "title": [{"type": "text", "text": {"content": "PsiDash — Sistema de Gestão para Psicólogos"}}]
            }
        },
        "children": first_batch,
    }

    print("Criando página no Notion...")
    resp = requests.post("https://api.notion.com/v1/pages", headers=headers,
                         data=json.dumps(payload))
    if resp.status_code != 200:
        print(f"\nErro ao criar página: {resp.status_code}")
        print(resp.json().get("message", resp.text))
        sys.exit(1)

    page = resp.json()
    page_id = page["id"]
    page_url = page.get("url", "")
    print(f"Página criada: {page_url}")

    # Append blocos restantes
    if rest:
        print(f"Adicionando {len(rest)} blocos restantes...")
        for i in range(0, len(rest), 100):
            batch = rest[i:i+100]
            r = requests.patch(
                f"https://api.notion.com/v1/blocks/{page_id}/children",
                headers=headers,
                data=json.dumps({"children": batch})
            )
            if r.status_code != 200:
                print(f"Aviso: erro ao adicionar blocos {i}–{i+len(batch)}: {r.status_code}")
                print(r.json().get("message", ""))

    return page


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  PsiDash → Criar página no Notion")
    print("=" * 60)
    print()
    print("Precisa de:")
    print("  1. Token: notion.so/my-integrations → copie o secret_...")
    print("  2. ID da página pai: últimos 32 chars da URL da página")
    print()

    token = getpass.getpass("NOTION_TOKEN (secret_...): ").strip()
    if not token.startswith("secret_"):
        print("Aviso: tokens normalmente começam com 'secret_'")

    parent_id = input("PARENT_PAGE_ID (32 chars, com ou sem hífens): ").strip()
    parent_id = parent_id.replace("-", "")
    if len(parent_id) != 32:
        print(f"Aviso: ID tem {len(parent_id)} caracteres (esperado: 32). Continuando mesmo assim...")

    print()
    try:
        page = create_page(token, parent_id)
        print()
        print("=" * 60)
        print("  Página criada com sucesso!")
        print(f"  URL: {page.get('url', '(verifique seu Notion)')}")
        print("=" * 60)
    except KeyboardInterrupt:
        print("\nCancelado.")
        sys.exit(0)


if __name__ == "__main__":
    main()
