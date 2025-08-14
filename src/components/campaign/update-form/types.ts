import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';

// Types for Prize Distribution
export interface PrizeItem {
  prizeId?: string;
  name: string;
  value: string;
  image?: string;
}

// Categories for Instant Prizes
export interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
  individualPrizes?: IndividualPrize[];
}

export interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

export interface IndividualPrize {
  id?: string;
  type: 'money' | 'item';
  quantity: number;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
  category?: string;
}

// Instant Prize Types
export interface InstantPrize {
  id?: string;
  categoryId?: string;
  number: string;
  value: number;
  claimed?: boolean;
  type?: 'money' | 'item';
  prizeId?: string;
  name?: string;
  image?: string;
}

// Package Types
export interface NumberPackage {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  isActive: boolean;
  highlight: boolean;
  order: number;
  maxPerUser?: number;
}

export interface PrizeDistribution {
  position: number;
  prizes: IPrize[];
  description?: string;
}

// Main Form Data Type
export interface RaffleFormUpdateData {
  title: string;
  description: string;
  individualNumberPrice: number;
  totalNumbers: number;
  drawDate: string;
  status: string;
  canceled: boolean;
  isScheduled: boolean;
  scheduledActivationDate?: string;
  winnerPositions: number;
  prizeDistribution: PrizeDistribution[];
  winners: string[];
  enablePackages: boolean;
  numberPackages: NumberPackage[];
  instantPrizes: InstantPrize[];
  prizeCategories?: PrizeCategoriesConfig;
  regulation: string;
  returnExpected: number;
  minNumbersPerUser: number;
  maxNumbersPerUser?: number;
  images: any[]; // File[] but we use any due to server/client serialization
  coverImage?: any; // File | string but we use any due to server/client serialization
  mainPrize?: string;
  valuePrize?: string;
}

// Payload for Instant Prizes
export interface InstantPrizesPayload {
  prizes: Array<{
    type: 'money' | 'item';
    categoryId: string;
    quantity?: number;
    number?: string;
    value: number;
    prizeId?: string;
    name?: string;
    image?: string;
  }>;
}

// Props for Section Components
export interface SectionProps {
  control: any;
  errors?: any;
  watch?: any;
  setValue?: any;
  getValues?: any;
  isSubmitting?: boolean;
  hasBasicRequirements?: boolean;
  basicRequirementsMessage?: string;
  extractNumericValue?: (value: string) => number;
  totalNumbers?: number;
}

// Interface para tracking changes - each field will be compared
export interface FieldChanges {
  [key: string]: {
    original: any;
    current: any;
    hasChanged: boolean;
  };
}

export interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;
  number?: string;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
}

// Props comuns para componentes de seção
export interface BaseSectionProps {
  control: any;
  errors?: any;
  isSubmitting?: boolean;
}

// Props para BasicInfoSection
export interface BasicInfoSectionProps extends BaseSectionProps {
  watch: any;
  setValue: any;
  getValues: any;
  hasBasicRequirements: boolean;
  basicRequirementsMessage: string;
  extractNumericValue: (value: string) => number;
}

// Props para ImagesSection
export interface ImagesSectionProps extends BaseSectionProps {
  setValue: any;
}

// Props para RegulationSection
export interface RegulationSectionProps extends BaseSectionProps {
  watch: any;
}

// Props para SchedulingSection
export interface SchedulingSectionProps extends BaseSectionProps {
  watch: any;
  setValue: any;
}

// Props para InstantPrizesSection
export interface InstantPrizesSectionProps extends BaseSectionProps {
  instantPrizesInitialData: any;
  setValue: any;
  watch: any;
  totalNumbers: number;
  hasBasicRequirements: boolean;
  basicRequirementsMessage: string;
  disabled: boolean;
}

// Props para CombosSection
export interface CombosSectionProps extends BaseSectionProps {
  watch: any;
  setValue: any;
  getValues: any;
  hasBasicRequirements?: boolean;
  basicRequirementsMessage?: string;
}

// Props para PrizesSection
export interface PrizesSectionProps extends BaseSectionProps {
  watch: any;
  setValue: any;
  getValues: any;
}

// Props para FormActions
export interface  FormActionsProps {
  onCancel: () => void;
  onReset: () => void;
  hasChanges: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

// Props para ChangesSummary
export interface ChangesSummaryProps {
  fieldChanges: FieldChanges;
}

// Props para UpdateIndicator
export interface UpdateIndicatorProps {
  changedFields: string[];
}

// Props para FormSection
export interface FormSectionProps {
  title: string;
  icon: string;
  hasChanges?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Props para ImageItem
export interface ImageItem {
  id: string;
  type: 'url' | 'file';
  url?: string;
  file?: File;
  preview: string;
  isCover: boolean;
}

// Props para RaffleImageManager
export interface RaffleImageManagerProps {
  value: Array<File | string>;
  onChange: (files: Array<File | string>, coverImage?: File | string) => void;
} 