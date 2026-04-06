export interface ItineraryStop {
  id: string
  name: string
  coordinates: [number, number]
  description: string
  highlights: string[]
  driveFromPrev?: { km: number; minutes: number }
  recommendedTime: string
  overnight?: boolean
  day: number
  thumbnail: string
}

export interface Itinerary {
  id: string
  name: string
  tagline: string
  description: string
  days: number
  totalKm: number
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  seasons: string[]
  requiresFourWD: boolean
  stops: ItineraryStop[]
  coverImage: string
  color: string
  icon: string
}

export const itineraries: Itinerary[] = [
  {
    "id": "ring-road",
    "name": "The Ring Road",
    "tagline": "Iceland's legendary coastal circuit",
    "description": "Drive the full 1,332km Route 1 that circles Iceland, taking in glaciers, volcanoes, waterfalls, black sand beaches, whale watching, and the midnight sun. The classic Icelandic adventure — no other route shows you more.",
    "days": 8,
    "totalKm": 1350,
    "difficulty": "Moderate",
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "requiresFourWD": false,
    "stops": [
      {
        "id": "reykjavik-start",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Iceland's vibrant capital where your journey begins. Explore the colourful harbour, the futuristic Harpa concert hall, and climb Hallgrímskirkja for sweeping views before hitting the open road.",
        "highlights": [
          "Hallgrímskirkja church tower",
          "Old Harbour & Reinholt restaurant",
          "Tjörnin pond at sunset",
          "Stock up at Bónus for road snacks"
        ],
        "recommendedTime": "3–4 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "thingvellir",
        "name": "Þingvellir National Park",
        "coordinates": [
          -21.13,
          64.26
        ],
        "description": "Walk the rift valley between the North American and Eurasian tectonic plates at Iceland's most historically significant site — home of the world's oldest parliament, founded in 930 AD.",
        "highlights": [
          "Walk the Almannagjá rift canyon",
          "Snorkelling/diving in Silfra fissure",
          "Öxará river & Law Rock",
          "UNESCO World Heritage site"
        ],
        "driveFromPrev": {
          "km": 50,
          "minutes": 45
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3224935/pexels-photo-3224935.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "geysir",
        "name": "Geysir Geothermal Area",
        "coordinates": [
          -20.3,
          64.31
        ],
        "description": "Watch Strokkur erupt every 5–8 minutes, sending boiling water 20–30 metres into the air. The original Geysir geyser — which gave all geysers their name — slumbers nearby in a sulphurous steam field.",
        "highlights": [
          "Strokkur erupts every 5–8 minutes",
          "Great Geysir hot spring pool",
          "Steam vents & bubbling mud pots",
          "Gift shop & café at Geysir Center"
        ],
        "driveFromPrev": {
          "km": 62,
          "minutes": 55
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "gullfoss",
        "name": "Gullfoss",
        "coordinates": [
          -20.12,
          64.32
        ],
        "description": "The Golden Falls cascade in two dramatic tiers into a rugged canyon, throwing up rainbows of mist visible for kilometres. On clear days the spray catches the light in a way that makes the whole gorge glow gold — hence the name.",
        "highlights": [
          "Two-tiered 32m waterfall",
          "Rainbow mist on sunny mornings",
          "Upper walking path along canyon rim",
          "Jónína's café with panoramic windows"
        ],
        "driveFromPrev": {
          "km": 9,
          "minutes": 10
        },
        "recommendedTime": "1–2 hours",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3894874/pexels-photo-3894874.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "seljalandsfoss-rr",
        "name": "Seljalandsfoss",
        "coordinates": [
          -19.99,
          63.61
        ],
        "description": "One of Iceland's most magical waterfalls — a path cut into the cliff lets you walk completely behind the 60m curtain of water for a soaking but unforgettable experience. At midnight sun hours the mist turns to liquid gold.",
        "highlights": [
          "Walk fully behind the waterfall",
          "Gljúfrabúi hidden canyon 500m away",
          "Golden-hour light through the mist",
          "Wear waterproof gear (you will get wet)"
        ],
        "driveFromPrev": {
          "km": 111,
          "minutes": 75
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/19267246/pexels-photo-19267246.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "skogafoss-rr",
        "name": "Skógafoss",
        "coordinates": [
          -19.51,
          63.53
        ],
        "description": "A thundering 60m waterfall with a perfect 25m width. Climb the 527-step staircase to the right for sweeping views over the coastal plain, then walk the lower trail for close-up rainbow encounters in the mist.",
        "highlights": [
          "Rainbow forms in the mist daily",
          "527-step staircase for panoramic views",
          "Skógar Folk Museum nearby",
          "First stage of the Fimmvörðuháls trail"
        ],
        "driveFromPrev": {
          "km": 30,
          "minutes": 25
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/29018995/pexels-photo-29018995.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reynisfjara-rr",
        "name": "Reynisfjara Black Sand Beach",
        "coordinates": [
          -19.04,
          63.4
        ],
        "description": "One of the world's most dramatic beaches — jet-black volcanic sand, towering basalt columns forming perfect hexagonal caves, and the iconic Reynisdrangar sea stacks rising from the surf. Sneaker waves make this beautiful but dangerous.",
        "highlights": [
          "Hálsanef basalt column caves",
          "Reynisdrangar sea stacks",
          "Powerful sneaker waves — stay back 30m",
          "Puffins nest in cliffs (April–August)"
        ],
        "driveFromPrev": {
          "km": 33,
          "minutes": 28
        },
        "recommendedTime": "1–2 hours",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "dyrhol",
        "name": "Dyrhólaey Cape",
        "coordinates": [
          -19.13,
          63.4
        ],
        "description": "A dramatic headland jutting into the Atlantic with a natural sea arch large enough for a boat to pass through. Puffins nest in the cliffs every summer, and the views across the black sand coast toward Vík are spectacular.",
        "highlights": [
          "Natural sea arch rock formation",
          "Puffin nesting cliffs (April–August)",
          "360° panorama from the lighthouse",
          "Best sunrise spot on the South Coast"
        ],
        "driveFromPrev": {
          "km": 12,
          "minutes": 12
        },
        "recommendedTime": "45 minutes",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3894876/pexels-photo-3894876.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "jokulsarlon-rr",
        "name": "Jökulsárlón Glacier Lagoon",
        "coordinates": [
          -16.18,
          64.05
        ],
        "description": "An ethereal lagoon filled with floating blue icebergs calved from Europe's largest glacier. Seals rest on the ice, and the silence is broken only by groaning ice and the distant rumble of the glacier. A boat tour gets you right among the bergs.",
        "highlights": [
          "Floating blue & white icebergs",
          "Seals lounging on the ice",
          "Amphibian boat tour (seasonal)",
          "Spectacular at sunrise & sunset"
        ],
        "driveFromPrev": {
          "km": 205,
          "minutes": 140
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/1891882/pexels-photo-1891882.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "diamond-beach-rr",
        "name": "Diamond Beach",
        "coordinates": [
          -16.17,
          64.04
        ],
        "description": "Just across the Ring Road from Jökulsárlón, ice chunks washed from the lagoon litter the black volcanic sand like scattered diamonds. The contrast of crystal-clear ice against jet-black sand is among Iceland's most photogenic sights.",
        "highlights": [
          "Ice chunks on jet-black sand",
          "Best photography at golden hour",
          "Seals occasionally rest on the bergs",
          "1 minute walk from Jökulsárlón"
        ],
        "driveFromPrev": {
          "km": 1,
          "minutes": 2
        },
        "recommendedTime": "45 minutes",
        "overnight": true,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3408745/pexels-photo-3408745.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "hofn",
        "name": "Höfn",
        "coordinates": [
          -15.21,
          64.25
        ],
        "description": "A charming fishing town backed by the sweeping Vatnajökull glacier, best known as Iceland's langoustine capital. The harbour offers fresh seafood and the surrounding landscape of glacial tongues descending to flat farmland is breathtaking.",
        "highlights": [
          "Fresh langoustine at Pakkhús restaurant",
          "Vatnajökull glacier views from the pier",
          "Glacier Jeep tours available",
          "Overnight: best base for SE Iceland"
        ],
        "driveFromPrev": {
          "km": 78,
          "minutes": 60
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/4825701/pexels-photo-4825701.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "east-fjords-coast",
        "name": "East Fjords Coastal Drive",
        "coordinates": [
          -14.28,
          64.8
        ],
        "description": "A slow, winding drive through Iceland's most remote and tranquil region. The East Fjords twist and turn past colourful fishing villages perched on narrow strips of land between steep mountains and glassy fjords. Stop at Djúpivogur for the Eggs sculpture.",
        "highlights": [
          "Djúpivogur's Eggin í Gleðivík sculpture",
          "Stöðvarfjörður stone collection (Petra's)",
          "Sleepy fishing villages & perfect silence",
          "Occasional reindeer sightings"
        ],
        "driveFromPrev": {
          "km": 102,
          "minutes": 80
        },
        "recommendedTime": "En route",
        "overnight": false,
        "day": 5,
        "thumbnail": "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "egilsstadir",
        "name": "Egilsstaðir",
        "coordinates": [
          -14.4,
          65.27
        ],
        "description": "The service hub of East Iceland sits on the banks of the long, sinuous Lagarfljót lake — whose resident 'lake monster' has been reported since 1345. A good base for day hikes to the spectacular Hengifoss waterfall.",
        "highlights": [
          "Hengifoss waterfall hike (2.5km each way)",
          "Lagarfljót lake monster legend",
          "East Iceland Heritage Museum",
          "Overnight base for the east region"
        ],
        "driveFromPrev": {
          "km": 140,
          "minutes": 110
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 5,
        "thumbnail": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "dettifoss",
        "name": "Dettifoss",
        "coordinates": [
          -16.38,
          65.81
        ],
        "description": "Europe's most powerful waterfall in terms of discharge — 500 cubic metres of glacial water per second plunging 44m into a vast canyon. The ground shakes underfoot and the roar can be heard kilometres away. Raw, primal, overwhelming.",
        "highlights": [
          "Europe's most powerful waterfall",
          "Selfoss waterfall 1km upstream",
          "Lunar landscapes along the canyon rim",
          "Featured in Prometheus (2012) opening"
        ],
        "driveFromPrev": {
          "km": 150,
          "minutes": 120
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 6,
        "thumbnail": "https://images.pexels.com/photos/1906438/pexels-photo-1906438.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "myvatn",
        "name": "Lake Mývatn",
        "coordinates": [
          -16.99,
          65.6
        ],
        "description": "A vast, shallow lake surrounded by one of Iceland's most concentrated collections of volcanic and geothermal wonders — pseudo craters, lava pillars, sulphur vents, and a natural bathing lagoon. Midges are thick in summer (June–August) but harmless.",
        "highlights": [
          "Dimmuborgir lava maze formations",
          "Námafjall sulphur mud pots & steam vents",
          "Mývatn Nature Baths (like Blue Lagoon, fewer crowds)",
          "Krafla caldera & lava field (20 min drive)"
        ],
        "driveFromPrev": {
          "km": 65,
          "minutes": 50
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 6,
        "thumbnail": "https://images.pexels.com/photos/3224934/pexels-photo-3224934.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "godafoss",
        "name": "Goðafoss — Waterfall of the Gods",
        "coordinates": [
          -17.55,
          65.68
        ],
        "description": "In the year 1000 AD, Iceland's lawspeaker Þorgeir threw his Norse idols into this waterfall after deciding that Iceland would convert to Christianity, giving it the name 'Waterfall of the Gods'. The horseshoe-shaped cascade is one of Iceland's most beautiful.",
        "highlights": [
          "Horseshoe-shaped waterfall",
          "Rich Norse conversion history",
          "Walk both banks for different perspectives",
          "10 minutes off the Ring Road"
        ],
        "driveFromPrev": {
          "km": 53,
          "minutes": 45
        },
        "recommendedTime": "45 minutes",
        "overnight": false,
        "day": 7,
        "thumbnail": "https://images.pexels.com/photos/3075992/pexels-photo-3075992.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "akureyri",
        "name": "Akureyri",
        "coordinates": [
          -18.1,
          65.68
        ],
        "description": "Iceland's northern capital and the country's most important city outside Reykjavík. Surrounded by mountains at the head of Eyjafjörður, Iceland's longest fjord, Akureyri punches well above its size with a lively restaurant scene, botanical garden, and ski resort.",
        "highlights": [
          "Akureyri Botanical Garden (northernmost in world)",
          "Whale watching from the harbour",
          "Hlíðarfjall ski resort (winter)",
          "Lively main street café culture"
        ],
        "driveFromPrev": {
          "km": 52,
          "minutes": 40
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 7,
        "thumbnail": "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "vatnsnes",
        "name": "Vatnsnes Seal Colony",
        "coordinates": [
          -20.47,
          65.42
        ],
        "description": "A finger-shaped peninsula on the northwest coast is home to Iceland's largest colony of harbour seals. The famous Hvítserkur basalt stack — resembling a drinking rhinoceros — rises 15m from the sea at the peninsula's tip.",
        "highlights": [
          "Hvítserkur basalt sea stack",
          "Hundreds of harbour seals on the shore",
          "Lonely, atmospheric coastal road",
          "Icelandic horse farms en route"
        ],
        "driveFromPrev": {
          "km": 130,
          "minutes": 100
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 8,
        "thumbnail": "https://images.pexels.com/photos/9974260/pexels-photo-9974260.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reykjavik-end",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "You made it! You've completed one of the world's great road trips — the full Ring Road around Iceland. Celebrate with a soak in a hot pot, a seafood dinner, and a toast to the land of fire and ice.",
        "highlights": [
          "Celebrate completing the Ring Road",
          "Blue Lagoon en route (book ahead)",
          "Laugardalslaug geothermal pool",
          "Share your best photos over dinner"
        ],
        "driveFromPrev": {
          "km": 190,
          "minutes": 140
        },
        "recommendedTime": "Journey's end",
        "overnight": false,
        "day": 8,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/3894874/pexels-photo-3894874.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#f5a623",
    "icon": "🔄"
  },
  {
    "id": "south",
    "name": "South Iceland",
    "tagline": "Waterfalls, glaciers & black sand",
    "description": "The most accessible and dramatic route in Iceland — a 3-day sweep along the South Coast packing in walk-behind waterfalls, black sand beaches, a glacier lagoon, and a canyon that's been in music videos.",
    "days": 3,
    "totalKm": 450,
    "difficulty": "Easy",
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "requiresFourWD": false,
    "stops": [
      {
        "id": "reykjavik-s",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Start early to make the most of the South Coast. Grab coffee at Reykjavík Roasters and hit the Ring Road east as the morning light turns golden.",
        "highlights": [
          "Early morning start recommended",
          "Fill up at N1 petrol station",
          "Pack a rain jacket — always"
        ],
        "recommendedTime": "Morning departure",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "seljalandsfoss-s",
        "name": "Seljalandsfoss",
        "coordinates": [
          -19.99,
          63.61
        ],
        "description": "The crown jewel of the South Coast — a 60m waterfall you can walk behind. The path through the cliff takes you inside the curtain of water for a soaking but unforgettable experience.",
        "highlights": [
          "Walk fully behind the waterfall",
          "Gljúfrabúi canyon 500m to the north",
          "Best in golden morning light",
          "Waterproof gear essential"
        ],
        "driveFromPrev": {
          "km": 121,
          "minutes": 90
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/19267246/pexels-photo-19267246.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "gljufrabui-s",
        "name": "Gljúfrabúi Hidden Waterfall",
        "coordinates": [
          -19.986,
          63.619
        ],
        "description": "Iceland's best-kept secret, hidden inside a narrow gorge just 500m from Seljalandsfoss yet seen by only a fraction of visitors. Squeeze through a crack in the cliff and wade a shallow stream to find a 40m cascade thundering into a mossy chamber.",
        "highlights": [
          "Squeeze through the cliff crack",
          "Wade through shallow stream",
          "40m waterfall inside a cave",
          "Completely hidden from the road"
        ],
        "driveFromPrev": {
          "km": 1,
          "minutes": 3
        },
        "recommendedTime": "30–45 minutes",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/18273215/pexels-photo-18273215.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "skogafoss-s",
        "name": "Skógafoss",
        "coordinates": [
          -19.51,
          63.53
        ],
        "description": "One of Iceland's largest and most beautiful waterfalls, 60m high and 25m wide. A rainbow almost always forms in the mist. Climb the 527 steps to the top for panoramic views over the South Coast.",
        "highlights": [
          "Rainbow in the mist almost guaranteed",
          "527-step staircase to the top",
          "Skógar Folk Museum at the base",
          "Trailhead for Fimmvörðuháls trek"
        ],
        "driveFromPrev": {
          "km": 30,
          "minutes": 25
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/29018995/pexels-photo-29018995.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reynisfjara-s",
        "name": "Reynisfjara & Vík",
        "coordinates": [
          -19.04,
          63.4
        ],
        "description": "End the day at the world-famous black sand beach beneath the Reynisdrangar sea stacks and hexagonal basalt columns. Stay overnight in Vík — Iceland's southernmost village — for local charm and easy access to Dyrhólaey at sunrise.",
        "highlights": [
          "Hálsanef basalt column caves",
          "Reynisdrangar sea stacks from the shore",
          "Warning: sneaker waves — stay 30m back",
          "Stay overnight in Vík village"
        ],
        "driveFromPrev": {
          "km": 33,
          "minutes": 28
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "dyrhol-s",
        "name": "Dyrhólaey Cape",
        "coordinates": [
          -19.13,
          63.4
        ],
        "description": "Catch sunrise at this dramatic headland with a natural sea arch. Puffins nest in the cliffs from April to August, and the view sweeping east along the black sand coast toward Vík is one of Iceland's best.",
        "highlights": [
          "Natural sea arch rock formation",
          "Puffin colony (April–August)",
          "Best sunrise viewpoint on south coast",
          "Lighthouse at the top of the headland"
        ],
        "driveFromPrev": {
          "km": 12,
          "minutes": 12
        },
        "recommendedTime": "1 hour",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/3894876/pexels-photo-3894876.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "fjadra",
        "name": "Fjaðrárgljúfur Canyon",
        "coordinates": [
          -18.17,
          63.77
        ],
        "description": "A dramatic canyon up to 100m deep carved by glacial meltwater over thousands of years. Winding boardwalks follow the rim high above the turquoise river. Made famous internationally by Justin Bieber and Kings of Leon music videos.",
        "highlights": [
          "1–2km canyon rim walk with boardwalks",
          "Turquoise river far below",
          "Justin Bieber/Kings of Leon film location",
          "Eerie, otherworldly silence"
        ],
        "driveFromPrev": {
          "km": 40,
          "minutes": 35
        },
        "recommendedTime": "1–1.5 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "jokulsarlon-s",
        "name": "Jökulsárlón Glacier Lagoon",
        "coordinates": [
          -16.18,
          64.05
        ],
        "description": "Drift among floating blue icebergs calved from the Breiðamerkurjökull outlet glacier. Seals play in the lagoon while the air hums with the creaking of ancient ice. An amphibian boat tour gets you right among the bergs.",
        "highlights": [
          "Floating icebergs in electric blue",
          "Seals resting on the bergs",
          "Amphibian boat tour option",
          "Diamond Beach 1 min across the road"
        ],
        "driveFromPrev": {
          "km": 165,
          "minutes": 115
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/1891882/pexels-photo-1891882.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "diamond-s",
        "name": "Diamond Beach",
        "coordinates": [
          -16.17,
          64.04
        ],
        "description": "Icebergs washed from Jökulsárlón scatter across jet-black volcanic sand like scattered diamonds. The contrast is one of Iceland's most striking — and the photography opportunities are extraordinary at any time of day.",
        "highlights": [
          "Ice chunks on black sand",
          "Best light at golden hour or sunrise",
          "Seals occasionally join the scene",
          "Just 1 minute from Jökulsárlón"
        ],
        "driveFromPrev": {
          "km": 1,
          "minutes": 2
        },
        "recommendedTime": "45 minutes",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/3408745/pexels-photo-3408745.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "skaftafell",
        "name": "Skaftafell — Svartifoss Hike",
        "coordinates": [
          -16.97,
          64.02
        ],
        "description": "Hike through Vatnajökull National Park to Svartifoss — the 'Black Waterfall' — framed by dramatic dark basalt columns that inspired the design of Reykjavík's Hallgrímskirkja. The trail continues to glacier viewpoints above.",
        "highlights": [
          "Svartifoss hexagonal basalt waterfall",
          "Glacier tongue viewpoint above",
          "1.5hr easy return hike",
          "Inspiration for Hallgrímskirkja church design"
        ],
        "driveFromPrev": {
          "km": 20,
          "minutes": 20
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "gullfoss-s",
        "name": "Gullfoss",
        "coordinates": [
          -20.12,
          64.32
        ],
        "description": "The Golden Falls — Iceland's most famous waterfall — as a grand finale before returning to Reykjavík. The two-tiered cascade plunges 32m into a canyon shrouded in rainbow mist.",
        "highlights": [
          "Two-tiered waterfall into deep canyon",
          "Rainbow mist on sunny days",
          "Short walking paths both above and below",
          "Café with good soup & coffee"
        ],
        "driveFromPrev": {
          "km": 280,
          "minutes": 190
        },
        "recommendedTime": "1 hour",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3894874/pexels-photo-3894874.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reykjavik-s-end",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Return to the capital via Þingvellir National Park for a final stop at the UNESCO rift valley, then into Reykjavík for a well-earned dinner celebrating the South Coast.",
        "highlights": [
          "Þingvellir National Park optional stop",
          "Blue Lagoon for a soak (book ahead)",
          "Celebrate at a harbour restaurant",
          "Laugavegur main street shopping"
        ],
        "driveFromPrev": {
          "km": 110,
          "minutes": 80
        },
        "recommendedTime": "Journey's end",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#3b82f6",
    "icon": "🌊"
  },
  {
    "id": "north",
    "name": "North Iceland",
    "tagline": "Whale watching, geysers & waterfalls",
    "description": "Fly to Akureyri and discover a region as dramatic as the south but with a fraction of the crowds. Europe's most powerful waterfall, whale watching in Húsavík, volcanic Lake Mývatn, and the magnificent Ásbyrgi canyon await.",
    "days": 4,
    "totalKm": 700,
    "difficulty": "Moderate",
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "requiresFourWD": false,
    "stops": [
      {
        "id": "akureyri-n",
        "name": "Akureyri",
        "coordinates": [
          -18.1,
          65.68
        ],
        "description": "Iceland's northern capital is the gateway to the north. Fly here direct (45 min from Reykjavík) or make the scenic 5-hour drive. Explore the lively main street, botanical garden, and settle in for the best of Iceland's north.",
        "highlights": [
          "Akureyri Botanical Garden",
          "Lively café & restaurant scene",
          "Whale watching from the harbour",
          "Fly here in 45 min from Reykjavík (Air Iceland)"
        ],
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "godafoss-n",
        "name": "Goðafoss — Waterfall of the Gods",
        "coordinates": [
          -17.55,
          65.68
        ],
        "description": "Just 50km east of Akureyri, this horseshoe-shaped waterfall carries the story of Iceland's conversion to Christianity in 1000 AD. The lawspeaker Þorgeir threw his Norse idols into the falls — and the rest is history.",
        "highlights": [
          "Horseshoe waterfall shape",
          "Norse history from year 1000 AD",
          "Walk both banks for full view",
          "Quick detour just off the Ring Road"
        ],
        "driveFromPrev": {
          "km": 50,
          "minutes": 45
        },
        "recommendedTime": "45 minutes",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3075992/pexels-photo-3075992.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "dettifoss-n",
        "name": "Dettifoss",
        "coordinates": [
          -16.38,
          65.81
        ],
        "description": "Europe's most powerful waterfall — the ground vibrates, the roar is deafening, and 500 cubic metres of glacial water crash 44m into a cathedral-sized canyon every second. An awe-inspiring, humbling experience.",
        "highlights": [
          "500 cubic metres/second discharge",
          "Ground shakes 200m from the falls",
          "Selfoss 1km upstream (smaller, ethereal)",
          "Lunar black lava landscape surroundings"
        ],
        "driveFromPrev": {
          "km": 165,
          "minutes": 135
        },
        "recommendedTime": "1–2 hours",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/1906438/pexels-photo-1906438.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "asbyrgi",
        "name": "Ásbyrgi Canyon",
        "coordinates": [
          -16.51,
          66.02
        ],
        "description": "A vast horseshoe-shaped canyon 3.5km long and 1km wide, its 100m walls carpeted in birch forest and wildflowers. Norse mythology says it was formed by Sleipnir, Odin's eight-legged horse. Tranquil walking trails wind through the floor.",
        "highlights": [
          "Horseshoe canyon formed by ancient flood",
          "Lush birch forest inside the canyon",
          "Eyjan island rock feature at the centre",
          "Quiet woodland trails & birdlife"
        ],
        "driveFromPrev": {
          "km": 45,
          "minutes": 40
        },
        "recommendedTime": "1.5–2 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/3224934/pexels-photo-3224934.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "husavik",
        "name": "Húsavík",
        "coordinates": [
          -17.34,
          66.04
        ],
        "description": "The whale watching capital of Europe — a charming harbour town where dozens of humpback and minke whales are spotted on every trip. The colourful wooden church overlooking the harbour is one of Iceland's most photographed.",
        "highlights": [
          "Whale watching (humpback, minke, blue)",
          "Húsavík Whale Museum",
          "Colourful wooden church above the harbour",
          "The film Eurovision Song Contest was set here"
        ],
        "driveFromPrev": {
          "km": 65,
          "minutes": 55
        },
        "recommendedTime": "2–3 hours",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/9974260/pexels-photo-9974260.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "myvatn-n",
        "name": "Lake Mývatn",
        "coordinates": [
          -16.99,
          65.6
        ],
        "description": "A shallow volcanic lake surrounded by an almost absurd concentration of geothermal and volcanic wonders. Explore the surreal Dimmuborgir lava maze, boiling mud pots at Námafjall, and soak in the Mývatn Nature Baths — Iceland's best-kept bathing secret.",
        "highlights": [
          "Dimmuborgir lava maze & cave formations",
          "Námafjall sulphur mud pots & steam vents",
          "Mývatn Nature Baths (quieter than Blue Lagoon)",
          "Krafla caldera & lava field 20 min drive"
        ],
        "driveFromPrev": {
          "km": 100,
          "minutes": 80
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3224935/pexels-photo-3224935.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "vatnsnes-n",
        "name": "Vatnsnes Seal Colony",
        "coordinates": [
          -20.47,
          65.42
        ],
        "description": "Detour down the Vatnsnes Peninsula to find Iceland's largest harbour seal colony and the iconic Hvítserkur basalt stack at the tip. The 15m rock resembles a drinking rhinoceros and looks magical in the morning light.",
        "highlights": [
          "Hvítserkur basalt stack (looks like a rhino)",
          "Harbour seal colony at Ósar",
          "Lonely, uncrowded coastal road",
          "Icelandic horse farms en route"
        ],
        "driveFromPrev": {
          "km": 180,
          "minutes": 140
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reykjavik-n-end",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Complete the northern loop back to the capital, or extend your trip west to the Snæfellsnes peninsula for one of Iceland's most dramatic driving experiences.",
        "highlights": [
          "3h 30min drive from Vatnsnes",
          "Optional: Snæfellsnes peninsula detour",
          "Borgarnes Settlement Centre stop",
          "Celebrate the northern adventure"
        ],
        "driveFromPrev": {
          "km": 185,
          "minutes": 140
        },
        "recommendedTime": "Journey's end",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/1906438/pexels-photo-1906438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#8b5cf6",
    "icon": "🐋"
  },
  {
    "id": "east",
    "name": "East Fjords",
    "tagline": "Tranquil fjords & hidden gems",
    "description": "The East Fjords are Iceland's best-kept secret — a slow, winding drive through a landscape of mirror-calm fjords, colourful fishing villages, and dramatic valleys. Don't miss Petra's stone collection or the rainbow street of Seyðisfjörður.",
    "days": 4,
    "totalKm": 600,
    "difficulty": "Moderate",
    "seasons": [
      "Spring",
      "Summer",
      "Autumn"
    ],
    "requiresFourWD": false,
    "stops": [
      {
        "id": "hofn-e",
        "name": "Höfn",
        "coordinates": [
          -15.21,
          64.25
        ],
        "description": "Fly into Egilsstaðir or drive to Höfn and base yourself in Iceland's langoustine capital. The Vatnajökull glacier tongue fills the view from town and the pace of life here is gloriously slow.",
        "highlights": [
          "Fresh langoustine at local restaurants",
          "Vatnajökull glacier panorama",
          "Jökulsárlón lagoon 78km west",
          "Overnight base for SE Iceland"
        ],
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/4825701/pexels-photo-4825701.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "djupivogur",
        "name": "Djúpivogur",
        "coordinates": [
          -14.28,
          64.66
        ],
        "description": "A tiny, picture-perfect fishing village with colourful houses, a small marina, and the extraordinary Eggin í Gleðivík art installation — 34 giant granite eggs each representing a local bird species placed along the shore.",
        "highlights": [
          "Eggin í Gleðivík egg sculpture trail",
          "Landbrot restaurant for fresh fish",
          "Village with barely 400 residents",
          "Papey island bird tour (seasonal)"
        ],
        "driveFromPrev": {
          "km": 100,
          "minutes": 80
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "petra",
        "name": "Petra's Stone Collection, Stöðvarfjörður",
        "coordinates": [
          -13.87,
          64.83
        ],
        "description": "One of Iceland's most unexpected attractions — a retired schoolteacher named Petra Sveinsdóttir spent her life collecting minerals and crystals from the surrounding mountains. Her house and garden are now an extraordinary free-access museum of geological wonders.",
        "highlights": [
          "Thousands of minerals & crystals on display",
          "One woman's life work on show",
          "Set in a beautiful fjord village",
          "Free to visit the garden (fee for house)"
        ],
        "driveFromPrev": {
          "km": 60,
          "minutes": 60
        },
        "recommendedTime": "1 hour",
        "overnight": false,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "seydisfjordur",
        "name": "Seyðisfjörður",
        "coordinates": [
          -14.02,
          65.26
        ],
        "description": "The most strikingly beautiful town in the East Fjords — a rainbow street leads from the ferry terminal to the iconic blue church, with wooden houses lining the banks of the fjord river. The drive in over the mountain pass is spectacular.",
        "highlights": [
          "Rainbow-painted road to the blue church",
          "Mountain pass drive (breathtaking views)",
          "Ferry terminal connecting to mainland Europe",
          "Skaftfell art centre & café"
        ],
        "driveFromPrev": {
          "km": 115,
          "minutes": 100
        },
        "recommendedTime": "2–3 hours",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "egilsstadir-e",
        "name": "Egilsstaðir",
        "coordinates": [
          -14.4,
          65.27
        ],
        "description": "The service capital of East Iceland sits by the long Lagarfljót lake. Use it as a base for hiking to the spectacular Hengifoss waterfall — Iceland's third tallest — through a dramatic basalt valley.",
        "highlights": [
          "Hengifoss waterfall hike (2.5km each way)",
          "Litlanesfoss hexagonal basalt columns en route",
          "Lagarfljót lake monster legend since 1345",
          "East Iceland Heritage Museum"
        ],
        "driveFromPrev": {
          "km": 26,
          "minutes": 25
        },
        "recommendedTime": "Half day",
        "overnight": true,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3224934/pexels-photo-3224934.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "hengifoss",
        "name": "Hengifoss Waterfall",
        "coordinates": [
          -15.19,
          65.08
        ],
        "description": "Iceland's third tallest waterfall at 128m plunges through striking red and black basalt stripes — the red layers are ancient lakebed sediments from millions of years ago. The 5km return hike passes Litlanesfoss, framed by perfect hexagonal columns.",
        "highlights": [
          "128m waterfall (3rd tallest in Iceland)",
          "Red & black striped basalt geology",
          "Litlanesfoss columns en route",
          "5km return hike (1.5–2hrs)"
        ],
        "driveFromPrev": {
          "km": 35,
          "minutes": 35
        },
        "recommendedTime": "2–3 hours hike",
        "overnight": false,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "jokulsarlon-e",
        "name": "Jökulsárlón — Return via the Glacier",
        "coordinates": [
          -16.18,
          64.05
        ],
        "description": "Drive south along the Ring Road and finish the East Iceland loop at Jökulsárlón, stopping at the Vatnajökull glacier tongue for a guided ice walk before the iconic lagoon farewell.",
        "highlights": [
          "Guided glacier walk on Vatnajökull",
          "Jökulsárlón lagoon & Diamond Beach",
          "175km scenic Ring Road drive south",
          "Ideal connection point for Ring Road continue"
        ],
        "driveFromPrev": {
          "km": 175,
          "minutes": 150
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/1891882/pexels-photo-1891882.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#10b981",
    "icon": "🦅"
  },
  {
    "id": "westfjords",
    "name": "Westfjords",
    "tagline": "Iceland's wild, remote northwest",
    "description": "The Westfjords are Iceland's least-visited and most dramatic region — a tangle of deep fjords and soaring cliffs at the country's northwest corner. Come for puffins at Látrabjarg, the bizarre red sands of Rauðasandur, and the magnificent Dynjandi waterfall.",
    "days": 5,
    "totalKm": 700,
    "difficulty": "Challenging",
    "seasons": [
      "Spring",
      "Summer"
    ],
    "requiresFourWD": false,
    "stops": [
      {
        "id": "reykjavik-w",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Begin your journey to Iceland's most dramatic and remote region. The Westfjords are only reachable by a long, winding drive — but the reward is a landscape almost untouched by tourism.",
        "highlights": [
          "Fill up fuel — long distances ahead",
          "Book accommodation well in advance",
          "Pack layers: weather changes fast",
          "The drive north is half the adventure"
        ],
        "recommendedTime": "Morning departure",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "borgarnes",
        "name": "Borgarnes Settlement Centre",
        "coordinates": [
          -21.92,
          64.54
        ],
        "description": "Stop at this fascinating museum dedicated to the Norse settlement of Iceland and the Egils Saga — one of the greatest Icelandic sagas. The town bridge over Borgarfjörður is also a great photo stop.",
        "highlights": [
          "Norse settlement history exhibition",
          "Egils Saga audio tour",
          "Good café for lunch",
          "Snapshot of Iceland's Viking past"
        ],
        "driveFromPrev": {
          "km": 75,
          "minutes": 60
        },
        "recommendedTime": "1–1.5 hours",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "holmavik",
        "name": "Hólmavík — Museum of Sorcery & Witchcraft",
        "coordinates": [
          -21.69,
          65.7
        ],
        "description": "A small fishing village in the southern Westfjords is home to Iceland's strangest museum — a deeply researched exhibition on the dark arts of Icelandic folk magic and the 17th-century witch trials. Oddly compelling.",
        "highlights": [
          "Museum of Sorcery & Witchcraft",
          "Necropants display (not for the faint-hearted)",
          "Remote, atmospheric village",
          "Good base for first night in Westfjords"
        ],
        "driveFromPrev": {
          "km": 150,
          "minutes": 120
        },
        "recommendedTime": "1–2 hours",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/9974260/pexels-photo-9974260.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "isafjordur",
        "name": "Ísafjörður",
        "coordinates": [
          -23.12,
          66.07
        ],
        "description": "The largest town in the Westfjords sits on a narrow spit in a deep fjord — the mountains rise almost vertically behind the brightly painted houses. Take a sea kayak tour, visit the Maritime Museum, and eat at Tjöruhúsið for the best fish stew in Iceland.",
        "highlights": [
          "Tjöruhúsið restaurant — legendary fish stew",
          "Sea kayaking in the fjords",
          "Westfjords Heritage Museum",
          "Base for Hornstrandir nature reserve hikes"
        ],
        "driveFromPrev": {
          "km": 200,
          "minutes": 180
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/4825701/pexels-photo-4825701.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "latrabjarg",
        "name": "Látrabjarg Bird Cliffs",
        "coordinates": [
          -24.5,
          65.5
        ],
        "description": "The westernmost point of Iceland and Europe — a 14km cliff face that rises 440m above the crashing Atlantic. Home to millions of seabirds including razorbills, guillemots, and huge puffin colonies. Puffins are famously fearless and will sit within arm's reach.",
        "highlights": [
          "Westernmost point of Europe",
          "Puffins sit within arm's reach (June–Aug)",
          "440m cliffs drop to the North Atlantic",
          "Razorbills, guillemots & fulmars nesting"
        ],
        "driveFromPrev": {
          "km": 150,
          "minutes": 150
        },
        "recommendedTime": "2–3 hours",
        "overnight": true,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3224935/pexels-photo-3224935.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "raudasandur",
        "name": "Rauðasandur Red Sand Beach",
        "coordinates": [
          -23.82,
          65.48
        ],
        "description": "Iceland's most extraordinary beach — not black but a deep russet red, formed from crushed scallop shells. 10km of deserted crimson sand backed by green cliffs, almost always completely empty. The contrast with the blue Atlantic is surreal.",
        "highlights": [
          "Red sand from crushed scallop shells",
          "10km of completely empty beach",
          "Foxes & seabirds on the sand",
          "The most unusual beach in Iceland"
        ],
        "driveFromPrev": {
          "km": 25,
          "minutes": 40
        },
        "recommendedTime": "1–2 hours",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/3894876/pexels-photo-3894876.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "dynjandi",
        "name": "Dynjandi Waterfall",
        "coordinates": [
          -23.2,
          65.73
        ],
        "description": "The jewel of the Westfjords — a tiered cascade that fans out like a bridal veil from 100m above, growing wider with every tier until it's 60m wide at the base. Six smaller waterfalls tumble down the hillside below, each with its own name and character.",
        "highlights": [
          "Bridal-veil shape fans to 60m wide",
          "6 named waterfalls on the hike below",
          "Very few crowds even in summer",
          "One of Iceland's most beautiful waterfalls"
        ],
        "driveFromPrev": {
          "km": 100,
          "minutes": 90
        },
        "recommendedTime": "1.5–2 hours",
        "overnight": true,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/1906438/pexels-photo-1906438.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "snaefellsnes-w",
        "name": "Snæfellsnes Peninsula",
        "coordinates": [
          -23.77,
          64.85
        ],
        "description": "Drive south out of the Westfjords and detour onto the Snæfellsnes Peninsula — often called 'Iceland in miniature'. The glacier-capped Snæfellsjökull volcano (Jules Verne's gateway to the Earth's interior) crowns the western tip.",
        "highlights": [
          "Snæfellsjökull glacier-volcano (Jules Verne)",
          "Kirkjufell mountain — Iceland's most photographed",
          "Arnarstapi & Hellnar coastal walk",
          "Vatnshellir lava tube cave tour"
        ],
        "driveFromPrev": {
          "km": 280,
          "minutes": 200
        },
        "recommendedTime": "Half day",
        "overnight": false,
        "day": 5,
        "thumbnail": "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reykjavik-w-end",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Return to Reykjavík via the Snæfellsnes Peninsula, having experienced Iceland's most remote and rewarding region. The Westfjords change those who visit — fewer tourists, more silence, more Iceland.",
        "highlights": [
          "190km from Snæfellsnes",
          "Celebrate surviving the Westfjords roads",
          "Hot pot at Sundhöll Reykjavíkur",
          "Best fish & chips at Icelandic Fish & Chips"
        ],
        "driveFromPrev": {
          "km": 190,
          "minutes": 150
        },
        "recommendedTime": "Journey's end",
        "overnight": false,
        "day": 5,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/9974260/pexels-photo-9974260.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#ef4444",
    "icon": "🐦"
  },
  {
    "id": "highlands",
    "name": "The Highlands",
    "tagline": "Iceland's forbidden interior",
    "description": "The uninhabited volcanic highland interior is the most remote landscape in Europe — accessible only in summer with a 4WD. Rainbow rhyolite mountains, the Askja caldera swim, and Þórsmörk's glacial valley reward those who venture beyond the Ring Road.",
    "days": 4,
    "totalKm": 600,
    "difficulty": "Challenging",
    "seasons": [
      "Summer"
    ],
    "requiresFourWD": true,
    "stops": [
      {
        "id": "reykjavik-h",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "The Highland F-roads are only open from mid-June to mid-September. Hire a 4WD in Reykjavík — a standard car will be stopped or badly damaged. Fuel up, stock supplies, and go. The interior is one of Europe's last true wildernesses.",
        "highlights": [
          "4WD hire is essential (no exceptions)",
          "F-roads open mid-June to mid-September only",
          "Stock food & water for 2+ days",
          "File a trip plan at safetravel.is"
        ],
        "recommendedTime": "Early morning departure",
        "overnight": false,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "thorsmork",
        "name": "Þórsmörk — Valley of Thor",
        "coordinates": [
          -19.52,
          63.69
        ],
        "description": "A stunning river valley ringed by three glaciers — Eyjafjallajökull, Mýrdalsjökull, and Tindfjallajökull — accessible only via the F249 river crossing. Lush birch forests shelter hiking trails with glacier and volcano views in every direction.",
        "highlights": [
          "Three glaciers visible from the valley",
          "River crossing on the F249 (4WD only)",
          "Fimmvörðuháls trail to Skógafoss (2 days)",
          "Spectacular Valahnúkur viewpoint hike (1.5hrs)"
        ],
        "driveFromPrev": {
          "km": 150,
          "minutes": 180
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 1,
        "thumbnail": "https://images.pexels.com/photos/3224934/pexels-photo-3224934.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "landmannalaugar",
        "name": "Landmannalaugar",
        "coordinates": [
          -19.07,
          63.98
        ],
        "description": "The most colourful landscape in Iceland — rhyolite mountains painted in shades of green, yellow, pink, red, and purple surround a natural hot spring where hikers soak after conquering the Laugavegur trail. The colours are unique on Earth.",
        "highlights": [
          "Rhyolite mountains in 10+ colours",
          "Natural geothermal hot spring pool",
          "Start/end of the Laugavegur trek (4 days)",
          "Brennisteinsalda volcano hike (2–3hrs)"
        ],
        "driveFromPrev": {
          "km": 90,
          "minutes": 180
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 2,
        "thumbnail": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "askja",
        "name": "Askja Caldera",
        "coordinates": [
          -16.75,
          65.03
        ],
        "description": "A remote caldera in the centre of Iceland's barren highland desert — one of the most otherworldly places in Europe. Öskjuvatn is Iceland's deepest lake; beside it, the smaller Víti crater contains milky-blue geothermal water warm enough to swim in.",
        "highlights": [
          "Víti explosion crater — swim in geothermal water",
          "Öskjuvatn — Iceland's deepest lake",
          "Lunar landscape used by Apollo astronauts",
          "250km highland drive via F88 (5hrs)"
        ],
        "driveFromPrev": {
          "km": 250,
          "minutes": 300
        },
        "recommendedTime": "Overnight",
        "overnight": true,
        "day": 3,
        "thumbnail": "https://images.pexels.com/photos/3894874/pexels-photo-3894874.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "kerlingarfjoll",
        "name": "Kerlingarfjöll Hot Springs",
        "coordinates": [
          -19.51,
          64.78
        ],
        "description": "A detour into the Kerlingarfjöll mountain range rewards with dramatically colourful geothermal valleys — rivers of orange, yellow, and red flowing between snow-dusted peaks with hot springs steaming in every crevice. A hidden highlight of the Kjölur route.",
        "highlights": [
          "Surreal orange & yellow geothermal valleys",
          "Hot spring streams winding through the hills",
          "Snow even in summer on the peaks",
          "Hveradalir geothermal area — 45min walk"
        ],
        "driveFromPrev": {
          "km": 140,
          "minutes": 200
        },
        "recommendedTime": "2–3 hours",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "id": "reykjavik-h-end",
        "name": "Reykjavík",
        "coordinates": [
          -22.0,
          64.13
        ],
        "description": "Complete the Kjölur route (F35) south back to the capital — a long but stunning drive across the highland plateau with glacier views. You've experienced Iceland that 95% of visitors never see.",
        "highlights": [
          "Kjölur route (F35) back to civilisation",
          "Geysir & Gullfoss on the route home",
          "3–4 hour drive from Kerlingarfjöll",
          "Hot pot and rest well-earned"
        ],
        "driveFromPrev": {
          "km": 280,
          "minutes": 210
        },
        "recommendedTime": "Journey's end",
        "overnight": false,
        "day": 4,
        "thumbnail": "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ],
    "coverImage": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    "color": "#06b6d4",
    "icon": "🏔️"
  }
]