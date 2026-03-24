import * as Astronomy from "https://esm.sh/astronomy-engine@2.1.19";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json();
    const { birth_date, birth_time, lat, lng, timezone } = payload;

    if (!birth_date || lat === undefined || lng === undefined) {
      throw new Error("Missing required fields: birth_date, lat, or lng");
    }

    const [year, month, day] = birth_date.split('-').map(Number);
    const [hour, min] = (birth_time || "12:00").split(':').map(Number);
    
    // ვქმნით დროს UTC-ში (ვითვალისწინებთ იუზერის ტაიმზონას)
    const date = new Date(Date.UTC(year, month - 1, day, hour - (Number(timezone) || 4), min));
    const astroTime = new Astronomy.AstroTime(date);

    // 🔥 1. გამოვთვალოთ Local Sidereal Time (LST) და RAMC
    const gmst = Astronomy.SiderealTime(astroTime); // საათებში
    const lstHours = gmst + (Number(lng) / 15);
    const lst = (lstHours % 24 + 24) % 24;
    const ramc = lst * 15; // გრადუსებში

   // 🔥 2. ეკლიპტიკის დახრილობა (Obliquity)
    // ვითვლით პირდაპირ J2000 ეპოქიდან გასული საუკუნეების მიხედვით (ყველაზე ზუსტია)
    const T = astroTime.ut / 36525.0;
    const eps = 23.4392911 - 0.013004167 * T;

    const rad = (d: number) => d * Math.PI / 180;
    const deg = (r: number) => r * 180 / Math.PI;
    const norm = (d: number) => (d % 360 + 360) % 360;

    // 🔥 3. ასცენდენტის (ASC) და Midheaven (MC) ზუსტი ასტრონომიული გამოთვლა
    const ramcRad = rad(ramc);
    const epsRad = rad(eps);
    const latRad = rad(Number(lat));

    // ASC 
    const yAsc = Math.cos(ramcRad);
    const xAsc = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    const ascDeg = norm(deg(Math.atan2(yAsc, xAsc)));

    // MC 
    const yMc = Math.sin(ramcRad);
    const xMc = Math.cos(ramcRad) * Math.cos(epsRad);
    const mcDeg = norm(deg(Math.atan2(yMc, xMc)));

    // 🔥 4. სახლების კუსპიდების გამოთვლა (Porphyry სისტემა)
    const icDeg = norm(mcDeg + 180);
    const descDeg = norm(ascDeg + 180);
    const angleDiff = (a: number, b: number) => (b - a + 360) % 360;

    const q1 = angleDiff(ascDeg, icDeg) / 3;
    const h1 = ascDeg;
    const h2 = norm(h1 + q1);
    const h3 = norm(h2 + q1);

    const q2 = angleDiff(icDeg, descDeg) / 3;
    const h4 = icDeg;
    const h5 = norm(h4 + q2);
    const h6 = norm(h5 + q2);

    // 12-ვე სახლის საწყისი გრადუსი
    const cusps = [
      h1, h2, h3, h4, h5, h6,
      norm(h1 + 180), norm(h2 + 180), norm(h3 + 180),
      norm(h4 + 180), norm(h5 + 180), norm(h6 + 180)
    ];

    // 🔥 5. პლანეტების მდებარეობის და მათი შესაბამისი სახლების პოვნა
    const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    
    const planetResults = bodies.map(body => {
      // @ts-ignore
      const geoVec = Astronomy.GeoVector(body, astroTime, true);
      // @ts-ignore
      const ecliptic = Astronomy.Ecliptic(geoVec);
      
      let lon = norm(ecliptic.elon);
      let signIndex = Math.floor(lon / 30);

      // ვპოულობთ რომელ სახლში ხვდება პლანეტა
      let planetHouse = 12;
      for (let i = 0; i < 11; i++) {
        const cStart = cusps[i];
        const cEnd = cusps[i+1];
        if (cStart < cEnd) {
            if (lon >= cStart && lon < cEnd) { planetHouse = i + 1; break; }
        } else {
            if (lon >= cStart || lon < cEnd) { planetHouse = i + 1; break; }
        }
      }
      if (cusps[11] < cusps[0]) {
          if (lon >= cusps[11] && lon < cusps[0]) planetHouse = 12;
      } else {
          if (lon >= cusps[11] || lon < cusps[0]) planetHouse = 12;
      }

      return {
        id: body.toLowerCase(),
        degree: Math.floor(lon % 30),
        signIndex: signIndex,
        house: planetHouse
      };
    });

    return new Response(JSON.stringify({ 
      success: true, 
      planets: planetResults,
      ascendant: {
        signIndex: Math.floor(ascDeg / 30),
        degree: Math.floor(ascDeg % 30)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
})