import React, { useState } from 'react';
import {
  X,
  Trash2,
  Truck,
  Building2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  User as UserIcon,
  Layers,
  Smartphone,
  AlertCircle,
  Lock,
  MessageSquare,
  KeyRound,
  Check,
} from 'lucide-react';
import { CartItem } from '../types/index.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotalEtb: number;
  deliveryFeeEtb: number;
  serviceFeeEtb: number;
  grandTotalEtb: number;
  onUpdateQuantity: (itemId: number, newQty: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotalEtb,
  deliveryFeeEtb,
  serviceFeeEtb,
  grandTotalEtb,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'telebirr_prompt' | 'processing' | 'success'>('cart');
  const [deliveryModel, setDeliveryModel] = useState<'DIRECT' | 'HUB_CROSS_DOCK'>('DIRECT');
  const [paymentProvider, setPaymentProvider] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA'>('TELEBIRR');
  
  // Clean, unpopulated user input fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryRegion, setDeliveryRegion] = useState('Addis Ababa');
  const [deliveryZone, setDeliveryZone] = useState('');
  const [deliveryWoreda, setDeliveryWoreda] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [payerAccountNumber, setPayerAccountNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Interactive Telebirr PIN / USSD simulation
  const [telebirrPin, setTelebirrPin] = useState('');
  const [formError, setFormError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!contactName.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 9) {
      setFormError('Please enter a valid Phone Number (e.g. 0961123330 or +251 96 112 3330).');
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError('Please enter your specific Delivery Street Address or Landmark.');
      return;
    }

    // If Telebirr or CBE Birr is selected, show interactive mobile prompt step
    if (paymentProvider === 'TELEBIRR' || paymentProvider === 'CBE_BIRR') {
      setStep('telebirr_prompt');
    } else {
      executeCheckout();
    }
  };

  const executeCheckout = async () => {
    setSubmitting(true);
    setStep('processing');
    setFormError('');

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress,
          deliveryRegion,
          deliveryZone: deliveryZone || 'Zone 01',
          deliveryWoreda: deliveryWoreda || 'Woreda 01',
          deliveryContactName: contactName,
          deliveryContactPhone: contactPhone,
          deliveryModel,
          hubId: deliveryModel === 'HUB_CROSS_DOCK' ? 1 : null,
          nationalIdNumber: nationalIdNumber || undefined,
          tinNumber: tinNumber || undefined,
          payerAccountNumber: payerAccountNumber || contactPhone,
          notes: orderNotes || undefined,
          paymentMethod: paymentProvider,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedOrder(data.order);
        setStep('success');
        onOrderSuccess(data.order);
      } else {
        const err = await res.json();
        setFormError(err.error || 'Payment failed. Please verify your details.');
        setStep('checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setFormError('Network connection error. Please try again.');
      setStep('checkout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between relative animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
              AgriLink Procurement & Escrow
            </span>
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              {step === 'cart' && `Order Cart (${cartItems.length} items)`}
              {step === 'checkout' && 'Enter Buyer Details & Delivery'}
              {step === 'telebirr_prompt' && 'Authorize Mobile Payment'}
              {step === 'processing' && 'Processing Transaction...'}
              {step === 'success' && 'Payment Verified & Confirmed'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Truck className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">Your cart is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Browse verified fresh crops or agricultural inputs from certified Ethiopian producers.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Start Sourcing Produce
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const title = item.itemType === 'PRODUCE' ? item.product?.name : item.inputProduct?.name;
                    const gradeOrBrand = item.itemType === 'PRODUCE' ? item.product?.grade : item.inputProduct?.brand;
                    const unit = item.itemType === 'PRODUCE' ? item.product?.unit : item.inputProduct?.unit;
                    const img = (item.itemType === 'PRODUCE' ? item.product?.images?.[0] : item.inputProduct?.images?.[0]) ||
                      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-zinc-200 bg-white flex gap-3.5 shadow-2xs items-center"
                      >
                        <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-zinc-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 truncate leading-snug">{title || 'Agricultural Item'}</h4>
                          <span className="text-[10px] text-emerald-800 font-semibold block">{gradeOrBrand?.replace(/_/g, ' ')}</span>
                          <span className="text-xs font-extrabold text-zinc-900">
                            {item.unitPriceEtb.toLocaleString()} ETB <span className="text-[10px] font-normal text-zinc-400">/{unit}</span>
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - (unit === 'QUINTAL' ? 1 : 5)))}
                              className="px-2 py-0.5 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-zinc-900">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + (unit === 'QUINTAL' ? 1 : 5))}
                              className="px-2 py-0.5 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-zinc-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleStartPayment} className="space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Buyer Contact & Phone Number (Primary Requirement) */}
              <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <span className="text-xs font-bold text-zinc-900 block flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-emerald-700" />
                  Your Contact & Phone Information
                </span>
                
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                    Your Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your full name (e.g. Abebe Balcha)"
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                    Phone Number for Payment & Delivery SMS <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (!payerAccountNumber) setPayerAccountNumber(e.target.value);
                      }}
                      placeholder="e.g. 0961123330 or +251 96 112 3330"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                    />
                    <Phone className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    An SMS confirmation and Telebirr authorization push will be sent to this number.
                  </span>
                </div>
              </div>

              {/* 2. Delivery Destination */}
              <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <span className="text-xs font-bold text-zinc-900 block flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  Delivery Location in Ethiopia
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Region</label>
                    <select
                      value={deliveryRegion}
                      onChange={(e) => setDeliveryRegion(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Amhara">Amhara</option>
                      <option value="Sidama">Sidama</option>
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Tigray">Tigray</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Sub-City / Zone</label>
                    <input
                      type="text"
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      placeholder="e.g. Bole / Kirkos"
                      className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Woreda</label>
                    <input
                      type="text"
                      value={deliveryWoreda}
                      onChange={(e) => setDeliveryWoreda(e.target.value)}
                      placeholder="e.g. Woreda 03"
                      className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                    Specific Street Address or Landmark <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Near Medhanealem Mall, House #412"
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* 3. Logistics Fulfillment Model */}
              <div>
                <label className="text-xs font-bold text-zinc-900 block mb-2">Logistics Fulfillment Model</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryModel('DIRECT')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryModel === 'DIRECT'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Truck className="h-4 w-4 mb-1 text-emerald-700" />
                    <span className="text-xs block font-bold">Direct Delivery</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Farm to Buyer Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryModel('HUB_CROSS_DOCK')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryModel === 'HUB_CROSS_DOCK'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Building2 className="h-4 w-4 mb-1 text-emerald-700" />
                    <span className="text-xs block font-bold">Hub Cross-Docking</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Addis Central Cold-Hub</span>
                  </button>
                </div>
              </div>

              {/* 4. Payment Method Selection */}
              <div>
                <label className="text-xs font-bold text-zinc-900 block mb-2">Select Payment Method</label>
                <div className="space-y-2">
                  {[
                    { id: 'TELEBIRR', name: 'Telebirr (Ethio Telecom Mobile Money)', desc: 'Instant USSD push prompt on your mobile phone' },
                    { id: 'CBE_BIRR', name: 'CBE Birr (Commercial Bank of Ethiopia)', desc: 'Direct mobile account debit' },
                    { id: 'CHAPA', name: 'Chapa Gateway (Debit Card & Multi-Wallet)', desc: 'National Switch & Card payment' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        paymentProvider === p.id
                          ? 'border-emerald-600 bg-emerald-50/60 font-bold ring-1 ring-emerald-600'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentProvider"
                          value={p.id}
                          checked={paymentProvider === p.id}
                          onChange={() => setPaymentProvider(p.id as any)}
                          className="accent-emerald-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{p.name}</p>
                          <p className="text-[10px] text-zinc-500">{p.desc}</p>
                        </div>
                      </div>
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Interactive Mobile USSD / Push Prompt Screen */}
          {step === 'telebirr_prompt' && (
            <div className="py-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-950 text-white shadow-xl border border-emerald-800 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                        {paymentProvider === 'TELEBIRR' ? 'Telebirr SuperApp USSD' : 'CBE Birr Direct Debit'}
                      </span>
                      <h4 className="text-sm font-black text-white">Payment Request Sent</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-800/60 text-[10px] text-emerald-300 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Waiting for Phone
                  </div>
                </div>

                <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/50 space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-200">
                    <span>Merchant:</span>
                    <strong className="text-white">AgriLink Escrow Trust</strong>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Recipient / Order:</span>
                    <span className="font-mono text-emerald-300">{cartItems.length} Produce Items</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Your Phone Number:</span>
                    <strong className="text-white">{contactPhone}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Payer Name:</span>
                    <strong className="text-white">{contactName}</strong>
                  </div>
                  <div className="pt-2 border-t border-emerald-800/80 flex justify-between text-sm font-black">
                    <span className="text-emerald-300">Total Amount:</span>
                    <span className="text-emerald-300 text-base">{grandTotalEtb.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-emerald-200 font-semibold block flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                    Enter your 4-digit {paymentProvider === 'TELEBIRR' ? 'Telebirr PIN' : 'CBE Birr PIN'}:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={telebirrPin}
                    onChange={(e) => setTelebirrPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[1em] text-lg font-black px-4 py-2.5 bg-emerald-900/80 border border-emerald-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-emerald-600"
                  />
                  <p className="text-[10px] text-emerald-300/80 text-center">
                    Simulating secure USSD popup push on mobile device
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-1/3 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs cursor-pointer"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={executeCheckout}
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 cursor-pointer disabled:opacity-50"
                >
                  Authorize {grandTotalEtb.toLocaleString()} ETB <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-20 space-y-4">
              <div className="h-14 w-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
              <h3 className="text-base font-bold text-zinc-900">Authorizing {paymentProvider} Transaction</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Securing funds in AgriLink Escrow and dispatching driver to {deliveryAddress || 'your delivery address'}...
              </p>
            </div>
          )}

          {step === 'success' && completedOrder && (
            <div className="py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">Payment Verified & Order Active</h3>
                <p className="text-xs text-zinc-600">
                  Order <span className="font-mono font-bold text-zinc-900">#{completedOrder.orderNumber}</span> has been confirmed.
                </p>
              </div>

              {/* Authentic Live SMS Notification Pop-up */}
              <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-700 shadow-xl text-left space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS Alert from {paymentProvider === 'TELEBIRR' ? '127 (Telebirr)' : '889 (CBE Birr)'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Just Now</span>
                </div>
                <p className="text-xs text-zinc-200 font-mono leading-relaxed">
                  Dear <strong>{completedOrder.deliveryContactName || contactName}</strong>, your payment of{' '}
                  <strong className="text-emerald-400">{Number(completedOrder.grandTotalEtb).toLocaleString()} ETB</strong> has been successfully transferred to AgriLink Escrow for Order #{completedOrder.orderNumber}.
                  Refrigerated driver dispatched to <strong>{completedOrder.deliveryAddress}</strong>.
                </p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>To: {completedOrder.deliveryContactPhone || contactPhone}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Delivered to Phone SMS
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Paid:</span>
                  <span className="font-extrabold text-zinc-900">{Number(completedOrder.grandTotalEtb).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Contact Person:</span>
                  <span className="font-bold text-zinc-900">{completedOrder.deliveryContactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phone Number:</span>
                  <span className="font-bold text-zinc-900">{completedOrder.deliveryContactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery Address:</span>
                  <span className="font-semibold text-zinc-800">{completedOrder.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Logistics Status:</span>
                  <span className="font-bold text-emerald-700">IN TRANSIT (Assigned Driver)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Done & View Active Deliveries
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer / Price Breakdown */}
        {cartItems.length > 0 && step !== 'telebirr_prompt' && step !== 'processing' && step !== 'success' && (
          <div className="p-4 sm:p-6 bg-zinc-50 border-t border-zinc-200 space-y-3">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Produce & Input Subtotal</span>
                <span className="font-bold text-zinc-900">{subtotalEtb.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics & Cold-Chain Transport</span>
                <span className="font-bold text-zinc-900">
                  {deliveryFeeEtb === 0 ? <span className="text-emerald-700">Free Bulk Logistics</span> : `${deliveryFeeEtb.toLocaleString()} ETB`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Quality & Escrow Fee (2%)</span>
                <span className="font-bold text-zinc-900">{serviceFeeEtb.toLocaleString()} ETB</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-black text-emerald-950">
                <span>Total Amount Due</span>
                <span>{grandTotalEtb.toLocaleString()} ETB</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-colors cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-1/3 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  form="checkout-form"
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 cursor-pointer"
                >
                  Proceed to Pay via {paymentProvider === 'TELEBIRR' ? 'Telebirr' : paymentProvider === 'CBE_BIRR' ? 'CBE Birr' : 'Chapa'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
