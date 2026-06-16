#!/usr/bin/env python3
"""
Execute este arquivo no seu terminal LOCAL:
    python3 aplicar_notion.py
"""
import sys, json
try:
    import requests
except ImportError:
    import subprocess; subprocess.check_call([sys.executable,"-m","pip","install","requests","-q"])
    import requests

TOKEN = "ntn_T2142949703b5V7nrfK3XPURmJ1cXd7Z5Ko2QjBKdGn8XJ"
H = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

# ── helpers de bloco ────────────────────────────────────────────────────────
def h1(t): return {"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":t}}]}}
def h2(t): return {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"type":"text","text":{"content":t}}]}}
def h3(t): return {"object":"block","type":"heading_3","heading_3":{"rich_text":[{"type":"text","text":{"content":t}}]}}
def p(t,bold=False):
    ann={"bold":bold}
    return {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":t},"annotations":ann}]}}
def code(t,lang="bash"): return {"object":"block","type":"code","code":{"rich_text":[{"type":"text","text":{"content":t}}],"language":lang}}
def bullet(label,val=None):
    if val:
        rt=[{"type":"text","text":{"content":label},"annotations":{"bold":True}},{"type":"text","text":{"content":val}}]
    else:
        rt=[{"type":"text","text":{"content":label}}]
    return {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":rt}}
def divider(): return {"object":"block","type":"divider","divider":{}}
def callout(t,emoji="💡",color="blue_background"):
    return {"object":"block","type":"callout","callout":{"rich_text":[{"type":"text","text":{"content":t}}],"icon":{"type":"emoji","emoji":emoji},"color":color}}
def toggle(title, children):
    return {"object":"block","type":"toggle","toggle":{"rich_text":[{"type":"text","text":{"content":title},"annotations":{"bold":True}}],"children":children}}

def row(c1,c2):
    return {"object":"block","type":"table_row","table_row":{"cells":[
        [{"type":"text","text":{"content":c1},"annotations":{"bold":True}}],
        [{"type":"text","text":{"content":c2}}],
    ]}}

def table(rows):
    return {"object":"block","type":"table","table":{"table_width":2,"has_column_header":True,"has_row_header":False,"children":[row(a,b) for a,b in rows]}}

# ── conteúdo ────────────────────────────────────────────────────────────────
BLOCKS = [
    callout("demo@psi.com  /  demo123   →   http://localhost:5000","🔑","green_background"),
    p(""),
    h2("Como rodar"),
    code("cd psi_dashboard\npip install -r requirements.txt\npython3 app.py\n# http://localhost:5000"),
    p(""),
    h2("Stack técnico"),
    table([
        ("Componente","Tecnologia"),
        ("Backend","Flask 3.0 + Python 3"),
        ("Banco","SQLite + SQLAlchemy ORM"),
        ("Auth","Flask-Login + Werkzeug hash"),
        ("Frontend","Bootstrap 5 dark theme"),
        ("Fontes","Inter via Google Fonts"),
        ("Ícones","Bootstrap Icons"),
    ]),
    p(""),
    h2("Estrutura de arquivos"),
    code("psi_dashboard/\n├── app.py               # Flask — modelos, rotas, seed\n├── extensions.py        # SQLAlchemy + LoginManager\n├── requirements.txt\n├── instance/psi_dashboard.db\n├── static/css/custom.css\n└── templates/\n    ├── base.html\n    ├── login.html\n    ├── dashboard.html\n    ├── agenda.html\n    ├── pacientes.html\n    ├── paciente.html\n    └── config.html","plain text"),
    p(""),
    h2("Rotas"),
    table([
        ("Rota","Descrição"),
        ("/","Redirect → /dashboard ou /login"),
        ("/login  GET/POST","Autenticação"),
        ("/logout","Encerra sessão"),
        ("/dashboard","KPIs + próximas consultas"),
        ("/agenda  GET/POST","CRUD de consultas"),
        ("/pacientes  GET/POST","Lista paginada + cadastro"),
        ("/paciente/<id>","Ficha individual"),
        ("/paciente/<id>/sessao  POST","Registrar sessão"),
        ("/paciente/<id>/nota  POST","Nota interna"),
        ("/config  GET/POST","Configurações"),
    ]),
    p(""),
    h2("Funcionalidades"),
    h3("Autenticação"),
    bullet("Login com email/senha + remember_me"),
    bullet("Hash Werkzeug pbkdf2:sha256"),
    bullet("Todas as rotas privadas protegidas por @login_required"),
    p(""),
    h3("Dashboard"),
    bullet("Cards KPI: total pacientes, consultas hoje, semana, receita mês"),
    bullet("Próximas 5 consultas com data, hora, tipo e status"),
    bullet("3 últimos pacientes com link para ficha"),
    p(""),
    h3("Agenda"),
    bullet("Lista das próximas 20 consultas ordenadas por data"),
    bullet("Busca por nome do paciente"),
    bullet("Modal: adicionar / editar / excluir consultas"),
    bullet("Status: agendada | confirmada | cancelada | realizada"),
    bullet("Modalidade: presencial | online"),
    p(""),
    h3("Pacientes"),
    bullet("Lista paginada (15/pág) com busca por nome"),
    bullet("Cadastro: nome, telefone, e-mail, nascimento, CPF, endereço, obs"),
    p(""),
    h3("Ficha Individual"),
    bullet("Dados pessoais + idade calculada automaticamente"),
    bullet("Prontuário em timeline reversa (data, tema, evolução, humor 1-5, objetivos)"),
    bullet("Notas internas: assunto + texto + timestamp"),
    p(""),
    h3("Configurações"),
    bullet("Nome, CRP, especialização, e-mail, telefone"),
    bullet("Horário de funcionamento (início e fim)"),
    bullet("Alteração de senha opcional"),
    p(""),
    h2("Design System"),
    table([
        ("Token","Valor"),
        ("--bg-base","#0f0f1a  (fundo global)"),
        ("--bg-surface","#1a1a2e  (cards, sidebar)"),
        ("--bg-elevated","#22223a  (inputs, tabelas)"),
        ("--accent","#5b8dee  (azul principal)"),
        ("--text-primary","#e8e8f0"),
        ("--text-secondary","#9898b8"),
        ("--success","#34c77b"),
        ("--danger","#ef4444"),
        ("--radius","10px"),
    ]),
    p(""),
    h2("Modelos do Banco"),
    toggle("User", [code("id, name, email, password_hash\ncrp, specialization, contact_email\nphone, work_start, work_end","plain text")]),
    toggle("Patient", [code("id, user_id (FK)\nname, phone, email, birth_date\ncpf, address, notes, created_at","plain text")]),
    toggle("Appointment", [code("id, user_id (FK), patient_id (FK)\ndatetime_appt, appt_type, status, created_at","plain text")]),
    toggle("SessionRecord", [code("id, patient_id (FK)\nsession_date, tema, evolucao\nhumor (1-5), objetivos, created_at","plain text")]),
    toggle("InternalNote", [code("id, patient_id (FK)\nassunto, texto, created_at","plain text")]),
    p(""),
    h2("Seed de demonstração"),
    callout("5 pacientes • 7 consultas • 3 sessões de prontuário • 2 notas internas\nGerado automaticamente na primeira execução","🗄️","gray_background"),
    p(""),
    h2("requirements.txt"),
    code("flask==3.0.3\nflask-sqlalchemy==3.1.1\nflask-login==0.6.3\nwerkzeug==3.0.3","plain text"),
    divider(),
    p("Gerado automaticamente via script Python + Notion API",False),
]

# ── buscar páginas e criar ──────────────────────────────────────────────────
def search_pages():
    r = requests.post("https://api.notion.com/v1/search", headers=H,
        json={"filter":{"value":"page","property":"object"},"page_size":20})
    if r.status_code != 200:
        print(f"Erro ao buscar páginas: {r.status_code} — {r.json().get('message','')}")
        return []
    return r.json().get("results", [])

def get_title(page):
    for v in page.get("properties",{}).values():
        if v.get("type") == "title":
            return "".join(x.get("plain_text","") for x in v.get("title",[]))
    return "(sem título)"

def create_page(parent_id):
    payload = {
        "parent": {"type":"page_id","page_id":parent_id.replace("-","")},
        "icon": {"type":"emoji","emoji":"🧠"},
        "properties": {"title":{"title":[{"type":"text","text":{"content":"PsiDash — Sistema de Gestão para Psicólogos"}}]}},
        "children": BLOCKS[:100],
    }
    r = requests.post("https://api.notion.com/v1/pages", headers=H, json=payload)
    if r.status_code != 200:
        print(f"Erro: {r.status_code} — {r.json().get('message','')}")
        sys.exit(1)
    page = r.json()
    pid = page["id"]

    rest = BLOCKS[100:]
    if rest:
        for i in range(0, len(rest), 100):
            requests.patch(f"https://api.notion.com/v1/blocks/{pid}/children",
                headers=H, json={"children": rest[i:i+100]})
    return page.get("url","")

def main():
    print("Buscando páginas acessíveis...")
    pages = search_pages()

    if not pages:
        print("Nenhuma página acessível. Verifique se a integração tem acesso a alguma página.")
        sys.exit(1)

    print("\nPáginas disponíveis:\n")
    for i, pg in enumerate(pages):
        print(f"  [{i+1}] {get_title(pg)}")
        print(f"       ID: {pg['id']}\n")

    choice = input("Digite o número da página onde criar a documentação: ").strip()
    try:
        idx = int(choice) - 1
        parent = pages[idx]
    except (ValueError, IndexError):
        print("Opção inválida.")
        sys.exit(1)

    print(f"\nCriando página em: {get_title(parent)} ...")
    url = create_page(parent["id"])
    print(f"\nPronto! Página criada: {url}")

if __name__ == "__main__":
    main()
