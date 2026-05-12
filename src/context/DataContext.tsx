import React, { createContext, useContext, useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  category: string;
  clientName: string | null;
  results: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  contentType: string;
  sortOrder: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
  sortOrder: number;
}

interface Service {
  id: string;
  title: string;
  description: string;
  iconIdentifier: string | null;
  sortOrder: number;
}

interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  iconIdentifier: string | null;
  sortOrder: number;
}

interface Testimonial {
  id: string;
  clientName: string;
  role: string | null;
  company: string | null;
  quote: string;
  videoUrl: string | null;
  imageUrl: string | null;
  ytSubscribers: string | null;
  ytViews: string | null;
  igFollowers: string | null;
  fbFollowers: string | null;
  tiktokFollowers: string | null;
  sortOrder: number;
}

interface TrustedBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  sortOrder: number;
}

interface Settings {
  id: string;
  heroSubtitle: string | null;
  heroTitle: string | null;
  heroTitleHighlight: string | null;
  heroDescription: string | null;
  heroVideoUrl: string | null;
  heroPosterUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  calendlyUrl: string | null;
  address: string | null;
  city: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  teamCarouselDistance: number;
  teamCarouselCardSize: number;
  teamCarouselGrayscale: boolean;
  teamHeaderTitle: string;
  teamHeaderHighlight: string;
  teamBackgroundText: string;
  teamBackgroundTextSize: number;
  teamBackgroundTextLineHeight: number;
  teamCarouselStairOffset: number;
  footerTagline: string | null;
  copyrightText: string | null;
  siteTitle: string | null;
  siteDescription: string | null;
  trustedBrandsGrayscale: boolean;
  trustedBrandsMarqueeSpeed: number;
  privacyPolicy: string | null;
  termsOfService: string | null;
  defaultMeetingDuration: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  whatsappNotifyNumber: string | null;
  whatsappApiKey: string | null;
}

interface InitData {
  settings: Settings | null;
  projects: Project[];
  teamMembers: TeamMember[];
  services: Service[];
  processSteps: ProcessStep[];
  testimonials: Testimonial[];
  trustedBrands: TrustedBrand[];
}

interface DataContextType extends InitData {
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InitData>({
    settings: null,
    projects: [],
    teamMembers: [],
    services: [],
    processSteps: [],
    testimonials: [],
    trustedBrands: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/init-data');
      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData);
      }
    } catch (error) {
      console.error('Failed to fetch initialization data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, loading, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
