import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { api, getUser } from "@/lib/api";

interface Slot {
  id: number;
  time: string;
  is_booked: boolean;
}

interface Specialist {
  id: number;
  name: string;
  specialty: string;
  experience_years: number;
  rating: number;
  price: number;
  emoji: string;
}

function getNext14Days() {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" });
}

export default function BookPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const user = getUser();

  const specialist: Specialist = location.state || { id: Number(id), name: "Специалист", specialty: "", price: 0, emoji: "🩺", rating: 5, experience_years: 0 };

  const days = getNext14Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [patientName, setPatientName] = useState(user?.full_name || "");
  const [patientPhone, setPatientPhone] = useState(user?.phone || "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.getSlots(Number(id), selectedDay)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, selectedDay]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error("Выберите время приёма"); return; }
    if (!patientName.trim()) { toast.error("Введите имя"); return; }
    if (!patientPhone.trim()) { toast.error("Введите телефон"); return; }

    setSubmitting(true);
    try {
      await api.bookAppointment({
        specialist_id: Number(id),
        schedule_id: selectedSlot.id,
        appointment_date: selectedDay,
        appointment_time: selectedSlot.time,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_comment: comment,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--reg-bg)" }}>
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--reg-blue-light)" }}>
            <Icon name="CheckCircle" size={48} style={{ color: "var(--reg-blue)" }} />
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--reg-dark)" }}>Готово!</h2>
          <p className="text-base mb-1" style={{ color: "var(--reg-muted)" }}>
            Вы записаны к <strong style={{ color: "var(--reg-dark)" }}>{specialist.name}</strong>
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--reg-muted)" }}>
            {formatDate(selectedDay)} в {selectedSlot?.time}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-3.5 rounded-2xl text-white font-bold"
              style={{ background: "linear-gradient(135deg, var(--reg-blue), #5b86f5)" }}
            >
              Мои записи
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-2xl text-sm font-medium"
              style={{ color: "var(--reg-muted)", border: "1.5px solid var(--reg-border)" }}
            >
              К списку врачей
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--reg-bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--reg-dark)" }} className="sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:opacity-80" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--reg-blue)" }}>
              <Icon name="Plus" size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">МедЦентр</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Specialist card */}
        <div className="p-5 rounded-2xl mb-6 flex items-center gap-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: "var(--reg-blue-light)" }}>
            {specialist.emoji}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg" style={{ color: "var(--reg-dark)" }}>{specialist.name}</h2>
            <p className="text-sm" style={{ color: "var(--reg-muted)" }}>{specialist.specialty} · {specialist.experience_years} лет опыта</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--reg-blue)" }}>Стоимость приёма: {specialist.price} ₽</p>
          </div>
        </div>

        <form onSubmit={handleBook} className="space-y-5">
          {/* Date picker */}
          <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--reg-muted)" }}>Выберите дату</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => {
                const date = new Date(d + "T00:00:00");
                const isToday = d === days[0];
                const isSelected = d === selectedDay;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className="flex-shrink-0 flex flex-col items-center px-3 py-3 rounded-xl transition-all duration-150"
                    style={{
                      background: isSelected ? "var(--reg-blue)" : "var(--reg-bg)",
                      border: `2px solid ${isSelected ? "var(--reg-blue)" : "transparent"}`,
                      minWidth: "64px",
                    }}
                  >
                    <span className="text-xs font-semibold mb-1" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--reg-muted)" }}>
                      {date.toLocaleDateString("ru-RU", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold" style={{ color: isSelected ? "white" : "var(--reg-dark)" }}>
                      {date.getDate()}
                    </span>
                    <span className="text-xs" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--reg-muted)" }}>
                      {date.toLocaleDateString("ru-RU", { month: "short" })}
                    </span>
                    {isToday && <span className="text-xs font-bold mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "var(--reg-blue)" }}>сегодня</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--reg-muted)" }}>Свободное время</p>
            {loadingSlots ? (
              <div className="text-center py-4 text-sm" style={{ color: "var(--reg-muted)" }}>
                <Icon name="Loader2" size={20} className="animate-spin mx-auto mb-2" />
                Загрузка...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--reg-muted)" }}>На этот день нет доступных слотов</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.is_booked}
                    onClick={() => setSelectedSlot(slot)}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed"
                    style={{
                      background: slot.is_booked ? "#f0f0f0" : selectedSlot?.id === slot.id ? "var(--reg-blue)" : "var(--reg-blue-light)",
                      color: slot.is_booked ? "#ccc" : selectedSlot?.id === slot.id ? "white" : "var(--reg-blue)",
                      textDecoration: slot.is_booked ? "line-through" : "none",
                    }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Patient info */}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: "white", border: "1px solid var(--reg-border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--reg-muted)" }}>Ваши данные</p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--reg-muted)" }}>Имя и фамилия *</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                style={{ background: "#f7f9fc", border: "2px solid var(--reg-border)", color: "var(--reg-dark)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--reg-muted)" }}>Телефон *</label>
              <input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+7 900 000-00-00"
                type="tel"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                style={{ background: "#f7f9fc", border: "2px solid var(--reg-border)", color: "var(--reg-dark)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--reg-muted)" }}>Комментарий (необязательно)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите жалобы или укажите причину визита..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none resize-none"
                style={{ background: "#f7f9fc", border: "2px solid var(--reg-border)", color: "var(--reg-dark)" }}
              />
            </div>
          </div>

          {/* Summary */}
          {selectedSlot && (
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--reg-blue-light)", border: "1.5px solid var(--reg-blue)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--reg-blue)" }}>Ваша запись</p>
                <p className="text-sm font-bold" style={{ color: "var(--reg-dark)" }}>
                  {formatDate(selectedDay)} в {selectedSlot.time}
                </p>
              </div>
              <p className="font-bold text-lg" style={{ color: "var(--reg-blue)" }}>{specialist.price} ₽</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, var(--reg-blue), #5b86f5)", boxShadow: "0 8px 24px rgba(59,108,244,0.3)" }}
          >
            {submitting ? "Оформляем запись..." : selectedSlot ? `Записаться на ${selectedSlot.time}` : "Выберите время"}
          </button>
        </form>
      </div>
    </div>
  );
}
