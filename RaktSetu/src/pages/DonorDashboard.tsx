import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Droplets, LogOut, Heart, MapPin, Calendar, Award, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSession, logout, getDonorProfile, getAppointments, createAppointment,
  type DonorProfile, type DonationAppointment,
} from "@/lib/api";

type View = "dashboard" | "drives" | "history" | "impact";

const navItems = [
  { label: "Dashboard", path: "/donor", view: "dashboard" as View, icon: Heart },
  { label: "Find Drives", path: "/donor/drives", view: "drives" as View, icon: MapPin },
  { label: "My Donations", path: "/donor/history", view: "history" as View, icon: Calendar },
  { label: "Impact", path: "/donor/impact", view: "impact" as View, icon: Award },
];

const upcomingDrives = [
  { id: 1, name: "City Community Blood Drive", location: "Central Park Community Center", date: "2026-08-22", slots: 24 },
  { id: 2, name: "University Campus Drive", location: "Medical College Auditorium", date: "2026-08-25", slots: 18 },
  { id: 3, name: "Corporate Wellness Drive", location: "Tech Park, Building 3", date: "2026-08-28", slots: 30 },
];

const statusConfig = (s: string) => {
  if (s === "completed") return { icon: CheckCircle2, class: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" };
  if (s === "cancelled") return { icon: XCircle, class: "text-red-500", bg: "bg-red-50", badge: "bg-red-100 text-red-600" };
  return { icon: Clock, class: "text-blue-500", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" };
};

export default function DonorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [appointments, setAppointments] = useState<DonationAppointment[]>([]);
  const [scheduling, setScheduling] = useState<number | null>(null);

  const view: View =
    location.pathname.endsWith("impact") ? "impact" :
    location.pathname.endsWith("history") ? "history" :
    location.pathname.endsWith("drives") ? "drives" : "dashboard";

  const load = async () => {
    const session = getSession();
    if (!session || session.role !== "donor") { navigate("/user/login"); return; }
    const [p, appts] = await Promise.all([getDonorProfile(), getAppointments()]);
    setProfile(p);
    setAppointments(appts);
  };

  useEffect(() => { void load(); }, []);

  const handleSchedule = async (drive: (typeof upcomingDrives)[number]) => {
    setScheduling(drive.id);
    try {
      await createAppointment({ drive_name: drive.name, location: drive.location, appointment_date: drive.date });
      await load();
    } finally { setScheduling(null); }
  };

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const impactLives = Math.max(appointments.length, 1) * 3;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 card-shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Donor</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{profile?.full_name ?? "Loading…"}</p>
            </div>
          </div>
          {profile?.blood_group && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5">
              <Droplets className="h-3 w-3 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">{profile.blood_group}</span>
            </div>
          )}
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === item.view ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {view === "dashboard" ? `Welcome, ${profile?.full_name?.split(" ")[0] ?? "Donor"}` :
                view === "drives" ? "Find a Drive" :
                view === "history" ? "Donation History" : "Your Impact"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {view === "dashboard" ? "Your donation overview" :
                view === "drives" ? "Schedule your next donation" :
                view === "history" ? "All your donation appointments" : "The lives you've helped save"}
            </p>
          </div>

          {view === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Scheduled", value: scheduledCount, color: "text-blue-600" },
                  { label: "Completed", value: completedCount, color: "text-emerald-600" },
                  { label: "Lives Impacted", value: impactLives, color: "text-rose-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-5">
                    <p className="text-sm text-gray-500 mb-2">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl card-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Recent Appointments</h2>
                  <Link to="/donor/drives" className="text-xs font-medium text-emerald-600 hover:underline">
                    Find drives →
                  </Link>
                </div>
                {appointments.length === 0 ? (
                  <div className="text-center py-10">
                    <Heart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-3">No appointments yet.</p>
                    <Link to="/donor/drives">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Find a Drive</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 4).map((a) => {
                      const sc = statusConfig(a.status);
                      return (
                        <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
                              <sc.icon className={`h-5 w-5 ${sc.class}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{a.drive_name}</p>
                              <p className="text-xs text-gray-500">{new Date(a.appointment_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.badge}`}>{a.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "drives" && (
            <div className="space-y-4">
              {upcomingDrives.map((drive) => {
                const alreadyScheduled = appointments.some((a) => a.drive_name === drive.name);
                return (
                  <div key={drive.id} className="bg-white rounded-2xl card-shadow p-6 flex items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Heart className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{drive.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <MapPin className="h-3 w-3" />{drive.location}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />{new Date(drive.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 mb-2">{drive.slots} slots available</p>
                      <Button
                        size="sm"
                        disabled={alreadyScheduled || scheduling === drive.id}
                        onClick={() => void handleSchedule(drive)}
                        className={alreadyScheduled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"}>
                        {alreadyScheduled ? "✓ Scheduled" : scheduling === drive.id ? "Scheduling…" : "Schedule"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "history" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No donations yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((a) => {
                    const sc = statusConfig(a.status);
                    return (
                      <div key={a.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`}>
                            <sc.icon className={`h-5 w-5 ${sc.class}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{a.drive_name}</p>
                            <p className="text-xs text-gray-500">{a.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.badge} block mb-1`}>{a.status}</span>
                          <p className="text-xs text-gray-400">{new Date(a.appointment_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === "impact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Donations", value: appointments.length, sub: "drives attended", color: "text-blue-600" },
                  { label: "Completed", value: completedCount, sub: "successful donations", color: "text-emerald-600" },
                  { label: "Lives Impacted", value: impactLives, sub: "estimated lives saved", color: "text-rose-600" },
                  { label: "Blood Group", value: profile?.blood_group ?? "—", sub: "your blood type", color: "text-purple-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-6">
                    <p className="text-sm text-gray-500 mb-2">{s.label}</p>
                    <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              {appointments.length > 0 && (
                <div className="bg-white rounded-2xl card-shadow p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Donation Timeline</h2>
                  <div className="flex flex-wrap gap-2">
                    {appointments.map((a, i) => {
                      const sc = statusConfig(a.status);
                      return (
                        <div key={i} title={`${a.drive_name} — ${a.status}`}
                          className={`w-8 h-8 rounded-lg ${sc.bg} flex items-center justify-center`}>
                          <sc.icon className={`h-4 w-4 ${sc.class}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white text-center">
                <Heart className="h-10 w-10 mx-auto mb-3 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Thank you for donating!</h3>
                <p className="text-white/70 text-sm">Every donation makes a real difference.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
