export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private readonly requiredVars = [
    'ONET_USERNAME',
    'ONET_PASSWORD',
    'SERP_API_KEY',
    'JINA_API_KEY'
  ];

  private constructor() {
    this.validateEnvironment();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnvironment(): void {
    for (const envVar of this.requiredVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }

  public getOnetConfig() {
    return {
      username: process.env.ONET_USERNAME!,
      password: process.env.ONET_PASSWORD!,
      baseUrl: process.env.NEXT_PUBLIC_ONET_API_URL
    };
  }

  public getSerpConfig() {
    return {
      apiKey: process.env.SERP_API_KEY!,
      baseUrl: process.env.SERP_API_BASE_URL
    };
  }

  public getJinaConfig() {
    return {
      apiKey: process.env.JINA_API_KEY!,
      baseUrl: process.env.JINA_API_BASE_URL
    };
  }

  public getProxyConfig() {
    return {
      url: process.env.NEXT_PUBLIC_API_PROXY_URL,
      timeout: parseInt(process.env.API_PROXY_TIMEOUT || '30000')
    };
  }
}