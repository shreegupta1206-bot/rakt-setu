import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Droplets, Heart, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

const portals = [
  {
    title: "Hospital",
    description: "Request blood units in real-time, track fulfillment status, and manage emergency needs.",
    icon: Building2,
    path: "/hospital/login",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
  },
  {
    title: "Blood Bank",
    description: "Manage inventory across all blood groups, respond to hospital emergencies instantly.",
    icon: Droplets,
    path: "/bloodbank/login",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "border-rose-100",
  },
  {
    title: "Donor",
    description: "Find donation drives near you, schedule appointments, and track your life-saving impact.",
    icon: Heart,
    path: "/user/login",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
  },
];

const stats = [
  { icon: Zap, label: "Real-time Updates", desc: "Live request tracking across all portals" },
  { icon: Shield, label: "Secure & Reliable", desc: "JWT-authenticated, always-on API" },
  { icon: BarChart3, label: "Full Analytics", desc: "Insights on inventory and requests" },
];

export default function Index() {
  return (
    <div className="min-h-screen gradient-hero">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">RaktSetu</span>
        </div>
        <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">Blood Logistics Platform</span>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-16 pb-20"
        >
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Live Blood Coordination</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Every Second
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">
              Saves a Life
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            HemoLink connects hospitals, blood banks, and donors in real-time — so the right blood reaches the right patient, fast.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {portals.map((portal, i) => (
            <motion.div
              key={portal.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <Link
                to={portal.path}
                className={`group block h-full bg-white border ${portal.border} rounded-2xl p-7 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl ${portal.bg} flex items-center justify-center mb-5`}>
                  <portal.icon className={`h-6 w-6 ${portal.iconColor}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{portal.title} Portal</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{portal.description}</p>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${portal.color} bg-clip-text text-transparent`}>
                  Enter Portal
                  <ArrowRight className={`h-4 w-4 ${portal.iconColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-100 rounded-2xl card-shadow p-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why HemoLink?</h2>
            <p className="text-gray-500">Built for speed, reliability and life-saving coordination</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.label}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        HemoLink v2.0 — Blood Logistics Coordination Platform
      </footer>
    </div>
  );
}
