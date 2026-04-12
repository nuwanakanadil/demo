import { ArrowRight, Heart, Recycle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "../components/ui/Button";

type LandingPageProps = {
  isAuthenticated: boolean;
  onPrimaryAction: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onPrimaryIntent?: () => void;
  onLoginIntent?: () => void;
  onRegisterIntent?: () => void;
};

export function LandingPage({
  isAuthenticated,
  onPrimaryAction,
  onLogin,
  onRegister,
  onPrimaryIntent,
  onLoginIntent,
  onRegisterIntent,
}: Readonly<LandingPageProps>) {
  const featureCards = [
    {
      icon: Recycle,
      title: "Swap without waste",
      text: "Keep quality clothes in rotation instead of in storage.",
    },
    {
      icon: ShieldCheck,
      title: "Safe and transparent",
      text: "Clear statuses and verified accounts keep every step understandable.",
    },
    {
      icon: Heart,
      title: "Style that feels personal",
      text: "Find unique pieces from people with similar taste.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-1px)] bg-[radial-gradient(circle_at_0%_0%,rgba(66,145,114,0.16),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(66,145,114,0.1),transparent_35%)]">
      <header className="border-b border-white/70 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ReWear"
              width={144}
              height={36}
              decoding="async"
              className="h-9 w-auto"
            />
            <span className="text-lg font-bold tracking-tight text-neutral-900">ReWear</span>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogin}
                onMouseEnter={onLoginIntent}
                onFocus={onLoginIntent}
              >
                Login
              </Button>
            )}
            <Button
              size="sm"
              onClick={isAuthenticated ? onPrimaryAction : onRegister}
              onMouseEnter={isAuthenticated ? onPrimaryIntent : onRegisterIntent}
              onFocus={isAuthenticated ? onPrimaryIntent : onRegisterIntent}
            >
              {isAuthenticated ? "Continue" : "Join Free"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <section className="landing-fade-up pt-2">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Customer-first fashion exchange
            </p>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
              Love your wardrobe.
              <br />
              Spend less.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Discover pieces you actually want, swap what you do not wear, and refresh your style
              without fast-fashion waste. Built for real people, simple choices, and confident swaps.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={onPrimaryAction}
                onMouseEnter={onPrimaryIntent}
                onFocus={onPrimaryIntent}
              >
                {isAuthenticated ? "Start Browsing" : "Start Swapping"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={onLogin}
                  onMouseEnter={onLoginIntent}
                  onFocus={onLoginIntent}
                >
                  I already have an account
                </Button>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="landing-fade-up rounded-xl border border-white/80 bg-white/70 p-3 backdrop-blur-sm" style={{ animationDelay: "80ms" }}>
                <p className="text-xs font-semibold text-neutral-500">Average save</p>
                <p className="mt-1 text-xl font-bold text-neutral-900">40%+</p>
              </div>
              <div className="landing-fade-up rounded-xl border border-white/80 bg-white/70 p-3 backdrop-blur-sm" style={{ animationDelay: "140ms" }}>
                <p className="text-xs font-semibold text-neutral-500">Happy swappers</p>
                <p className="mt-1 text-xl font-bold text-neutral-900">10k+</p>
              </div>
              <div className="landing-fade-up rounded-xl border border-white/80 bg-white/70 p-3 backdrop-blur-sm" style={{ animationDelay: "200ms" }}>
                <p className="text-xs font-semibold text-neutral-500">Items re-loved</p>
                <p className="mt-1 text-xl font-bold text-neutral-900">25k+</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="landing-fade-up rounded-3xl border border-white/75 bg-white/70 p-6 shadow-[0_12px_28px_-20px_rgba(17,24,39,0.45)] backdrop-blur-xl sm:p-8" style={{ animationDelay: "100ms" }}>
              <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/70 bg-[linear-gradient(140deg,#f8fbf9,#eef5f1)] p-2">
                <div className="h-20 rounded-xl bg-[linear-gradient(140deg,#dcefe4,#cfe4d7)]" />
                <div className="h-20 rounded-xl bg-[linear-gradient(140deg,#e9f4ee,#d9eadf)]" />
                <div className="h-20 rounded-xl bg-[linear-gradient(140deg,#d3e7db,#bfd9cb)]" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Why customers choose ReWear</h2>
              <div className="mt-5 space-y-4">
                {featureCards.map((item, index) => (
                  <div key={item.title} className="landing-fade-up flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-3" style={{ animationDelay: `${180 + index * 70}ms` }}>
                    <item.icon className="mt-0.5 h-4 w-4 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{item.title}</p>
                      <p className="mt-0.5 text-sm text-neutral-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-fade-up rounded-2xl border border-white/75 bg-white/68 p-5 backdrop-blur-xl" style={{ animationDelay: "180ms" }}>
              <div className="flex items-center gap-1 text-brand-600">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                "I refreshed half my wardrobe in one month and spent almost nothing. The experience feels
                premium and simple."
              </p>
              <p className="mt-3 text-xs font-semibold text-neutral-500">ReWear member</p>
            </div>
          </section>
        </div>

        <section className="landing-fade-up mt-14 rounded-3xl border border-white/75 bg-white/70 p-6 backdrop-blur-xl sm:p-8" style={{ animationDelay: "220ms" }}>
          <h3 className="text-lg font-bold text-neutral-900">How it works</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              "Browse and wishlist items you love.",
              "Offer one of your pieces to request a swap.",
              "Confirm details and enjoy your new look.",
            ].map((step, index) => (
              <div key={step} className="landing-fade-up rounded-xl border border-white/80 bg-white/75 p-4" style={{ animationDelay: `${260 + index * 70}ms` }}>
                <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {index + 1}
                </div>
                <p className="text-sm text-neutral-700">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}