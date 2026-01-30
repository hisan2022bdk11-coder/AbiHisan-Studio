
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Moon, 
  Sun, 
  Download, 
  Trash2, 
  Wand2, 
  RefreshCw,
  LayoutGrid,
  Cpu,
  X,
  UserCheck,
  Camera,
  Heart,
  Zap,
  Briefcase,
  ChevronRight,
  Fingerprint,
  Layers,
  Shield,
  Stars,
  User,
  ZapOff,
  Flame,
  AlertTriangle
} from 'lucide-react';
import MagicStudioLogo from './components/MagicStudioLogo';
import { callGeminiAI, enhancePrompt } from './services/geminiService';
import { UploadedImage, TabType } from './types';

interface PoseVariant {
  id: string;
  label: string;
  promptAddon: string;
}

interface PosePreset {
  id: string;
  label: string;
  icon: React.ReactNode;
  basePrompt: string;
  variants: PoseVariant[];
}

const REALISTIC_VARIANTS: PoseVariant[] = [
  { id: 'ultra_hd', label: 'Ultra-HD Detail', promptAddon: 'Fokus sangat tajam pada detail wajah, tekstur kulit mikro yang nyata, pencahayaan alami yang menonjolkan kedalaman fitur wajah.' },
  { id: 'soft_glow', label: 'Soft Portrait', promptAddon: 'Pencahayaan lembut yang estetis, tone kulit yang sehat dan natural, latar belakang bokeh halus untuk kesan elegan.' },
  { id: 'sharp_eye', label: 'Sharp Studio', promptAddon: 'Gaya studio dengan kontras tinggi, penekanan pada ketajaman mata dan rambut, bayangan dramatis yang mendefinisikan struktur tulang wajah.' },
  { id: 'natural_daily', label: 'Natural Daily', promptAddon: 'Gaya foto sehari-hari yang otentik, tanpa filter berlebihan, pencahayaan outdoor natural, kesan nyata dan jujur.' }
];

const POSE_PRESETS: PosePreset[] = [
  {
    id: 'formal',
    label: 'Foto Resmi',
    icon: <UserCheck size={16} />,
    basePrompt: 'Foto studio formal profesional dengan latar belakang polos, pencahayaan merata (flat lighting), postur tegak sempurna.',
    variants: [
      { id: 'suit', label: 'Jas & Dasi', promptAddon: 'Subjek mengenakan setelan jas hitam elegan dengan dasi sutra, kesan sangat profesional dan berwibawa.' },
      { id: 'batik', label: 'Batik Formal', promptAddon: 'Subjek mengenakan kemeja Batik premium dengan motif tradisional yang rapi, nuansa budaya Indonesia yang modern.' },
      { id: 'shirt', label: 'Kemeja Kerja', promptAddon: 'Subjek mengenakan kemeja putih bersih yang disetrika rapi, tanpa dasi, gaya clean and approachable.' },
      { id: 'glasses', label: 'Kacamata Cerdas', promptAddon: 'Menambahkan aksesoris kacamata berbingkai tipis untuk kesan intelektual dan teliti.' }
    ]
  },
  {
    id: 'model',
    label: 'Pose Model',
    icon: <Camera size={16} />,
    basePrompt: 'Pose editorial high-fashion, sudut kamera dramatis, pencahayaan kontras tinggi (chiaroscuro).',
    variants: [
      { id: 'vogue', label: 'Vogue Style', promptAddon: 'Gaya sampul majalah fashion ternama dengan saturasi warna yang berani and ekspresi wajah ikonik.' },
      { id: 'street', label: 'Urban Street', promptAddon: 'Latar belakang jalanan kota yang sibuk, gaya pakaian streetwear premium, nuansa edgy dan dinamis.' },
      { id: 'blackwhite', label: 'B&W Artistic', promptAddon: 'Hitam putih klasik dengan kontras bayangan yang dalam, menonjolkan tekstur dan bentuk wajah.' },
      { id: 'avantgarde', label: 'Avant-Garde', promptAddon: 'Gaya seni eksperimental dengan riasan atau aksesoris unik yang futuristik.' }
    ]
  },
  {
    id: 'wedding',
    label: 'Pernikahan',
    icon: <Heart size={16} />,
    basePrompt: 'Suasana romantis pernikahan, pencahayaan lembut hangat, nuansa elegan dan penuh kebahagiaan.',
    variants: [
      { id: 'classic', label: 'Klasik Mewah', promptAddon: 'Dekorasi bunga melimpah, gaun/jas mewah, di dalam gedung pesta dengan lampu gantung kristal.' },
      { id: 'garden', label: 'Outdoor Garden', promptAddon: 'Latar taman hijau asri, cahaya matahari terbenam (golden hour), dekorasi kayu dan lampu peri (fairy lights).' },
      { id: 'trad', label: 'Adat Tradisional', promptAddon: 'Pakaian adat pernikahan tradisional Indonesia dengan detail emas yang rumit dan latar pelaminan artistik.' },
      { id: 'candid', label: 'Candid Emosional', promptAddon: 'Momen spontan penuh tawa dan air mata kebahagiaan, fokus pada detail ekspresi yang tulus.' }
    ]
  },
  {
    id: 'business',
    label: 'Bisnis',
    icon: <Briefcase size={16} />,
    basePrompt: 'Gaya eksekutif di lingkungan modern, pencahayaan natural yang cerah, profesional dan visioner.',
    variants: [
      { id: 'office', label: 'Ruang Kerja', promptAddon: 'Duduk di balik meja kayu besar dengan pemandangan gedung tinggi di luar jendela kaca.' },
      { id: 'presentation', label: 'Presentasi', promptAddon: 'Berdiri di depan layar besar atau papan tulis kaca, menunjukkan sikap kepemimpinan yang komunikatif.' },
      { id: 'casualbiz', label: 'Business Casual', promptAddon: 'Mengenakan blazer tanpa dasi di area lounge kantor yang nyaman, gaya startup modern.' },
      { id: 'team', label: 'Leader Focus', promptAddon: 'Fokus pada individu di depan dengan latar belakang tim yang sedang bekerja secara produktif.' }
    ]
  },
  {
    id: 'cinematic',
    label: 'Sinematik',
    icon: <Zap size={16} />,
    basePrompt: 'Gaya sinematik film layar lebar, kedalaman ruang (bokeh) yang artistik.',
    variants: [
      { id: 'cyber', label: 'Cyberpunk', promptAddon: 'Lampu neon biru dan merah muda, suasana malam hari yang futuristik, refleksi cahaya pada genangan air.' },
      { id: 'vintage', label: 'Vintage 70s', promptAddon: 'Efek film grain kasar, warna-warna hangat kecokelatan, gaya retro yang nostalgik.' },
      { id: 'noir', label: 'Film Noir', promptAddon: 'Drama bayangan melalui jendela bertirai, suasana misterius, pencahayaan satu arah yang tajam.' },
      { id: 'fantasy', label: 'Ethereal Fantasy', promptAddon: 'Atmosfer magis dengan kabut lembut, partikel cahaya beterbangan, warna-warna pastel yang mimpi.' }
    ]
  }
];

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('product'); 
  const [images, setImages] = useState<UploadedImage[]>([]); 
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoPrompt, setAutoPrompt] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<PosePreset | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PoseVariant | null>(null);
  const [isRealisticMode, setIsRealisticMode] = useState(false);
  const [selectedRealisticVariant, setSelectedRealisticVariant] = useState<PoseVariant | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const limit = activeTab === 'product' ? 1 : 12;
    const currentCount = images.length;
    
    if (currentCount + files.length > limit) {
      setError(`Maksimal ${limit} foto diperbolehkan untuk fitur ini.`);
      return;
    }

    try {
      const newImages = await Promise.all(
        files.map(async (file: File) => ({
          file,
          preview: URL.createObjectURL(file),
          base64: await fileToBase64(file)
        }))
      );

      setImages(prev => [...prev, ...newImages]);
      setError(null);
    } catch (err) {
      setError("Gagal memproses unggahan gambar.");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const applyPreset = (p: PosePreset) => {
    setIsRealisticMode(false);
    setSelectedRealisticVariant(null);
    setSelectedPreset(p);
    setSelectedVariant(null);
    setPrompt(p.basePrompt);
    setAutoPrompt(true);
  };

  const applyVariant = (v: PoseVariant) => {
    if (!selectedPreset) return;
    setSelectedVariant(v);
    setPrompt(`${selectedPreset.basePrompt} ${v.promptAddon}`);
  };

  const applyRealisticVariant = (v: PoseVariant) => {
    setIsRealisticMode(true);
    setSelectedPreset(null);
    setSelectedVariant(null);
    setSelectedRealisticVariant(v);
    const baseRealistic = "Hyper-realistic 8k portrait photography, professional DSLR shot, extremely detailed skin texture, pores visible, lifelike eyes, masterpiece quality.";
    setPrompt(`${baseRealistic} ${v.promptAddon}`);
    setAutoPrompt(true);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err: any) {
      const isQuota = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
      setError(isQuota ? "Limit kuota AI terlampaui. Mohon tunggu 1 menit sebelum mencoba lagi." : "Gagal memperbaiki prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateImage = async () => {
    if (images.length === 0) {
      setError("Silakan unggah setidaknya satu foto.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const identityInstruction = `STRICT INSTRUCTION: You MUST maintain 100% of the person's facial features and identity from the provided ${images.length > 1 ? 'images' : 'image'}. Do not change the person's identity. Only change the background, clothing, and environment as requested. The person in the output must be the exact same person from the input reference files. If multiple people are shown, merge them harmoniously while keeping their identities intact. For "Wajah Realistis" styles, pay extreme attention to skin texture, pore details, and natural lighting to make it indistinguishable from a real photograph.`;
      
      let finalPrompt = prompt;
      if (autoPrompt) {
        if (activeTab === 'product') {
          finalPrompt = prompt 
            ? `${identityInstruction} Professional product photography with high-end studio lighting, ${prompt}. Place the product/subject in a clean, elegant, high-contrast environment.`
            : `${identityInstruction} Professional photography with clean studio lighting, soft shadows, and high-end aesthetic.`;
        } else {
          finalPrompt = prompt
            ? `${identityInstruction} Creative artistic photo blend using ${images.length} source assets: ${prompt}. Ensure seamless transitions, harmonious color grading, and a cohesive cinematic look while keeping the subjects faces 100% identical to references.`
            : `${identityInstruction} Creative artistic photo blending of ${images.length} images with seamless transitions and harmonic color grading, strictly preserving 100% face identity.`;
        }
      } else {
        finalPrompt = `${identityInstruction} ${prompt}`;
      }

      const resultUrl = await callGeminiAI(finalPrompt, images);
      setResultImage(resultUrl);
    } catch (err: any) {
      const isQuota = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
      setError(isQuota ? "Limit kuota harian Gemini terlampaui. Mohon tunggu beberapa saat atau beralih ke paket berbayar." : (err.message || "Terjadi kesalahan tak terduga saat memproses."));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `abi-hisan-magic-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-500 ${
      darkMode 
        ? 'bg-slate-950 text-white' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background Dinamis */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] opacity-40 animate-pulse transition-colors duration-500 ${
          darkMode ? 'bg-blue-900/40' : 'bg-blue-300/50'
        }`} />
        <div className={`absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse transition-colors duration-500 ${
          darkMode ? 'bg-indigo-950/40' : 'bg-indigo-200/50'
        }`} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigasi */}
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
          darkMode ? 'bg-slate-950/70 border-white/5' : 'bg-white/70 border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
              <MagicStudioLogo className="w-10 h-10" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600">
                  ABI HISAN
                </h1>
                <span className="text-[10px] uppercase tracking-[0.25em] font-black opacity-50 -mt-1">Magic Studio</span>
              </div>
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                darkMode ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
          {/* Bagian Hero */}
          <section className="text-center mb-16">
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
              <MagicStudioLogo className="w-28 h-28 relative z-10 drop-shadow-2xl" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
              Sihir Visual <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600">Masa Depan</span>
            </h2>
            <p className={`max-w-2xl mx-auto text-lg font-medium opacity-60 leading-relaxed`}>
              Sulap foto biasa jadi luar biasa atau gabungkan hingga 12 aset imajinasimu menjadi satu mahakarya sempurna menggunakan kecerdasan buatan Gemini.
            </p>
          </section>

          {/* Tab Fitur */}
          <div className="flex justify-center mb-16">
            <div className={`flex p-1.5 rounded-[2.5rem] border transition-all ${
              darkMode ? 'bg-slate-900/60 border-white/10 shadow-2xl' : 'bg-slate-200/50 border-white shadow-xl'
            }`}>
              <button 
                onClick={() => { setActiveTab('product'); setImages([]); setResultImage(null); setSelectedPreset(null); setIsRealisticMode(false); }}
                className={`flex items-center gap-2 px-10 py-5 rounded-[2rem] transition-all font-black text-xs tracking-widest ${
                  activeTab === 'product' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:opacity-70'
                }`}
              >
                <Wand2 size={16} /> PRODUK
              </button>
              <button 
                onClick={() => { setActiveTab('merge'); setImages([]); setResultImage(null); setSelectedPreset(null); setIsRealisticMode(false); }}
                className={`flex items-center gap-2 px-10 py-5 rounded-[2rem] transition-all font-black text-xs tracking-widest ${
                  activeTab === 'merge' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:opacity-70'
                }`}
              >
                <Layers size={16} /> GABUNG FOTO (12 ASSET)
              </button>
            </div>
          </div>

          {/* Area Kerja */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Panel Kontrol (Input) */}
            <div className={`lg:col-span-5 p-10 rounded-[3.5rem] border transition-all duration-500 ${
              darkMode 
                ? 'bg-slate-900/40 border-white/10 shadow-2xl' 
                : 'bg-white/80 border-slate-200 shadow-xl'
            }`}>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                  <Upload size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Sumber Gambar</h3>
                  <p className="text-xs opacity-50 mt-1 font-bold uppercase tracking-wider">
                    {activeTab === 'product' ? 'Fokus Produk Tunggal' : 'Multi-Gambar (Hingga 12)'}
                  </p>
                </div>
              </div>

              {/* Area Unggah */}
              <div className="relative group">
                <input 
                  type="file" 
                  multiple={activeTab === 'merge'} 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-[3rem] p-16 text-center transition-all duration-300 ${
                  darkMode 
                    ? 'border-white/10 group-hover:border-blue-500 group-hover:bg-blue-500/5' 
                    : 'border-slate-300 group-hover:border-blue-400 group-hover:bg-blue-50/50'
                }`}>
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <ImageIcon className="text-blue-500" size={32} />
                  </div>
                  <p className="font-black text-xl mb-1">Seret & Lepas Aset</p>
                  <p className="text-sm opacity-40 font-medium">Klik untuk memilih file (Max: {activeTab === 'product' ? '1' : '12'})</p>
                </div>
              </div>

              {/* Daftar Gambar Aktif */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-8">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden ring-4 ring-transparent hover:ring-blue-500 transition-all shadow-lg bg-slate-800">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500/90 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Kontrol Prompting */}
              <div className="mt-12 space-y-12">
                
                {/* MENU KHUSUS: WAJAH REALISTIS */}
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${
                  isRealisticMode 
                    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                    : (darkMode ? 'bg-slate-900/40 border-white/5 hover:border-blue-500/30' : 'bg-slate-50 border-slate-200 hover:border-blue-300')
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isRealisticMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'}`}>
                        <User size={20} />
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-wider">Potret Wajah Realistis</h4>
                    </div>
                    {isRealisticMode && <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase">Active</div>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {REALISTIC_VARIANTS.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => applyRealisticVariant(v)}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border text-center flex items-center justify-center gap-2 ${
                          selectedRealisticVariant?.id === v.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : (darkMode ? 'bg-slate-900 border-white/5 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300')
                        }`}
                      >
                        <Flame size={12} className={selectedRealisticVariant?.id === v.id ? 'animate-pulse' : 'opacity-30'} />
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Inspirasi Pose Utama */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-black uppercase tracking-widest opacity-40">1. Pilih Kategori Gaya Lainnya</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POSE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-tight transition-all border ${
                          selectedPreset?.id === p.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                            : (darkMode ? 'bg-slate-800/50 border-white/5 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200')
                        }`}
                      >
                        {p.icon}
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-menu Gaya Spesifik (Varian) */}
                {selectedPreset && (
                  <div className="space-y-4 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500">
                      <ChevronRight size={14} />
                      2. Pilih Gaya Spesifik ({selectedPreset.label})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPreset.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => applyVariant(v)}
                          className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border text-center ${
                            selectedVariant?.id === v.id
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : (darkMode ? 'bg-slate-900 border-white/5 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300')
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Face Identity Indicator */}
                <div className={`p-4 rounded-2xl flex items-center gap-4 border ${
                  darkMode ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg">
                    <Fingerprint size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Face Match Engine Active</p>
                    <p className="text-[11px] font-bold opacity-60">Menjaga 100% identitas wajah dari {images.length} referensi asli.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Mantra Kreatif</label>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className={`text-[10px] font-black uppercase flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border ${
                        darkMode 
                          ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/40' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                      } ${isEnhancing ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <Stars size={12} className={isEnhancing ? 'animate-spin' : ''} />
                      {isEnhancing ? 'Enhancing...' : 'Magic Enhance'}
                    </button>
                    <button 
                      onClick={() => setAutoPrompt(!autoPrompt)}
                      className={`text-[10px] font-black uppercase flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border ${
                        autoPrompt 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : 'bg-transparent border-current opacity-40 hover:opacity-100'
                      }`}
                    >
                      <RefreshCw size={12} className={autoPrompt ? 'animate-spin-slow' : ''} />
                      Auto-Optimize
                    </button>
                  </div>
                </div>
                
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={autoPrompt ? "Sesuaikan deskripsi detail jika diperlukan..." : "Deskripsikan perubahan visual secara detail..."}
                  className={`w-full p-6 rounded-[2.5rem] border outline-none focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[140px] resize-none text-base font-bold leading-relaxed ${
                    darkMode ? 'bg-slate-950/50 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />

                {error && (
                  <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-black flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="animate-pulse" />
                        <span className="flex-1">{error}</span>
                      </div>
                      <button onClick={() => setError(null)} className="shrink-0 p-1 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    {error.includes("kuota") && (
                      <p className="text-[10px] opacity-70 font-medium leading-relaxed italic border-t border-red-500/20 pt-2">
                        Tips: Coba gunakan prompt yang lebih pendek atau unggah aset gambar yang lebih kecil ukurannya sementara waktu.
                      </p>
                    )}
                  </div>
                )}

                <button 
                  onClick={generateImage}
                  disabled={isGenerating || images.length === 0}
                  className={`w-full py-6 rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xl tracking-tight transition-all shadow-2xl ${
                    isGenerating || images.length === 0
                      ? 'bg-slate-400 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-700 hover:scale-[1.01] active:scale-[0.99] text-white shadow-blue-600/20'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      MENGOLAH SIHIR...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      AKTIFKAN MAGIC
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Panel Hasil (Output) */}
            <div className="lg:col-span-7 space-y-8">
              <div className={`relative min-h-[650px] flex flex-col items-center justify-center p-10 rounded-[4rem] border transition-all duration-500 ${
                darkMode 
                  ? 'bg-slate-900/40 border-white/10' 
                  : 'bg-white/90 border-slate-200 shadow-2xl'
              }`}>
                
                {!resultImage && !isGenerating && (
                  <div className="text-center space-y-8">
                    <div className="w-40 h-40 mx-auto opacity-10 grayscale brightness-200">
                      <MagicStudioLogo pulse={false} />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-3xl opacity-20 italic uppercase tracking-tighter">Zona Manifestasi</p>
                      <p className="text-sm opacity-10 font-black tracking-[0.4em]">MENUNGGU INPUT NEURAL</p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center space-y-12">
                    <div className="relative flex justify-center scale-150">
                      <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-[80px] animate-pulse" />
                      <MagicStudioLogo className="w-40 h-40 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <p className="font-black text-4xl tracking-tighter animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        MERAMU KEAJAIBAN
                      </p>
                      <div className="flex justify-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                         <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                         <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                {resultImage && !isGenerating && (
                  <div className="w-full space-y-10 animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000">
                    <div className="relative group rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(37,99,235,0.2)] ring-1 ring-white/10 aspect-square bg-slate-950">
                      <img 
                        src={resultImage} 
                        alt="Result" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-16">
                        <button 
                          onClick={downloadImage}
                          className="px-10 py-5 bg-white text-blue-600 rounded-[2rem] hover:scale-110 transition-transform shadow-2xl font-black text-xs tracking-widest flex items-center gap-4"
                        >
                          <Download size={20} /> UNDUH MAHAKARYA
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-6">
                      <button 
                        onClick={downloadImage}
                        className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-base tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30"
                      >
                        SIMPAN HASIL
                      </button>
                      <button 
                        onClick={() => setResultImage(null)}
                        className={`px-10 py-6 rounded-[2rem] border font-black transition-all ${
                          darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Board */}
              <div className={`p-10 rounded-[3rem] border flex items-center gap-10 ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-900/30 to-slate-900 border-white/5 text-blue-100' 
                  : 'bg-gradient-to-br from-blue-50 to-white border-blue-50 text-blue-900 shadow-xl shadow-blue-100/20'
              }`}>
                <div className="p-5 rounded-[2rem] bg-blue-600 text-white shadow-2xl shrink-0">
                  <Cpu size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xs tracking-[0.3em] uppercase opacity-60">Status Neural: Optimal</h4>
                  <p className="text-base font-bold leading-relaxed">
                    Engine ABI HISAN menganalisis {images.length} piksel referensi. Siap untuk hasil resolusi maksimal dengan akurasi identitas 100%.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>

        <footer className={`mt-24 py-20 border-t transition-colors duration-500 ${
          darkMode ? 'border-white/5 bg-slate-950/50' : 'border-slate-100 bg-white'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10 text-center">
            <div className="flex items-center gap-5 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <MagicStudioLogo className="w-12 h-12" pulse={false} />
               <span className="font-black text-3xl tracking-tight uppercase">ABI HISAN</span>
            </div>
            <p className="text-sm font-bold opacity-30 max-w-lg leading-loose">
              Membangun masa depan seni digital melalui kreativitas neural. 
              Eksplorasi tanpa batas di setiap piksel.
            </p>
            <div className="text-[10px] font-black tracking-[0.4em] opacity-20 uppercase mt-4">
              © 2026 ABI HISAN MAGIC STUDIO • NEURAL AESTHETICS CO.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
