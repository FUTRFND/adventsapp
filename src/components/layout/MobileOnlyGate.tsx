import { Smartphone } from "lucide-react";

const MobileOnlyGate = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* Desktop blocker */}
      <div className="hidden md:flex fixed inset-0 z-[9999] bg-background items-center justify-center">
        <div className="text-center px-8 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Mobile App Preview</h1>
          <p className="text-muted-foreground mb-6">
            This app is designed for mobile devices. Please open this link on your phone to experience the full demo.
          </p>
          <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to view:</p>
            <p>Scan the QR code or open this URL on your mobile device's browser.</p>
          </div>
        </div>
      </div>
      {/* Mobile content */}
      <div className="md:hidden">
        {children}
      </div>
    </>
  );
};

export default MobileOnlyGate;
