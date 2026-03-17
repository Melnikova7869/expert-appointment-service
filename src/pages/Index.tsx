import { useState } from "react";
import Icon from "@/components/ui/icon";

type Role = "patient" | "doctor";
type Step = "role" | "form" | "success";

interface PatientForm {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
  confirm: string;
}

interface DoctorForm {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  license: string;
  experience: string;
  clinic: string;
  password: string;
  confirm: string;
}

const SPECIALTIES = [
  "Терапевт", "Кардиолог", "Невролог", "Ортопед",
  "Офтальмолог", "Эндокринолог", "Дерматолог", "Педиатр",
  "Хирург", "Гинеколог", "Уролог", "Психиатр",
];

const emptyPatient: PatientForm = { name: "", email: "", phone: "", birthdate: "", password: "", confirm: "" };
const emptyDoctor: DoctorForm = { name: "", email: "", phone: "", specialty: "", license: "", experience: "", clinic: "", password: "", confirm: "" };

function FieldInput({
  label, type = "text", value, onChange, placeholder, required = true, error,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--reg-muted)" }}>
        {label}{required && <span style={{ color: "var(--reg-error)" }}> *</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
          style={{
            background: focused ? "white" : "#f7f9fc",
            border: `2px solid ${error ? "var(--reg-error)" : focused ? "var(--reg-blue)" : "var(--reg-border)"}`,
            color: "var(--reg-dark)",
            boxShadow: focused ? "0 0 0 4px rgba(59,108,244,0.08)" : "none",
          }}
        />
      </div>
      {error && <p className="text-xs font-medium" style={{ color: "var(--reg-error)" }}>{error}</p>}
    </div>
  );
}

function SelectInput({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--reg-muted)" }}>
        {label}<span style={{ color: "var(--reg-error)" }}> *</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 appearance-none"
        style={{
          background: focused ? "white" : "#f7f9fc",
          border: `2px solid ${focused ? "var(--reg-blue)" : "var(--reg-border)"}`,
          color: value ? "var(--reg-dark)" : "var(--reg-muted)",
          boxShadow: focused ? "0 0 0 4px rgba(59,108,244,0.08)" : "none",
        }}
      >
        <option value="" disabled>Выберите специализацию</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function Index() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("patient");
  const [patient, setPatient] = useState<PatientForm>(emptyPatient);
  const [doctor, setDoctor] = useState<DoctorForm>(emptyDoctor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const setP = (k: keyof PatientForm) => (v: string) => setPatient((p) => ({ ...p, [k]: v }));
  const setD = (k: keyof DoctorForm) => (v: string) => setDoctor((d) => ({ ...d, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (role === "patient") {
      if (!patient.name.trim()) errs.name = "Введите имя";
      if (!patient.email.includes("@")) errs.email = "Некорректный email";
      if (patient.phone.length < 10) errs.phone = "Введите номер телефона";
      if (!patient.birthdate) errs.birthdate = "Укажите дату рождения";
      if (patient.password.length < 6) errs.password = "Минимум 6 символов";
      if (patient.password !== patient.confirm) errs.confirm = "Пароли не совпадают";
    } else {
      if (!doctor.name.trim()) errs.name = "Введите ФИО";
      if (!doctor.email.includes("@")) errs.email = "Некорректный email";
      if (doctor.phone.length < 10) errs.phone = "Введите номер телефона";
      if (!doctor.specialty) errs.specialty = "Выберите специализацию";
      if (!doctor.license.trim()) errs.license = "Введите номер лицензии";
      if (doctor.password.length < 6) errs.password = "Минимум 6 символов";
      if (doctor.password !== doctor.confirm) errs.confirm = "Пароли не совпадают";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("success");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--reg-bg)", fontFamily: "'Montserrat', sans-serif" }}>

      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: "var(--reg-dark)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, var(--reg-blue) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--reg-teal) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "var(--reg-blue)", transform: "translate(30%, 30%)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--reg-blue)" }}
            >
              <Icon name="Plus" size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">МедЦентр</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Современная<br />медицина<br />
              <span style={{ color: "var(--reg-teal)" }}>для всех</span>
            </h1>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
              Запись к врачу, история приёмов, результаты анализов — всё в одном месте
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: "CalendarCheck", text: "Онлайн-запись в любое время" },
            { icon: "FileText", text: "Электронная медкарта" },
            { icon: "Bell", text: "Напоминания о приёме" },
            { icon: "ShieldCheck", text: "Защита персональных данных" },
          ].map((f) => (
            <div key={f.icon} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Icon name={f.icon} size={16} style={{ color: "var(--reg-teal)" }} />
              </div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{f.text}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 МедЦентр. Все права защищены.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4 sm:px-8 overflow-y-auto">

        <div className="flex lg:hidden items-center gap-2 mb-8 self-start">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
            <Icon name="Plus" size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--reg-dark)" }}>МедЦентр</span>
        </div>

        <div className="w-full max-w-[520px]">

          {/* ── role select ── */}
          {step === "role" && !showLogin && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--reg-dark)" }}>Создать аккаунт</h2>
                <p className="text-sm" style={{ color: "var(--reg-muted)" }}>Кто вы? Выберите тип аккаунта для регистрации.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { r: "patient" as Role, icon: "User", label: "Пациент", desc: "Записывайтесь к врачам, храните историю лечения", color: "var(--reg-blue)", bg: "var(--reg-blue-light)", hoverShadow: "rgba(59,108,244,0.12)", hoverBorder: "var(--reg-blue)" },
                  { r: "doctor" as Role, icon: "Stethoscope", label: "Врач", desc: "Управляйте расписанием и ведите пациентов онлайн", color: "var(--reg-teal)", bg: "var(--reg-teal-light)", hoverShadow: "rgba(15,163,177,0.12)", hoverBorder: "var(--reg-teal)" },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => { setRole(item.r); setStep("form"); }}
                    className="p-6 rounded-2xl text-left transition-all duration-200 active:scale-95"
                    style={{ background: "white", border: "2px solid var(--reg-border)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.hoverBorder;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${item.hoverShadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--reg-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: item.bg }}>
                      <Icon name={item.icon} size={22} style={{ color: item.color }} />
                    </div>
                    <div className="font-bold text-base mb-1" style={{ color: "var(--reg-dark)" }}>{item.label}</div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--reg-muted)" }}>{item.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: item.color }}>
                      Выбрать <Icon name="ArrowRight" size={12} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
                <span className="text-sm" style={{ color: "var(--reg-muted)" }}>Уже есть аккаунт?</span>
                <button onClick={() => setShowLogin(true)} className="text-sm font-semibold hover:opacity-70" style={{ color: "var(--reg-blue)" }}>
                  Войти →
                </button>
              </div>
            </div>
          )}

          {/* ── login ── */}
          {showLogin && (
            <div className="animate-fade-in">
              <button onClick={() => setShowLogin(false)} className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-70" style={{ color: "var(--reg-muted)" }}>
                <Icon name="ArrowLeft" size={16} /> Назад
              </button>
              <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--reg-dark)" }}>Добро пожаловать</h2>
              <p className="text-sm mb-8" style={{ color: "var(--reg-muted)" }}>Войдите в свой аккаунт</p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FieldInput label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" />
                <FieldInput label="Пароль" type="password" value={loginPass} onChange={setLoginPass} placeholder="••••••••" />
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-medium hover:opacity-70" style={{ color: "var(--reg-blue)" }}>Забыли пароль?</button>
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98]" style={{ background: "var(--reg-blue)" }}>
                  Войти
                </button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm" style={{ color: "var(--reg-muted)" }}>Нет аккаунта? </span>
                <button onClick={() => setShowLogin(false)} className="text-sm font-semibold hover:opacity-70" style={{ color: "var(--reg-blue)" }}>
                  Зарегистрироваться
                </button>
              </div>
            </div>
          )}

          {/* ── registration form ── */}
          {step === "form" && (
            <div className="animate-fade-in">
              <button onClick={() => setStep("role")} className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-70" style={{ color: "var(--reg-muted)" }}>
                <Icon name="ArrowLeft" size={16} /> Назад
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: role === "patient" ? "var(--reg-blue-light)" : "var(--reg-teal-light)" }}
                >
                  <Icon name={role === "patient" ? "User" : "Stethoscope"} size={18} style={{ color: role === "patient" ? "var(--reg-blue)" : "var(--reg-teal)" }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--reg-dark)" }}>
                    {role === "patient" ? "Регистрация пациента" : "Регистрация врача"}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--reg-muted)" }}>
                    {role === "patient" ? "Создайте аккаунт для записи к специалистам" : "Заполните профессиональные данные"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-5 rounded-2xl space-y-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--reg-muted)" }}>Личные данные</p>
                  <FieldInput
                    label={role === "doctor" ? "ФИО" : "Имя и фамилия"}
                    value={role === "patient" ? patient.name : doctor.name}
                    onChange={role === "patient" ? setP("name") : setD("name")}
                    placeholder={role === "doctor" ? "Иванов Иван Иванович" : "Иван Иванов"}
                    error={errors.name}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldInput label="Email" type="email" value={role === "patient" ? patient.email : doctor.email} onChange={role === "patient" ? setP("email") : setD("email")} placeholder="you@example.com" error={errors.email} />
                    <FieldInput label="Телефон" type="tel" value={role === "patient" ? patient.phone : doctor.phone} onChange={role === "patient" ? setP("phone") : setD("phone")} placeholder="+7 900 000-00-00" error={errors.phone} />
                  </div>
                  {role === "patient" && (
                    <FieldInput label="Дата рождения" type="date" value={patient.birthdate} onChange={setP("birthdate")} error={errors.birthdate} />
                  )}
                </div>

                {role === "doctor" && (
                  <div className="p-5 rounded-2xl space-y-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--reg-muted)" }}>Профессиональные данные</p>
                    <SelectInput label="Специализация" value={doctor.specialty} onChange={setD("specialty")} options={SPECIALTIES} />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldInput label="Номер лицензии" value={doctor.license} onChange={setD("license")} placeholder="ЛО-77-01-..." error={errors.license} />
                      <FieldInput label="Опыт (лет)" type="number" value={doctor.experience} onChange={setD("experience")} placeholder="10" required={false} />
                    </div>
                    <FieldInput label="Клиника / место работы" value={doctor.clinic} onChange={setD("clinic")} placeholder="Городская больница №5" required={false} />
                  </div>
                )}

                <div className="p-5 rounded-2xl space-y-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--reg-muted)" }}>Придумайте пароль</p>
                  <FieldInput label="Пароль" type="password" value={role === "patient" ? patient.password : doctor.password} onChange={role === "patient" ? setP("password") : setD("password")} placeholder="Минимум 6 символов" error={errors.password} />
                  <FieldInput label="Подтвердите пароль" type="password" value={role === "patient" ? patient.confirm : doctor.confirm} onChange={role === "patient" ? setP("confirm") : setD("confirm")} placeholder="Повторите пароль" error={errors.confirm} />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-white font-bold text-base hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{
                    background: role === "patient" ? "linear-gradient(135deg, var(--reg-blue), #5b86f5)" : "linear-gradient(135deg, var(--reg-teal), #1ac5d4)",
                    boxShadow: role === "patient" ? "0 8px 24px rgba(59,108,244,0.3)" : "0 8px 24px rgba(15,163,177,0.3)",
                  }}
                >
                  {role === "patient" ? "Создать аккаунт пациента" : "Зарегистрироваться как врач"}
                </button>

                <p className="text-center text-xs" style={{ color: "var(--reg-muted)" }}>
                  Уже есть аккаунт?{" "}
                  <button type="button" onClick={() => { setStep("role"); setShowLogin(true); }} className="font-semibold hover:opacity-70" style={{ color: "var(--reg-blue)" }}>
                    Войти
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* ── success ── */}
          {step === "success" && (
            <div className="text-center py-12 animate-fade-in">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: role === "patient" ? "var(--reg-blue-light)" : "var(--reg-teal-light)" }}
              >
                <Icon name="CheckCircle" size={48} style={{ color: role === "patient" ? "var(--reg-blue)" : "var(--reg-teal)" }} />
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--reg-dark)" }}>Аккаунт создан!</h2>
              <p className="text-base mb-2" style={{ color: "var(--reg-muted)" }}>
                Добро пожаловать,{" "}
                <strong style={{ color: "var(--reg-dark)" }}>{role === "patient" ? patient.name : doctor.name}</strong>
              </p>
              <p className="text-sm mb-8" style={{ color: "var(--reg-muted)" }}>
                Письмо с подтверждением отправлено на{" "}
                <span style={{ color: "var(--reg-dark)", fontWeight: 600 }}>{role === "patient" ? patient.email : doctor.email}</span>
              </p>
              <div className="space-y-3">
                <button
                  className="w-full py-3.5 rounded-2xl text-white font-bold hover:opacity-90 active:scale-[0.98]"
                  style={{ background: role === "patient" ? "linear-gradient(135deg, var(--reg-blue), #5b86f5)" : "linear-gradient(135deg, var(--reg-teal), #1ac5d4)" }}
                >
                  {role === "patient" ? "Записаться к врачу" : "Настроить расписание"}
                </button>
                <button
                  onClick={() => { setStep("role"); setPatient(emptyPatient); setDoctor(emptyDoctor); setErrors({}); }}
                  className="w-full py-3 rounded-2xl text-sm font-medium hover:opacity-70"
                  style={{ color: "var(--reg-muted)", border: "1.5px solid var(--reg-border)" }}
                >
                  Зарегистрировать другой аккаунт
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
