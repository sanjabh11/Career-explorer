import { v4 as uuidv4 } from 'uuid';

interface MetricEvent {
    id: string;
    timestamp: number;
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
}

interface UserSession {
    sessionId: string;
    startTime: number;
    lastActivity: number;
    pageViews: number;
    interactions: number;
}

class MetricsCollector {
    private static instance: MetricsCollector;
    private events: MetricEvent[] = [];
    private currentSession: UserSession;
    private readonly BATCH_SIZE = 50;
    private readonly FLUSH_INTERVAL = 60000; // 1 minute

    private constructor() {
        this.currentSession = this.initSession();
        this.setupPeriodicFlush();
        this.setupPageVisibilityListener();
    }

    public static getInstance(): MetricsCollector {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }

    private initSession(): UserSession {
        return {
            sessionId: uuidv4(),
            startTime: Date.now(),
            lastActivity: Date.now(),
            pageViews: 1,
            interactions: 0
        };
    }

    private setupPeriodicFlush(): void {
        setInterval(() => {
            this.flushEvents();
        }, this.FLUSH_INTERVAL);
    }

    private setupPageVisibilityListener(): void {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushEvents();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.flushEvents();
        });
    }

    public trackEvent(
        category: string,
        action: string,
        label?: string,
        value?: number,
        metadata?: Record<string, any>
    ): void {
        const event: MetricEvent = {
            id: uuidv4(),
            timestamp: Date.now(),
            category,
            action,
            label,
            value,
            metadata: {
                ...metadata,
                sessionId: this.currentSession.sessionId,
                sessionDuration: Date.now() - this.currentSession.startTime
            }
        };

        this.events.push(event);
        this.currentSession.interactions++;
        this.currentSession.lastActivity = Date.now();

        if (this.events.length >= this.BATCH_SIZE) {
            this.flushEvents();
        }
    }

    public trackPageView(page: string): void {
        this.currentSession.pageViews++;
        this.trackEvent('navigation', 'page_view', page);
    }

    public trackComponentRender(componentName: string, renderTime: number): void {
        this.trackEvent('performance', 'component_render', componentName, renderTime);
    }

    public trackUserInteraction(
        element: string,
        action: string,
        metadata?: Record<string, any>
    ): void {
        this.trackEvent('interaction', action, element, undefined, metadata);
    }

    public trackApiCall(
        endpoint: string,
        method: string,
        duration: number,
        status: number
    ): void {
        this.trackEvent('api', method, endpoint, duration, { status });
    }

    public trackError(
        category: string,
        message: string,
        stack?: string
    ): void {
        this.trackEvent('error', category, message, undefined, { stack });
    }

    private async flushEvents(): Promise<void> {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        try {
            await fetch('/api/v2/metrics/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: eventsToSend,
                    session: this.currentSession
                })
            });
        } catch (error) {
            console.error('Failed to send metrics:', error);
            // Re-add failed events to the queue
            this.events = [...eventsToSend, ...this.events];
        }
    }
}

// Export singleton instance
export const metrics = MetricsCollector.getInstance();

// React Hook for component performance tracking
export const useTrackRender = (componentName: string) => {
    const startTime = Date.now();
    
    return () => {
        const renderTime = Date.now() - startTime;
        metrics.trackComponentRender(componentName, renderTime);
    };
};

export const trackError = (category: string, message: string, stack?: string) => {
    console.error(`[${category}] ${message}${stack ? `\nStack: ${stack}` : ''}`);
};

export const trackApiCall = (endpoint: string, method: string, duration: number, status: number) => {
    console.log(`API Call: ${method} ${endpoint} - Duration: ${duration}ms, Status: ${status}`);
};

export const withErrorTracking = async <T>(
    fn: () => Promise<T>,
    endpoint: string,
    method: string
): Promise<T> => {
    const startTime = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - startTime;
        trackApiCall(endpoint, method, duration, 200);
        return result;
    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        trackApiCall(endpoint, method, duration, 0);
        
        if (error instanceof Error) {
            trackError('api_error', error.message, error.stack);
        } else {
            trackError('api_error', 'An unknown error occurred', undefined);
        }
        throw error;
    }
};

export const apiCall = async <T>(
    endpoint: string,
    method: string,
    options?: RequestInit
): Promise<T> => {
    return withErrorTracking(async () => {
        const response = await fetch(endpoint, {
            method,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }, endpoint, method);
};
