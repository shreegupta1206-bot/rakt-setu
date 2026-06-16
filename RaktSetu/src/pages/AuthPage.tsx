import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bloodGroups, login, register, getSession } from "@/lib/api";
import type { AppRole } from "@/lib/api";

const dashboardMap: Record<AppRole, string> = {
  hospital: "/hospital",
  blood_bank: "/bloodbank",
  donor: "/donor",
};

const roleConfig = {
  hospital: { color: "from-blue-500 to-blue-600", bg: "bg-blue-50", accent: "text-blue-600", border: "border-blue-200" },
  blood_bank: { color: "from-rose-500 to-red-600", bg: "bg-rose-50", accent: "text-rose-600", border: "border-rose-200" },
  donor: { color: "from-emerald-500 to-green-600", bg: "bg-emerald-50", accent: "text-emerald-600", border: "border-emerald-200" },
};

interface AuthPageProps {
  role: AppRole;
  roleLabel: string;
}

export default function AuthPage({ role, roleLabel }: AuthPageProps) {
  const navigate = useNavigate();
  const cfg = roleConfig[role];
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.role === role) navigate(dashboardMap[role]);
  }, [role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        await register(email, password, role, { name, address, phone, bloodGroup, city });
      }
      navigate(dashboardMap[role]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const namePlaceholder =
    role === "hospital" ? "City General Hospital" :
    role === "blood_bank" ? "Central Blood Bank" : "Your Full Name";

  return (
    <div className="min-h-screen gradient-hero flex">
      <div className="hidden lg:flex flex-col w-[420px] gradient-primary p-12 text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <Link to="/" className="flex items-center gap-2 mb-auto relative">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">Rakt Setu</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            {roleLabel} Portal
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            {role === "hospital" && "Request and track blood units for your patients in real-time."}
            {role === "blood_bank" && "Manage your blood inventory and respond to hospital requests."}
            {role === "donor" && "Schedule donations, find drives, and track your life-saving impact."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="bg-white rounded-2xl card-shadow p-8">
            <div className={`inline-flex items-center gap-2 ${cfg.bg} rounded-full px-3 py-1 mb-6`}>
              <Droplets className={`h-3.5 w-3.5 ${cfg.accent}`} />
              <span className={`text-xs font-semibold ${cfg.accent} uppercase tracking-wider`}>{roleLabel}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-500 mb-7">
              {isLogin ? "Sign in to continue to your dashboard" : `Register as a ${roleLabel.toLowerCase()}`}
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <Input className="mt-1.5 h-11" placeholder={namePlaceholder} value={name}
                    onChange={(e) => setName(e.target.value)} required />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Email address</Label>
                <Input className="mt-1.5 h-11" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative mt-1.5">
                  <Input className="h-11 pr-10" type={showPassword ? "text" : "password"}
                    placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-4 pt-1">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Address <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input className="mt-1.5 h-11" placeholder="123 Main St" value={address}
                      onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input className="mt-1.5 h-11" placeholder="+1 555 000 0000" value={phone}
                      onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  {role === "donor" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Blood Group</Label>
                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                          <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">City</Label>
                        <Input className="mt-1.5 h-11" placeholder="New York" value={city}
                          onChange={(e) => setCity(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading}
                className={`w-full h-11 text-sm font-semibold bg-gradient-to-r ${cfg.color} border-0 hover:opacity-90 transition-opacity mt-2`}>
                {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isLogin ? "Don't have an account?" : "Already have one?"}{" "}
              <button type="button"
                className={`font-semibold ${cfg.accent} hover:underline`}
                onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="hover:text-gray-600 transition-colors">← Back to portal selection</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
