import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, MapPin, Calendar, Users, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventData = location.state?.eventData;
  const [processing, setProcessing] = useState(false);

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No event data found</p>
          <Button onClick={() => navigate("/create")}>Start Over</Button>
        </div>
      </div>
    );
  }

  const venuePrice = eventData.selectedVenue?.price || 0;
  const vendorTotal = (eventData.selectedVendors || []).reduce((s: number, v: any) => s + (v.price || 0), 0);
  const decorTotal = (eventData.selectedDecor || []).reduce((s: number, d: any) => s + (d.price || 0), 0);
  const subtotal = venuePrice + vendorTotal + decorTotal;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate("/event-simulation", { state: { eventData: { ...eventData, totalPaid: total } } });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground flex-1 text-center pr-6">Review & Pay</h1>
        </div>
      </div>

      <div className="flex-1 px-5 space-y-5 overflow-y-auto pb-4">
        {/* Event Overview */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-3">{eventData.name}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{eventData.dateStart || "Date TBD"}</span>
            </div>
            {eventData.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{eventData.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{eventData.guestCount} guests</span>
            </div>
          </div>
        </div>

        {/* Itemized Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Booking Summary</h3>
          <div className="space-y-3">
            {eventData.selectedVenue && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{eventData.selectedVenue.name}</p>
                  <p className="text-xs text-muted-foreground">Venue</p>
                </div>
                <span className="text-sm font-semibold text-foreground">${venuePrice.toLocaleString()}</span>
              </div>
            )}
            {(eventData.selectedVendors || []).map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.category}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">${(v.price || 0).toLocaleString()}</span>
              </div>
            ))}
            {(eventData.selectedDecor || []).map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">Decor</p>
                </div>
                <span className="text-sm font-semibold text-foreground">${(d.price || 0).toLocaleString()}</span>
              </div>
            ))}

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee (5%)</span>
                <span className="text-foreground">${serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Payment Method</h3>
          <button className="w-full flex items-center gap-3 bg-secondary rounded-xl p-4">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 text-left">Add payment method</span>
          </button>
          <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Payments are secure and encrypted
          </p>
        </div>

        {/* Deposit Note */}
        <div className="bg-secondary rounded-2xl p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            A 25% deposit of <span className="font-semibold text-foreground">${Math.round(total * 0.25).toLocaleString()}</span> is required to confirm your booking. 
            The remaining balance is due 7 days before the event.
          </p>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <Button className="w-full py-6 text-base font-semibold" onClick={handlePayment} disabled={processing}>
          {processing ? "Processing..." : `Confirm & Pay $${total.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentReview;
