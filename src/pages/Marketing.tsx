import React, { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, BarChart3, Target, TrendingUp, DollarSign, Users, ShoppingCart, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface MarketingPixels {
  facebook_pixel_id?: string
  google_analytics_id?: string
  google_ads_conversion_id?: string
  google_ads_conversion_label?: string
  tiktok_pixel_id?: string
  taboola_pixel_id?: string
  custom_scripts?: string
}

interface ConversionEvent {
  id: string
  event_type: string
  pixel_type: string
  order_value: number
  customer_phone: string
  created_at: string
}

export const Marketing: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [pixels, setPixels] = useState<MarketingPixels>({})
  const [conversions, setConversions] = useState<ConversionEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPixels, setShowPixels] = useState<{ [key: string]: boolean }>({})
  const [testingPixel, setTestingPixel] = useState<string | null>(null)

  useEffect(() => {
    if (restaurant?.id) {
      fetchMarketingData()
    }
  }, [restaurant])

  const fetchMarketingData = async () => {
    try {
      setLoading(true)
      
      // Fetch marketing pixels
      const { data: pixelData, error: pixelError } = await supabaseClient
        .from('marketing_pixels')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .maybeSingle()

      if (pixelError && pixelError.code !== 'PGRST116') {
        throw pixelError
      }

      if (pixelData) {
        setPixels(pixelData)
      }

      // Fetch recent conversions
      const { data: conversionData, error: conversionError } = await supabaseClient
        .from('conversion_events')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (conversionError && conversionError.code !== 'PGRST116') {
        throw conversionError
      }

      setConversions(conversionData || [])

    } catch (err: any) {
      setError('Erro ao carregar dados de marketing')
      console.error('Error fetching marketing data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePixelChange = (field: keyof MarketingPixels, value: string) => {
    setPixels({
      ...pixels,
      [field]: value
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const { error } = await supabaseClient
        .from('marketing_pixels')
        .upsert({
          restaurant_id: restaurant!.id,
          ...pixels,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess('Pixels salvos com sucesso!')
      
      // Update pixels in the page head
      updatePagePixels()

    } catch (err: any) {
      setError(err.message || 'Erro ao salvar pixels')
    } finally {
      setSaving(false)
    }
  }

  const updatePagePixels = () => {
    // Remove existing pixels
    const existingPixels = document.querySelectorAll('[data-pixel-script]')
    existingPixels.forEach(script => script.remove())

    // Add Facebook Pixel
    if (pixels.facebook_pixel_id) {
      const fbScript = document.createElement('script')
      fbScript.setAttribute('data-pixel-script', 'facebook')
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixels.facebook_pixel_id}');
        fbq('track', 'PageView');
      `
      document.head.appendChild(fbScript)
    }

    // Add Google Analytics
    if (pixels.google_analytics_id) {
      const gaScript = document.createElement('script')
      gaScript.setAttribute('data-pixel-script', 'google-analytics')
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.google_analytics_id}`
      gaScript.async = true
      document.head.appendChild(gaScript)

      const gaConfigScript = document.createElement('script')
      gaConfigScript.setAttribute('data-pixel-script', 'google-analytics-config')
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${pixels.google_analytics_id}');
      `
      document.head.appendChild(gaConfigScript)
    }

    // Add TikTok Pixel
    if (pixels.tiktok_pixel_id) {
      const ttScript = document.createElement('script')
      ttScript.setAttribute('data-pixel-script', 'tiktok')
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixels.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `
      document.head.appendChild(ttScript)
    }

    // Add custom scripts
    if (pixels.custom_scripts) {
      const customScript = document.createElement('script')
      customScript.setAttribute('data-pixel-script', 'custom')
      customScript.innerHTML = pixels.custom_scripts
      document.head.appendChild(customScript)
    }
  }

  const testPixel = async (pixelType: string) => {
    setTestingPixel(pixelType)
    
    try {
      // Send test conversion event
      const testValue = 50.00
      await sendConversionEvent('test_purchase', testValue, 'test_customer')
      
      setSuccess(`Evento de teste enviado para ${pixelType}!`)
    } catch (err: any) {
      setError(`Erro ao testar ${pixelType}: ${err.message}`)
    } finally {
      setTestingPixel(null)
    }
  }

  const sendConversionEvent = async (eventType: string, value: number, customerPhone: string) => {
    // Send to all configured pixels
    const promises = []

    // Facebook Pixel
    if (pixels.facebook_pixel_id && window.fbq) {
      promises.push(
        window.fbq('track', 'Purchase', {
          value: value,
          currency: 'BRL',
          content_type: 'product'
        })
      )
    }

    // Google Analytics
    if (pixels.google_analytics_id && window.gtag) {
      promises.push(
        window.gtag('event', 'purchase', {
          transaction_id: `order_${Date.now()}`,
          value: value,
          currency: 'BRL'
        })
      )
    }

    // Google Ads
    if (pixels.google_ads_conversion_id && pixels.google_ads_conversion_label && window.gtag) {
      promises.push(
        window.gtag('event', 'conversion', {
          send_to: `${pixels.google_ads_conversion_id}/${pixels.google_ads_conversion_label}`,
          value: value,
          currency: 'BRL'
        })
      )
    }

    // TikTok Pixel
    if (pixels.tiktok_pixel_id && window.ttq) {
      promises.push(
        window.ttq.track('CompletePayment', {
          value: value,
          currency: 'BRL'
        })
      )
    }

    // Log conversion event
    await supabaseClient
      .from('conversion_events')
      .insert({
        restaurant_id: restaurant!.id,
        event_type: eventType,
        pixel_type: 'all',
        order_value: value,
        customer_phone: customerPhone
      })

    return Promise.all(promises)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copiado para a área de transferência!')
  }

  const togglePixelVisibility = (pixelType: string) => {
    setShowPixels({
      ...showPixels,
      [pixelType]: !showPixels[pixelType]
    })
  }

  const getTotalConversions = () => {
    return conversions.reduce((sum, conv) => sum + conv.order_value, 0)
  }

  const getConversionsToday = () => {
    const today = new Date().toDateString()
    return conversions.filter(conv => 
      new Date(conv.created_at).toDateString() === today
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing & Pixels</h1>
          <p className="text-gray-600 mt-1">Configure pixels de conversão e monitore suas vendas</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      {/* Estatísticas de Conversão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Vendas Hoje</p>
              <p className="text-3xl font-bold">R$ {getConversionsToday().reduce((sum, conv) => sum + conv.order_value, 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Conversões Hoje</p>
              <p className="text-3xl font-bold">{getConversionsToday().length}</p>
            </div>
            <Target className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total do Mês</p>
              <p className="text-3xl font-bold">R$ {getTotalConversions().toFixed(2)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold">
                R$ {conversions.length > 0 ? (getTotalConversions() / conversions.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Configuração de Pixels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook Pixel */}
        <Card title="Facebook Pixel" subtitle="Meta Ads e Facebook Ads">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Facebook Pixel ID"
                value={pixels.facebook_pixel_id || ''}
                onChange={(e) => handlePixelChange('facebook_pixel_id', e.target.value)}
                placeholder="123456789012345"
                type={showPixels.facebook ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => togglePixelVisibility('facebook')}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPixels.facebook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testPixel('Facebook')}
                loading={testingPixel === 'Facebook'}
                disabled={!pixels.facebook_pixel_id}
              >
                Testar Pixel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(pixels.facebook_pixel_id || '')}
                disabled={!pixels.facebook_pixel_id}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Como encontrar:</strong> Acesse o Gerenciador de Eventos do Facebook → Fontes de Dados → Seu Pixel
              </p>
            </div>
          </div>
        </Card>

        {/* Google Analytics */}
        <Card title="Google Analytics 4" subtitle="Acompanhamento de conversões GA4">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Google Analytics ID"
                value={pixels.google_analytics_id || ''}
                onChange={(e) => handlePixelChange('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                type={showPixels.google ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => togglePixelVisibility('google')}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPixels.google ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testPixel('Google Analytics')}
                loading={testingPixel === 'Google Analytics'}
                disabled={!pixels.google_analytics_id}
              >
                Testar GA4
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(pixels.google_analytics_id || '')}
                disabled={!pixels.google_analytics_id}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>Como encontrar:</strong> Google Analytics → Administrador → Informações da propriedade → ID de acompanhamento
              </p>
            </div>
          </div>
        </Card>

        {/* Google Ads */}
        <Card title="Google Ads" subtitle="Acompanhamento de conversões do Google Ads">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Conversion ID"
                value={pixels.google_ads_conversion_id || ''}
                onChange={(e) => handlePixelChange('google_ads_conversion_id', e.target.value)}
                placeholder="123456789"
                type={showPixels.googleAds ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => togglePixelVisibility('googleAds')}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPixels.googleAds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Conversion Label"
                value={pixels.google_ads_conversion_label || ''}
                onChange={(e) => handlePixelChange('google_ads_conversion_label', e.target.value)}
                placeholder="AbCdEfGhIjKlMnOp"
                type={showPixels.googleAdsLabel ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => togglePixelVisibility('googleAdsLabel')}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPixels.googleAdsLabel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => testPixel('Google Ads')}
              loading={testingPixel === 'Google Ads'}
              disabled={!pixels.google_ads_conversion_id || !pixels.google_ads_conversion_label}
            >
              Testar Conversão
            </Button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>Como encontrar:</strong> Google Ads → Ferramentas → Conversões → Sua ação de conversão
              </p>
            </div>
          </div>
        </Card>

        {/* TikTok Pixel */}
        <Card title="TikTok Pixel" subtitle="TikTok Ads Manager">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="TikTok Pixel ID"
                value={pixels.tiktok_pixel_id || ''}
                onChange={(e) => handlePixelChange('tiktok_pixel_id', e.target.value)}
                placeholder="C4XXXXXXXXXXXXXXXXXXXXXXXX"
                type={showPixels.tiktok ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => togglePixelVisibility('tiktok')}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPixels.tiktok ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testPixel('TikTok')}
                loading={testingPixel === 'TikTok'}
                disabled={!pixels.tiktok_pixel_id}
              >
                Testar Pixel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(pixels.tiktok_pixel_id || '')}
                disabled={!pixels.tiktok_pixel_id}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                <strong>Como encontrar:</strong> TikTok Ads Manager → Ferramentas → Eventos → Gerenciar → Pixel
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scripts Personalizados */}
      <Card title="Scripts Personalizados" subtitle="Adicione códigos de tracking personalizados">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código JavaScript Personalizado
            </label>
            <textarea
              value={pixels.custom_scripts || ''}
              onChange={(e) => handlePixelChange('custom_scripts', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              placeholder={`// Exemplo: Taboola, Outbrain, etc.
!function (e, f, u, i) {
  if (!document.getElementById(i)){
    e.async = 1;
    e.src = u;
    e.id = i;
    f.parentNode.insertBefore(e, f);
  }
}(document.createElement('script'),
document.getElementsByTagName('script')[0],
'//cdn.taboola.com/libtrc/your-account/loader.js',
'tb_loader_script');`}
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-orange-900">Atenção</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Apenas adicione scripts de fontes confiáveis. Códigos maliciosos podem comprometer a segurança do seu site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Conversões Recentes */}
      <Card title="Conversões Recentes" subtitle="Últimas vendas rastreadas pelos pixels">
        {conversions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Evento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Pixel</th>
                </tr>
              </thead>
              <tbody>
                {conversions.slice(0, 10).map((conversion) => (
                  <tr key={conversion.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(conversion.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {conversion.event_type === 'test_purchase' ? 'Teste' : 'Compra'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      R$ {conversion.order_value.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {conversion.customer_phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {conversion.pixel_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversão ainda</h3>
            <p className="text-gray-600">
              Configure seus pixels e comece a rastrear suas vendas automaticamente
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}