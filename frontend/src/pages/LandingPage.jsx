import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Soup, HandHeart, Sprout, Heart, ArrowRight, UserPlus,
  HandCoins, PackageCheck, LineChart,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const STATS = [
  { value: "12,400+", label: "Meals delivered" },
  { value: "340+",    label: "Families helped" },
  { value: "80+",     label: "NGO partners" },
  { value: "₹4.2L+",  label: "Funds raised" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create an account",     desc: "Sign up as a donor or NGO in under a minute.",                          icon: UserPlus,     color: "#ff6600" },
  { step: "02", title: "Make a donation",        desc: "Donate items or money to verified campaigns and NGOs.",                icon: HandCoins,    color: "#c0453a" },
  { step: "03", title: "NGO accepts & delivers", desc: "Verified NGOs accept donations and ensure they reach those in need.",  icon: PackageCheck, color: "#e07b39" },
  { step: "04", title: "Track your impact",      desc: "Monitor your donations and see real-world impact on your dashboard.",  icon: LineChart,    color: "#b03a2e" },
];

const MISSION_POINTS = [
  { icon: Soup,      title: "Zero hunger",        desc: "Every day, millions of children go to bed hungry. We connect surplus food with those who need it most — eliminating waste while fighting hunger." },
  { icon: HandHeart, title: "Community unity",    desc: "We believe kindness is contagious. Our platform empowers ordinary people to become everyday heroes in their communities." },
  { icon: Sprout,    title: "Sustainable impact",  desc: "Through transparent reporting and verified NGO partnerships, we ensure every donation creates lasting, measurable change." },
];

const GALLERY = [
  { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80", alt: "Children receiving food" },
  { url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80", alt: "Volunteers serving meals" },
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80", alt: "Community donation" },
  { url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80", alt: "Child smiling after receiving food" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-[DM_Sans] overflow-x-hidden" style={{ backgroundColor: "var(--color-bg-sidebar)" }}>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-sm border-b px-6 md:px-12 py-4 flex justify-between items-center"
        style={{ backgroundColor: "var(--color-bg-sidebar)", borderColor: "var(--color-border-soft)" }}
      >
        <div className="flex items-center gap-2 font-['DM_Serif_Display'] text-[20px]" style={{ color: "var(--color-text-primary)" }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
          Heart Share
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm transition px-3 py-1.5" style={{ color: "var(--color-text-secondary)" }}>
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm transition text-white px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div className="flex-1 max-w-xl" {...fadeUp}>
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-5 border"
            style={{ backgroundColor: "var(--status-pending-bg)", color: "var(--color-primary)", borderColor: "#f5c9b0" }}
          >
            <Soup size={13} /> Fighting hunger, one meal at a time
          </div>
          <h1 className="font-['DM_Serif_Display'] text-[42px] md:text-[54px] leading-tight mb-5" style={{ color: "var(--color-text-primary)" }}>
            Share from your <span style={{ color: "var(--color-primary)" }}>heart,</span><br />feed a life.
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
            HeartShare connects generous donors with verified NGOs to ensure surplus food,
            essential items, and funds reach children and families who need them most.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 transition text-white px-6 py-3 rounded-xl font-medium"
              style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 8px 20px rgba(255,102,0,0.18)" }}
            >
              Start donating <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="border transition px-6 py-3 rounded-xl font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              How it works
            </a>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 grid grid-cols-2 gap-3 max-w-sm md:max-w-md w-full"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {GALLERY.map((img, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden shadow-md lift-on-hover ${i === 0 ? "col-span-2 h-48" : "h-36"}`}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* Stats banner */}
      <motion.section
        className="py-10 px-6"
        style={{ backgroundColor: "var(--color-primary)" }}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-['DM_Serif_Display'] text-[32px] md:text-[38px]">{s.value}</div>
              <div className="text-white/75 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Mission */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>Our purpose</div>
          <h2 className="font-['DM_Serif_Display'] text-[36px] md:text-[42px]" style={{ color: "var(--color-text-primary)" }}>Why HeartShare exists</h2>
          <p className="text-base mt-4 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Over 190 million children in India face food insecurity every day.
            We built HeartShare to make it effortless for anyone to help.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MISSION_POINTS.map((m, i) => (
            <motion.div
              key={m.title}
              className="bg-white rounded-2xl p-6 border lift-on-hover"
              style={{ borderColor: "var(--color-border-soft)" }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--status-pending-bg)", color: "var(--color-primary)" }}
              >
                <m.icon size={22} strokeWidth={1.75} />
              </div>
              <div className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>{m.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emotional quote image */}
      <section className="py-10 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          className="relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[380px] flex items-end"
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80"
            alt="Children in need"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
            <p className="font-['DM_Serif_Display'] text-[26px] md:text-[34px] leading-snug mb-3">
              A child who is fed can dream. A child who dreams can change the world.
            </p>
            <p className="text-white/70 text-sm">— HeartShare Mission Statement</p>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>Simple process</div>
          <h2 className="font-['DM_Serif_Display'] text-[36px] md:text-[42px]" style={{ color: "var(--color-text-primary)" }}>How it works</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connecting line — only visible at the breakpoint where cards sit in one row */}
          <div
            className="hidden lg:block absolute top-[38px] left-[12.5%] right-[12.5%] h-px"
            style={{ backgroundColor: "var(--color-border)" }}
            aria-hidden="true"
          />
          {HOW_IT_WORKS.map((h, i) => (
            <motion.div
              key={h.step}
              className="relative bg-white rounded-2xl p-5 border lift-on-hover"
              style={{ borderColor: "var(--color-border-soft)" }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${h.color}1A`, color: h.color }}
                >
                  <h.icon size={17} strokeWidth={1.75} />
                </div>
                <div className="text-[22px] font-['DM_Serif_Display']" style={{ color: h.color }}>{h.step}</div>
              </div>
              <div className="font-semibold mb-2 text-sm" style={{ color: "var(--color-text-primary)" }}>{h.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{h.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-6 md:px-12 border-y" style={{ backgroundColor: "#fff8f2", borderColor: "var(--color-bg-app)" }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <motion.div className="flex-1" {...fadeUp}>
            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>Our vision</div>
            <h2 className="font-['DM_Serif_Display'] text-[32px] md:text-[38px] leading-snug mb-4" style={{ color: "var(--color-text-primary)" }}>
              A world where no child sleeps hungry
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              We envision an India where food surplus is never wasted, where communities
              stand for each other, and where technology bridges the gap between abundance
              and need. HeartShare is that bridge — built with love, powered by people.
            </p>
          </motion.div>
          <motion.div
            className="flex-1 rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=700&q=80"
              alt="Volunteers working together"
              className="w-full h-64 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section className="py-20 px-6 text-center" {...fadeUp}>
        <div className="max-w-2xl mx-auto">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "var(--status-pending-bg)", color: "var(--color-primary)" }}
          >
            <Heart size={26} strokeWidth={1.75} fill="var(--color-primary)" />
          </div>
          <h2 className="font-['DM_Serif_Display'] text-[34px] md:text-[42px] mb-4" style={{ color: "var(--color-text-primary)" }}>
            Ready to make a difference?
          </h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Join thousands of donors, NGOs, and volunteers who are already changing lives one meal at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 transition text-white px-8 py-3 rounded-xl font-medium text-sm"
              style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 8px 20px rgba(255,102,0,0.18)" }}
            >
              Create free account <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="border transition px-8 py-3 rounded-xl font-medium text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              Login
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-white/60 text-center py-6 text-xs px-4" style={{ backgroundColor: "var(--color-text-primary)" }}>
        <div className="flex items-center justify-center gap-2 font-['DM_Serif_Display'] text-white text-base mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
          Heart Share
        </div>
        © {new Date().getFullYear()} HeartShare. Built to fight hunger.
      </footer>

    </div>
  );
}