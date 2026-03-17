import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { api, getUser, clearToken } from "@/lib/api";
import { toast } from "sonner";

interface Specialist {
  id: number;
  name: string;
  specialty: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  price: number;
  emoji: string;
  is_available: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "var(--reg-success)",
  pending: "#f59e0b",
  cancelled: "var(--reg-error)",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждена",
  pending: "Ожидает",
  cancelled: "Отменена",
};

export default function DoctorsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  useEffect(() => {
    api.getSpecialists()
      .then(setSpecialists)
      .catch(() => toast.error("Не удалось загрузить специалистов"))
      .finally(() => setLoading(false));
  }, []);

  const specialties = [...new Set(specialists.map((s) => s.specialty))];

  const filtered = specialists.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpec || s.specialty === filterSpec;
    return matchSearch && matchSpec;
  });

  const logout = () => {
    clearToken();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--reg-bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--reg-dark)" }} className="sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
              <Icon name="Plus" size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">МедЦентр</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              <Icon name="User" size={15} />
              <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || "Профиль"}</span>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <Icon name="LogOut" size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--reg-dark)" }}>Специалисты</h1>
          <p className="text-sm" style={{ color: "var(--reg-muted)" }}>Выберите врача и запишитесь онлайн</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="Search" size={16} style={{ color: "var(--reg-muted)" }} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или специальности..."
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: "1.5px solid var(--reg-border)", color: "var(--reg-dark)" }}
            />
          </div>
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none appearance-none"
            style={{ background: "white", border: "1.5px solid var(--reg-border)", color: filterSpec ? "var(--reg-dark)" : "var(--reg-muted)" }}
          >
            <option value="">Все специальности</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Specialists grid */}
        {loading ? (
          <div className="text-center py-16" style={{ color: "var(--reg-muted)" }}>
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3" />
            Загружаем специалистов...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--reg-muted)" }}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Специалисты не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="p-6 rounded-2xl transition-all duration-200"
                style={{
                  background: "white",
                  border: `2px solid ${s.is_available ? "var(--reg-border)" : "var(--reg-border)"}`,
                  opacity: s.is_available ? 1 : 0.7,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "var(--reg-blue-light)" }}
                    >
                      {s.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight" style={{ color: "var(--reg-dark)" }}>{s.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--reg-muted)" }}>{s.specialty}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: s.is_available ? "rgba(34,197,94,0.1)" : "rgba(107,122,153,0.1)",
                      color: s.is_available ? "var(--reg-success)" : "var(--reg-muted)",
                    }}
                  >
                    {s.is_available ? "Доступен" : "Недоступен"}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-xl" style={{ background: "var(--reg-bg)" }}>
                    <div className="text-lg font-bold" style={{ color: "var(--reg-dark)" }}>⭐ {s.rating}</div>
                    <div className="text-xs" style={{ color: "var(--reg-muted)" }}>{s.reviews_count} отз.</div>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: "var(--reg-bg)" }}>
                    <div className="text-lg font-bold" style={{ color: "var(--reg-dark)" }}>{s.experience_years}</div>
                    <div className="text-xs" style={{ color: "var(--reg-muted)" }}>лет опыта</div>
                  </div>
                  <div className="text-center p-2 rounded-xl" style={{ background: "var(--reg-bg)" }}>
                    <div className="text-base font-bold" style={{ color: "var(--reg-blue)" }}>{s.price}₽</div>
                    <div className="text-xs" style={{ color: "var(--reg-muted)" }}>приём</div>
                  </div>
                </div>

                <button
                  onClick={() => s.is_available && navigate(`/book/${s.id}`, { state: s })}
                  disabled={!s.is_available}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed"
                  style={{
                    background: s.is_available ? "var(--reg-blue)" : "var(--reg-border)",
                    color: s.is_available ? "white" : "var(--reg-muted)",
                  }}
                >
                  {s.is_available ? "Записаться" : "Временно недоступен"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
