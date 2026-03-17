import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { api, getUser, clearToken } from "@/lib/api";

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  date: string;
  time: string;
  status: string;
  comment: string;
  specialist_name: string;
  specialty: string;
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
  return new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    api.allAppointments()
      .then(setAppointments)
      .catch(() => toast.error("Не удалось загрузить записи"))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    navigate("/auth");
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.date === today);
  const upcoming = appointments.filter((a) => a.date > today);
  const past = appointments.filter((a) => a.date < today);

  const filtered = appointments.filter((a) => {
    const matchDate = !filterDate || a.date === filterDate;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchDate && matchStatus;
  });

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--reg-bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--reg-dark)" }} className="sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-teal)" }}>
              <Icon name="Stethoscope" size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold">МедЦентр</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: "var(--reg-teal)", color: "white" }}>Врач</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <Icon name="User" size={14} />
              <span className="hidden sm:inline">{user?.full_name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <Icon name="LogOut" size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--reg-dark)" }}>
            Добрый день, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-sm" style={{ color: "var(--reg-muted)" }}>
            {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Сегодня", value: todayAppts.length, icon: "Calendar", color: "var(--reg-blue)" },
            { label: "Ожидают", value: pendingCount, icon: "Clock", color: "#d97706" },
            { label: "Предстоящих", value: upcoming.length, icon: "CalendarCheck", color: "var(--reg-teal)" },
            { label: "Всего записей", value: appointments.length, icon: "Users", color: "var(--reg-muted)" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name={s.icon} size={18} style={{ color: s.color }} />
                <span className="text-xs font-medium" style={{ color: "var(--reg-muted)" }}>{s.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--reg-dark)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Today highlight */}
        {todayAppts.length > 0 && (
          <div className="mb-6 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--reg-teal), #1ac5d4)", color: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Sun" size={18} />
              <span className="font-bold">На сегодня — {todayAppts.length} {todayAppts.length === 1 ? "запись" : "записи"}</span>
            </div>
            <div className="space-y-2">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{a.time}</span>
                    <span className="text-sm">{a.patient_name}</span>
                  </div>
                  <span className="text-xs opacity-80">{a.patient_phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All appointments */}
        <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-bold text-lg" style={{ color: "var(--reg-dark)" }}>Все записи</h2>
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid var(--reg-border)", color: "var(--reg-dark)" }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none appearance-none"
                style={{ border: "1.5px solid var(--reg-border)", color: filterStatus ? "var(--reg-dark)" : "var(--reg-muted)" }}
              >
                <option value="">Все статусы</option>
                <option value="pending">Ожидают</option>
                <option value="confirmed">Подтверждены</option>
                <option value="cancelled">Отменены</option>
              </select>
              {(filterDate || filterStatus) && (
                <button
                  onClick={() => { setFilterDate(""); setFilterStatus(""); }}
                  className="px-3 py-2 rounded-xl text-sm font-medium"
                  style={{ border: "1.5px solid var(--reg-border)", color: "var(--reg-muted)" }}
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12" style={{ color: "var(--reg-muted)" }}>
              <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-3" />
              Загружаем записи...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--reg-muted)" }}>
              <p className="text-4xl mb-3">📭</p>
              <p>Записей не найдено</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => {
                const st = STATUS_COLORS[a.status] || { bg: "rgba(107,122,153,0.1)", color: "var(--reg-muted)" };
                const isToday = a.date === today;
                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl flex items-start gap-4 flex-wrap"
                    style={{
                      background: isToday ? "rgba(15,163,177,0.05)" : "var(--reg-bg)",
                      border: `1.5px solid ${isToday ? "var(--reg-teal)" : "transparent"}`,
                    }}
                  >
                    {/* Date/time */}
                    <div className="text-center flex-shrink-0 w-14">
                      <div className="text-lg font-bold" style={{ color: "var(--reg-dark)" }}>
                        {new Date(a.date + "T00:00:00").getDate()}
                      </div>
                      <div className="text-xs" style={{ color: "var(--reg-muted)" }}>
                        {new Date(a.date + "T00:00:00").toLocaleDateString("ru-RU", { month: "short" })}
                      </div>
                      <div className="text-sm font-semibold mt-1" style={{ color: "var(--reg-blue)" }}>{a.time}</div>
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-[160px]">
                      <div className="font-semibold text-sm" style={{ color: "var(--reg-dark)" }}>{a.patient_name}</div>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "var(--reg-muted)" }}>
                        <Icon name="Phone" size={11} />
                        {a.patient_phone}
                      </div>
                      {a.comment && (
                        <div className="text-xs mt-1.5 px-2 py-1 rounded-lg" style={{ background: "white", color: "var(--reg-muted)" }}>
                          💬 {a.comment}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                      {isToday && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--reg-teal)", color: "white" }}>
                          Сегодня
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
