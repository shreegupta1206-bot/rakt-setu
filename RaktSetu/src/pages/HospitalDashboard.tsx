import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Droplets, LogOut, Plus, Activity, FileText, BarChart3, X, AlertCircle, Clock, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getSession, logout, getHospitalProfile, getHospitalRequests, createBloodRequest, bloodGroups,
  type HospitalProfile, type BloodRequest,
} from "@/lib/api";

type View = "dashboard" | "requests" | "analytics";

const navItems = [
  { label: "Dashboard", path: "/hospital", view: "dashboard" as View, icon: Activity },
  { label: "Requests", path: "/hospital/requests", view: "requests" as View, icon: FileText },
  { label: "Analytics", path: "/hospital/analytics", view: "analytics" as View, icon: BarChart3 },
];

const urgencyBadge = (u: string) => {
  if (u === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (u === "urgent") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const statusBadge = (s: string) => {
  if (s === "pending") return "bg-amber-100 text-amber-700";
  if (s === "committed" || s === "in_transit") return "bg-blue-100 text-blue-700";
  if (s === "delivered") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-600";
};

const statusIcon = (s: string) => {
  if (s === "pending") return <Clock className="h-3.5 w-3.5" />;
  if (s === "committed" || s === "in_transit") return <AlertCircle className="h-3.5 w-3.5" />;
  return <CheckCircle2 className="h-3.5 w-3.5" />;
};

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState("1");
  const [urgency, setUrgency] = useState<"critical" | "urgent" | "routine">("urgent");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const view: View =
    location.pathname.endsWith("analytics") ? "analytics" :
    location.pathname.endsWith("requests") ? "requests" : "dashboard";

  const load = async () => {
    const session = getSession();
    if (!session || session.role !== "hospital") { navigate("/hospital/login"); return; }
    const [p, r] = await Promise.all([getHospitalProfile(), getHospitalRequests()]);
    setProfile(p);
    setRequests(r);
  };

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return;
    setSubmitting(true); setError("");
    try {
      await createBloodRequest({ blood_group: bloodGroup, units: Number(units), urgency, notes });
      setShowForm(false); setBloodGroup(""); setUnits("1"); setNotes("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally { setSubmitting(false); }
  };

  const totalUnits = requests.reduce((s, r) => s + r.units, 0);
  const criticalCount = requests.filter((r) => r.urgency === "critical").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 card-shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Hospital</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{profile?.hospital_name ?? "Loading…"}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === item.view
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {view === "dashboard" ? "Overview" : view === "requests" ? "Blood Requests" : "Analytics"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {view === "dashboard" ? "Your hospital blood request summary" :
                  view === "requests" ? "All submitted blood requests" : "Request statistics and trends"}
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 text-sm font-semibold">
              <Plus className="h-4 w-4" /> New Request
            </Button>
          </div>

          {view === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Requests", value: requests.length, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pending", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Critical", value: criticalCount, color: "text-red-600", bg: "bg-red-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-5">
                    <p className="text-sm text-gray-500 mb-3">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl card-shadow p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Requests</h2>
                {requests.length === 0 ? (
                  <div className="text-center py-10">
                    <Droplets className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No requests yet. Click "New Request" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 6).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center card-shadow">
                            <span className="text-sm font-bold text-blue-600">{r.blood_group}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{r.units} units</p>
                            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${urgencyBadge(r.urgency)}`}>
                              {r.urgency}
                            </span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(r.status)}`}>
                          {statusIcon(r.status)}{r.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "requests" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              {requests.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No requests submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="text-base font-bold text-blue-600">{r.blood_group}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">{r.units} units</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${urgencyBadge(r.urgency)}`}>{r.urgency}</span>
                          </div>
                          {r.notes && <p className="text-xs text-gray-500 mb-1">{r.notes}</p>}
                          <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(r.status)}`}>
                        {statusIcon(r.status)}{r.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Units Requested", value: totalUnits },
                  { label: "Critical Requests", value: criticalCount },
                  { label: "Pending", value: pendingCount },
                  { label: "Fulfilled", value: requests.filter((r) => r.status === "delivered").length },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-5">
                    <p className="text-sm text-gray-500 mb-2">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl card-shadow p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-5">Requests by Blood Group</h2>
                <div className="space-y-3">
                  {bloodGroups.map((bg) => {
                    const count = requests.filter((r) => r.blood_group === bg).length;
                    if (!count) return null;
                    return (
                      <div key={bg} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-blue-600 w-8">{bg}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${(count / requests.length) * 100}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                  {requests.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl card-shadow-hover p-7 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">New Blood Request</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup} required>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Units</Label>
                  <Input className="mt-1.5 h-11" type="number" min="1" value={units} onChange={(e) => setUnits(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Urgency</Label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="urgent">🟡 Urgent</SelectItem>
                      <SelectItem value="routine">🟢 Routine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input className="mt-1.5 h-11" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information…" />
              </div>
              {error && <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !bloodGroup}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting ? "Submitting…" : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
