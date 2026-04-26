import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  Database,
  Download,
  Eye,
  Globe,
  Monitor,
  RefreshCcw,
  Smartphone,
  Sparkles,
  Tablet,
  TrendingUp,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  ActivityHeatmap,
  HorizontalBarChart,
  LollipopChart,
  MetricCard as AnalyticsMetricCard,
  SplitProgressChart,
  StackedShareChart,
  WorldMap
} from './charts/AnalyticsCharts';

interface AnalyticsData {
  totalSessions: number;
  uniqueVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topSlide: number | null;
  topContent: {
    id: string;
    type: string;
    views: number;
  } | null;
  countriesCount: number;
  recentSessions: Array<{
    id: string;
    startTime: string;
    duration: number;
    deviceType: string;
    country: string;
    slidesViewed: number;
    completed: boolean;
  }>;
  slidePerformance: Array<{
    slideNumber: number;
    views: number;
    avgDuration: number;
    dropOffRate: number;
  }>;
  contentPerformance: Array<{
    id: string;
    type: string;
    title: string;
    views: number;
    clicks: number;
    conversionRate: number;
  }>;
  countryData: Array<{
    country: string;
    sessions: number;
    percentage: number;
  }>;
  dailyMetrics: Array<{
    date: string;
    sessions: number;
    visitors: number;
    pageViews: number;
  }>;
}

function createPreviewAnalyticsData(days: number): AnalyticsData {
  const today = new Date();
  const dailyMetrics = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);

    const sessions = 20 + ((index * 7) % 23) + (index % 4) * 3;
    const visitors = Math.max(10, sessions - (3 + (index % 5)));
    const pageViews = sessions * (2 + (index % 3));

    return {
      date: date.toISOString().split('T')[0],
      sessions,
      visitors,
      pageViews
    };
  });

  const recentSessions = Array.from({ length: 8 }, (_, index) => ({
    id: `preview-session-${index + 1}`,
    startTime: new Date(today.getTime() - index * 1000 * 60 * 65).toISOString(),
    duration: 180 + index * 38,
    deviceType: ['desktop', 'mobile', 'tablet'][index % 3],
    country: ['Angola', 'Portugal', 'Brazil', 'South Africa'][index % 4],
    slidesViewed: 3 + (index % 5),
    completed: index % 3 !== 1
  }));

  const slidePerformance = Array.from({ length: 8 }, (_, index) => ({
    slideNumber: index,
    views: 22 + ((index + 3) * 9) % 43,
    avgDuration: 12 + (index % 4) * 4,
    dropOffRate: 0
  }));

  const contentPerformance = [
    { id: 'branding-system', type: 'project', title: 'Branding System', views: 84, clicks: 18, conversionRate: 21.4 },
    { id: 'campaign-kit', type: 'project', title: 'Campaign Kit', views: 73, clicks: 14, conversionRate: 19.2 },
    { id: 'product-launch', type: 'case-study', title: 'Product Launch', views: 58, clicks: 11, conversionRate: 19.0 },
    { id: 'social-pack', type: 'asset', title: 'Social Pack', views: 41, clicks: 8, conversionRate: 19.5 }
  ];

  const countryData = [
    { country: 'Angola', sessions: 62, percentage: 42 },
    { country: 'Portugal', sessions: 31, percentage: 21 },
    { country: 'Brazil', sessions: 24, percentage: 16 },
    { country: 'South Africa', sessions: 17, percentage: 11 },
    { country: 'Mozambique', sessions: 13, percentage: 9 }
  ];

  return {
    totalSessions: dailyMetrics.reduce((sum, day) => sum + day.sessions, 0),
    uniqueVisitors: dailyMetrics.reduce((sum, day) => sum + day.visitors, 0),
    totalPageViews: dailyMetrics.reduce((sum, day) => sum + day.pageViews, 0),
    avgSessionDuration: 246,
    bounceRate: 34.8,
    conversionRate: 12.6,
    topSlide: 2,
    topContent: {
      id: contentPerformance[0].id,
      type: contentPerformance[0].type,
      views: contentPerformance[0].views
    },
    countriesCount: countryData.length,
    recentSessions,
    slidePerformance,
    contentPerformance,
    countryData,
    dailyMetrics
  };
}

function hasLiveAnalyticsData(args: {
  dailyMetrics: any[];
  recentSessions: any[];
  contentPerf: any[];
  slideEvents: any[];
}) {
  return (
    args.dailyMetrics.length > 0 ||
    args.recentSessions.length > 0 ||
    args.contentPerf.length > 0 ||
    args.slideEvents.length > 0
  );
}

function processSlidePerformance(slideEvents: any[]) {
  const slideStats = new Map<number, { views: number; totalDuration: number }>();

  slideEvents.forEach((event) => {
    const slideNumber = event.slide_number;
    if (slideNumber === null || slideNumber === undefined) return;

    if (!slideStats.has(slideNumber)) {
      slideStats.set(slideNumber, { views: 0, totalDuration: 0 });
    }

    const stats = slideStats.get(slideNumber)!;
    stats.views += 1;
    stats.totalDuration += event.duration_ms || 0;
  });

  return Array.from(slideStats.entries())
    .map(([slideNumber, stats]) => ({
      slideNumber,
      views: stats.views,
      avgDuration: stats.views > 0 ? Math.round(stats.totalDuration / stats.views / 1000) : 0,
      dropOffRate: 0
    }))
    .sort((left, right) => left.slideNumber - right.slideNumber);
}

function processCountryData(sessions: any[]) {
  const countryCounts = new Map<string, number>();

  sessions.forEach((session) => {
    const country = session.country || 'Unknown';
    countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
  });

  const total = sessions.length;

  return Array.from(countryCounts.entries())
    .map(([country, count]) => ({
      country,
      sessions: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((left, right) => right.sessions - left.sessions)
    .slice(0, 10);
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [notice, setNotice] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [dailyMetricsRes, recentSessionsRes, contentPerfRes, slideEventsRes] = await Promise.all([
        supabase
          .from('daily_metrics')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: false }),
        supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('content_performance')
          .select('*')
          .order('total_views', { ascending: false })
          .limit(10),
        supabase
          .from('analytics_events')
          .select('slide_number, created_at, duration_ms')
          .eq('event_type', 'slide_view')
          .gte('created_at', startDate.toISOString())
      ]);

      const dailyMetrics = dailyMetricsRes.data || [];
      const recentSessions = recentSessionsRes.data || [];
      const contentPerf = contentPerfRes.data || [];
      const slideEvents = slideEventsRes.data || [];
      const queryErrors = [
        dailyMetricsRes.error,
        recentSessionsRes.error,
        contentPerfRes.error,
        slideEventsRes.error
      ].filter(Boolean);

      if (!hasLiveAnalyticsData({ dailyMetrics, recentSessions, contentPerf, slideEvents })) {
        setData(createPreviewAnalyticsData(days));
        setIsPreviewMode(true);
        setNotice('Ainda nao existem dados suficientes nas tabelas de analytics. Estou a mostrar um preview visual para o painel nao ficar vazio.');
        return;
      }

      const slidePerformance = processSlidePerformance(slideEvents);
      const processedData: AnalyticsData = {
        totalSessions: dailyMetrics.reduce((sum, day) => sum + (day.total_sessions || 0), 0),
        uniqueVisitors: dailyMetrics.reduce((sum, day) => sum + (day.unique_visitors || 0), 0),
        totalPageViews: dailyMetrics.reduce((sum, day) => sum + (day.total_page_views || 0), 0),
        avgSessionDuration:
          dailyMetrics.reduce((sum, day) => sum + (day.avg_session_duration_seconds || 0), 0) / (dailyMetrics.length || 1) || 0,
        bounceRate: dailyMetrics.reduce((sum, day) => sum + (day.bounce_rate || 0), 0) / (dailyMetrics.length || 1) || 0,
        conversionRate:
          dailyMetrics.reduce((sum, day) => sum + (day.conversion_rate || 0), 0) / (dailyMetrics.length || 1) || 0,
        topSlide: dailyMetrics[0]?.top_slide ?? (slidePerformance[0]?.slideNumber ?? null),
        topContent: contentPerf[0]
          ? {
              id: contentPerf[0].content_id,
              type: contentPerf[0].content_type,
              views: contentPerf[0].total_views
            }
          : null,
        countriesCount: dailyMetrics[0]?.countries_count || new Set(recentSessions.map((session) => session.country).filter(Boolean)).size,
        recentSessions: recentSessions.map((session) => ({
          id: session.session_id || session.id,
          startTime: session.start_time || session.created_at || new Date().toISOString(),
          duration: session.duration_seconds || 0,
          deviceType: session.device_type || 'unknown',
          country: session.country || 'Unknown',
          slidesViewed: session.total_slides_viewed || 0,
          completed: session.completed_presentation || false
        })),
        slidePerformance,
        contentPerformance: contentPerf.map((item) => ({
          id: item.content_id,
          type: item.content_type,
          title: item.content_title || item.content_id,
          views: item.total_views || 0,
          clicks: item.total_clicks || 0,
          conversionRate: item.total_views > 0 ? ((item.total_clicks || 0) / item.total_views) * 100 : 0
        })),
        countryData: processCountryData(recentSessions),
        dailyMetrics: dailyMetrics.map((day) => ({
          date: day.date,
          sessions: day.total_sessions || 0,
          visitors: day.unique_visitors || 0,
          pageViews: day.total_page_views || 0
        }))
      };

      setData(processedData);
      setIsPreviewMode(false);

      if (queryErrors.length > 0) {
        setNotice('Algumas fontes de analytics responderam com erro. O painel esta a mostrar apenas os dados que conseguiu carregar.');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setData(createPreviewAnalyticsData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      setIsPreviewMode(true);
      setNotice('Falhou a leitura live do analytics. Ativei um modo preview para manter o painel utilizavel enquanto ligamos os dados reais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#635BFF]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[24px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#DC2626] shadow-sm">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="mt-4 text-lg font-semibold text-[#111827]">Nao foi possivel carregar os analytics</div>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
          Verifica a ligacao ao Supabase e confirma se as tabelas de analytics ja existem no projeto.
        </p>
      </div>
    );
  }

  const dailyTrafficSeries = [...data.dailyMetrics].slice(0, 14).reverse();
  const slideChartData = [...data.slidePerformance]
    .sort((left, right) => left.slideNumber - right.slideNumber)
    .map((slide) => ({
      value: slide.views,
      label: `S${slide.slideNumber + 1}`,
      color: '#635BFF'
    }));
  const topContentChartData = data.contentPerformance.slice(0, 4).map((content, index) => ({
    value: content.views,
    label: content.title,
    color: ['#635BFF', '#10B981', '#F59E0B', '#EF4444'][index] || '#635BFF'
  }));
  const deviceData = [
    { type: 'Desktop', count: data.recentSessions.filter((session) => session.deviceType === 'desktop').length, icon: Monitor, color: '#635BFF' },
    { type: 'Mobile', count: data.recentSessions.filter((session) => session.deviceType === 'mobile').length, icon: Smartphone, color: '#10B981' },
    { type: 'Tablet', count: data.recentSessions.filter((session) => session.deviceType === 'tablet').length, icon: Tablet, color: '#F59E0B' }
  ];
  const conversionBreakdown = [
    { label: 'Conversao', value: data.conversionRate, color: '#10B981' },
    { label: 'Rejeicao', value: data.bounceRate, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[26px] font-bold tracking-[-0.04em] text-[#09090B]">Analytics Dashboard</h3>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${isPreviewMode ? 'bg-[#FFF7ED] text-[#C2410C]' : 'bg-[#ECFDF3] text-[#027A48]'}`}>
              {isPreviewMode ? <Sparkles className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
              {isPreviewMode ? 'Preview mode' : 'Live data'}
            </span>
            <span>{isPreviewMode ? 'Painel visivel mesmo sem base pronta.' : 'Sincronizado com a base de analytics.'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadAnalyticsData()}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] hover:bg-[#F9FAFB]"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value as '7d' | '30d' | '90d')}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#CBC5FF]"
          >
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="90d">Ultimos 90 dias</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] hover:bg-[#F9FAFB]">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {notice && (
        <div className={`flex items-start gap-3 rounded-[20px] border px-4 py-3 ${isPreviewMode ? 'border-[#FED7AA] bg-[#FFF7ED]' : 'border-[#D8D4FE] bg-[#F5F3FF]'}`}>
          <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${isPreviewMode ? 'text-[#C2410C]' : 'text-[#635BFF]'}`} />
          <div>
            <div className={`text-sm font-semibold ${isPreviewMode ? 'text-[#9A3412]' : 'text-[#4C1D95]'}`}>
              {isPreviewMode ? 'Analytics em preview' : 'Carga parcial de dados'}
            </div>
            <p className={`mt-1 text-sm ${isPreviewMode ? 'text-[#9A3412]' : 'text-[#5B21B6]'}`}>{notice}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard title="Sessoes Totais" value={data.totalSessions} icon={Users} color="#635BFF" trend="up" />
        <AnalyticsMetricCard title="Visualizacoes" value={data.totalPageViews} icon={Eye} color="#10B981" trend="up" />
        <AnalyticsMetricCard title="Duracao Media" value={data.avgSessionDuration} icon={Clock} color="#F59E0B" format="duration" trend="down" />
        <AnalyticsMetricCard title="Taxa de Conversao" value={data.conversionRate} icon={TrendingUp} color="#EF4444" format="percentage" trend="up" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Panel title="Trafego Diario" description="Evolucao das visualizacoes ao longo do tempo.">
          <div className="space-y-4">
            <DailyTrafficChart data={dailyTrafficSeries} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">Hoje</div>
                <div className="text-lg font-bold text-gray-900">{data.dailyMetrics[0]?.sessions || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Media 7d</div>
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(data.dailyMetrics.slice(0, 7).reduce((sum, day) => sum + day.sessions, 0) / Math.max(data.dailyMetrics.slice(0, 7).length, 1))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-bold text-gray-900">{data.dailyMetrics.reduce((sum, day) => sum + day.sessions, 0)}</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Distribuicao Geografica" description="Visitantes por pais.">
          <WorldMap data={data.countryData} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Performance dos Slides" description="Engajamento por slide da apresentacao.">
          <div className="space-y-4">
            <LollipopChart data={slideChartData} height={220} />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Slide mais popular</div>
                <div className="text-lg font-bold text-gray-900">#{data.topSlide !== null ? data.topSlide + 1 : '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Media de visualizacoes</div>
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(data.slidePerformance.reduce((sum, slide) => sum + slide.views, 0) / Math.max(data.slidePerformance.length, 1))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Conteudo Popular" description="Projetos e elementos mais visualizados.">
          <div className="space-y-4">
            <HorizontalBarChart data={topContentChartData} />
            <div className="space-y-2 rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA] p-3">
              {data.contentPerformance.slice(0, 3).map((content, index) => (
                <div key={content.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ['#635BFF', '#10B981', '#F59E0B'][index] }} />
                    <span className="truncate text-sm text-gray-700">{content.title}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{content.views}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Dispositivos" description="Distribuicao por tipo de dispositivo.">
          <div className="space-y-4">
            <StackedShareChart
              data={deviceData.map((device) => ({
                value: device.count,
                label: device.type,
                color: device.color
              }))}
            />

            <div className="grid grid-cols-3 gap-3">
              {deviceData.map((device) => (
                <div key={device.type} className="rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA] p-3 text-center">
                  <device.icon className="mx-auto mb-2 h-4 w-4" style={{ color: device.color }} />
                  <div className="text-sm font-semibold text-gray-900">{device.count}</div>
                  <div className="text-xs text-gray-500">{device.type}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Taxa de Conversao" description="Metricas de engajamento e conversao.">
          <div className="space-y-6">
            <SplitProgressChart data={conversionBreakdown} />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">Taxa de Rejeicao</div>
                <div className="text-lg font-bold text-gray-900">{data.bounceRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Sessoes Completas</div>
                <div className="text-lg font-bold text-gray-900">{data.recentSessions.filter((session) => session.completed).length}</div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Mapa de Atividade" description="Intensidade de visualizacao nos ultimos dias.">
        <ActivityHeatmap
          data={data.dailyMetrics.map((day) => ({
            date: day.date,
            value: day.sessions
          }))}
        />
      </Panel>

      <Panel title="Sessoes Recentes" description="Atividade dos ultimos visitantes.">
        {data.recentSessions.length > 0 ? (
          <div className="space-y-2">
            {data.recentSessions.slice(0, 8).map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    {session.deviceType === 'desktop' && <Monitor className="h-4 w-4 text-gray-600" />}
                    {session.deviceType === 'mobile' && <Smartphone className="h-4 w-4 text-gray-600" />}
                    {session.deviceType === 'tablet' && <Tablet className="h-4 w-4 text-gray-600" />}
                    {!['desktop', 'mobile', 'tablet'].includes(session.deviceType) && <Globe className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(session.startTime).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">{session.country}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{Math.round(session.duration / 60)}m</div>
                    <div className="text-xs text-gray-500">{session.slidesViewed} slides</div>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-xs ${session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {session.completed ? 'Completo' : 'Parcial'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#635BFF] shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-[#111827]">Ainda nao existem sessoes recentes</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Assim que alguem navegar no portfolio, este bloco vai preencher automaticamente com visitas, dispositivos e progresso da apresentacao.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 border-b border-[#E5E7EB] pb-3.5">
        <h4 className="text-[17px] font-semibold tracking-[-0.03em] text-[#111827]">{title}</h4>
        {description && <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function DailyTrafficChart({ data }: { data: Array<{ date: string; sessions: number; visitors: number; pageViews: number }> }) {
  const maxValue = Math.max(...data.map((day) => day.sessions), 1);

  return (
    <div className="flex h-[200px] items-end gap-2 rounded-[20px] bg-[#FAFAFC] px-3 pb-3 pt-5">
      {data.map((day) => {
        const height = (day.sessions / maxValue) * 100;

        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-[145px] w-full items-end rounded-[14px] bg-white p-1.5">
              <div
                className="w-full rounded-[10px] bg-[linear-gradient(180deg,#8A7DFF_0%,#635BFF_100%)] shadow-[0_10px_20px_rgba(99,91,255,0.16)] transition-all"
                style={{ height: `${Math.max(height, 8)}%` }}
                title={`${day.date}: ${day.sessions} sessoes`}
              />
            </div>
            <div className="text-[10px] font-medium text-[#9CA3AF]">
              {new Date(day.date).toLocaleDateString('pt-PT', { day: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
