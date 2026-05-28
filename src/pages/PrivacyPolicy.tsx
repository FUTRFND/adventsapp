import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-secondary"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-display font-semibold">Privacy Policy</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6 text-sm text-foreground/90 leading-relaxed">
        <p className="text-muted-foreground">Last updated: May 28, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">1. Introduction</h2>
          <p>
            Advents ("we", "us", or "our") provides an event planning platform that connects event planners with
            service vendors. This Privacy Policy explains how we collect, use, and protect your information when
            you use our mobile application and related services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">2. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> name, email, account type (planner or vendor), and password.</li>
            <li><strong>Profile information:</strong> business name, description, category, and profile photo.</li>
            <li><strong>Event data:</strong> event details, budgets, tasks, venue selections, and uploaded images.</li>
            <li><strong>Location data:</strong> addresses you enter and approximate location for map features.</li>
            <li><strong>Device data:</strong> device type, operating system, and basic usage analytics.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide, maintain, and improve the Advents service.</li>
            <li>To match planners with relevant vendors and services.</li>
            <li>To process bookings, payments, and communications between users.</li>
            <li>To send important account and service notifications.</li>
            <li>To comply with legal obligations and prevent fraud.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">4. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We share data only with: (a) vendors you contact through
            the marketplace, (b) trusted service providers who help us operate the app (such as cloud hosting
            and analytics), and (c) authorities when required by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">5. Data Security</h2>
          <p>
            We use industry-standard safeguards including encrypted connections, role-based access controls, and
            row-level security on our database. No method of transmission over the internet is 100% secure, but
            we work to protect your information at all times.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">6. Your Rights</h2>
          <p>
            You may access, update, export, or delete your account data at any time from the Profile section of
            the app. You may also contact us to exercise any rights granted under applicable privacy laws
            (including GDPR and CCPA).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">7. Children's Privacy</h2>
          <p>
            Advents is not directed to children under 13, and we do not knowingly collect personal information
            from children.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated through
            the app or by email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-semibold text-foreground">9. Contact Us</h2>
          <p>
            Questions about this Privacy Policy? Contact us at{" "}
            <a href="mailto:support@advents.app" className="text-primary underline">support@advents.app</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
