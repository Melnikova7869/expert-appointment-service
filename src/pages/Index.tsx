import { useState } from "react";
import Icon from "@/components/ui/icon";

const SPECIALTIES = [
  { id: "therapist", name: "Терапевт", icon: "Stethoscope", desc: "Общая медицина" },
  { id: "cardiologist", name: "Кардиолог", icon: "Heart", desc: "Сердце и сосуды" },
  { id: "neurologist", name: "Невролог", icon: "Brain", desc: "Нервная система" },
  { id: "orthopedist", name: "Ортопед", icon: "Bone", desc: "Суставы и кости" },
  { id: "ophthalmologist", name: "Офтальмолог", icon: "Eye", desc: "Зрение" },
  { id: "endocrinologist", name: "Эндокринолог", icon: "Activity", desc: "Гормоны и обмен" },
];

const DOCTORS: Record<string, { id: string; name: string; title: string; exp: string; rating: number }[]> = {
  therapist: [
    { id: "d1", name: "Соколова Анна Михайловна", title: "Терапевт высшей категории", exp: "18 лет опыта", rating: 4.9 },
    { id: "d2", name: "Ларионов Дмитрий Павлович", title: "Врач-терапевт", exp: "9 лет опыта", rating: 4.7 },
  ],
  cardiologist: [
    { id: "d3", name: "Громова Елена Сергеевна", title: "Кардиолог, к.м.н.", exp: "22 года опыта", rating: 5.0 },
    { id: "d4", name: "Белов Игорь Алексеевич", title: "Кардиолог", exp: "12 лет опыта", rating: 4.8 },
  ],
  neurologist: [
    { id: "d5", name: "Панова Татьяна Юрьевна", title: "Невролог высшей категории", exp: "15 лет опыта", rating: 4.9 },
  ],
  orthopedist: [
    { id: "d6", name: "Зайцев Андрей Николаевич", title: "Хирург-ортопед", exp: "20 лет опыта", rating: 4.8 },
  ],
  ophthalmologist: [
    { id: "d7", name: "Козлова Марина Владимировна", title: "Офтальмолог, д.м.н.", exp: "25 лет опыта", rating: 5.0 },
  ],
  endocrinologist: [
    { id: "d8", name: "Федорова Наталья Ивановна", title: "Эндокринолог", exp: "11 лет опыта", rating: 4.6 },
  ],
};

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

function getDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString("ru-RU", { weekday: "short" });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString("ru-RU", { month: "short" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    dates.push({ date: d, dayName, dayNum, month, isWeekend, key: d.toISOString().split("T")[0] });
  }
  return dates;
}

export default function Index() {
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const dates = getDates();

  const goTo = (s: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(s);
      setAnimating(false);
    }, 200);
  };

  const specialty = SPECIALTIES.find((s) => s.id === selectedSpecialty);
  const doctor = selectedSpecialty ? DOCTORS[selectedSpecialty]?.find((d) => d.id === selectedDoctor) : null;
  const dateObj = dates.find((d) => d.key === selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const canStep2 = selectedSpecialty && selectedDoctor;
  const canStep3 = canStep2 && selectedDate && selectedTime;

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--med-cream)" }}>
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--med-sage)" }}>
              <Icon name="Plus" size={16} className="text-white" />
            </div>
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--med-dark)" }}>
              МедЦентр
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--med-muted)" }}>
            <Icon name="Phone" size={14} />
            <span>8 (800) 555-00-00</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10 animate-slide-up">
          <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: "var(--med-sage)" }}>
            Онлайн-запись
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight" style={{ color: "var(--med-dark)" }}>
            Запись к врачу
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--med-muted)" }}>
            Выберите специалиста и удобное время — без ожидания на линии
          </p>
        </div>

        {/* Steps indicator */}
        {!submitted && (
          <div className="flex items-center gap-0 mb-8">
            {[
              { n: 1, label: "Врач" },
              { n: 2, label: "Время" },
              { n: 3, label: "Данные" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                    style={{
                      background: step >= s.n ? "var(--med-sage)" : "var(--med-sage-light)",
                      color: step >= s.n ? "white" : "var(--med-sage)",
                    }}
                  >
                    {step > s.n ? <Icon name="Check" size={14} /> : s.n}
                  </div>
                  <span
                    className="text-sm font-medium hidden sm:block"
                    style={{ color: step >= s.n ? "var(--med-dark)" : "var(--med-muted)" }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="w-12 h-px mx-3 transition-all duration-500"
                    style={{ background: step > s.n ? "var(--med-sage)" : "var(--med-sage-light)" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>

          {/* Step 1 — Specialty + Doctor */}
          {step === 1 && !submitted && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-semibold mb-5" style={{ color: "var(--med-dark)" }}>
                  Выберите специализацию
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALTIES.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => { setSelectedSpecialty(sp.id); setSelectedDoctor(""); }}
                      className="p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md"
                      style={{
                        background: selectedSpecialty === sp.id ? "var(--med-sage)" : "white",
                        borderColor: selectedSpecialty === sp.id ? "var(--med-sage)" : "transparent",
                        color: selectedSpecialty === sp.id ? "white" : "var(--med-dark)",
                        boxShadow: selectedSpecialty === sp.id ? "0 4px 20px rgba(122,158,142,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Icon
                        name={sp.icon}
                        size={22}
                        className="mb-2"
                        style={{ color: selectedSpecialty === sp.id ? "rgba(255,255,255,0.9)" : "var(--med-sage)" }}
                      />
                      <div className="font-semibold text-sm">{sp.name}</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: selectedSpecialty === sp.id ? "rgba(255,255,255,0.75)" : "var(--med-muted)" }}
                      >
                        {sp.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSpecialty && (
                <div className="animate-slide-up">
                  <h2 className="font-serif text-2xl font-semibold mb-5" style={{ color: "var(--med-dark)" }}>
                    Выберите врача
                  </h2>
                  <div className="space-y-3">
                    {(DOCTORS[selectedSpecialty] || []).map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc.id)}
                        className="w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 hover:shadow-md"
                        style={{
                          background: selectedDoctor === doc.id ? "var(--med-sage)" : "white",
                          borderColor: selectedDoctor === doc.id ? "var(--med-sage)" : "transparent",
                          color: selectedDoctor === doc.id ? "white" : "var(--med-dark)",
                          boxShadow: selectedDoctor === doc.id ? "0 4px 20px rgba(122,158,142,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-lg font-semibold"
                          style={{
                            background: selectedDoctor === doc.id ? "rgba(255,255,255,0.2)" : "var(--med-sage-light)",
                            color: selectedDoctor === doc.id ? "white" : "var(--med-sage)",
                          }}
                        >
                          {doc.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{doc.name}</div>
                          <div
                            className="text-sm mt-0.5"
                            style={{ color: selectedDoctor === doc.id ? "rgba(255,255,255,0.8)" : "var(--med-muted)" }}
                          >
                            {doc.title} · {doc.exp}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Icon
                            name="Star"
                            size={14}
                            style={{ color: selectedDoctor === doc.id ? "rgba(255,255,255,0.9)" : "var(--med-gold)" }}
                          />
                          <span style={{ color: selectedDoctor === doc.id ? "rgba(255,255,255,0.9)" : "var(--med-gold)" }}>
                            {doc.rating}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  disabled={!canStep2}
                  onClick={() => goTo(2)}
                  className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
                  style={{ background: "var(--med-sage)" }}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Date + Time */}
          {step === 2 && !submitted && (
            <div className="space-y-8">
              {/* Summary */}
              <div
                className="p-4 rounded-2xl flex items-center gap-4"
                style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-base font-semibold flex-shrink-0"
                  style={{ background: "var(--med-sage-light)", color: "var(--med-sage)" }}
                >
                  {doctor?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--med-dark)" }}>{doctor?.name}</div>
                  <div className="text-xs" style={{ color: "var(--med-muted)" }}>{specialty?.name} · {doctor?.title}</div>
                </div>
                <button
                  onClick={() => goTo(1)}
                  className="ml-auto text-xs font-medium"
                  style={{ color: "var(--med-sage)" }}
                >
                  Изменить
                </button>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold mb-5" style={{ color: "var(--med-dark)" }}>
                  Выберите дату
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.filter((d) => !d.isWeekend).slice(0, 10).map((d) => (
                    <button
                      key={d.key}
                      onClick={() => { setSelectedDate(d.key); setSelectedTime(""); }}
                      className="flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all duration-200 hover:shadow-md"
                      style={{
                        background: selectedDate === d.key ? "var(--med-sage)" : "white",
                        color: selectedDate === d.key ? "white" : "var(--med-dark)",
                        boxShadow: selectedDate === d.key ? "0 4px 16px rgba(122,158,142,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: selectedDate === d.key ? "rgba(255,255,255,0.75)" : "var(--med-muted)" }}
                      >
                        {d.dayName}
                      </div>
                      <div className="text-xl font-serif font-semibold my-0.5">{d.dayNum}</div>
                      <div
                        className="text-xs"
                        style={{ color: selectedDate === d.key ? "rgba(255,255,255,0.75)" : "var(--med-muted)" }}
                      >
                        {d.month}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="animate-slide-up">
                  <h2 className="font-serif text-2xl font-semibold mb-5" style={{ color: "var(--med-dark)" }}>
                    Выберите время
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
                        style={{
                          background: selectedTime === t ? "var(--med-sage)" : "white",
                          color: selectedTime === t ? "white" : "var(--med-dark)",
                          boxShadow: selectedTime === t ? "0 4px 12px rgba(122,158,142,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => goTo(1)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-70"
                  style={{ color: "var(--med-muted)" }}
                >
                  ← Назад
                </button>
                <button
                  disabled={!canStep3}
                  onClick={() => goTo(3)}
                  className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
                  style={{ background: "var(--med-sage)" }}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Contact form */}
          {step === 3 && !submitted && (
            <div className="space-y-6">
              {/* Summary card */}
              <div
                className="p-5 rounded-2xl space-y-3"
                style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--med-muted)" }}>
                  Ваша запись
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="User" size={16} style={{ color: "var(--med-sage)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--med-dark)" }}>{doctor?.name}</span>
                  <span className="text-sm" style={{ color: "var(--med-muted)" }}>— {specialty?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Calendar" size={16} style={{ color: "var(--med-sage)" }} />
                  <span className="text-sm" style={{ color: "var(--med-dark)" }}>
                    {dateObj ? `${dateObj.dayNum} ${dateObj.month}` : ""}, {selectedTime}
                  </span>
                </div>
                <button
                  onClick={() => goTo(2)}
                  className="text-xs font-medium mt-1"
                  style={{ color: "var(--med-sage)" }}
                >
                  Изменить дату и время
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold" style={{ color: "var(--med-dark)" }}>
                  Ваши данные
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--med-dark)" }}>
                    Имя и фамилия *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Иванов Иван"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: "white",
                      borderColor: "hsl(var(--border))",
                      color: "var(--med-dark)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--med-sage)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--med-dark)" }}>
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: "white",
                      borderColor: "hsl(var(--border))",
                      color: "var(--med-dark)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--med-sage)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--med-dark)" }}>
                    Комментарий <span style={{ color: "var(--med-muted)" }}>(необязательно)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Опишите жалобы или вопросы к врачу..."
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
                    style={{
                      background: "white",
                      borderColor: "hsl(var(--border))",
                      color: "var(--med-dark)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--med-sage)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
                  />
                </div>

                <div className="flex justify-between pt-2 items-center">
                  <button
                    type="button"
                    onClick={() => goTo(2)}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-70"
                    style={{ color: "var(--med-muted)" }}
                  >
                    ← Назад
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                    style={{ background: "var(--med-sage)" }}
                  >
                    Записаться
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "var(--med-sage-light)" }}
              >
                <Icon name="CheckCircle" size={40} style={{ color: "var(--med-sage)" }} />
              </div>
              <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: "var(--med-dark)" }}>
                Запись принята!
              </h2>
              <p className="text-base mb-2" style={{ color: "var(--med-muted)" }}>
                Ждём вас {dateObj ? `${dateObj.dayNum} ${dateObj.month}` : ""} в {selectedTime}
              </p>
              <p className="text-sm mb-8" style={{ color: "var(--med-muted)" }}>
                Специалист: {doctor?.name}
              </p>
              <p className="text-sm px-8 py-3 rounded-2xl" style={{ background: "white", color: "var(--med-muted)" }}>
                Подтверждение придёт на номер <strong style={{ color: "var(--med-dark)" }}>{form.phone}</strong>
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedSpecialty("");
                  setSelectedDoctor("");
                  setSelectedDate("");
                  setSelectedTime("");
                  setForm({ name: "", phone: "", comment: "" });
                  setSubmitted(false);
                }}
                className="mt-8 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ color: "var(--med-sage)", border: "1.5px solid var(--med-sage-light)" }}
              >
                Записаться ещё раз
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--med-sage)" }}
            >
              <Icon name="Plus" size={12} className="text-white" />
            </div>
            <span className="font-serif text-base font-semibold" style={{ color: "var(--med-dark)" }}>
              МедЦентр
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--med-muted)" }}>
            Пн–Пт: 09:00–18:00 · Сб: 09:00–14:00
          </p>
        </div>
      </footer>
    </div>
  );
}
