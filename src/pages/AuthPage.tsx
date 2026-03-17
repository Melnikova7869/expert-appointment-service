import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { api, setToken, setUser, getToken } from "@/lib/api";

type Mode = "login" | "register";

function Field({
  label, type = "text", value, onChange, placeholder, error,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--reg-muted)" }}>
        {label}
      </label>
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
      {error && <p className="text-xs" style={{ color: "var(--reg-error)" }}>{error}</p>}
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (getToken()) {
    navigate("/");
    return null;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "register" && !name.trim()) e.name = "Введите имя";
    if (!email.includes("@")) e.email = "Некорректный email";
    if (password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let res;
      if (mode === "register") {
        res = await api.register({ full_name: name, email, phone, password, role: "client" });
      } else {
        res = await api.login(email, password);
      }
      setToken(res.token);
      setUser(res.user);
      toast.success(mode === "register" ? "Аккаунт создан!" : "Вы вошли в систему");
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--reg-bg)" }}>
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 p-10 relative overflow-hidden" style={{ background: "var(--reg-dark)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, var(--reg-blue) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--reg-teal) 0%, transparent 50%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
              <Icon name="Plus" size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">МедЦентр</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white mb-3">
            Современная<br />медицина<br /><span style={{ color: "var(--reg-teal)" }}>для всех</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Запись к врачу, история приёмов, результаты анализов — всё в одном месте
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: "CalendarCheck", text: "Онлайн-запись в любое время" },
            { icon: "FileText", text: "Электронная медкарта" },
            { icon: "Bell", text: "Напоминания о приёме" },
            { icon: "ShieldCheck", text: "Защита персональных данных" },
          ].map((f) => (
            <div key={f.icon} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
                <Icon name={f.icon} size={15} style={{ color: "var(--reg-teal)" }} />
              </div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{f.text}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>© 2026 МедЦентр</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
              <Icon name="Plus" size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--reg-dark)" }}>МедЦентр</span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--reg-dark)" }}>
            {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--reg-muted)" }}>
            {mode === "login" ? "Войдите в свой аккаунт" : "Зарегистрируйтесь, чтобы записаться к врачу"}
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: mode === m ? "var(--reg-blue)" : "transparent",
                  color: mode === m ? "white" : "var(--reg-muted)",
                }}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-5 rounded-2xl space-y-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
              {mode === "register" && (
                <Field label="Имя и фамилия" value={name} onChange={setName} placeholder="Иван Иванов" error={errors.name} />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
              {mode === "register" && (
                <Field label="Телефон" type="tel" value={phone} onChange={setPhone} placeholder="+7 900 000-00-00" />
              )}
              <Field label="Пароль" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={errors.password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--reg-blue), #5b86f5)", boxShadow: "0 8px 24px rgba(59,108,244,0.3)" }}
            >
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
