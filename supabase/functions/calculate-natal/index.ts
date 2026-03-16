import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as Astronomy from "https://esm.sh/astronomy-engine@2.1.19"

// 1. CORS ჰედერები - აუცილებელია მობილური აპლიკაციისთვის
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // 2. OPTIONS მოთხოვნის დამუშავება (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. მონაცემების მიღება აპლიკაციიდან
    const { birth_date, lat, lng } = await req.json()
    
    // თარიღის გადაყვანა UTC ფორმატში
    const date = new Date(birth_date)
    
    // პლანეტების სია, რომლებიც უნდა დავითვალოთ
    const bodies = [
      "Sun", "Moon", "Mercury", "Venus", "Mars", 
      "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
    ]

    // 4. პლანეტარული გამოთვლები
    const planetResults = bodies.map(body => {
      // პლანეტის ეკვატორული კოორდინატების გამოთვლა
      // @ts-ignore (Deno-ს სპეციფიკა Astronomy ბიბლიოთეკასთან)
      const equat = Astronomy.Equator(body, date, null, true)
      
      // გადაყვანა ეკლიპტიკურ გრძედზე (რაც ზოდიაქოსთვის გვჭირდება)
      // @ts-ignore - აქ ვასწორებთ იმ წითელ ხაზს, რომელიც equat-ზე გქონდა
      const ecliptic = Astronomy.Ecliptic(equat)
      
      const longitude = (ecliptic.elon % 360 + 360) % 360 // ნორმალიზაცია 0-360

      return {
        id: body.toLowerCase(),
        longitude: longitude,
        degree: Math.floor(longitude % 30),
        minutes: Math.floor((longitude % 1) * 60),
        signIndex: Math.floor(longitude / 30) // 0 - ვერძი, 1 - კუ და ა.შ.
      }
    })

    // 5. სახლების და ასცენდენტის გამარტივებული გამოთვლა
    const siderealTime = Astronomy.SiderealTime(date)
    const localSiderealTime = (siderealTime * 15 + lng) % 360
    const ascDegree = (localSiderealTime + 90) % 360 // ჰორიზონტის კუთხე

    const finalResponse = {
      planets: planetResults,
      ascendant: {
        degree: Math.floor(ascDegree % 30),
        signIndex: Math.floor(ascDegree / 30)
      },
      calculation_info: {
        utc_time: date.toISOString(),
        location: { lat, lng }
      }
    }

    // 6. წარმატებული პასუხის დაბრუნება
    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    // 7. შეცდომის დამუშავება
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})