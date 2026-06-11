import os
from datetime import datetime, date, timedelta
from flask import (Flask, render_template, redirect, url_for, request,
                   flash, jsonify, abort)
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
from extensions import db, login_manager

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'psi-secret-2024-change-in-prod')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///psi_dashboard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager.init_app(app)


# ─── MODELS ────────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    crp = db.Column(db.String(30), default='')
    specialization = db.Column(db.String(120), default='')
    contact_email = db.Column(db.String(120), default='')
    phone = db.Column(db.String(20), default='')
    work_start = db.Column(db.String(5), default='08:00')
    work_end = db.Column(db.String(5), default='18:00')

    patients = db.relationship('Patient', backref='psychologist', lazy=True,
                               cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='psychologist', lazy=True,
                                   cascade='all, delete-orphan')

    is_active = True
    is_authenticated = True
    is_anonymous = False

    def get_id(self):
        return str(self.id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), default='')
    email = db.Column(db.String(120), default='')
    birth_date = db.Column(db.Date, nullable=True)
    cpf = db.Column(db.String(14), default='')
    address = db.Column(db.String(250), default='')
    notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    appointments = db.relationship('Appointment', backref='patient', lazy=True,
                                   cascade='all, delete-orphan')
    sessions = db.relationship('SessionRecord', backref='patient', lazy=True,
                               cascade='all, delete-orphan',
                               order_by='SessionRecord.session_date.desc()')
    internal_notes = db.relationship('InternalNote', backref='patient', lazy=True,
                                     cascade='all, delete-orphan',
                                     order_by='InternalNote.created_at.desc()')

    @property
    def age(self):
        if self.birth_date:
            today = date.today()
            return (today.year - self.birth_date.year
                    - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day)))
        return None


class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    datetime_appt = db.Column(db.DateTime, nullable=False)
    appt_type = db.Column(db.String(20), default='presencial')
    status = db.Column(db.String(20), default='agendada')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SessionRecord(db.Model):
    __tablename__ = 'session_records'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    session_date = db.Column(db.Date, nullable=False)
    tema = db.Column(db.String(200), nullable=False)
    evolucao = db.Column(db.Text, nullable=False)
    humor = db.Column(db.Integer, default=3)
    objetivos = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class InternalNote(db.Model):
    __tablename__ = 'internal_notes'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    assunto = db.Column(db.String(200), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ─── HELPERS ───────────────────────────────────────────────────────────────────

def get_week_bounds():
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return datetime.combine(start, datetime.min.time()), datetime.combine(end, datetime.max.time())


# ─── ROUTES ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember_me'))
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user, remember=remember)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        flash('Email ou senha inválidos.', 'danger')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Sessão encerrada com sucesso.', 'info')
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    uid = current_user.id
    total_patients = Patient.query.filter_by(user_id=uid).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    appts_today = Appointment.query.filter(
        Appointment.user_id == uid,
        Appointment.datetime_appt >= today_start,
        Appointment.datetime_appt <= today_end
    ).count()

    week_start, week_end = get_week_bounds()
    appts_week = Appointment.query.filter(
        Appointment.user_id == uid,
        Appointment.datetime_appt >= week_start,
        Appointment.datetime_appt <= week_end
    ).count()

    month_start = datetime.today().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    appts_month = Appointment.query.filter(
        Appointment.user_id == uid,
        Appointment.datetime_appt >= month_start,
        Appointment.status.in_(['realizada', 'confirmada'])
    ).count()
    receita_mes = appts_month * 150

    upcoming = (Appointment.query
                .join(Patient)
                .filter(Appointment.user_id == uid,
                        Appointment.datetime_appt >= datetime.now(),
                        Appointment.status != 'cancelada')
                .order_by(Appointment.datetime_appt)
                .limit(5).all())

    recent_patients = (Patient.query
                       .filter_by(user_id=uid)
                       .order_by(Patient.created_at.desc())
                       .limit(3).all())

    return render_template('dashboard.html',
                           total_patients=total_patients,
                           appts_today=appts_today,
                           appts_week=appts_week,
                           receita_mes=receita_mes,
                           upcoming=upcoming,
                           recent_patients=recent_patients)


@app.route('/agenda', methods=['GET', 'POST'])
@login_required
def agenda():
    uid = current_user.id
    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'add':
            patient_id = request.form.get('patient_id')
            date_str = request.form.get('date')
            time_str = request.form.get('time')
            appt_type = request.form.get('appt_type', 'presencial')
            status = request.form.get('status', 'agendada')
            dt = datetime.strptime(f'{date_str} {time_str}', '%Y-%m-%d %H:%M')
            appt = Appointment(user_id=uid, patient_id=patient_id,
                               datetime_appt=dt, appt_type=appt_type, status=status)
            db.session.add(appt)
            db.session.commit()
            flash('Consulta agendada com sucesso.', 'success')

        elif action == 'edit':
            appt_id = request.form.get('appt_id')
            appt = Appointment.query.filter_by(id=appt_id, user_id=uid).first_or_404()
            date_str = request.form.get('date')
            time_str = request.form.get('time')
            appt.datetime_appt = datetime.strptime(f'{date_str} {time_str}', '%Y-%m-%d %H:%M')
            appt.patient_id = request.form.get('patient_id')
            appt.appt_type = request.form.get('appt_type', 'presencial')
            appt.status = request.form.get('status', 'agendada')
            db.session.commit()
            flash('Consulta atualizada.', 'success')

        elif action == 'delete':
            appt_id = request.form.get('appt_id')
            appt = Appointment.query.filter_by(id=appt_id, user_id=uid).first_or_404()
            db.session.delete(appt)
            db.session.commit()
            flash('Consulta removida.', 'info')

        return redirect(url_for('agenda'))

    search = request.args.get('q', '').strip()
    query = (Appointment.query
             .join(Patient)
             .filter(Appointment.user_id == uid))
    if search:
        query = query.filter(Patient.name.ilike(f'%{search}%'))
    appointments = (query.order_by(Appointment.datetime_appt).limit(20).all())
    patients = Patient.query.filter_by(user_id=uid).order_by(Patient.name).all()
    return render_template('agenda.html', appointments=appointments,
                           patients=patients, search=search)


@app.route('/pacientes', methods=['GET', 'POST'])
@login_required
def pacientes():
    uid = current_user.id
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            birth_str = request.form.get('birth_date', '')
            birth_date = datetime.strptime(birth_str, '%Y-%m-%d').date() if birth_str else None
            p = Patient(
                user_id=uid,
                name=request.form.get('name', '').strip(),
                phone=request.form.get('phone', '').strip(),
                email=request.form.get('email', '').strip(),
                birth_date=birth_date,
                cpf=request.form.get('cpf', '').strip(),
                address=request.form.get('address', '').strip(),
                notes=request.form.get('notes', '').strip(),
            )
            db.session.add(p)
            db.session.commit()
            flash('Paciente cadastrado com sucesso.', 'success')
        return redirect(url_for('pacientes'))

    search = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    query = Patient.query.filter_by(user_id=uid)
    if search:
        query = query.filter(Patient.name.ilike(f'%{search}%'))
    pagination = query.order_by(Patient.name).paginate(page=page, per_page=15, error_out=False)
    return render_template('pacientes.html', pagination=pagination, search=search)


@app.route('/paciente/<int:pid>')
@login_required
def paciente(pid):
    p = Patient.query.filter_by(id=pid, user_id=current_user.id).first_or_404()
    return render_template('paciente.html', patient=p)


@app.route('/paciente/<int:pid>/sessao', methods=['POST'])
@login_required
def add_sessao(pid):
    p = Patient.query.filter_by(id=pid, user_id=current_user.id).first_or_404()
    date_str = request.form.get('session_date', '')
    try:
        session_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        flash('Data inválida.', 'danger')
        return redirect(url_for('paciente', pid=pid))
    sr = SessionRecord(
        patient_id=p.id,
        session_date=session_date,
        tema=request.form.get('tema', '').strip(),
        evolucao=request.form.get('evolucao', '').strip(),
        humor=int(request.form.get('humor', 3)),
        objetivos=request.form.get('objetivos', '').strip(),
    )
    db.session.add(sr)
    db.session.commit()
    flash('Sessão registrada com sucesso.', 'success')
    return redirect(url_for('paciente', pid=pid))


@app.route('/paciente/<int:pid>/nota', methods=['POST'])
@login_required
def add_nota(pid):
    p = Patient.query.filter_by(id=pid, user_id=current_user.id).first_or_404()
    note = InternalNote(
        patient_id=p.id,
        assunto=request.form.get('assunto', '').strip(),
        texto=request.form.get('texto', '').strip(),
    )
    db.session.add(note)
    db.session.commit()
    flash('Nota adicionada.', 'success')
    return redirect(url_for('paciente', pid=pid))


@app.route('/config', methods=['GET', 'POST'])
@login_required
def config():
    if request.method == 'POST':
        current_user.name = request.form.get('name', '').strip()
        current_user.crp = request.form.get('crp', '').strip()
        current_user.specialization = request.form.get('specialization', '').strip()
        current_user.contact_email = request.form.get('contact_email', '').strip()
        current_user.phone = request.form.get('phone', '').strip()
        current_user.work_start = request.form.get('work_start', '08:00')
        current_user.work_end = request.form.get('work_end', '18:00')
        new_pw = request.form.get('new_password', '')
        if new_pw:
            current_user.set_password(new_pw)
        db.session.commit()
        flash('Configurações salvas com sucesso.', 'success')
        return redirect(url_for('config'))
    return render_template('config.html')


# ─── INIT DB ───────────────────────────────────────────────────────────────────

def init_db():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email='demo@psi.com').first():
            demo = User(
                name='Dra. Ana Paula Silva',
                email='demo@psi.com',
                crp='CRP 06/123456',
                specialization='Psicologia Clínica',
                contact_email='demo@psi.com',
                phone='(11) 99999-0001',
                work_start='08:00',
                work_end='18:00',
            )
            demo.set_password('demo123')
            db.session.add(demo)
            db.session.flush()

            patients_data = [
                ('João Carlos Mendes', '(11) 98765-4321', 'joao@email.com',
                 date(1985, 3, 12), '123.456.789-00', 'Rua das Flores, 100 - SP', 'Ansiedade moderada'),
                ('Maria Fernanda Souza', '(11) 91234-5678', 'maria@email.com',
                 date(1992, 7, 25), '987.654.321-00', 'Av. Paulista, 500 - SP', 'Depressão leve'),
                ('Carlos Eduardo Lima', '(11) 97654-3210', 'carlos@email.com',
                 date(1978, 11, 3), '456.123.789-00', 'Rua Augusta, 200 - SP', 'Burnout'),
                ('Patrícia Oliveira', '(11) 95555-1234', 'patricia@email.com',
                 date(1990, 5, 18), '321.654.987-00', 'Rua Oscar Freire, 30 - SP', 'TCC em andamento'),
                ('Roberto Santos', '(11) 94444-5678', 'roberto@email.com',
                 date(1975, 9, 7), '654.321.123-00', 'Av. Rebouças, 800 - SP', 'Fobia social'),
            ]
            patient_objs = []
            for pd in patients_data:
                p = Patient(user_id=demo.id, name=pd[0], phone=pd[1], email=pd[2],
                            birth_date=pd[3], cpf=pd[4], address=pd[5], notes=pd[6])
                db.session.add(p)
                patient_objs.append(p)
            db.session.flush()

            now = datetime.now()
            appts = [
                (patient_objs[0], now + timedelta(hours=2), 'presencial', 'confirmada'),
                (patient_objs[1], now + timedelta(days=1, hours=1), 'online', 'agendada'),
                (patient_objs[2], now + timedelta(days=2, hours=3), 'presencial', 'agendada'),
                (patient_objs[3], now + timedelta(days=3), 'online', 'confirmada'),
                (patient_objs[4], now + timedelta(days=5), 'presencial', 'agendada'),
                (patient_objs[0], now - timedelta(days=7), 'presencial', 'realizada'),
                (patient_objs[1], now - timedelta(days=5), 'online', 'realizada'),
            ]
            for ap in appts:
                a = Appointment(user_id=demo.id, patient_id=ap[0].id,
                                datetime_appt=ap[1], appt_type=ap[2], status=ap[3])
                db.session.add(a)

            sessions = [
                SessionRecord(patient_id=patient_objs[0].id,
                              session_date=date.today() - timedelta(days=14),
                              tema='Gatilhos de ansiedade no trabalho',
                              evolucao='Paciente identificou principais situações que provocam ansiedade. Demonstrou insight sobre padrões de comportamento.',
                              humor=2, objetivos='Praticar técnicas de respiração diária.'),
                SessionRecord(patient_id=patient_objs[0].id,
                              session_date=date.today() - timedelta(days=7),
                              tema='Técnicas de regulação emocional',
                              evolucao='Boa adesão às técnicas propostas. Relata melhora no sono. Ainda apresenta dificuldade em situações sociais.',
                              humor=3, objetivos='Continuar exercícios de exposição gradual.'),
                SessionRecord(patient_id=patient_objs[1].id,
                              session_date=date.today() - timedelta(days=10),
                              tema='Histórico familiar e padrões relacionais',
                              evolucao='Exploração de dinâmicas familiares. Paciente mostrou-se resistente inicialmente mas abriu-se ao longo da sessão.',
                              humor=2, objetivos='Reflexão sobre relacionamentos atuais.'),
            ]
            for s in sessions:
                db.session.add(s)

            notes = [
                InternalNote(patient_id=patient_objs[0].id,
                             assunto='Contato de emergência',
                             texto='Esposa: Ana Mendes - (11) 98888-0001'),
                InternalNote(patient_id=patient_objs[1].id,
                             assunto='Convênio',
                             texto='Plano de saúde: Unimed - nº 123456789'),
            ]
            for n in notes:
                db.session.add(n)

            db.session.commit()
            print('Banco de dados inicializado com dados demo.')


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
