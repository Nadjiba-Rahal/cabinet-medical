"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  MessageCircle,
  CheckCircle,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Plus,
  Award,
  Heart,
  Shield,
  Zap,
  Sparkles,
  Stethoscope,
  Brain,
  Activity,
  Leaf,
  Star,
  Quote,
  Fingerprint,
  Mail,
} from "lucide-react";
import { getAvailableSlotsAction, createAppointmentAction } from "@/actions/appointment.actions";
import { formatOpeningHours, getNextAvailableDates } from "@/lib/booking/slots";
import { buildWhatsAppLink } from "@/lib/notifications/whatsapp";
import { appointmentInputSchema } from "@/lib/validations/appointment";
import type { Service } from "@/types/service";
import type { SettingsMap } from "@/types/settings";

/**
 * Visual/decorative content for each service card (icon, accent colour,
 * feature tags). Order matches the seeded Service rows exactly, so
 * `realServices[i].id` is the booking id for `serviceDisplays[i]`. If a
 * service is renamed/reordered in the admin, the numbers/duration shown
 * here fall back to the live DB values — only the icon/color/features
 * stay static, since those aren't stored fields.
 */
const serviceDisplays = [
  {
    icon: <Stethoscope size={32} />,
    color: "#10b981",
    features: ["Diagnostic complet", "Conseils personnalisés", "Suivi adapté"],
  },
  {
    icon: <Brain size={32} />,
    color: "#8b5cf6",
    features: ["Expertise pointue", "Évaluation détaillée", "Plan d'action"],
  },
  {
    icon: <Activity size={32} />,
    color: "#3b82f6",
    features: ["Suivi régulier", "Ajustements précis", "Évolution mesurée"],
  },
  {
    icon: <Leaf size={32} />,
    color: "#22c55e",
    features: ["Prévention active", "Conseils santé", "Bilan complet"],
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const patientInfoSchema = appointmentInputSchema.pick({
  fullName: true,
  phone: true,
  email: true,
  message: true,
});
type PatientInfoValues = z.infer<typeof patientInfoSchema>;

export function BellevueSite({ services, settings }: { services: Service[]; settings: SettingsMap }) {
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [serviceIdx, setServiceIdx] = useState<number | null>(null);
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [timeIso, setTimeIso] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);
  const [menu, setMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const upcomingDates = useMemo(() => getNextAvailableDates(settings, 6), [settings]);
  const selectedService = serviceIdx !== null ? services[serviceIdx] : null;

  const selectedServiceId = selectedService?.id ?? null;

  useEffect(() => {
    if (!selectedServiceId || !dateObj) return;
    let cancelled = false;

    async function loadSlots() {
      setAvailableSlots(null);
      setTimeIso("");
      const slots = await getAvailableSlotsAction(selectedServiceId as string, (dateObj as Date).toISOString());
      if (!cancelled) setAvailableSlots(slots);
    }
    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedServiceId, dateObj]);

  const openBooking = () => {
    setBooking(true);
    setStep(1);
    setServiceIdx(null);
    setDateObj(null);
    setTimeIso("");
    setSubmitError(null);
    setConfirmedAt(null);
  };
  const closeBooking = () => setBooking(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", darkMode ? "light" : "dark");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInfoValues>({ resolver: zodResolver(patientInfoSchema) });

  async function onSubmitInfo(values: PatientInfoValues) {
    if (!selectedService || !timeIso) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await createAppointmentAction({
      serviceId: selectedService.id,
      startAt: timeIso,
      ...values,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "conflict") {
        setSubmitError("Ce créneau vient d'être réservé. Veuillez choisir un autre horaire.");
        setTimeIso("");
        setStep(3);
      } else if (result.error === "validation") {
        setSubmitError("Merci de vérifier les informations saisies.");
      } else {
        setSubmitError("Une erreur est survenue. Veuillez réessayer.");
      }
      return;
    }

    setConfirmedAt(new Date(timeIso));
    setStep(5);
  }

  const openingSummary = formatOpeningHours(settings);
  const [openingDaysLabel, openingTimesLabel] = openingSummary.split(" · ");
  const factsData = [
    { label: "10+", desc: "Années d'expérience", icon: <Award size={24} /> },
    { label: openingDaysLabel || "Horaires", desc: openingTimesLabel || "Voir nos disponibilités", icon: <Calendar size={24} /> },
    { label: "Bellevue", desc: "El Harrach — Alger", icon: <MapPin size={24} /> },
    { label: "24h/24", desc: "Prise de rendez-vous", icon: <Zap size={24} /> },
  ];

  const whyData = [
    { n: "01", title: "Expertise", desc: "Une pratique attentive et orientée vers vos besoins.", icon: <Heart size={28} /> },
    { n: "02", title: "Accessible", desc: "Un rendez-vous en ligne disponible à tout moment.", icon: <Zap size={28} /> },
    { n: "03", title: "Personnalisé", desc: "Chaque consultation commence par l'écoute.", icon: <Shield size={28} /> },
    { n: "04", title: "Simple", desc: "Un parcours de réservation clair, sans compte à créer.", icon: <Award size={28} /> },
  ];

  const testimonials = [
    { quote: "Une écoute exceptionnelle et des conseils qui ont changé ma vie. Je recommande chaleureusement.", author: "Sophie M.", role: "Patiente" },
    { quote: "Le cabinet Bellevue est un véritable havre de paix. Une approche médicale humaine et professionnelle.", author: "Karim A.", role: "Patient" },
    { quote: "Des consultations qui vont au-delà du simple diagnostic. Une véritable relation de confiance.", author: "Lina B.", role: "Patiente" },
  ];

  const processData = [
    ["01", "Choisissez", "Sélectionnez la consultation qui vous convient."],
    ["02", "Réservez", "Choisissez une date et un créneau disponible."],
    ["03", "Confirmez", "Recevez immédiatement la confirmation de votre demande."],
  ];

  const faqData = [
    { q: "Comment prendre rendez-vous ?", a: "Sélectionnez un service, une date et un créneau, puis renseignez vos coordonnées. C'est tout." },
    { q: "Puis-je annuler mon rendez-vous ?", a: "Oui. Contactez simplement le cabinet par téléphone ou WhatsApp." },
    { q: "Dois-je créer un compte ?", a: "Non. La réservation est volontairement simple et ne nécessite aucun compte." },
    { q: "Puis-je contacter le cabinet via WhatsApp ?", a: "Oui, le bouton WhatsApp permet de contacter directement le cabinet." },
    { q: "Quels sont les horaires du cabinet ?", a: `Le cabinet est ouvert ${openingSummary}.` },
  ];

  const dateLabelFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const confirmFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <main className={`site ${darkMode ? "dark" : ""}`}>
      {/* Animated Background */}
      <div className="bg-particles">
        <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
        <div className="particle" style={{ left: "30%", animationDelay: "2s" }} />
        <div className="particle" style={{ left: "50%", animationDelay: "4s" }} />
        <div className="particle" style={{ left: "70%", animationDelay: "1s" }} />
        <div className="particle" style={{ left: "90%", animationDelay: "3s" }} />
      </div>

      {/* Navigation */}
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#home" className="brand">
          <Image
            src="/images/logo.jpg"
            alt="BELLEVUE Cabinet Médical"
            width={120}
            height={48}
            className="brand-logo"
            priority
            style={{ width: "auto", height: "auto" }}
          />
          <div className="brand-text">
            <span>BELLEVUE</span>
            <small>CABINET MÉDICAL</small>
          </div>
        </a>
        <nav className={menu ? "navlinks open" : "navlinks"}>
          <a href="#services" onClick={() => setMenu(false)}>Services</a>
          <a href="#cabinet" onClick={() => setMenu(false)}>Le cabinet</a>
          <a href="#booking" onClick={() => setMenu(false)}>Rendez-vous</a>
          <a href="#faq" onClick={() => setMenu(false)}>FAQ</a>
          <a href="#contact" onClick={() => setMenu(false)}>Contact</a>
        </nav>
        <div className="navright">
          <button className="lang">FR</button>
          <button className="outline-btn" onClick={openBooking}>
            Prendre rendez-vous <ArrowUpRight size={14} />
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <button className="hamb" onClick={() => setMenu(!menu)}>
          {menu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-bg-glow" />
        <motion.div className="hero-content" initial="initial" animate="animate" variants={staggerChildren}>
          <motion.div className="hero-copy" variants={fadeInUp}>
            <p className="eyebrow"><span className="dot" /> CABINET MÉDICAL</p>
            <h1>Une médecine<br /><em>plus simple,</em><br />plus humaine.</h1>
            <p className="lead">Une prise en charge attentive, personnalisée et accessible. Prenez rendez-vous en ligne en quelques clics.</p>
            <div className="actions">
              <button className="primary-btn" onClick={openBooking}>Prendre rendez-vous <ArrowUpRight size={16} /></button>
              <a className="wa-btn" href={buildWhatsAppLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>
            </div>
            <div className="available"><span className="live-dot" /> Disponible aujourd&apos;hui</div>
          </motion.div>
          <motion.div className="hero-visual" variants={fadeInUp}>
            <div className="portrait">
              <div className="portrait-placeholder">
                <Image
                  src="/images/doctor-portrait.jpg"
                  alt="Dr. Nadia Rahal"
                  width={600}
                  height={650}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  loading="eager"
                  priority
                />
              </div>
              <div className="portrait-overlay">
                <div className="floating-badge"><Sparkles size={16} /><span>Élite médicale</span></div>
              </div>
            </div>
            <div className="hero-card">
              <strong><Clock size={14} /> {openingSummary}</strong>
              <span><MapPin size={12} /> Bellevue, El Harrach — Alger</span>
            </div>
            <div className="vertical-word">BELLEVUE</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Facts */}
      <motion.section className="facts" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerChildren}>
        {factsData.map((fact) => (
          <motion.div className="fact" key={fact.desc} variants={fadeInUp}>
            <div className="fact-icon">{fact.icon}</div>
            <strong>{fact.label}</strong>
            <span>{fact.desc}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* Services */}
      <section id="services" className="services-section">
        <motion.div className="section-head" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <p className="eyebrow"><span className="dot" /> 01 — NOS SERVICES</p>
            <h2 className="section-title">Des soins pensés<br /><em>pour vous.</em><span className="title-accent">✦</span></h2>
          </div>
          <p className="section-desc">Une approche médicale fondée sur l&apos;écoute, la prévention et un suivi personnalisé.</p>
        </motion.div>

        <div className="services-grid">
          {services.map((s, i) => {
            const display = serviceDisplays[i % serviceDisplays.length];
            return (
              <motion.div
                className="service-card"
                key={s.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                onClick={() => {
                  openBooking();
                  setServiceIdx(i);
                  setStep(2);
                }}
              >
                <div className="service-card-glow" />
                <div className="service-card-content">
                  <div className="service-icon" style={{ color: display.color, background: `${display.color}15` }}>{display.icon}</div>
                  <div className="service-number">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="service-features">
                    {display.features.map((f, idx) => (
                      <span key={idx} className="feature-tag"><Star size={10} />{f}</span>
                    ))}
                  </div>
                  <div className="service-footer">
                    <span className="service-duration"><Clock size={14} /> {s.durationMinutes} min</span>
                    <span className="service-cta">Réserver <ChevronRight size={14} /></span>
                  </div>
                </div>
                <div className="service-card-bg" style={{ background: `linear-gradient(135deg, ${display.color}20, transparent)` }} />
              </motion.div>
            );
          })}
        </div>

        <motion.div className="services-cta" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="services-cta-content">
            <Quote size={20} />
            <p>&quot;La santé est un état d&apos;harmonie entre le corps, l&apos;esprit et l&apos;environnement.&quot;</p>
            <span>— Dr. Nadia Rahal</span>
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section id="cabinet" className="about-section">
        <div className="about-bg-pattern" />
        <motion.div className="about-content" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerChildren}>
          <motion.div className="about-image-wrapper" variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className="about-image">
              <Image
                src="/images/consultation-room.jpg"
                alt="Cabinet de consultation"
                width={600}
                height={600}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
            <div className="about-image-badge"><Fingerprint size={16} /><span>Confiance &amp; Exigence</span></div>
          </motion.div>
          <motion.div className="about-copy" variants={fadeInUp}>
            <p className="eyebrow"><span className="dot" /> 02 — LE CABINET</p>
            <h2>Une relation de confiance,<br /><em>avant tout.</em></h2>
            <p>Le Cabinet Bellevue place l&apos;écoute et l&apos;attention au cœur de chaque consultation. Notre objectif est de rendre votre parcours de soins plus clair, plus humain et plus accessible.</p>
            <div className="doctor-card">
              <div className="doctor-avatar"><User size={20} /></div>
              <div className="doctor-info">
                <strong>Dr. Nadia Rahal</strong>
                <span>Médecine générale · Diplômée de l&apos;Université d&apos;Alger</span>
              </div>
            </div>
            <button className="text-btn" onClick={openBooking}>Prendre rendez-vous <ArrowUpRight size={14} /></button>
          </motion.div>
        </motion.div>
      </section>

      {/* Why */}
      <section className="why-section">
        <div className="why-bg-shapes"><div className="shape shape-1" /><div className="shape shape-2" /></div>
        <motion.div className="section-head" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <p className="eyebrow"><span className="dot" /> 03 — NOTRE APPROCHE</p>
            <h2>Pourquoi<br /><em>Bellevue ?</em></h2>
          </div>
        </motion.div>
        <div className="why-grid-enhanced">
          {whyData.map((item, i) => (
            <motion.div
              className="why-card-enhanced"
              key={item.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="why-card-icon">{item.icon}</div>
              <div className="why-card-number">{item.n}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <motion.div className="section-head" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div>
            <p className="eyebrow"><span className="dot" /> TÉMOIGNAGES</p>
            <h2>Ce que disent<br /><em>nos patients.</em></h2>
          </div>
        </motion.div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="testimonial-card"
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Quote size={24} className="quote-icon" />
              <p>&quot;{t.quote}&quot;</p>
              <div className="testimonial-author">
                <strong>{t.author}</strong>
                <span>{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="process-section">
        <motion.div className="process-content" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerChildren}>
          <motion.div variants={fadeInUp}>
            <p className="eyebrow"><span className="dot" /> 04 — COMMENT ÇA MARCHE</p>
            <h2>Votre rendez-vous<br /><em>en trois étapes.</em></h2>
          </motion.div>
          <div className="steps-enhanced">
            {processData.map(([n, title, desc], i) => (
              <motion.div className="step-enhanced" key={n} variants={fadeInUp} whileHover={{ x: 8 }}>
                <div className="step-number">{n}</div>
                <div className="step-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                {i < processData.length - 1 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section id="booking" className="cta-section">
        <div className="cta-particles">
          <div className="cta-particle" style={{ left: "20%", animationDelay: "0s" }} />
          <div className="cta-particle" style={{ left: "50%", animationDelay: "1.5s" }} />
          <div className="cta-particle" style={{ left: "80%", animationDelay: "3s" }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="cta-content">
          <p className="eyebrow"><span className="dot light" /> 05 — RENDEZ-VOUS</p>
          <h2>Votre prochain rendez-vous<br /><em>commence ici.</em></h2>
          <p>Choisissez votre consultation et votre créneau en moins d&apos;une minute.</p>
          <button className="primary-btn light" onClick={openBooking}>Prendre rendez-vous <ArrowUpRight size={16} /></button>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <motion.div className="faq-content" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerChildren}>
          <motion.div variants={fadeInUp}>
            <p className="eyebrow"><span className="dot" /> 06 — FAQ</p>
            <h2>Questions<br /><em>fréquentes.</em></h2>
          </motion.div>
          <div className="faq-list-enhanced">
            {faqData.map((item) => (
              <motion.details className="faq-item" key={item.q} variants={fadeInUp}>
                <summary>{item.q}<Plus size={18} /></summary>
                <p>{item.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Location */}
      <section className="location-section" id="localisation">
        <div className="location-copy">
          <p className="eyebrow"><span className="dot" /> 07 — NOUS TROUVER</p>
          <h2>Un cabinet proche<br /><em>de vous.</em></h2>
          <div className="location-details">
            <div><MapPin size={18} /><span>Cabinet Bellevue<br />{settings.address}</span></div>
            <div><Phone size={18} /><span>{settings.phone}</span></div>
            <div><Clock size={18} /><span>{formatOpeningHours(settings)}</span></div>
          </div>
          <a className="outline-btn" href="https://www.google.com/maps/search/?api=1&query=Bellevue+El+Harrach+Alger" target="_blank" rel="noopener noreferrer">Itinéraire <ArrowUpRight size={15} /></a>
        </div>
        <div className="location-map">
          <iframe title="Localisation fictive du Cabinet Bellevue" src="https://www.google.com/maps?q=Bellevue%20El%20Harrach%20Alger&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <span className="demo-map-label">Emplacement de démonstration</span>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact-section">
        <motion.div className="contact-content" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerChildren}>
          <motion.div variants={fadeInUp}>
            <p className="eyebrow"><span className="dot" /> 08 — CONTACT</p>
            <h2>Nous sommes<br /><em>à votre écoute.</em></h2>
          </motion.div>
          <div className="contact-grid-enhanced">
            {[
              { icon: <MapPin />, label: "ADRESSE", value: settings.address },
              { icon: <Phone />, label: "TÉLÉPHONE", value: settings.phone },
              { icon: <MessageCircle />, label: "WHATSAPP", value: settings.phone },
              { icon: <Clock />, label: "HORAIRES", value: formatOpeningHours(settings) },
            ].map((item, i) => (
              <motion.div className="contact-item-enhanced" key={i} variants={fadeInUp} whileHover={{ scale: 1.02, x: 4 }}>
                <div className="contact-icon">{item.icon}</div>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer>
        <div className="brand">
          <Image
            src="/images/logo.jpg"
            alt="BELLEVUE Cabinet Médical"
            width={100}
            height={40}
            className="footer-logo"
            style={{ width: "auto", height: "auto" }}
          />
          <div className="brand-text">
            <span>BELLEVUE</span>
            <small>CABINET MÉDICAL</small>
          </div>
        </div>
        <p>Une médecine plus simple, plus humaine.</p>
        <Link href="/admin" className="admin-link">Administration</Link>
        <span>© 2026 Bellevue</span>
      </footer>

      {/* Floating WhatsApp */}
      <motion.button
        className="floating-wa"
        onClick={() => window.open(buildWhatsAppLink(settings.whatsapp), "_blank")}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </motion.button>

      {/* Booking Modal */}
      <AnimatePresence>
        {booking && (
          <motion.div className="overlay" onMouseDown={(e) => e.currentTarget === e.target && closeBooking()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal enhanced-modal" initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              <button className="close" onClick={closeBooking}>×</button>
              <p className="eyebrow"><span className="dot" /> PRENDRE RENDEZ-VOUS</p>
              {step < 5 ? (
                <>
                  <div className="progress">
                    <span className={step >= 1 ? "on" : ""}>01</span><i />
                    <span className={step >= 2 ? "on" : ""}>02</span><i />
                    <span className={step >= 3 ? "on" : ""}>03</span><i />
                    <span className={step >= 4 ? "on" : ""}>04</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div className="book-step" key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                        <h2>Votre consultation</h2>
                        {services.map((s, i) => (
                          <button
                            className={serviceIdx === i ? "choice selected" : "choice"}
                            key={s.id}
                            onClick={() => { setServiceIdx(i); setStep(2); }}
                          >
                            <span>{String(i + 1).padStart(2, "0")}</span>
                            <b>{s.name}</b>
                            <small><Clock size={10} /> {s.durationMinutes} min</small>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div className="book-step" key="step2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                        <h2>Choisissez une date</h2>
                        <div className="dates">
                          {upcomingDates.map((d) => (
                            <button
                              className={dateObj?.toDateString() === d.toDateString() ? "date selected" : "date"}
                              key={d.toISOString()}
                              onClick={() => setDateObj(d)}
                            >
                              <small>{dateLabelFormatter.format(d).toUpperCase()}</small>
                              <b>{d.getDate()}</b>
                            </button>
                          ))}
                        </div>
                        <button className="primary-btn full" disabled={!dateObj} onClick={() => setStep(3)}>Continuer <ChevronRight size={14} /></button>
                        <button className="back-link" onClick={() => setStep(1)}><ChevronLeft size={14} /> Retour</button>
                      </motion.div>
                    )}
                    {step === 3 && dateObj && (
                      <motion.div className="book-step" key="step3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                        <h2>Choisissez un créneau</h2>
                        <p className="muted"><Calendar size={12} /> {confirmFormatter.format(dateObj)} · {selectedService?.name}</p>
                        {availableSlots === null && <p className="muted">Chargement des créneaux…</p>}
                        {availableSlots?.length === 0 && (
                          <p className="muted">Aucun créneau disponible ce jour-là. Essayez une autre date.</p>
                        )}
                        {availableSlots && availableSlots.length > 0 && (
                          <div className="times">
                            {availableSlots.map((iso) => (
                              <button className={timeIso === iso ? "time selected" : "time"} key={iso} onClick={() => setTimeIso(iso)}>
                                {timeFormatter.format(new Date(iso))}
                              </button>
                            ))}
                          </div>
                        )}
                        <button className="primary-btn full" disabled={!timeIso} onClick={() => setStep(4)}>Continuer <ChevronRight size={14} /></button>
                        <button className="back-link" onClick={() => setStep(2)}><ChevronLeft size={14} /> Retour</button>
                      </motion.div>
                    )}
                    {step === 4 && (
                      <motion.form
                        className="book-step"
                        key="step4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit(onSubmitInfo)}
                      >
                        <h2>Vos informations</h2>

                        <div className="field">
                          <label htmlFor="fullName"><User size={11} style={{ display: "inline", marginRight: 4 }} /> Nom complet</label>
                          <input id="fullName" {...register("fullName")} placeholder="Votre nom et prénom" />
                          {errors.fullName && <p className="field-error">Merci de vérifier ce champ.</p>}
                        </div>

                        <div className="field-row">
                          <div className="field">
                            <label htmlFor="phone"><Phone size={11} style={{ display: "inline", marginRight: 4 }} /> Téléphone</label>
                            <input id="phone" type="tel" {...register("phone")} placeholder="0555 12 34 56" />
                            {errors.phone && <p className="field-error">Merci de vérifier ce champ.</p>}
                          </div>
                          <div className="field">
                            <label htmlFor="email"><Mail size={11} style={{ display: "inline", marginRight: 4 }} /> Email</label>
                            <input id="email" type="email" {...register("email")} placeholder="vous@exemple.com" />
                            {errors.email && <p className="field-error">Merci de vérifier ce champ.</p>}
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="message">Motif (optionnel)</label>
                          <textarea id="message" rows={3} {...register("message")} placeholder="Décrivez brièvement le motif de votre visite…" />
                        </div>

                        {submitError && <div className="error-banner">{submitError}</div>}

                        <button type="submit" className="primary-btn full" disabled={submitting}>
                          {submitting ? "Confirmation…" : "Confirmer le rendez-vous"} <ChevronRight size={14} />
                        </button>
                        <button type="button" className="back-link" onClick={() => setStep(3)}><ChevronLeft size={14} /> Retour</button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div className="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20, stiffness: 300 }}>
                  <div className="check"><CheckCircle size={32} /></div>
                  <h2>Votre rendez-vous<br />est confirmé.</h2>
                  {confirmedAt && selectedService && (
                    <p>
                      {selectedService.name}
                      <br />
                      {confirmFormatter.format(confirmedAt)} · {timeFormatter.format(confirmedAt)}
                      <br />
                      {settings.cabinetName} · Alger
                    </p>
                  )}
                  <button className="primary-btn full" onClick={closeBooking}>Terminer</button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
