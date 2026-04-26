import { supabase } from './supabase';

type EventType = 'slide_view' | 'project_click' | 'contact_click' | 'testimonial_view' | 'session_start' | 'session_end';
type ContentType = 'projecto' | 'servico' | 'depoimento' | 'contacto';
type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface AnalyticsEvent {
  event_type: EventType;
  slide_number?: number;
  content_id?: string;
  content_type?: ContentType;
  session_id: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  referrer?: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
}

interface UserSession {
  session_id: string;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  country?: string;
  city?: string;
}

class AnalyticsService {
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private currentSlide: number | null = null;
  private slideStartTime: number | null = null;
  private totalInteractions = 0;
  private slidesViewed = new Set<number>();

  constructor() {
    this.initializeSession();
    this.trackPageUnload();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDeviceInfo(): { device_type: DeviceType; browser: string; os: string } {
    const userAgent = navigator.userAgent;
    
    // Detectar dispositivo
    let deviceType: DeviceType = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detectar browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Detectar OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { device_type: deviceType, browser, os };
  }

  private getUTMParameters(): Record<string, string> {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
    };
  }

  private async initializeSession(): Promise<void> {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();

    const deviceInfo = this.getDeviceInfo();
    const utmParams = this.getUTMParameters();
    
    const sessionData: UserSession = {
      session_id: this.sessionId,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screen_resolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || '',
      ...utmParams,
    };

    try {
      // Iniciar sessão no banco
      await supabase.from('user_sessions').insert(sessionData);

      // Rastrear início da sessão
      await this.trackEvent('session_start', {
        metadata: {
          screen_resolution: sessionData.screen_resolution,
          referrer: sessionData.referrer,
          ...utmParams,
        },
      });

      // Obter informações de localização (se disponível)
      this.fetchLocationInfo();
    } catch (error) {
      console.warn('Analytics session initialization failed:', error);
    }
  }

  private async fetchLocationInfo(): Promise<void> {
    try {
      // Usar uma API gratuita para obter informações de localização baseada no IP
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar sessão com informações de localização
        await supabase
          .from('user_sessions')
          .update({
            country: data.country_name || data.country,
            city: data.city,
          })
          .eq('session_id', this.sessionId);

        // Armazenar para eventos futuros
        this.updateSessionLocation(data.country_name || data.country, data.city);
      }
    } catch (error) {
      console.warn('Location fetch failed:', error);
    }
  }

  private updateSessionLocation(country: string, city?: string): void {
    // Armazenar localização para uso em eventos futuros
    (window as any).__analytics_location = { country, city };
  }

  private async trackEvent(eventType: EventType, data: Partial<AnalyticsEvent> = {}): Promise<void> {
    if (!this.sessionId) return;

    const location = (window as any).__analytics_location || {};
    
    const eventData: AnalyticsEvent = {
      event_type: eventType,
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || '',
      country: location.country,
      ...data,
    };

    try {
      await supabase.from('analytics_events').insert(eventData);
    } catch (error) {
      console.warn('Analytics event tracking failed:', error);
    }
  }

  private trackPageUnload(): void {
    const handleUnload = () => {
      if (this.sessionId && this.sessionStartTime) {
        const duration = Date.now() - this.sessionStartTime;
        
        // Enviar evento de fim de sessão síncrono (usando sendBeacon)
        const eventData = {
          event_type: 'session_end' as EventType,
          session_id: this.sessionId,
          duration_ms: duration,
        };

        try {
          const data = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
          navigator.sendBeacon(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`,
            data
          );
        } catch (error) {
          console.warn('Beacon tracking failed:', error);
        }

        // Atualizar sessão com duração final
        this.updateSessionEnd(duration);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
  }

  private async updateSessionEnd(duration: number): Promise<void> {
    if (!this.sessionId) return;

    try {
      await supabase
        .from('user_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: Math.round(duration / 1000),
          total_slides_viewed: this.slidesViewed.size,
          total_interactions: this.totalInteractions,
          completed_presentation: this.slidesViewed.size >= 8, // Considera completo se viu 8+ slides
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.warn('Session end update failed:', error);
    }
  }

  // Métodos públicos para rastreamento

  public async trackSlideView(slideNumber: number): Promise<void> {
    if (!this.sessionId) return;

    // Calcular duração do slide anterior
    if (this.slideStartTime && this.currentSlide !== null) {
      const slideDuration = Date.now() - this.slideStartTime;
      
      await this.trackEvent('slide_view', {
        slide_number: this.currentSlide,
        duration_ms: slideDuration,
      });
    }

    this.currentSlide = slideNumber;
    this.slideStartTime = Date.now();
    this.slidesViewed.add(slideNumber);
  }

  public async trackProjectClick(projectId: string): Promise<void> {
    this.totalInteractions++;
    await this.trackEvent('project_click', {
      content_id: projectId,
      content_type: 'projecto',
    });
  }

  public async trackContactClick(contactId: string, contactType: string): Promise<void> {
    this.totalInteractions++;
    await this.trackEvent('contact_click', {
      content_id: contactId,
      content_type: 'contacto',
      metadata: { contact_type: contactType },
    });
  }

  public async trackTestimonialView(testimonialId: string): Promise<void> {
    await this.trackEvent('testimonial_view', {
      content_id: testimonialId,
      content_type: 'depoimento',
    });
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public getCurrentSlide(): number | null {
    return this.currentSlide;
  }

  public getSlidesViewed(): number {
    return this.slidesViewed.size;
  }

  public getTotalInteractions(): number {
    return this.totalInteractions;
  }
}

// Criar instância global do serviço
export const analytics = new AnalyticsService();

// Exportar tipos para uso em componentes
export type { EventType, ContentType, DeviceType, AnalyticsEvent, UserSession };
export { AnalyticsService };
