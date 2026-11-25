import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
} from "@heroui/react";
import {
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  MapPinned,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: UsersRound, label: "Every account, join date and sign-in location" },
  { icon: MapPinned, label: "Country, city and region breakdowns from real visits" },
  { icon: MousePointerClick, label: "UTM source, medium and campaign attribution" },
  { icon: Smartphone, label: "Device, browser and operating-system signals" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err?.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#08080d] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-xl">
          <p className="eyebrow mb-4">Operations console</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
            Every listener.
            <br />
            <span className="gradient-text">Every signal.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-default-400">
            A single view over the ZYRAVA accounts, arrivals, acquisition channels and listening
            library — reading the same MongoDB database as the production API.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-violet-300">
                  <feature.icon className="h-4 w-4" />
                </div>
                <p className="text-[13px] text-default-400">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-default-600">
          <span className="h-px w-8 bg-white/10" />
          zyrava-server · MongoDB · read-only
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand />
          </div>

          <Card className="border border-white/[0.07] bg-content1/75 shadow-card backdrop-blur-xl">
            <CardBody className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/12 text-violet-300">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Administrator sign-in
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-default-500">
                  Use the ADMIN_EMAIL and ADMIN_PASSWORD configured on zyrava-server. Sessions last
                  up to 12 hours.
                </p>
              </div>

              {error ? (
                <Alert
                  color="danger"
                  variant="flat"
                  className="mb-5 border border-rose-500/20 bg-rose-500/[0.06]"
                  title="Sign-in failed"
                  description={error}
                />
              ) : null}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                  type="email"
                  label="Admin email"
                  labelPlacement="outside"
                  placeholder="admin@zyrava.app"
                  value={email}
                  onValueChange={setEmail}
                  autoComplete="username"
                  autoFocus
                  isRequired
                  size="lg"
                  variant="bordered"
                  startContent={<Mail className="h-4 w-4 text-default-500" />}
                  classNames={{ inputWrapper: "border-white/10 bg-content2/40" }}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  labelPlacement="outside"
                  placeholder="••••••••••••"
                  value={password}
                  onValueChange={setPassword}
                  autoComplete="current-password"
                  isRequired
                  size="lg"
                  variant="bordered"
                  startContent={<LockKeyhole className="h-4 w-4 text-default-500" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded-lg p-1 text-default-500 transition hover:text-default-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  classNames={{ inputWrapper: "border-white/10 bg-content2/40" }}
                />
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="mt-2 w-full font-semibold"
                  isLoading={loading}
                  isDisabled={!email || !password}
                >
                  Enter the console
                </Button>
              </form>

              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-[11px] leading-relaxed text-default-500">
                  Credentials are verified inside zyrava-server. The browser never sees the MongoDB
                  connection string or the user collection directly.
                </p>
              </div>
            </CardBody>
          </Card>

          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-default-600">
            ZYRAVA · internal analytics
          </p>
        </div>
      </section>
    </div>
  );
}
