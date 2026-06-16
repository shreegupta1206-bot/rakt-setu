import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Droplets, LogOut, Package, Clock, BarChart3, Bell, Save, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSession, logout, getBloodBankProfile, getInventory, getAllBloodRequests,
  updateBloodRequest, updateInventoryItem, bloodGroups,
  type BloodBankProfile, type InventoryItem, type BloodRequest,
} from "@/lib/api";

type View = "dashboard" | "requests" | "analytics";

const navItems = [
  { label: "Dashboard", path: "/bloodbank", view: "dashboard" as View, icon: Package },
  { label: "Requests", path: "/bloodbank/requests", view: "requests" as View, icon: Clock },
  { label: "Analytics", path: "/bloodbank/analytics", view: "analytics" as View, icon: BarChart3 },
];

const urgencyBadge = (u: string) => {
  if (u === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (u === "urgent") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const levelColor = (units: number) => {
  if (units === 0) return "bg-red-500";
  if (units < 4) return "bg-orange-400";
  if (units < 8) return "bg-amber-400";
  return "bg-emerald-500";
};

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<BloodBankProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [draftUnits, setDraftUnits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const view: View =
    location.pathname.endsWith("analytics") ? "analytics" :
    location.pathname.endsWith("requests") ? "requests" : "dashboard";

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const hasPending = pendingRequests.length > 0;

  const load = async () => {
    const session = getSession();
    if (!session || session.role !== "blood_bank") { navigate("/bloodbank/login"); return; }
    setUserId(session.userId);
    const [p, inv, reqs] = await Promise.all([getBloodBankProfile(), getInventory(), getAllBloodRequests()]);
    setProfile(p);
    setInventory(inv);
    setRequests(reqs);
    setDraftUnits(Object.fromEntries(inv.map((i) => [i.id, String(i.units)])));
  };

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (hasPending && audioRef.current) audioRef.current.play().catch(() => {});
  }, [hasPending]);

  const handleCommit = async (req: BloodRequest) => {
    const item = inventory.find((i) => i.blood_group === req.blood_group);
    if (!item || item.units < req.units) return;
    await updateBloodRequest(req.id, { status: "committed", committed_by: userId, acknowledged_at: new Date().toISOString() });
    await updateInventoryItem(item.id, item.units - req.units);
    await load();
  };

  const handleAcknowledge = async (req: BloodRequest) => {
    await updateBloodRequest(req.id, { acknowledged_at: new Date().toISOString() });
    await load();
  };

  const handleSaveInventory = async (item: InventoryItem) => {
    const parsed = Number(draftUnits[item.id]);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed === item.units) return;
    setSavingId(item.id);
    try { await updateInventoryItem(item.id, parsed); await load(); }
    finally { setSavingId(null); }
  };

  const totalUnits = inventory.reduce((s, i) => s + i.units, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <audio ref={audioRef} loop>
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" type="audio/mpeg" />
      </audio>

      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 card-shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Blood Bank</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{profile?.bank_name ?? "Loading…"}</p>
            </div>
          </div>
          {hasPending && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <Bell className="h-3.5 w-3.5 text-red-500 animate-bounce" />
              <span className="text-xs font-semibold text-red-600">{pendingRequests.length} pending</span>
            </div>
          )}
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === item.view ? "bg-rose-50 text-rose-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.view === "requests" && hasPending && (
                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
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
              {view === "dashboard" ? "Overview" : view === "requests" ? "All Requests" : "Analytics"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Blood bank management and coordination</p>
          </div>

          {view === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Inventory", value: `${totalUnits}u`, color: "text-rose-600" },
                  { label: "Pending Requests", value: pendingRequests.length, color: "text-amber-600" },
                  { label: "Types in Stock", value: inventory.filter((i) => i.units > 0).length, color: "text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-5">
                    <p className="text-sm text-gray-500 mb-2">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {pendingRequests.length > 0 && (
                <div className="bg-white rounded-2xl card-shadow border border-red-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-4 w-4 text-red-500" />
                    <h2 className="text-sm font-semibold text-red-700">Action Required — Pending Requests</h2>
                  </div>
                  <div className="space-y-3">
                    {pendingRequests.map((r) => {
                      const item = inventory.find((i) => i.blood_group === r.blood_group);
                      const canCommit = item && item.units >= r.units;
                      return (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center card-shadow">
                              <span className="text-sm font-bold text-rose-600">{r.blood_group}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{r.units} units needed</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${urgencyBadge(r.urgency)}`}>{r.urgency}</span>
                              {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!r.acknowledged_at && (
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleAcknowledge(r)}>
                                Acknowledge
                              </Button>
                            )}
                            <Button size="sm" disabled={!canCommit}
                              className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={() => void handleCommit(r)}>
                              Commit <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl card-shadow p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Blood Inventory</h2>
                <div className="grid grid-cols-4 gap-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-3 hover:border-rose-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-rose-600">{item.blood_group}</span>
                        <div className={`w-2 h-2 rounded-full ${levelColor(item.units)}`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          className="h-8 text-sm px-2 w-14"
                          value={draftUnits[item.id] ?? item.units}
                          onChange={(e) => {
                            if (/^\d*$/.test(e.target.value))
                              setDraftUnits((d) => ({ ...d, [item.id]: e.target.value }));
                          }}
                        />
                        <button
                          onClick={() => void handleSaveInventory(item)}
                          disabled={savingId === item.id || draftUnits[item.id] === String(item.units)}
                          className="text-gray-300 hover:text-emerald-500 disabled:opacity-30 transition-colors">
                          {savingId === item.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "requests" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              {requests.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No requests yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => {
                    const item = inventory.find((i) => i.blood_group === r.blood_group);
                    const canCommit = r.status === "pending" && item && item.units >= r.units;
                    return (
                      <div key={r.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-rose-600">{r.blood_group}</span>
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
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            r.status === "pending" ? "bg-amber-100 text-amber-700" :
                            r.status === "committed" ? "bg-blue-100 text-blue-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>{r.status}</span>
                          {canCommit && (
                            <Button size="sm" className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={() => void handleCommit(r)}>Commit</Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Inventory Units", value: totalUnits },
                  { label: "Pending Requests", value: pendingRequests.length },
                  { label: "Committed", value: requests.filter((r) => r.status === "committed").length },
                  { label: "Delivered", value: requests.filter((r) => r.status === "delivered").length },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl card-shadow p-5">
                    <p className="text-sm text-gray-500 mb-2">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl card-shadow p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-5">Inventory Levels by Blood Group</h2>
                <div className="space-y-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-rose-600 w-8">{item.blood_group}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${levelColor(item.units)}`}
                          style={{ width: `${Math.min((item.units / 20) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{item.units}u</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
