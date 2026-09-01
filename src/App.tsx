import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { MarketplaceView } from './components/MarketplaceView.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FarmerPortal } from './components/FarmerPortal.tsx';
import { BusinessProcurement } from './components/BusinessProcurement.tsx';
import { InputMarketplaceView } from './components/InputMarketplaceView.tsx';
import { LogisticsHubPortal } from './components/LogisticsHubPortal.tsx';
import { FinancePortal } from './components/FinancePortal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { Footer } from './components/Footer.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { EmailVerificationModal } from './components/EmailVerificationModal.tsx';
import { BrandModal } from './components/BrandModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CallCenterModal } from './components/CallCenterModal.tsx';
import { AgriIntelligenceRadar } from './components/AgriIntelligenceRadar.tsx';
import { ActionToast, ToastMessage } from './components/ActionToast.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { AgriLinkSurveyModal } from './components/AgriLinkSurveyModal.tsx';
import EthioDirectRegistration from './components/EthioDirectRegistration.tsx';
import { User, Product, ProductCategory, CartItem, Notification } from './types/index.ts';
import { supabase, signOutSupabase } from './lib/supabase.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  // Cart State
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotalEtb, setSubtotalEtb] = useState(0);
  const [deliveryFeeEtb, setDeliveryFeeEtb] = useState(0);
  const [serviceFeeEtb, setServiceFeeEtb] = useState(0);
  const [grandTotalEtb, setGrandTotalEtb] = useState(0);

  // Modals & Action Feedback
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notifsModalOpen, setNotifsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [pendingVerificationData, setPendingVerificationData] = useState<{
    email: string;
    fullName?: string;
  } | null>(null);
  const [callCenterModalOpen, setCallCenterModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [hasRated, setHasRated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agrilink_survey_submitted') === 'true';
    }
    return false;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Helper to trigger interactive toast feedback
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetching
  const fetchAuthAndPlatformData = async () => {
    try {
      const [usrRes, curRes, catRes, prodRes, notifRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/auth/current'),
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/notifications'),
      ]);

      if (usrRes.ok) setAllUsers(await usrRes.json());
      
      // If user previously logged in, restore session; otherwise default to open Guest Mode
      const isAuthSaved = localStorage.getItem('agrilink_authenticated') === 'true';
      if (isAuthSaved && curRes.ok) {
        setCurrentUser(await curRes.json());
      } else {
        setCurrentUser(null);
      }

      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setFeaturedProducts(await prodRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Initial load error:', err);
    }
  };

  const fetchCartData = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
        setSubtotalEtb(data.subtotalEtb || 0);
        setDeliveryFeeEtb(data.deliveryFeeEtb || 0);
        setServiceFeeEtb(data.serviceFeeEtb || 0);
        setGrandTotalEtb(data.grandTotalEtb || 0);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAuthAndPlatformData();
    fetchCartData();

    // Listen for Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        localStorage.setItem('agrilink_authenticated', 'true');
        // Fetch refreshed current user from backend
        try {
          const curRes = await fetch('/api/auth/current');
          if (curRes.ok) {
            const user = await curRes.json();
            setCurrentUser(user);
          }
        } catch (e) {}
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('agrilink_authenticated');
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Switch Active User / Stakeholder Persona
  const handleSwitchUser = async (userId: number) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const curRes = await fetch('/api/auth/current');
        if (curRes.ok) {
          const user = await curRes.json();
          setCurrentUser(user);
          localStorage.setItem('agrilink_authenticated', 'true');
          fetchCartData();
          
          showToast({
            type: 'success',
            title: `Signed in as ${user.fullName}`,
            description: `Active role: ${user.role.replace(/_/g, ' ')} (${user.organizationName || user.region})`,
          });

          // Auto route to relevant tab on switch for convenience
          if (user.role === 'FARMER') setActiveTab('farmer-portal');
          else if (user.role === 'BUSINESS_BUYER') setActiveTab('procurement');
          else if (user.role === 'INPUT_SUPPLIER') setActiveTab('inputs');
          else if (user.role === 'DRIVER' || user.role === 'LOGISTICS_ADMIN' || user.role === 'HUB_OPERATOR') setActiveTab('logistics');
          else if (user.role === 'FINANCIAL_INSTITUTION') setActiveTab('finance');
          else if (user.role === 'PLATFORM_ADMIN') setActiveTab('admin');
        }
      }
    } catch (err) {
      console.error('Switch user error:', err);
    }
  };

  // Log Out / Return to Open Guest Mode
  const handleLogoutToGuest = async () => {
    await signOutSupabase();
    localStorage.removeItem('agrilink_authenticated');
    setCurrentUser(null);
    setActiveTab('home');
    showToast({
      type: 'info',
      title: 'Signed Out Successfully',
      description: 'Browsing AgriLink Ethiopia marketplace in open guest view.',
    });
  };

  // Add Item to Persistent Cart
  const handleAddToCart = async (item: any, quantity: number) => {
    try {
      const isInput = item.itemType === 'INPUT' || item.priceEtb !== undefined;
      const itemName = item.name || 'Agricultural Produce';
      const itemImg = (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';
      const unit = item.unit || 'QUINTAL';
      const unitPrice = isInput ? item.priceEtb : item.pricePerUnitEtb;

      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: isInput ? 'INPUT' : 'PRODUCE',
          productId: isInput ? null : item.id,
          inputProductId: isInput ? item.id : null,
          quantity,
          unitPriceEtb: unitPrice,
        }),
      });

      if (res.ok) {
        await fetchCartData();
        showToast({
          type: 'cart',
          title: `Added ${quantity} ${unit} of ${itemName}`,
          description: `Total: ${(quantity * unitPrice).toLocaleString()} ETB • Escrow Protected`,
          image: itemImg,
          actionLabel: 'Review Cart & Checkout',
          onAction: () => setCartDrawerOpen(true),
        });
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  // Update Cart Quantity
  const handleUpdateCartQty = async (itemId: number, newQty: number) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchCartData();
      showToast({
        type: 'info',
        title: 'Order Quantity Updated',
        description: `Batch quantity recalculated in real time.`,
        duration: 2500,
      });
    } catch (err) {
      console.error('Update qty error:', err);
    }
  };

  // Remove Cart Item
  const handleRemoveCartItem = async (itemId: number) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      fetchCartData();
      showToast({
        type: 'info',
        title: 'Item Removed from Cart',
        duration: 2500,
      });
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  // Clear Cart
  const handleClearCart = async () => {
    try {
      await fetch('/api/cart', { method: 'DELETE' });
      fetchCartData();
      showToast({
        type: 'info',
        title: 'Order Cart Emptied',
        duration: 2500,
      });
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const handleMarkNotifRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Mark notif error:', err);
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col justify-between font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Sticky Top Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setCartDrawerOpen(true)}
        unreadNotifsCount={unreadNotifs}
        onOpenNotifs={() => setNotifsModalOpen(true)}
        onOpenRegister={() => setActiveTab('register')}
        onOpenBrandModal={() => setBrandModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogoutToGuest={handleLogoutToGuest}
        onOpenCallCenter={() => setCallCenterModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-14 sm:pt-16">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={setActiveTab}
            categories={categories}
            featuredProducts={featuredProducts}
            onSelectProduct={(p) => setSelectedProduct(p)}
            currentUser={currentUser}
            onOpenLogin={() => setAuthModalOpen(true)}
            onOpenSignUp={() => setActiveTab('register')}
            onOpenBrand={() => setBrandModalOpen(true)}
            onLogoutToGuest={handleLogoutToGuest}
            onOpenCallCenter={() => setCallCenterModalOpen(true)}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            categories={categories}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'inputs' && (
          <InputMarketplaceView
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'farmer-portal' && (
          <FarmerPortal
            currentUser={currentUser}
            onOpenCallCenter={() => setCallCenterModalOpen(true)}
          />
        )}

        {activeTab === 'procurement' && (
          <BusinessProcurement
            currentUser={currentUser}
          />
        )}

        {activeTab === 'logistics' && (
          <LogisticsHubPortal
            currentUser={currentUser}
          />
        )}

        {activeTab === 'finance' && (
          <FinancePortal
            currentUser={currentUser}
          />
        )}

        {activeTab === 'radar' && (
          <AgriIntelligenceRadar />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage onNavigate={setActiveTab} />
        )}

        {(activeTab === 'register' || activeTab === 'registration' || activeTab === 'ethiodirect') && (
          <EthioDirectRegistration
            onNavigate={setActiveTab}
            onOpenLogin={() => setAuthModalOpen(true)}
            onRegisteredSuccess={(newUser) => {
              localStorage.setItem('agrilink_authenticated', 'true');
              setCurrentUser(newUser);
              fetchAuthAndPlatformData();
              fetchCartData();
              showToast({
                type: 'success',
                title: `Welcome to EthioDirect, ${newUser.fullName}!`,
                description: `Your ${newUser.role.replace(/_/g, ' ')} account is verified and ready.`,
              });

              if (newUser.role === 'FARMER') setActiveTab('farmer-portal');
              else if (newUser.role === 'BUSINESS_BUYER') setActiveTab('procurement');
              else if (newUser.role === 'INPUT_SUPPLIER') setActiveTab('inputs');
              else if (newUser.role === 'DRIVER' || newUser.role === 'LOGISTICS_ADMIN' || newUser.role === 'HUB_OPERATOR') setActiveTab('logistics');
              else if (newUser.role === 'FINANCIAL_INSTITUTION') setActiveTab('finance');
              else setActiveTab('marketplace');
            }}
          />
        )}
      </main>

      {/* Modals & Slide-out Panels */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onRequestQuote={() => {
          setSelectedProduct(null);
          setActiveTab('procurement');
          showToast({
            type: 'info',
            title: 'RFQ Request Initiated',
            description: 'Provide your commercial volume specifications.',
          });
        }}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        subtotalEtb={subtotalEtb}
        deliveryFeeEtb={deliveryFeeEtb}
        serviceFeeEtb={serviceFeeEtb}
        grandTotalEtb={grandTotalEtb}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderSuccess={(order) => {
          fetchCartData();
          fetchAuthAndPlatformData();
          setCartDrawerOpen(false);
          setConfirmedOrder(order);
          showToast({
            type: 'success',
            title: `Order #${order.orderNumber} Confirmed!`,
            description: `${Number(order.grandTotalEtb).toLocaleString()} ETB locked in Escrow. Driver dispatched.`,
            actionLabel: 'Track Radar',
            onAction: () => setActiveTab('logistics'),
          });
        }}
      />

      {/* Official Order Confirmation & VAT Receipt Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        order={confirmedOrder}
        onTrackOrder={() => {
          setConfirmedOrder(null);
          setActiveTab('logistics');
        }}
      />

      <NotificationsModal
        isOpen={notifsModalOpen}
        onClose={() => setNotifsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
      />

      {/* Stakeholder Registration Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onOpenLogin={() => {
          setRegisterModalOpen(false);
          setAuthModalOpen(true);
        }}
        onRequireVerification={(data) => {
          setPendingVerificationData(data);
          setRegisterModalOpen(false);
          setVerificationModalOpen(true);
        }}
        onRegisteredSuccess={(newUser) => {
          localStorage.setItem('agrilink_authenticated', 'true');
          setCurrentUser(newUser);
          setRegisterModalOpen(false);
          fetchAuthAndPlatformData();
          fetchCartData();
          
          showToast({
            type: 'success',
            title: `Welcome, ${newUser.fullName}!`,
            description: `Your ${newUser.role.replace(/_/g, ' ')} profile is active and ready.`,
          });

          // Auto-route to the relevant dashboard
          if (newUser.role === 'FARMER') setActiveTab('farmer-portal');
          else if (newUser.role === 'BUSINESS_BUYER') setActiveTab('procurement');
          else if (newUser.role === 'INPUT_SUPPLIER') setActiveTab('inputs');
          else if (newUser.role === 'DRIVER' || newUser.role === 'LOGISTICS_ADMIN' || newUser.role === 'HUB_OPERATOR') setActiveTab('logistics');
          else if (newUser.role === 'FINANCIAL_INSTITUTION') setActiveTab('finance');
          else if (newUser.role === 'PLATFORM_ADMIN') setActiveTab('admin');
          else setActiveTab('marketplace');
        }}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={verificationModalOpen}
        email={pendingVerificationData?.email || ''}
        fullName={pendingVerificationData?.fullName || 'Valued User'}
        onClose={() => {
          setVerificationModalOpen(false);
        }}
        onOpenLogin={() => {
          setVerificationModalOpen(false);
          setAuthModalOpen(true);
        }}
        onVerificationSuccess={(verifiedUser) => {
          localStorage.setItem('agrilink_authenticated', 'true');
          setCurrentUser(verifiedUser);
          setVerificationModalOpen(false);
          fetchAuthAndPlatformData();
          fetchCartData();

          showToast({
            type: 'success',
            title: 'Email Verified Successfully!',
            description: `Welcome aboard, ${verifiedUser.fullName}. Your ${verifiedUser.role.replace(/_/g, ' ')} account is fully verified.`,
          });

          // Auto-route to the relevant dashboard
          if (verifiedUser.role === 'FARMER') setActiveTab('farmer-portal');
          else if (verifiedUser.role === 'BUSINESS_BUYER') setActiveTab('procurement');
          else if (verifiedUser.role === 'INPUT_SUPPLIER') setActiveTab('inputs');
          else if (verifiedUser.role === 'DRIVER' || verifiedUser.role === 'LOGISTICS_ADMIN' || verifiedUser.role === 'HUB_OPERATOR') setActiveTab('logistics');
          else if (verifiedUser.role === 'FINANCIAL_INSTITUTION') setActiveTab('finance');
          else if (verifiedUser.role === 'PLATFORM_ADMIN') setActiveTab('admin');
          else setActiveTab('marketplace');
        }}
      />

      {/* Pro Authentication Portal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        allUsers={allUsers}
        currentUser={currentUser}
        onSelectExistingUser={handleSwitchUser}
        onOpenSignUp={() => {
          setAuthModalOpen(false);
          setRegisterModalOpen(true);
        }}
        onOpenVerification={(data) => {
          setPendingVerificationData(data);
          setAuthModalOpen(false);
          setVerificationModalOpen(true);
        }}
        onContinueAsGuest={handleLogoutToGuest}
        onOpenCallCenter={() => {
          setAuthModalOpen(false);
          setCallCenterModalOpen(true);
        }}
        onOpenBrand={() => {
          setAuthModalOpen(false);
          setBrandModalOpen(true);
        }}
      />

      {/* 24/7 Call Center & Customer Desk Modal */}
      <CallCenterModal
        isOpen={callCenterModalOpen}
        onClose={() => setCallCenterModalOpen(false)}
      />

      {/* Official Brand Identity & High-Res Emblem Modal */}
      <BrandModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onNavigateHome={() => setActiveTab('home')}
      />

      {/* AgriLink User Satisfaction & Feedback Survey Modal */}
      <AgriLinkSurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        currentUser={currentUser}
        onSurveySubmitted={(rating) => {
          setHasRated(true);
          try {
            localStorage.setItem('agrilink_survey_submitted', 'true');
          } catch {
            // ignore
          }
          showToast({
            type: 'success',
            title: 'Thank You for Rating AgriLink!',
            description: `Your feedback (${rating}) has been recorded.`,
          });
        }}
      />

      {/* Floating Feedback Quick Trigger - Automatically removed/hidden once rated */}
      {!hasRated && (
        <button
          onClick={() => setSurveyModalOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-3.5 py-2 rounded-full bg-emerald-900/90 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-500/40 shadow-xl shadow-emerald-950/40 flex items-center gap-2 backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer animate-in fade-in"
          title="Rate AgriLink Platform Experience"
        >
          <span className="text-amber-300 text-sm">⭐</span>
          <span className="hidden sm:inline">Rate AgriLink</span>
        </button>
      )}

      {/* Global Interactive Action Toast Notifications */}
      <ActionToast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Footer with Support Desk & Survey trigger */}
      <Footer
        onNavigate={setActiveTab}
        onOpenCallCenter={() => setCallCenterModalOpen(true)}
        onOpenSurvey={hasRated ? undefined : () => setSurveyModalOpen(true)}
      />
    </div>
  );
}
