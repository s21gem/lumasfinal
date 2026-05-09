import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, Image as ImageIcon, Globe, Phone, MessageCircle, Calendar, Share2, Type, Layout, Search, Award } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

type SettingsTab = 'hero' | 'logo' | 'contact' | 'social' | 'team' | 'footer' | 'seo' | 'brands';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [settings, setSettings] = useState({
    heroSubtitle: '',
    heroTitle: '',
    heroTitleHighlight: '',
    heroDescription: '',
    heroVideoUrl: '',
    heroPosterUrl: '',
    logoLightUrl: '',
    logoDarkUrl: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    calendlyUrl: '',
    address: '',
    city: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    teamCarouselDistance: 380,
    footerTagline: '',
    copyrightText: '',
    siteTitle: '',
    siteDescription: '',
    faviconUrl: '',
    trustedBrandsGrayscale: true,
    trustedBrandsMarqueeSpeed: 40,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null)),
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: name === 'teamCarouselDistance' ? parseInt(value) || 0 : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    fieldName: string,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'lumas-portfolio/settings');
      
      if (fieldName.includes('logo')) {
        formData.append('type', 'logo');
      } else if (fieldName.includes('favicon')) {
        formData.append('type', 'favicon');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      setSettings(prev => ({ ...prev, [fieldName]: data.url }));
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'hero', label: 'Hero Section', icon: <Layout className="w-4 h-4" /> },
    { key: 'logo', label: 'Logo', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
    { key: 'social', label: 'Social Links', icon: <Share2 className="w-4 h-4" /> },
    { key: 'team', label: 'Team Carousel', icon: <Type className="w-4 h-4" /> },
    { key: 'footer', label: 'Footer', icon: <Globe className="w-4 h-4" /> },
    { key: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
    { key: 'brands', label: 'Brands', icon: <Award className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-400 outline-none text-black dark:text-white";
  const labelClass = "block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Site Settings</h1>
          <p className="text-zinc-500 mt-1">Configure your website content and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Settings
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl font-medium animate-in fade-in">
          ✓ {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-8 shadow-sm">
        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Hero Section Content</h3>
            <div>
              <label className={labelClass}>Subtitle (Top Line)</label>
              <input type="text" name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className={inputClass} placeholder="From Idea to Conversion..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Main Title</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleChange} className={inputClass} placeholder="Small in size," />
              </div>
              <div>
                <label className={labelClass}>Highlighted Text (Gradient)</label>
                <input type="text" name="heroTitleHighlight" value={settings.heroTitleHighlight} onChange={handleChange} className={inputClass} placeholder="Big in impact." />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="heroDescription" value={settings.heroDescription} onChange={handleChange} rows={3} className={inputClass + ' resize-none'} placeholder="Creative Production and Post-production Studio..." />
            </div>
            <div className="border-t border-black/5 dark:border-white/5 pt-6">
              <h4 className="text-lg font-bold mb-4">Background Video</h4>
              <div>
                <label className={labelClass}>Video URL (paste link)</label>
                <input type="url" name="heroVideoUrl" value={settings.heroVideoUrl} onChange={handleChange} className={inputClass} placeholder="https://videos.pexels.com/..." />
              </div>
              <div className="mt-4">
                <label className={labelClass}>Or Upload Video</label>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 1920×1080px (16:9) • MP4/WebM • Max 100MB</p>
                <label className={`flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingVideo ? 'opacity-50' : ''}`}>
                  {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                  <span className="text-zinc-500">{uploadingVideo ? 'Uploading...' : 'Click to upload video (MP4, WebM)'}</span>
                  <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'heroVideoUrl', setUploadingVideo);
                  }} />
                </label>
              </div>
              {settings.heroVideoUrl && (
                <div className="mt-4 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-video">
                  <video src={getMediaUrl(settings.heroVideoUrl, 'video')} className="w-full h-full object-cover" muted loop autoPlay />
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOGO TAB */}
        {activeTab === 'logo' && (
          <div className="space-y-8">
            <h3 className="text-xl font-bold mb-4">Logo Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Light Logo */}
              <div className="space-y-4">
                <label className={labelClass}>Light Mode Logo</label>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 400×120px • PNG (transparent bg) • Max 2MB</p>
                <div className="bg-white border border-zinc-200 rounded-xl p-8 flex items-center justify-center min-h-[120px]">
                  {settings.logoLightUrl ? (
                    <img src={getMediaUrl(settings.logoLightUrl)} alt="Light Logo" className="max-h-20 object-contain" />
                  ) : (
                    <span className="text-zinc-400">No logo uploaded</span>
                  )}
                </div>
                <input type="url" name="logoLightUrl" value={settings.logoLightUrl} onChange={handleChange} className={inputClass} placeholder="Logo URL or upload below" />
                <label className={`flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingLight ? 'opacity-50' : ''}`}>
                  {uploadingLight ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                  <span className="text-zinc-500 text-sm">{uploadingLight ? 'Uploading...' : 'Upload Light Logo'}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingLight} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logoLightUrl', setUploadingLight);
                  }} />
                </label>
              </div>
              {/* Dark Logo */}
              <div className="space-y-4">
                <label className={labelClass}>Dark Mode Logo</label>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 400×120px • PNG (transparent bg) • Max 2MB</p>
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 flex items-center justify-center min-h-[120px]">
                  {settings.logoDarkUrl ? (
                    <img src={getMediaUrl(settings.logoDarkUrl)} alt="Dark Logo" className="max-h-20 object-contain" />
                  ) : (
                    <span className="text-zinc-500">No logo uploaded</span>
                  )}
                </div>
                <input type="url" name="logoDarkUrl" value={settings.logoDarkUrl} onChange={handleChange} className={inputClass} placeholder="Logo URL or upload below" />
                <label className={`flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingDark ? 'opacity-50' : ''}`}>
                  {uploadingDark ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                  <span className="text-zinc-500 text-sm">{uploadingDark ? 'Uploading...' : 'Upload Dark Logo'}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingDark} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logoDarkUrl', setUploadingDark);
                  }} />
                </label>
              </div>
            </div>

            {/* Favicon Management */}
            <div className="border-t border-black/5 dark:border-white/5 pt-8">
              <h3 className="text-xl font-bold mb-4">Favicon Management</h3>
              <div className="max-w-md space-y-4">
                <label className={labelClass}>Site Favicon (32x32 or 64x64 .png/ .ico)</label>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 32×32px or 64×64px (1:1) • PNG/ICO • Max 500KB</p>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 flex items-center gap-4 border border-black/5 dark:border-white/5">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-black/5 shadow-sm overflow-hidden">
                    {settings.faviconUrl ? (
                      <img src={getMediaUrl(settings.faviconUrl)} alt="Favicon" className="w-8 h-8 object-contain" />
                    ) : (
                      <Globe className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input type="url" name="faviconUrl" value={settings.faviconUrl} onChange={handleChange} className={inputClass} placeholder="Favicon URL" />
                  </div>
                </div>
                <label className={`flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingFavicon ? 'opacity-50' : ''}`}>
                  {uploadingFavicon ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                  <span className="text-zinc-500 text-sm">{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingFavicon} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'faviconUrl', setUploadingFavicon);
                  }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}><Phone className="w-4 h-4 inline mr-1" /> Phone Number</label>
                <input type="text" name="phone" value={settings.phone} onChange={handleChange} className={inputClass} placeholder="+880 1234 567890" />
              </div>
              <div>
                <label className={labelClass}><Globe className="w-4 h-4 inline mr-1" /> Email Address</label>
                <input type="email" name="email" value={settings.email} onChange={handleChange} className={inputClass} placeholder="hello@lumascreative.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}><MessageCircle className="w-4 h-4 inline mr-1" /> WhatsApp Number</label>
                <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} className={inputClass} placeholder="8801234567890 (with country code, no +)" />
                <p className="text-xs text-zinc-500 mt-1">Enter number with country code but without + or spaces. Example: 8801234567890</p>
              </div>
              <div>
                <label className={labelClass}><Calendar className="w-4 h-4 inline mr-1" /> Calendly URL</label>
                <input type="url" name="calendlyUrl" value={settings.calendlyUrl} onChange={handleChange} className={inputClass} placeholder="https://calendly.com/your-name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" name="address" value={settings.address} onChange={handleChange} className={inputClass} placeholder="123 Creative Blvd, Suite 400" />
              </div>
              <div>
                <label className={labelClass}>City / Zip</label>
                <input type="text" name="city" value={settings.city} onChange={handleChange} className={inputClass} placeholder="Dhaka, Bangladesh" />
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input type="url" name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/yourpage" />
              </div>
              <div>
                <label className={labelClass}>Twitter / X URL</label>
                <input type="url" name="twitterUrl" value={settings.twitterUrl} onChange={handleChange} className={inputClass} placeholder="https://x.com/yourpage" />
              </div>
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={settings.linkedinUrl} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/company/yourpage" />
              </div>
              <div>
                <label className={labelClass}>YouTube URL</label>
                <input type="url" name="youtubeUrl" value={settings.youtubeUrl} onChange={handleChange} className={inputClass} placeholder="https://youtube.com/@yourchannel" />
              </div>
            </div>
          </div>
        )}

        {/* TEAM CAROUSEL TAB */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Team Carousel Settings</h3>
            <div className="max-w-xl">
              <label className={labelClass}>Desktop Carousel Distance (Radius): {settings.teamCarouselDistance}px</label>
              <input
                type="range"
                name="teamCarouselDistance"
                min="150"
                max="800"
                step="10"
                value={settings.teamCarouselDistance}
                onChange={handleChange}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>150px (compact)</span>
                <span>800px (spread)</span>
              </div>
              <p className="text-sm text-zinc-500 mt-3">
                Adjust the distance between image cards in the 3D carousel. Decrease for fewer members, increase for more.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Footer Content</h3>
            <div>
              <label className={labelClass}>Footer Tagline</label>
              <textarea name="footerTagline" value={settings.footerTagline} onChange={handleChange} rows={3} className={inputClass + ' resize-none'} placeholder="A creative production and post-production studio..." />
            </div>
            <div>
              <label className={labelClass}>Copyright Text (Company Name)</label>
              <input type="text" name="copyrightText" value={settings.copyrightText} onChange={handleChange} className={inputClass} placeholder="Lumas Creative Studio" />
              <p className="text-xs text-zinc-500 mt-1">Will display as: © 2026 {settings.copyrightText || 'Your Company'}. All rights reserved.</p>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">SEO Settings</h3>
            <div>
              <label className={labelClass}>Site Title</label>
              <input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} className={inputClass} placeholder="Lumas Creative Studio" />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows={3} className={inputClass + ' resize-none'} placeholder="Creative Production and Post-production Studio..." />
            </div>
          </div>
        )}

        {/* BRANDS TAB */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Trusted Brands Settings</h3>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-black dark:text-white">Grayscale Brand Logos</h4>
                  <p className="text-sm text-zinc-500 mt-1">
                    When enabled, brand logos will be shown in grayscale and only reveal their original colors when hovered. When disabled, logos will always show in full color.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.trustedBrandsGrayscale}
                    onChange={(e) => setSettings(prev => ({ ...prev, trustedBrandsGrayscale: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-black dark:text-white">Marquee Scroll Speed</h4>
                      <p className="text-sm text-zinc-500 mt-1">Control how fast the brands scroll across the screen.</p>
                    </div>
                    <span className="text-xl font-black text-cyan-500">{settings.trustedBrandsMarqueeSpeed}s</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="120" 
                    step="5"
                    value={settings.trustedBrandsMarqueeSpeed || 40}
                    onChange={(e) => setSettings(prev => ({ ...prev, trustedBrandsMarqueeSpeed: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-2 font-medium">
                    <span>Fast (10s)</span>
                    <span>Slow (120s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
