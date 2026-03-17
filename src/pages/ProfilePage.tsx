import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { api, getUser, clearToken } from "@/lib/api";

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  comment: string;
  specialist_name: string;
  specialist_specialty: string;
  specialist_emoji: string;
  price: number;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждена",
  pending: "Ожидает",
  cancelled: "Отменена",
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "rgba(34,197,94,0.1)", color: "var(--reg-success)" },
  pending: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  cancelled: { bg: "rgba(232,68,90,0.1)", color: "var(--reg-error)" },
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myAppointments()
      .then(setAppointments)
      .catch(() => toast.error("Не удалось загрузить записи"))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    navigate("/auth");
  };

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date(new Date().toDateString()));
  const past = appointments.filter((a) => new Date(a.date) < new Date(new Date().toDateString()));

  return (
    <div className="min-h-screen" style={{ background: "var(--reg-bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--reg-dark)" }} className="sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:opacity-80" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
              <Icon name="Plus" size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">МедЦентр</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-80" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="p-6 rounded-2xl mb-8 flex items-center gap-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: "var(--reg-blue-light)", color: "var(--reg-blue)" }}>
            {user?.full_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl" style={{ color: "var(--reg-dark)" }}>{user?.full_name}</h2>
            <p className="text-sm" style={{ color: "var(--reg-muted)" }}>{user?.email}</p>
            {user?.phone && <p className="text-sm" style={{ color: "var(--reg-muted)" }}>{user.phone}</p>}
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--reg-blue)", color: "white" }}
          >
            Записаться
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Всего записей", value: appointments.length, icon: "Calendar" },
            { label: "Предстоящих", value: upcoming.length, icon: "Clock" },
            { label: "Завершённых", value: past.length, icon: "CheckCircle" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
              <Icon name={s.icon} size={20} style={{ color: "var(--reg-blue)" }} className="mx-auto mb-2" />
              <div className="text-2xl font-bold" style={{ color: "var(--reg-dark)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--reg-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--reg-muted)" }}>
            <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-3" />
            Загружаем записи...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📅</p>
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--reg-dark)" }}>У вас пока нет записей</h3>
            <p className="text-sm mb-6" style={{ color: "var(--reg-muted)" }}>Запишитесь к специалисту прямо сейчас</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "var(--reg-blue)", color: "white" }}
            >
              Найти врача
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--reg-muted)" }}>Предстоящие</h3>
                <div className="space-y-3">
                  {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--reg-muted)" }}>История</h3>
                <div className="space-y-3 opacity-70">
                  {past.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const st = STATUS_COLORS[appt.status] || { bg: "rgba(107,122,153,0.1)", color: "var(--reg-muted)" };
  return (
    <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "var(--reg-blue-light)" }}>
          {appt.specialist_emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h4 className="font-bold text-base" style={{ color: "var(--reg-dark)" }}>{appt.specialist_name}</h4>
              <p className="text-xs" style={{ color: "var(--reg-muted)" }}>{appt.specialist_specialty}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color }}>
              {STATUS_LABELS[appt.status] || appt.status}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--reg-muted)" }}>
              <Icon name="Calendar" size={13} />
              {new Date(appt.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
            </div>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--reg-muted)" }}>
              <Icon name="Clock" size={13} />
              {appt.time}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--reg-blue)" }}>
              {appt.price} ₽
            </div>
          </div>
          {appt.comment && (
            <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: "var(--reg-bg)", color: "var(--reg-muted)" }}>
              💬 {appt.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
