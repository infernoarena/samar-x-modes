import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FirebaseRealtimeStore, type RealtimeStatus } from '@/lib/firebaseRealtime';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Grid3X3,
  Home,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Pencil,
  PlayCircle,
  Plus,
  ReceiptIndianRupee,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { Router as WouterRouter, useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import brandMark from '@assets/IMG_20260926_200428_774_1790512485577.jpg';
import bluePanel from '@assets/generated_images/panel-blue.jpg';
import purplePanel from '@assets/generated_images/panel-purple.jpg';
import cyanPanel from '@assets/generated_images/panel-cyan.jpg';
import limePanel from '@assets/generated_images/panel-lime.jpg';

const queryClient = new QueryClient();
const STORAGE_KEY = 'samar-x-modes-store-v2';
const ADMIN_SESSION_KEY = 'samar-x-modes-admin-session-tab';
const PENDING_PAYMENT_KEY = 'samar-x-modes-pending-payment';
const ADMIN_PASSWORD = 'samar123';
const ADMIN_PASSWORD_MIGRATION_VERSION = 1;

type Plan = {
  id: string;
  label: string;
  duration: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  videoUrl: string;
  badge: string;
  active: boolean;
  maintenance: boolean;
  plans: Plan[];
};

type StoreSettings = {
  storeName: string;
  tagline: string;
  announcement: string;
  upiId: string;
  upiName: string;
  supportUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImages: string[];
  cursorStyle: 'default' | 'crosshair' | 'glow';
};

type StoreData = {
  password: string;
  passwordMigrationVersion?: number;
  products: Product[];
  settings: StoreSettings;
};

const defaultData: StoreData = {
  password: ADMIN_PASSWORD,
  passwordMigrationVersion: ADMIN_PASSWORD_MIGRATION_VERSION,
  settings: {
    storeName: 'SAMAR X MODES',
    tagline: 'Premium digital panels. Fast delivery. Always online.',
    announcement: '24/7 panel & key delivery • payment ke baad proof bhejna zaroori hai',
    upiId: 'samarxmodes@upi',
    upiName: 'SAMAR X MODES',
    supportUrl: 'https://t.me/',
    heroTitle: 'POWER UP YOUR PLAY',
    heroSubtitle: 'Trusted digital panels and instant access keys for your setup.',
    heroImage: bluePanel,
    heroImages: [bluePanel, purplePanel, cyanPanel],
    cursorStyle: 'glow',
  },
  products: [
    {
      id: 'samar-aim',
      name: 'SAMAR AIM PANEL',
      category: 'NON ROOT',
      description: 'Fast setup panel with smooth controls, responsive aim tools and a clean dashboard.',
      image: bluePanel,
      videoUrl: '',
      badge: 'BEST SELLER',
      active: true,
      maintenance: false,
      plans: [
        { id: 'aim-1', label: '1 Day Key', duration: '1 day', price: 20 },
        { id: 'aim-7', label: '7 Days Key', duration: '7 days', price: 80 },
        { id: 'aim-30', label: '30 Days Key', duration: '30 days', price: 180 },
      ],
    },
    {
      id: 'samar-wire',
      name: 'SAMAR DRIP WIRE',
      category: 'NON ROOT',
      description: 'A compact panel experience with clear settings, quick access and low-friction setup.',
      image: purplePanel,
      videoUrl: '',
      badge: 'NEW',
      active: true,
      maintenance: false,
      plans: [
        { id: 'wire-1', label: '1 Day Key', duration: '1 day', price: 35 },
        { id: 'wire-7', label: '7 Days Key', duration: '7 days', price: 120 },
      ],
    },
    {
      id: 'samar-root',
      name: 'SAMAR ROOT PRO',
      category: 'ROOT',
      description: 'Powerful pro panel with a focused interface and flexible access plans.',
      image: cyanPanel,
      videoUrl: '',
      badge: 'PRO',
      active: true,
      maintenance: false,
      plans: [
        { id: 'root-1', label: '1 Day Key', duration: '1 day', price: 30 },
        { id: 'root-7', label: '7 Days Key', duration: '7 days', price: 100 },
        { id: 'root-30', label: '30 Days Key', duration: '30 days', price: 250 },
      ],
    },
    {
      id: 'samar-iphone',
      name: 'SAMAR IOS PANEL',
      category: 'I PHONE',
      description: 'Minimal mobile-first panel for iPhone users with fast delivery after payment.',
      image: limePanel,
      videoUrl: '',
      badge: 'IOS',
      active: true,
      maintenance: false,
      plans: [
        { id: 'ios-1', label: '1 Day Key', duration: '1 day', price: 25 },
        { id: 'ios-7', label: '7 Days Key', duration: '7 days', price: 90 },
      ],
    },
    {
      id: 'samar-pc',
      name: 'SAMAR PC TOOL',
      category: 'PC',
      description: 'Desktop panel with a clean operator view and flexible short-term plans.',
      image: bluePanel,
      videoUrl: '',
      badge: 'PC',
      active: true,
      maintenance: false,
      plans: [
        { id: 'pc-1', label: '1 Day Key', duration: '1 day', price: 40 },
        { id: 'pc-30', label: '30 Days Key', duration: '30 days', price: 300 },
      ],
    },
    {
      id: 'samar-other',
      name: 'SAMAR VIP ACCESS',
      category: 'OTHER',
      description: 'A flexible access product for custom setups and special requests.',
      image: purplePanel,
      videoUrl: '',
      badge: 'VIP',
      active: true,
      maintenance: false,
      plans: [
        { id: 'vip-1', label: '1 Day Key', duration: '1 day', price: 50 },
        { id: 'vip-7', label: '7 Days Key', duration: '7 days', price: 160 },
      ],
    },
  ],
};

const categories = ['ALL', 'NON ROOT', 'ROOT', 'I PHONE', 'PC', 'OTHER'];

function money(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeLoad(): StoreData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved) as StoreData;
    return normalizeStoreData(parsed) ?? defaultData;
  } catch {
    return defaultData;
  }
}

function normalizeStoreData(value: unknown): StoreData | null {
  if (!value || typeof value !== 'object') return null;
  const parsed = value as Partial<StoreData>;
  if (!parsed.settings || !Array.isArray(parsed.products) || !parsed.password) return null;
  const needsPasswordMigration = (parsed.passwordMigrationVersion ?? 0) < ADMIN_PASSWORD_MIGRATION_VERSION;
  return {
    ...defaultData,
    ...parsed,
    password: needsPasswordMigration ? ADMIN_PASSWORD : parsed.password,
    passwordMigrationVersion: ADMIN_PASSWORD_MIGRATION_VERSION,
    settings: {
      ...defaultData.settings,
      ...parsed.settings,
      heroImages: parsed.settings.heroImages?.length
        ? parsed.settings.heroImages
        : parsed.settings.heroImage
          ? [parsed.settings.heroImage]
          : defaultData.settings.heroImages,
    },
  };
}

function MediaGallery({
  value,
  multiple = false,
  onChange,
}: {
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
}) {
  const selected = (Array.isArray(value) ? value : [value]).filter(Boolean);

  const selectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!files.length) return;

    const images = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    })));

    if (multiple) {
      onChange([...selected, ...images]);
    } else {
      onChange(images[0]);
    }
  };

  const removeImage = (index: number) => {
    const next = selected.filter((_, itemIndex) => itemIndex !== index);
    onChange(multiple ? next : '');
  };

  return (
    <div className="media-gallery" aria-label={multiple ? 'Select carousel images' : 'Select product image'}>
      <label className="gallery-upload">
        <Upload size={18} />
        <span>Select from mobile gallery</span>
        <small>{multiple ? 'Multiple photos allowed' : 'Choose one photo'}</small>
        <input type="file" accept="image/*" multiple={multiple} onChange={selectFiles} />
      </label>
      {selected.length > 0 && (
        <div className="gallery-preview-grid">
          {selected.map((src, index) => (
            <div className="gallery-preview" key={`${src.slice(0, 30)}-${index}`}>
              <img src={src} alt={`Selected image ${index + 1}`} />
              <button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`}><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductArtwork({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <div className={`product-art ${className}`} style={{ backgroundImage: `url(${product.image || brandMark})` }}>
      <div className="product-art-overlay" />
      {product.maintenance && <span className="maintenance-stamp">MAINTENANCE</span>}
    </div>
  );
}

function Storefront({ data, onAdmin }: { data: StoreData; onAdmin: () => void }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [orderStarted, setOrderStarted] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [proofError, setProofError] = useState('');
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const restoredPendingRef = useRef('');

  const products = useMemo(() => data.products.filter((product) => product.active), [data.products]);
  const heroImages = data.settings.heroImages?.length ? data.settings.heroImages : [data.settings.heroImage || bluePanel];
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = category === 'ALL' || product.category === category;
        const searchMatch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.toLowerCase());
        return categoryMatch && searchMatch;
      }),
    [category, products, search],
  );

  useEffect(() => {
    setActiveHeroIndex((index) => index >= heroImages.length ? 0 : index);
    if (heroImages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveHeroIndex((index) => (index + 1) % heroImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_PAYMENT_KEY);
      if (!pending) return;
      const { productId, planId } = JSON.parse(pending) as { productId: string; planId: string };
      const pendingKey = `${productId}:${planId}`;
      if (restoredPendingRef.current === pendingKey) return;
      const product = data.products.find((item) => item.id === productId);
      const plan = product?.plans.find((item) => item.id === planId);
      if (product && plan) {
        restoredPendingRef.current = pendingKey;
        setActiveProduct(product);
        setSelectedPlan(plan);
        setOrderStarted(true);
        setProofFile(null);
        setProofPreview('');
        setProofError('');
      }
    } catch {
      sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    }
  }, [data.products]);

  const openProduct = (product: Product) => {
    restoredPendingRef.current = '';
    setActiveProduct(product);
    setSelectedPlan(product.plans[0] ?? null);
    setOrderStarted(false);
    setProofFile(null);
    setProofPreview('');
    setProofError('');
  };

  const openUpi = () => {
    if (!selectedPlan || !data.settings.upiId) return;
    const note = `${data.settings.storeName} - ${activeProduct?.name} - ${selectedPlan.label}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(data.settings.upiId)}&pn=${encodeURIComponent(data.settings.upiName)}&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(note)}`;
    if (activeProduct) {
      sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ productId: activeProduct.id, planId: selectedPlan.id }));
    }
    setOrderStarted(true);
    window.location.href = upiUrl;
  };

  const selectProof = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setProofError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProofFile(null);
      setProofPreview('');
      setProofError('Please choose a payment screenshot image. Other file types are not accepted.');
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(String(reader.result));
    reader.onerror = () => {
      setProofFile(null);
      setProofPreview('');
      setProofError('This screenshot could not be previewed. Please choose it again.');
    };
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview('');
    setProofError('');
  };

  const handoffToWhatsApp = () => {
    if (!activeProduct || !selectedPlan || !proofFile) return;
    const message = `Payment proof for ${activeProduct.name}\nPlan: ${selectedPlan.label} (${selectedPlan.duration})\nAmount: ${money(selectedPlan.price)}\n\nThe screenshot is selected and ready to attach. Please attach it before sending. Payment has not been auto-verified.`;
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    window.location.href = `https://wa.me/918360226615?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`storefront cursor-${data.settings.cursorStyle}`}>
      <div className="top-strip">24/7 ONLINE • INSTANT DELIVERY • TRUSTED SERVICE</div>
      <header className="site-header">
        <button className="mobile-menu-button" data-testid="button-mobile-menu" onClick={() => setMobileMenu((value) => !value)} aria-label="Open menu">
          {mobileMenu ? <X size={21} /> : <Menu size={21} />}
        </button>
        <button className="brand-pill" data-testid="button-brand-home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark"><img src={brandMark} alt="" /></span>
          <span>{data.settings.storeName}</span>
        </button>
        <nav className="main-nav">
           <a data-testid="link-home" href="#home"><Home size={15} /> Home</a>
           <a data-testid="link-products" href="#products"><Grid3X3 size={15} /> Products</a>
           <a data-testid="link-how-to-buy" href="#how-it-works"><Zap size={15} /> How to buy</a>
        </nav>
        <div className="header-actions">
           <a className="support-link" data-testid="link-support" href={data.settings.supportUrl || '#how-it-works'} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Support</a>
           <button className="admin-link" data-testid="button-admin-login" onClick={onAdmin}><LockKeyhole size={15} /> Admin</button>
        </div>
      </header>

      {mobileMenu && (
        <div className="mobile-nav">
           <a data-testid="mobile-link-home" href="#home" onClick={() => setMobileMenu(false)}>Home</a>
           <a data-testid="mobile-link-products" href="#products" onClick={() => setMobileMenu(false)}>Products</a>
           <a data-testid="mobile-link-how-to-buy" href="#how-it-works" onClick={() => setMobileMenu(false)}>How to buy</a>
           <button data-testid="mobile-button-admin-login" onClick={onAdmin}><LockKeyhole size={15} /> Admin login</button>
        </div>
      )}

      <main id="home">
        {noticeVisible && (
          <div className="notice-bar">
            <div><span className="notice-icon">!</span><strong>Notice</strong><span>{data.settings.announcement}</span></div>
             <button data-testid="button-dismiss-notice" onClick={() => setNoticeVisible(false)} aria-label="Close notice"><X size={18} /></button>
          </div>
        )}

        <section className="hero-banner">
          <img src={heroImages[activeHeroIndex]} alt="SAMAR X MODES featured panel" onError={(event) => { event.currentTarget.src = bluePanel; }} />
          <div className="hero-shade" />
          <div className="hero-copy">
            <span className="eyebrow">SAMAR X MODES / DIGITAL STORE</span>
            <h1>{data.settings.heroTitle}</h1>
            <p>{data.settings.heroSubtitle}</p>
             <a className="hero-button" data-testid="link-explore-panels" href="#products">Explore panels <ArrowRight size={18} /></a>
          </div>
          <div className="hero-points">
            <span><ShieldCheck size={18} /> Trusted</span>
            <span><Zap size={18} /> Fast service</span>
            <span><LockKeyhole size={18} /> Secure payment</span>
          </div>
          {heroImages.length > 1 && (
            <div className="hero-carousel-controls" aria-label="Hero carousel controls">
              <button type="button" onClick={() => setActiveHeroIndex((index) => (index - 1 + heroImages.length) % heroImages.length)} aria-label="Previous banner"><ChevronLeft size={16} /></button>
              <div className="hero-dots">
                {heroImages.map((image, index) => <button type="button" className={index === activeHeroIndex ? 'active' : ''} key={`${image}-${index}`} onClick={() => setActiveHeroIndex(index)} aria-label={`Show banner ${index + 1}`} />)}
              </div>
              <button type="button" onClick={() => setActiveHeroIndex((index) => (index + 1) % heroImages.length)} aria-label="Next banner"><ChevronRight size={16} /></button>
            </div>
          )}
        </section>

        <section className="store-controls" id="products">
          <div className="section-heading">
            <div><span className="eyebrow green">OUR PRODUCTS</span><h2>Choose your panel</h2></div>
             <div className="search-box"><Search size={16} /><input data-testid="input-search-panels" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search panel..." aria-label="Search panels" /></div>
          </div>
          <div className="category-row">
             {categories.map((item) => <button data-testid={`button-category-${item.toLowerCase().replace(/\s+/g, '-')}`} className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}{item === 'ALL' && <ChevronDown size={14} />}</button>)}
          </div>
        </section>

        <section className="product-grid" aria-label="Panel products">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
                 <button className="product-image-button" data-testid={`button-view-product-${product.id}`} onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
                <ProductArtwork product={product} />
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <span className="view-overlay"><Eye size={17} /> View details</span>
              </button>
              <div className="product-info">
                <div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div>
                <span className="from-price">From <strong>{money(Math.min(...product.plans.map((plan) => plan.price)))}</strong></span>
              </div>
              <p className="product-description">{product.description}</p>
               <div className="product-footer"><span data-testid={`text-plan-count-${product.id}`}>{product.plans.length} plans available</span><button data-testid={`button-buy-product-${product.id}`} onClick={() => openProduct(product)}>Buy now <ArrowRight size={15} /></button></div>
            </article>
          ))}
        </section>

         {filteredProducts.length === 0 && <div className="empty-state" data-testid="empty-products"><Search size={26} /><h3>No panel found</h3><p>Try another category or search term.</p><button data-testid="button-reset-filters" onClick={() => { setSearch(''); setCategory('ALL'); }}>Reset filters</button></div>}

        <section className="trust-section" id="how-it-works">
          <div className="section-heading"><div><span className="eyebrow green">SIMPLE PROCESS</span><h2>How to buy</h2></div><p>Choose a plan, pay securely and send your payment proof for delivery.</p></div>
          <div className="steps">
            <div className="step"><span>01</span><ShoppingCart size={22} /><h3>Select a panel</h3><p>Open any product and choose the access duration that suits you.</p></div>
            <div className="step"><span>02</span><Smartphone size={22} /><h3>Pay with UPI</h3><p>Use the direct UPI app button or copy the UPI ID to any app.</p></div>
            <div className="step"><span>03</span><MessageCircle size={22} /><h3>Send proof</h3><p>Send your transaction screenshot on support and receive your key.</p></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><div className="footer-logo"><img src={brandMark} alt="Samar X Modes" /></div><div><strong>{data.settings.storeName}</strong><p>{data.settings.tagline}</p></div></div>
        <div className="footer-links"><a href="#products">Products</a><a href="#how-it-works">How to buy</a><a href={data.settings.supportUrl || '#'} target="_blank" rel="noreferrer">Contact support</a></div>
         <div className="footer-admin"><span>Admin access</span><button data-testid="button-footer-admin-login" onClick={onAdmin}>Login to dashboard <LockKeyhole size={14} /></button><small>Admin sessions stay isolated to each browser tab.</small></div>
        <div className="footer-bottom"><span>© 2026 {data.settings.storeName}</span><span>Made for fast digital delivery.</span></div>
      </footer>

      {activeProduct && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
           <div className="product-modal">
             <button className="close-modal" data-testid="button-close-product-modal" onClick={() => setActiveProduct(null)} aria-label="Close product details"><X size={20} /></button>
            <div className="modal-image-wrap"><ProductArtwork product={activeProduct} className="modal-art" /></div>
            <div className="modal-content">
              <span className="eyebrow green">{activeProduct.category} / {activeProduct.badge || 'DIGITAL ACCESS'}</span>
              <h2 id="product-modal-title">{activeProduct.name}</h2>
              <p className="modal-description">{activeProduct.description}</p>
              {activeProduct.videoUrl && <a className="video-link" href={activeProduct.videoUrl} target="_blank" rel="noreferrer"><PlayCircle size={17} /> Watch setup video <ExternalLink size={13} /></a>}
              <label className="field-label">Choose duration</label>
              <div className="plan-list">
                 {activeProduct.plans.map((plan) => <button className={`plan-option ${selectedPlan?.id === plan.id ? 'selected' : ''}`} data-testid={`button-plan-${plan.id}`} key={plan.id} onClick={() => setSelectedPlan(plan)}><span><strong>{plan.label}</strong><small>Instant delivery after payment</small></span><b>{money(plan.price)}</b>{selectedPlan?.id === plan.id && <Check size={17} />}</button>)}
              </div>
              <div className="payment-box">
                <div><span>Pay to UPI ID</span><strong>{data.settings.upiId || 'Set UPI from admin'}</strong></div>
              </div>
               {orderStarted && (
                 <div className="proof-panel" data-testid="panel-payment-proof">
                   <div className="proof-panel-heading"><Upload size={17} /><div><strong>Payment completed?</strong><span>Select the payment screenshot from your gallery. We will not mark it as paid automatically.</span></div></div>
                   <input ref={proofInputRef} className="proof-input" data-testid="input-payment-proof" type="file" accept="image/*" onChange={selectProof} />
                   {proofPreview && proofFile ? (
                     <>
                       <div className="proof-preview" data-testid="preview-payment-proof"><img src={proofPreview} alt="Selected payment screenshot preview" /><div className="proof-preview-copy"><strong>{proofFile.name}</strong><span>Selected locally · not verified</span></div><button className="proof-remove" data-testid="button-remove-payment-proof" type="button" onClick={removeProof} aria-label="Remove selected payment screenshot"><X size={14} /></button></div>
                       <button className="handoff-button" data-testid="button-whatsapp-handoff" type="button" onClick={handoffToWhatsApp}><MessageCircle size={17} /> Continue to WhatsApp</button>
                       <p className="proof-disclaimer">WhatsApp will open the chat for <strong>+91 83602 26615</strong>. Attach this selected screenshot in that chat before sending. Payment approval is completed by support.</p>
                     </>
                   ) : (
                     <button className="proof-select-button" data-testid="button-send-payment-proof" type="button" onClick={() => proofInputRef.current?.click()}><Upload size={16} /> Send payment proof</button>
                   )}
                   {proofError && <p className="proof-error" data-testid="status-payment-proof-error">{proofError}</p>}
                 </div>
               )}
               {!orderStarted && <div className="modal-actions"><button className="upi-button" data-testid="button-pay-with-upi" disabled={!selectedPlan || !data.settings.upiId} onClick={openUpi}><Smartphone size={18} /> Pay {selectedPlan ? money(selectedPlan.price) : ''} with UPI</button></div>}
               <p className="secure-note"><ShieldCheck size={14} /> UPI opens in your selected payment app. Keep the payment screenshot for the next step.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ data, onSuccess, onBack }: { data: StoreData; onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== data.password) {
      setError('Wrong admin password. Please try again.');
      return;
    }
     if (remember) sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
     else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    onSuccess();
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
         <button className="back-store" data-testid="button-back-to-store" onClick={onBack}><ArrowRight size={16} className="rotate-180" /> Back to store</button>
        <div className="admin-lock"><LockKeyhole size={28} /></div>
        <span className="eyebrow green">SAMAR X MODES / PRIVATE AREA</span>
        <h1>Admin login</h1>
        <p>Manage panels, plans, payments and storefront settings from one place.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="admin-password">Admin password</label>
           <div className="password-input"><input id="admin-password" data-testid="input-admin-password" autoFocus autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Enter your password" /><button type="button" data-testid="button-toggle-admin-password" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
           {error && <p className="form-error" data-testid="status-admin-login-error">{error}</p>}
           <label className="remember-check"><input data-testid="checkbox-admin-session" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Keep this tab signed in</label>
           <button className="primary-button full" data-testid="button-open-dashboard" type="submit"><LogIn size={17} /> Open dashboard</button>
        </form>
          <div className="login-pass-hint" data-testid="status-admin-login-help"><span>Default login pass</span><code>{ADMIN_PASSWORD}</code><small>Sessions stay isolated per browser tab.</small></div>
      </div>
    </div>
  );
}

function AdminDashboard({ data, setData, onLogout, syncStatus }: { data: StoreData; setData: (next: StoreData) => void; onLogout: () => void; syncStatus: RealtimeStatus }) {
  const [tab, setTab] = useState<'overview' | 'products' | 'settings'>('overview');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [productForm, setProductForm] = useState<Product>(blankProduct());
  const [settingsForm, setSettingsForm] = useState(data.settings);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => setSettingsForm(data.settings), [data.settings]);

  const openEditor = (product?: Product) => {
    setEditingId(product?.id ?? null);
    setProductForm(product ? structuredClone(product) : blankProduct());
    setEditorOpen(true);
  };

  const saveProduct = (event: FormEvent) => {
    event.preventDefault();
    if (!productForm.name.trim() || productForm.plans.length === 0) return;
    const product = { ...productForm, name: productForm.name.trim() };
    const products = editingId ? data.products.map((item) => item.id === editingId ? product : item) : [product, ...data.products];
    setData({ ...data, products });
    setEditorOpen(false);
    setNotice(editingId ? 'Product updated successfully.' : 'New product added successfully.');
    window.setTimeout(() => setNotice(''), 2400);
  };

  const deleteProduct = (id: string) => {
    if (!window.confirm('Delete this product from the storefront?')) return;
    setData({ ...data, products: data.products.filter((product) => product.id !== id) });
  };

  const updatePlan = (id: string, key: keyof Plan, value: string) => {
    setProductForm((form) => ({ ...form, plans: form.plans.map((plan) => plan.id === id ? { ...plan, [key]: key === 'price' ? Number(value) : value } : plan) }));
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    const password = newPassword.trim() || data.password;
    setData({ ...data, password, settings: settingsForm });
    setNewPassword('');
    setNotice('Store settings saved successfully.');
    window.setTimeout(() => setNotice(''), 2400);
  };

  const totalPlans = data.products.reduce((count, product) => count + product.plans.length, 0);

  return (
    <div className="admin-shell">
       <aside className="admin-sidebar">
         <button className="admin-brand" data-testid="button-admin-brand" onClick={() => setTab('overview')}><span className="brand-mark"><img src={brandMark} alt="" /></span><span>{data.settings.storeName}<small>ADMIN PANEL</small></span></button>
        <nav className="admin-nav">
           <button className={tab === 'overview' ? 'active' : ''} data-testid="button-admin-overview" onClick={() => setTab('overview')}><LayoutDashboard size={18} /> Overview</button>
           <button className={tab === 'products' ? 'active' : ''} data-testid="button-admin-products" onClick={() => setTab('products')}><Package size={18} /> Manage products</button>
           <button className={tab === 'settings' ? 'active' : ''} data-testid="button-admin-settings" onClick={() => setTab('settings')}><Settings size={18} /> Store settings</button>
        </nav>
         <div className="admin-sidebar-bottom"><button data-testid="button-view-live-store" onClick={() => window.open('/', '_blank')}><ExternalLink size={16} /> View live store</button><button data-testid="button-admin-logout" onClick={onLogout}><LogOut size={16} /> Logout</button></div>
      </aside>
      <main className="admin-main">
         <header className="admin-topbar"><div><span className="eyebrow green">CONTROL CENTER</span><h1 data-testid="text-admin-page-title">{tab === 'overview' ? 'Overview' : tab === 'products' ? 'Manage products' : 'Store settings'}</h1></div><div className="admin-top-actions"><span className={`admin-status sync-${syncStatus}`} data-testid="status-firebase-sync"><span /> {syncStatus === 'connected' ? 'Live sync on' : syncStatus === 'reconnecting' || syncStatus === 'connecting' ? 'Connecting…' : 'Local mode'}</span><button data-testid="button-topbar-logout" onClick={onLogout} aria-label="Logout"><LogOut size={18} /></button></div></header>
         {notice && <div className="admin-toast" data-testid="status-admin-toast"><Check size={17} /> {notice}</div>}

        {tab === 'overview' && (
          <div className="admin-content">
             <div className="metric-grid"><div className="metric-card" data-testid="metric-active-products"><span>Active products</span><strong>{data.products.filter((product) => product.active).length}</strong><small><Package size={14} /> Published on store</small></div><div className="metric-card" data-testid="metric-available-plans"><span>Available plans</span><strong>{totalPlans}</strong><small><ReceiptIndianRupee size={14} /> Duration options</small></div><div className="metric-card" data-testid="metric-upi-status"><span>UPI payment</span><strong className="metric-upi">{data.settings.upiId ? 'READY' : 'SETUP'}</strong><small><Smartphone size={14} /> Buyer checkout</small></div><div className="metric-card" data-testid="metric-store-status"><span>Store status</span><strong className="metric-live">LIVE</strong><small><BarChart3 size={14} /> Visible to buyers</small></div></div>
             <div className="admin-grid-two"><section className="admin-panel-card"><div className="panel-card-heading"><div><span className="eyebrow green">QUICK ACTIONS</span><h2>Keep your store updated</h2></div></div><div className="quick-actions"><button data-testid="button-quick-add-product" onClick={() => { setTab('products'); openEditor(); }}><Plus size={18} /><span><strong>Add new panel</strong><small>Create a product and add multiple plans</small></span><ArrowRight size={16} /></button><button data-testid="button-quick-upi-settings" onClick={() => setTab('settings')}><ReceiptIndianRupee size={18} /><span><strong>Update UPI payment</strong><small>Set the ID buyers use at checkout</small></span><ArrowRight size={16} /></button><button data-testid="button-quick-password-settings" onClick={() => setTab('settings')}><LockKeyhole size={18} /><span><strong>Change admin password</strong><small>Keep your dashboard protected</small></span><ArrowRight size={16} /></button></div></section><section className="admin-panel-card"><div className="panel-card-heading"><div><span className="eyebrow green">PAYMENT SETUP</span><h2>Current checkout details</h2></div><Smartphone size={20} /></div><div className="payment-summary" data-testid="summary-payment-settings"><span>UPI ID</span><strong>{data.settings.upiId || 'Not set yet'}</strong><span>Account name</span><strong>{data.settings.upiName || 'Not set yet'}</strong><span>Payment flow</span><strong className="green-text">UPI app redirect enabled</strong></div></section></div>
            <section className="admin-panel-card"><div className="panel-card-heading"><div><span className="eyebrow green">PRODUCT SNAPSHOT</span><h2>Latest products</h2></div><button className="text-button" onClick={() => setTab('products')}>View all <ArrowRight size={14} /></button></div><div className="mini-product-list">{data.products.slice(0, 5).map((product) => <div className="mini-product" key={product.id}><img src={product.image || brandMark} alt="" /><div><strong>{product.name}</strong><small>{product.category} • {product.plans.length} plans</small></div><span className={product.maintenance ? 'status maintenance' : 'status'}>{product.maintenance ? 'Maintenance' : 'Live'}</span></div>)}</div></section>
          </div>
        )}

        {tab === 'products' && (
          <div className="admin-content"><div className="admin-page-actions"><div><p>These products appear as cards on your public store.</p></div><button className="primary-button" onClick={() => openEditor()}><Plus size={17} /> Add product</button></div><section className="admin-panel-card product-manager"><div className="product-table-head"><span>Product</span><span>Category</span><span>Plans</span><span>Status</span><span>Actions</span></div>{data.products.map((product) => <div className="product-table-row" key={product.id}><div className="table-product"><img src={product.image || brandMark} alt="" /><span><strong>{product.name}</strong><small>{product.description}</small></span></div><span className="category-tag">{product.category}</span><span>{product.plans.length} plans<br /><small>From {money(Math.min(...product.plans.map((plan) => plan.price)))}</small></span><span className={product.maintenance ? 'status maintenance' : product.active ? 'status' : 'status hidden'}>{product.maintenance ? 'Maintenance' : product.active ? 'Live' : 'Hidden'}</span><div className="row-actions"><button onClick={() => openEditor(product)} aria-label={`Edit ${product.name}`}><Pencil size={16} /></button><button onClick={() => deleteProduct(product.id)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></div>)}</section></div>
        )}

        {tab === 'settings' && (
          <div className="admin-content"><form className="settings-grid" onSubmit={saveSettings}><section className="admin-panel-card settings-card"><div className="panel-card-heading"><div><span className="eyebrow green">PAYMENT</span><h2>UPI checkout</h2></div><ReceiptIndianRupee size={20} /></div><p className="settings-help">Buy button se buyer ke phone ke UPI app me isi ID par payment screen open hogi.</p><label className="field-label">UPI ID<input value={settingsForm.upiId} onChange={(event) => setSettingsForm({ ...settingsForm, upiId: event.target.value })} placeholder="yourname@upi" /></label><label className="field-label">UPI account name<input value={settingsForm.upiName} onChange={(event) => setSettingsForm({ ...settingsForm, upiName: event.target.value })} placeholder="SAMAR X MODES" /></label><label className="field-label">Support / Telegram URL<input value={settingsForm.supportUrl} onChange={(event) => setSettingsForm({ ...settingsForm, supportUrl: event.target.value })} placeholder="https://t.me/yourusername" /></label></section><section className="admin-panel-card settings-card"><div className="panel-card-heading"><div><span className="eyebrow green">PUBLIC STORE</span><h2>Homepage content</h2></div><Home size={20} /></div><label className="field-label">Notice bar text<textarea value={settingsForm.announcement} onChange={(event) => setSettingsForm({ ...settingsForm, announcement: event.target.value })} rows={2} /></label><label className="field-label">Hero title<input value={settingsForm.heroTitle} onChange={(event) => setSettingsForm({ ...settingsForm, heroTitle: event.target.value })} /></label><label className="field-label">Hero subtitle<textarea value={settingsForm.heroSubtitle} onChange={(event) => setSettingsForm({ ...settingsForm, heroSubtitle: event.target.value })} rows={2} /></label><div className="field-label">Hero carousel gallery<MediaGallery value={settingsForm.heroImages} multiple onChange={(value) => setSettingsForm({ ...settingsForm, heroImages: value as string[], heroImage: (value as string[])[0] || bluePanel })} /><small className="input-hint">Multiple images select karo. Store par rectangular banner automatically carousel me chalega.</small></div></section><section className="admin-panel-card settings-card"><div className="panel-card-heading"><div><span className="eyebrow green">EXPERIENCE</span><h2>Cursor & password</h2></div><Settings size={20} /></div><label className="field-label">Cursor style<select value={settingsForm.cursorStyle} onChange={(event) => setSettingsForm({ ...settingsForm, cursorStyle: event.target.value as StoreSettings['cursorStyle'] })}><option value="glow">Glow pointer</option><option value="crosshair">Crosshair</option><option value="default">Default</option></select></label><label className="field-label">New admin password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Leave blank to keep current password" /></label><small className="input-hint">Password change ke baad next login me naya password use hoga.</small><button className="primary-button full" type="submit"><Check size={17} /> Save all settings</button></section></form></div>
        )}
      </main>

      {editorOpen && <ProductEditor product={productForm} editing={Boolean(editingId)} onChange={setProductForm} onSave={saveProduct} onClose={() => setEditorOpen(false)} onUpdatePlan={updatePlan} />}
    </div>
  );
}

function blankProduct(): Product {
  return { id: uid('panel'), name: '', category: 'NON ROOT', description: '', image: bluePanel, videoUrl: '', badge: 'NEW', active: true, maintenance: false, plans: [{ id: uid('plan'), label: '1 Day Key', duration: '1 day', price: 20 }] };
}

function ProductEditor({ product, editing, onChange, onSave, onClose, onUpdatePlan }: { product: Product; editing: boolean; onChange: (product: Product) => void; onSave: (event: FormEvent) => void; onClose: () => void; onUpdatePlan: (id: string, key: keyof Plan, value: string) => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <form className="product-editor" onSubmit={onSave}>
        <div className="editor-heading"><div><span className="eyebrow green">PRODUCT SETUP</span><h2 id="editor-title">{editing ? 'Edit product' : 'Add new product'}</h2></div><button type="button" onClick={onClose} aria-label="Close editor"><X size={20} /></button></div>
        <div className="editor-grid"><div><label className="field-label">Panel name<input required value={product.name} onChange={(event) => onChange({ ...product, name: event.target.value })} placeholder="SAMAR PANEL PRO" /></label><label className="field-label">Category<select value={product.category} onChange={(event) => onChange({ ...product, category: event.target.value })}>{categories.filter((category) => category !== 'ALL').map((category) => <option key={category}>{category}</option>)}</select></label><label className="field-label">Description<textarea required value={product.description} onChange={(event) => onChange({ ...product, description: event.target.value })} rows={4} placeholder="Panel ke baare me short description..." /></label><div className="field-label">Panel image gallery<MediaGallery value={product.image} onChange={(value) => onChange({ ...product, image: value as string })} /><small className="input-hint">Gallery se product ki image select karo.</small></div><label className="field-label">Setup video URL <span className="optional">(optional)</span><input value={product.videoUrl} onChange={(event) => onChange({ ...product, videoUrl: event.target.value })} placeholder="YouTube / Drive link" /></label></div><div><div className="plan-editor-heading"><span className="field-label">Plans & prices</span><button type="button" className="text-button" onClick={() => onChange({ ...product, plans: [...product.plans, { id: uid('plan'), label: 'New Key', duration: '1 day', price: 20 }] })}><Plus size={14} /> Add plan</button></div><div className="plan-editor-list">{product.plans.map((plan) => <div className="plan-editor-row" key={plan.id}><input value={plan.label} onChange={(event) => onUpdatePlan(plan.id, 'label', event.target.value)} placeholder="1 Day Key" /><input value={plan.duration} onChange={(event) => onUpdatePlan(plan.id, 'duration', event.target.value)} placeholder="1 day" /><div className="price-input"><span>₹</span><input type="number" min="0" value={plan.price} onChange={(event) => onUpdatePlan(plan.id, 'price', event.target.value)} /></div><button type="button" onClick={() => onChange({ ...product, plans: product.plans.filter((item) => item.id !== plan.id) })} aria-label="Remove plan"><Trash2 size={15} /></button></div>)}</div><div className="toggle-list"><label><input type="checkbox" checked={product.active} onChange={(event) => onChange({ ...product, active: event.target.checked })} /> Show on public store</label><label><input type="checkbox" checked={product.maintenance} onChange={(event) => onChange({ ...product, maintenance: event.target.checked })} /> Show maintenance badge</label></div></div></div>
        <div className="editor-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Check size={17} /> Save product</button></div>
      </form>
    </div>
  );
}

function AdminRoute({ data, setData, onBack, syncStatus }: { data: StoreData; setData: (next: StoreData) => void; onBack: () => void; syncStatus: RealtimeStatus }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  return authenticated ? <AdminDashboard data={data} setData={setData} syncStatus={syncStatus} onLogout={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); setAuthenticated(false); }} /> : <AdminLogin data={data} onSuccess={() => setAuthenticated(true)} onBack={onBack} />;
}

function App() {
  const [data, setData] = useState<StoreData>(safeLoad);
  const [location, setLocation] = useLocation();
  const [syncStatus, setSyncStatus] = useState<RealtimeStatus>('connecting');
  const firebaseStoreRef = useRef<FirebaseRealtimeStore<StoreData> | null>(null);
  const hasRemoteSnapshot = useRef(false);

  useEffect(() => {
    const firebaseStore = new FirebaseRealtimeStore<StoreData>({
      path: 'storeData',
      onData: (remoteData) => {
        hasRemoteSnapshot.current = true;
        const next = normalizeStoreData(remoteData);
        if (next) {
          setData(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          const remote = remoteData as Partial<StoreData>;
          if (remote.password !== next.password || remote.passwordMigrationVersion !== ADMIN_PASSWORD_MIGRATION_VERSION) {
            void firebaseStore.save(next).catch(() => undefined);
          }
          return;
        }

        const initialData = normalizeStoreData(defaultData) ?? defaultData;
        setData(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        void firebaseStore.save(initialData).catch(() => undefined);
      },
      onStatus: setSyncStatus,
      onError: (error) => {
        console.warn('Firebase realtime sync:', error.message);
      },
    });
    firebaseStoreRef.current = firebaseStore;
    void firebaseStore.connect();
    return () => {
      firebaseStore.close();
      firebaseStoreRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (next: StoreData) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (hasRemoteSnapshot.current) {
      void firebaseStoreRef.current?.save(next).catch(() => undefined);
    }
  };

  const isAdmin = location === '/admin';
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isAdmin ? <AdminRoute data={data} setData={updateData} syncStatus={syncStatus} onBack={() => setLocation('/')} /> : <Storefront data={data} onAdmin={() => setLocation('/admin')} />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default function RootApp() {
  const isGithubPagesBuild = import.meta.env.VITE_GITHUB_PAGES === 'true';
  const router = isGithubPagesBuild
    ? <WouterRouter hook={useHashLocation}><ErrorBoundary resetKey={window.location.hash}><App /></ErrorBoundary></WouterRouter>
    : <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={window.location.pathname}><App /></ErrorBoundary></WouterRouter>;
  return router;
}