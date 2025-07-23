import mongoose from 'mongoose';
import { 
  IPaymentGatewayTemplate, 
  PaymentGatewayTemplateStatus,
  FieldType,
  IGatewayField,
  IPaymentMethodConfig
} from './interfaces/IPaymentGatewayTemplateInterfaces';
import { generateEntityCode } from './utils/idGenerator';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

// Schema para campos dinâmicos
const GatewayFieldSchema = isServer ? new mongoose.Schema<IGatewayField>({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(FieldType),
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: String,
  description: String,
  validation: {
    minLength: Number,
    maxLength: Number,
    pattern: String,
    errorMessage: String
  },
  options: [{
    value: String,
    label: String
  }],
  defaultValue: String,
  group: {
    type: String,
    enum: ['credentials', 'settings'],
    required: true
  },
  isSecret: {
    type: Boolean,
    default: false
  }
}, { _id: false }) : null;

// Schema para configuração de métodos de pagamento
const PaymentMethodConfigSchema = isServer ? new mongoose.Schema<IPaymentMethodConfig>({
  method: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  fees: {
    percentage: Number,
    fixed: Number
  },
  limits: {
    min: Number,
    max: Number
  }
}, { _id: false }) : null;

// Schema principal
const PaymentGatewayTemplateSchema = isServer ? new mongoose.Schema<IPaymentGatewayTemplate>(
  {
    templateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true,
      default: 'v1'
    },
    templateUniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    
    // Status e disponibilidade
    status: {
      type: String,
      enum: Object.values(PaymentGatewayTemplateStatus),
      default: PaymentGatewayTemplateStatus.ACTIVE,
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    allowedUserTypes: [String],
    
    // Configuração visual
    logo: String,
    color: String,
    documentation: String,
    
    // Campos dinâmicos
    credentialFields: [GatewayFieldSchema],
    settingFields: [GatewayFieldSchema],
    
    // Métodos de pagamento suportados
    supportedMethods: [PaymentMethodConfigSchema],
    
    // Configuração técnica
    apiConfig: {
      baseUrl: {
        type: String,
        required: true
      },
      testBaseUrl: String,
      apiVersion: String,
      timeout: {
        type: Number,
        default: 30000
      },
      retries: {
        type: Number,
        default: 3
      }
    },
    
    // Webhook configuration
    webhookConfig: {
      supportedEvents: [String],
      signatureHeader: String,
      signatureMethod: {
        type: String,
        enum: ['HMAC_SHA256', 'HMAC_SHA1', 'RSA']
      },
      requiresSecret: {
        type: Boolean,
        default: false
      }
    },
    
    // Metadados
    minimumAmount: Number,
    maximumAmount: Number,
    currency: {
      type: String,
      default: 'BRL'
    },
    country: {
      type: String,
      default: 'BR'
    },
    
    // Controle de versão
    isActive: {
      type: Boolean,
      default: true
    },
    deprecatedAt: Date,
    
    // Timestamps e auditoria
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'payment_gateway_templates'
  }
) : null;

// Interface do modelo com métodos estáticos
interface PaymentGatewayTemplateModel extends mongoose.Model<IPaymentGatewayTemplate> {
  getPublicTemplates(): Promise<IPaymentGatewayTemplate[]>;
  getTemplateByCode(templateCode: string): Promise<IPaymentGatewayTemplate | null>;
  getActiveTemplates(): Promise<IPaymentGatewayTemplate[]>;
  getTemplatesForUser(userType: string): Promise<IPaymentGatewayTemplate[]>;
}

if (isServer && PaymentGatewayTemplateSchema) {
  // Índices
  PaymentGatewayTemplateSchema.index({ status: 1, isPublic: 1 });
  PaymentGatewayTemplateSchema.index({ provider: 1 });
  PaymentGatewayTemplateSchema.index({ isActive: 1 });
  PaymentGatewayTemplateSchema.index({ 'supportedMethods.method': 1 });

  // Validações customizadas
  PaymentGatewayTemplateSchema.pre('save', function(this: any, next) {
    // Gerar templateCode se não existir
    if (!this.templateCode && this.provider && this.name) {
      this.templateCode = `${this.provider.toUpperCase()}_${this.name.replace(/\s+/g, '_').toUpperCase()}`;
    }
    next();
  });

  // Métodos estáticos
  PaymentGatewayTemplateSchema.statics.getPublicTemplates = function() {
    return this.find({
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      isActive: true
    }).sort({ name: 1 });
  };

  PaymentGatewayTemplateSchema.statics.getTemplateByCode = function(templateCode: string) {
    return this.findOne({
      templateCode: templateCode.toUpperCase(),
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isActive: true
    });
  };

  PaymentGatewayTemplateSchema.statics.getActiveTemplates = function() {
    return this.find({
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isActive: true
    }).sort({ name: 1 });
  };

  PaymentGatewayTemplateSchema.statics.getTemplatesForUser = function(userType: string) {
    return this.find({
      $or: [
        { isPublic: true },
        { allowedUserTypes: userType }
      ],
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isActive: true
    }).sort({ name: 1 });
  };
}

// Verificar se o modelo já foi compilado
const PaymentGatewayTemplate = isServer 
  ? ((mongoose.models.PaymentGatewayTemplate as unknown as PaymentGatewayTemplateModel) || 
    mongoose.model<IPaymentGatewayTemplate, PaymentGatewayTemplateModel>('PaymentGatewayTemplate', PaymentGatewayTemplateSchema as any))
  : null;

export default PaymentGatewayTemplate; 