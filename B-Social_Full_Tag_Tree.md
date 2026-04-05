# B-Social — Complete Tag Tree

## Project Context

B-Social is a Danish social discovery app (React 18 + TypeScript + Vite, Supabase backend, Cloudflare Pages). It has **13 top-level categories** with ~5,700 events. We need a 3-level hierarchical tag browsing system:

**Category → Subcategory → Tags**

Users tap a category, then drill into a subcategory, then see specific tags they can select to filter events. The database column is `interest_tags TEXT[]` on the `events` table, filtered with the PostgreSQL overlap operator: `interest_tags && ARRAY['maraton','trail']`.

---

## The 13 Categories (with hex colors)

| # | Category | Emoji | Hex Color | Events |
|---|----------|-------|-----------|--------|
| 1 | aktiv | ⚽ | #2ECC71 | 418 |
| 2 | natur | 🌿 | #27AE60 | 405 |
| 3 | events | 🎉 | #E74C3C | 410 |
| 4 | mad | 🍽️ | #9B59B6 | 409 |
| 5 | kultur | 🎭 | #E67E22 | 851 |
| 6 | vand | 🌊 | #3498DB | 409 |
| 7 | wellness | 🧘 | #1ABC9C | 401 |
| 8 | ekstrem | ⚡ | #E74C3C | 414 |
| 9 | motor | 🏎️ | #F39C12 | 410 |
| 10 | rejser | ✈️ | #8E44AD | 389 |
| 11 | communities | 🤝 | #2980B9 | 411 |
| 12 | ture | 🗺️ | #16A085 | 400 |
| 13 | logi | 🏡 | #D35400 | 391 |

---

## Complete Tag Tree

---

### 1. ⚽ AKTIV (#2ECC71)

**🏃 Løb**
- Maraton, Halvmaraton, 10K Løb, 5K Race, Parkrun, Trail Running, Ultra Løb, Nattercup, Gadeløb, Stafetløb, Farveløb, Hinderbaneløb, Mud Run, Motionsløb, Barefootløb

**🚴 Cykling**
- Mountainbike, Gravelbike, Landevejscykling, BMX, Velodrom, E-bike, Cykelcross, Enduro MTB, Downhill MTB, Cargo Cykling, Spinninghold, Fixie, Triathlon Cykling, Indoor Cycling, Cykelpolo

**🧗 Klatring**
- Bouldering, Toprope, Lead Klatring, Via Ferrata, Outdoor Klippe, Klatrevæg, Deep Water Solo, Speed Climbing, Klipperapelling, Isklatring, Træklatring, Klatrekonkurrence

**⚽ Holdsport**
- Fodbold, Basketball, Volleyball, Badminton, Håndbold, Tennis, Padel, Bordtennis, Rugby, Ultimate Frisbee, Floorball, Hockey, Cricket, Lacrosse, Softball, Futsal, Beach Volleyball, Pickleball

**🏊 Svømning**
- Frisvømning, Åben Vand, Triathlon Svøm, Vandpolo, Vinterbadning, Svømmehold, Masterswim, Langdistance Svøm, Crawl Teknik, Baby Svøm, Børnesvøm, Aqua Fitness

**🥊 Kampsport**
- Boksning, Brazilian Jiu-Jitsu, Judo, MMA, Karate, Taekwondo, Kickboxning, Muay Thai, Wrestling, Krav Maga, Aikido, Fægtning, Capoeira, Wing Chun, Kendo

**🏋️ Styrketræning**
- CrossFit, Vægtløftning, Powerlifting, Kettlebell, Calisthenics, Strongman, Bootcamp, Functional Fitness, Bodybuilding, TRX, Sandsæk, Barrehold, HIIT, Tabata, Circuit Training

**🎿 Vintersport**
- Skiløb, Snowboard, Langrend, Skiskydning, Skøjteløb, Ishockey, Curling, Slædeture, Sneskosport, Skitouring, Telemarkskiløb, Freestyle Ski

**🏹 Præcisionssport**
- Bueskydning, Skydning, Dart, Petanque, Krolf, Golf, Disc Golf, Minigolf, Bowling, Billard, Snooker

**🤸 Gymnastik & Dans**
- Gymnastik, Parkour, Freerunning, Akrobatik, Trampolinsport, Cheerleading, Rytmisk Gymnastik, Kunstløb, Breakdance, Salsa, Tango, Hip Hop Dans, Contemporær Dans, Folkedans, Linedance, Zumba, Swing, Bachata

**🐎 Hestesport**
- Dressur, Springning, Military, Distanceridning, Islandsridning, Westernridning, Voltigering, Polotræning, Trailridt, Ridetur, Rideskole

**⛳ Udendørs Spil**
- Orienteringsløb, Geocaching, Paintball, Airsoft, Quidditch, Kubb, Kroket, Strandhåndbold, Beachvolley, Spikeball, Cornhole, Tagfat-varianter

---

### 2. 🌿 NATUR (#27AE60)

**🥾 Vandring**
- Dagsvandring, Overnatningsvandring, Højrute, Kyststi, Pilgrimsvej, Alpin Vandring, Fjeldvandring, Skovvandring, Byvandring Natur, Natursti, Hærvejen, Camino Nordisk, Klostervandring, Marsk Vandring, Nordic Walking

**🦅 Dyreliv**
- Fuglekiggeri, Skovoplevelse, Naturguide, Fotosafari, Hvalsafari, Sælsafari, Hjortebrunst, Krondyr, Ræveobservation, Insektsafari, Sommerfugle, Vilde Heste, Bæversafari, Naturgræsning, Havørn

**🌾 Planteviden**
- Svampetur, Bærplukning, Urtesamling, Vildmadskursus, Trækendskab, Botanisk Vandring, Mosser & Laver, Blomsterkunst, Orkidésafari, Havplanter, Mos & Fern Walk, Frøsamling, Vild Frugt

**🗺️ Geo & Orientering**
- Geocaching, Orienteringsløb, Naturformidling, Geologisk Vandring, Stjernekiggeri, Naturguide, Kompas & Kort, Topografisk Tur, Fossiljagt, Stensamling, Landskabslæsning

**🏕️ Friluftsliv**
- Bushcraft, Bålmad, Sheltertur, Overlevelse, Kanotur, Telttur, Hængekøjetur, Friluftskøkken, Lejrplads, Outdoor Førstehjælp, Reb & Knob, Naturseng

**🌅 Naturoplevelser**
- Solnedgangstur, Solopgangstur, Naturteraptur, Stilhedstur, Skovbadning (Shinrin-Yoku), Måneskinsvandring, Nordlysjagt, Tågeskovtur, Naturlyd, Mindful Naturvandring

**🌊 Kyst & Strand**
- Strandfodtur, Strandingshistorie, Ravsamling, Tidevandsvandring, Klint Vandring, Fossiljagt Strand, Strandeng, Kystfugle, Vadehavsvandring, Ø-vandring

**🌲 Have & Bynatur**
- Kolonihave, Byhøst, Vild Have, Permakultur, Tagterrasse, Insekthotel, Byhøns, Biavl, Kompost, Regnbed, Urban Farming, Balkondyrkning, Spiredyrkning

---

### 3. 🎉 EVENTS (#E74C3C)

**🎪 Festivaler**
- Musikfestival, Kulturfestival, Madfestival, Ølfestival, Vinfestival, Filmfestival, Kunstfestival, Litteraturfestival, Byfest, Havnefest, Middelalderfestival, Vikingemarked, Gadefestival, Pride Festival, Karnevalfest, Lysfestival, Høstfestival, Julemarked, Nytårsfest, Midsommerfest

**🎤 Live Underholdning**
- Stand-up Aften, Improv Show, Spoken Word, Open Mic, Kabaretshow, Comedy Club, Poetryslam, Drag Show, Burlesque, Varietéshow, Publikumsdeltagelse, Talentshow

**🛍️ Markeder**
- Loppemarked, Antikmarked, Kunsthåndværksmarked, Julemarked, Påskemarked, Bøndermarked, Gourmetmarked, Vinylmarked, Bogmarked, Designmarked, Planteloppemarked, Tøjbyttemarked, Genbrugsmarked, Nørdemarket, Street Food Marked

**🧩 Spil & Quiz**
- Pub Quiz, Musikquiz, Bordspilsaften, Escape Room, LARP, Rollespil, Skattejagt, D&D Night, Triviaaften, Pokerturnering, Skak Turnering, Gaming Turnering, Dungeon Crawl, Bingo

**🎭 Scenekunst**
- Teaterforestilling, Danseforestilling, Cirkusshow, Dukketeater, Gadeperformance, Lyrikoplæsning, Pantomime, Musicalopførelse, Opera, Balletforestilling, Storytelling, Natteater

**🤝 Netværk & Socialt**
- Branchemøde, Startup Pitch Night, After Work, Speed Dating, Singles Event, Speed Networking, Business Breakfast, Founder Meetup, Women in Tech, Iværksætteraften, Alumni Møde, Co-working Day, Hackathon

**🎶 Koncerter**
- Intimkoncert, Storskærm, Rooftop Koncert, Kirke Koncert, Jazzkoncert, Klassisk Koncert, Akustisk Aften, DJ Set, Electronica, Reggae, Hip Hop Live, Rock, Metal, Indie, Folkekoncert, Korsang

**🏆 Konkurrencer**
- Madkonkurrence, Barista Championship, Cocktail Competition, Talent Show, Dance Battle, Rap Battle, Cosplay Konkurrence, Kunst Udstillings Pris, Film Pitch, Fotoudfordring

---

### 4. 🍽️ MAD (#9B59B6)

**🍳 Madlavningskurser**
- Kokkeskole, Masterclass, Grillkursus, Bagedyst, Sushi Kursus, Pasta Kursus, Brødkursus, Dessertkursus, Fermentering, Syltning, Pickles, Chokoladekursus, Temakøkken Asiatisk, Temakøkken Italiensk, Temakøkken Nordisk, Temakøkken Mexicansk, Vegansk Kursus, Raakost, Madlavning for Par, Børnemadlavning

**🍷 Drinks & Smagning**
- Vinsmagning, Ølsmagning, Cocktailkursus, Whiskey Tasting, Ginproduktion, Kaffe Barista, Te-ceremoni, Mead Smagning, Cider Workshop, Naturvin, Orangevin, Sake, Kombucha, Juice Cleanse, Smoothie Bar, Mocktail

**🏪 Restauranter & Spisesteder**
- Fine Dining, Bistro, Streetfood, Pop-up Restaurant, Sushi Bar, Tapasbar, Brasserie, Café, Brunchsted, Isterning Bar, Smørrebrødssted, Pølsevogn, Foodtruck, Michelin, Noma-inspireret, Ramen, Burger Joint, Pizza, Thai, Indisk, Vietnamesisk, Koreansk BBQ

**🥬 Markeder & Produktion**
- Bøndermarked, Gourmetmarked, Øko Gårdbutik, Vingård Besøg, Ølbryggeri Tour, Destilleri Besøg, Ostemejerí, Chokoladefabrik, Røgeri, Gårdbesøg, Frugtplantage, Selvpluk, Honninghøst, Olivenpresning

**🍲 Fællesspisning**
- Middag for Fremmede, Nabomad, Potluck, Folkekøkken, Suppekøkken, Spiseforening, Fælles Grillaften, Cooking Club, Madklub, Høstmiddag, Langt Bord, Farm-to-Table, Foragers Dinner, Silent Dinner, Pop-up Dining

**🌱 Special Diæt**
- Vegansk, Vegetarisk, Glutenfri, Paleo, Keto, Raw Food, Allergivenlig, Laktosefri, Insektmad, Plantebaseret, Ayurvedisk, Makrobiotisk, Fermenteret, Zero Waste Madlavning

**🍰 Bagning**
- Sourdough, Croissant, Kage Dekoration, Macarons, Chokolade Temperering, Brødkursus, Tærtekursus, Julesmåkager, Bageri Tour, Kanelsnegel Workshop, Wienerbrød

---

### 5. 🎭 KULTUR (#E67E22)

**🎵 Musik**
- Koncert, Festival, Jazz, Klassisk, Kormusik, Orkester, Chamber Musik, Blues, Soul, R&B, Electronica, Techno, House, Reggae, Hip Hop, Rock, Metal, Punk, Indie, Folk, Singer-Songwriter, World Music, Latin, Afrobeat, Dansemusik, Akustisk, A cappella, Beatbox, Jam Session, Åben Øveaften

**🎭 Teater**
- Dramatik, Komedie, Stand-up, Improv, Opera, Musical, Monolog, Dukketeater, Mime, Eksperimentelt Teater, Forumteater, Gadeteater, Børneteater, Ungdomsteater, Sommerrevy, Egnsteater, Cabaret, Farce, Tragedie

**🎨 Billedkunst**
- Galleri, Udstilling, Maledags Workshop, Skulptur, Keramik, Glaskunst, Fotografi, Grafisk Tryk, Litografi, Akvarel, Olie Maleri, Akryl, Tegning, Illustration, Street Art, Grafitti Tour, Digital Art, Mixed Media, Installationskunst, Performancekunst, Land Art

**📚 Litteratur**
- Bogklub, Forfatteroplæsning, Poesislam, Debataften, Bogmesse, Skriveværksted, Manuskriptkursus, Forlagsbesøg, Bogcafé, Lyrisk Aften, Novellekonkurrence, Litteratur Walk, Bogpræsentation, Oversætterforum, Fanfiction, Tegneserier & Graphic Novels

**🎬 Film**
- Biografaften, Filmklub, Dokumentar Screening, Kortfilm Festival, Outdoor Biograf, Silent Film Night, Filmproduktion Workshop, Manuskriptskrivning, Film Pitch, Instruktør Q&A, Animationsfilm, Filmhistorie Forelæsning, Drive-In Bio, Midnight Movies

**🏛️ Museer & Kulturarv**
- Kunstmuseum, Historisk Museum, Naturhistorisk, Teknisk Museum, Skibsmuseum, Vikingecenter, Frilandsmuseum, Designmuseum, Arkitekturguide, Slotbesøg, Kirkevandring, Ruiner, Arkæologisk Udgravning, Kulturnat, Museum Bag Kulissen

**💃 Dans**
- Ballet, Contemporær, Hip Hop, Salsa, Tango, Swing, Lindy Hop, Bachata, Kizomba, Folkedans, Flamenco, Ballroom, Jazz Dans, Tap Dance, Breakdance, Belly Dance, Country Line, West Coast Swing, Forró

**🎪 Cirkus & Performance**
- Nycirkus, Akrobatik, Jonglering, Trapez, Klovn, Magic, Ild Performance, Stilt Walking, Aerial Hoop, Aerial Silk, Varieté, Sideshow, Gøglertræf

---

### 6. 🌊 VAND (#3498DB)

**🚣 Kajak & Kano**
- Havkajak, Flodkajak, Kano Tur, SUP (Stand Up Paddle), SUP Yoga, Kajak Polo, Kajakfiskeri, Kanotur Overnatning, Whitewater Kajak, Surfski, Outrigger, Dragonboat, Kajak Guidet Tur

**⛵ Sejlads**
- Dinghy, Kølbåd, Katamaran, Sejlskole, Kapsejlads, Havkapsejlads, Langturssejlads, Skonnert, Vikingeskib, Sejltur, Solnedgangssejlads, Tall Ship, Windjammer, Matchrace, Speedbåd, RIB Tur

**🏄 Surf & Boardsport**
- Windsurfing, Kitesurfing, Wakeboard, Bodyboard, Skim Board, Surfskole, Foilboard, Waveski, Kitebuggy, Kitelandboard, Wakeskate, Cable Park, Jet Ski, Flyboard

**🤿 Dykning**
- Snorkling, Sportsdykning, Fridykning, Wrakdykning, Natdykning, Huleuddanning, Teknisk Dykning, Undervandsrugby, Undervandsjagt, Koralrev, UW Fotografi, UW Video, Dykkercertifikat (Open Water, Advanced, Rescue, Divemaster)

**🏊 Åben Vand**
- Åben Vands Svøm, Ocean Swim, Issvømning, Vinterbadning, Kanal Svøm, Sø Svøm, Triathlon Svøm, Swimrun, Natsvøm, Fuldmånesvøm

**🎣 Fiskeri**
- Fluefiskeri, Havfiskeri, Kystfiskeri, Lystfiskeri, Put & Take, Trolling, Undervandsjagt, Isfiskeri, Stangfiskeri, Geddefiskeri, Ørredfiskeri, Havørredsafari, Krabbesafari

**🚢 Bådture**
- Havnecruise, Kanaltour, Fjordtur, Hvalsafari, Sæltur, Fiskekutter, Hurtigfærge Udflugt, Husbåd, Flodcruise, Turbåd, Postbåd, Ø-hop

---

### 7. 🧘 WELLNESS (#1ABC9C)

**🧘 Yoga**
- Hatha, Vinyasa, Yin, Ashtanga, Kundalini, Bikram (Hot Yoga), Restorative, Power Yoga, Rocket Yoga, Yoga Nidra, Acro Yoga, Aerial Yoga, Prenatal Yoga, Chair Yoga, Kids Yoga, Partner Yoga, Beach Yoga, SUP Yoga, Forest Yoga, Yoga Retreat

**🧖 Spa & Bad**
- Badeanstalter, Floatation Tank, Massage (Thai, Deep Tissue, Hot Stone, Sports), Sauna (Finsk, Infrarød, Damp), Hammam, Kurbad, Koldtvandsbassin, Isterapí, Kropsbehandling, Ansigtsbehandling, Fodpleje, Aromaterapi, Ayurvedisk Behandling

**🌬️ Åndedræt**
- Wim Hof Metode, Box Breathing, Pranayama, Holotropisk Breathwork, Tummo, Transformational Breath, Breath of Fire, 4-7-8 Teknik, Iceman Training, Buteyko, Rebirthing, Coherent Breathing

**🌱 Mindfulness & Meditation**
- Vipassana, Zen Meditation, Transcendental, Guidet Meditation, Kropsscanning, Skovbadning, Stilhedsretreat, MBSR (Mindfulness-Based Stress Reduction), Lyd Meditation, Gong Bath, Singing Bowl, Walking Meditation, Loving-Kindness, Journaling, Gratitude Practice

**💪 Bevægelse & Krop**
- Pilates (Mat, Reformer), Barre, Funktionel Træning, Mobility, Fascia Release, Foam Rolling, Tai Chi, Qigong, Feldenkrais, Alexander Teknik, Gyrotonics, Animal Flow, Stretch Class, Rygskole, Smertefri Bevægelse

**🍵 Holistisk Helbred**
- Akupunktur, Zoneterapi, Kranio-Sakral, Reiki, Healing, Kinesiologi, Osteopati, Naprapati, Kostvejledning, Naturmedicin, Homøopati, Urtemedicin, Ayurveda, Klangterapi, Krystalhealing

**😴 Søvn & Recovery**
- Søvnhygiejne Workshop, Power Nap Lounge, Recovery Session, Cold Plunge, Contrast Therapy, Cryotherapy, Compression Therapy, Infrared Sauna, Sleep Retreat, Digital Detox

---

### 8. ⚡ EKSTREM (#E74C3C)

**🪂 Højde**
- Faldskærmsudspring, Paragliding, Base Jump, Bungee Jump, Zipline, Højklatring, Via Ferrata Ekstrem, Rappelling, Bridge Swing, Skywalk, Helikopter Hop, Wingsuit, Speed Flying, Klatreekspedition

**🏎️ Fart**
- Rallykørsel, Superbike, Downhill MTB, Speedway, Karting Highspeed, Dragrace, Sprint Cykling, Bobslæde, Skeleton, Luge, Sandboarding, Land Sailing, Jetski Racing

**🌊 Vand-Ekstrem**
- Whitewater Rafting, Canyoning, Cliff Jumping, Coasteering, Big Wave Surf, Tow-in Surf, Freediving Ekstrem, Cave Diving, Shark Diving, Open Water Crossing, River Boarding, Hydrospeeding

**❄️ Vinter-Ekstrem**
- Backcountry Skiing, Heliski, Isklatring, Snowkiting, Speed Riding, Ski Mountaineering, Glacier Trekking, Dog Sledding, Snowmobil, Extreme Snowboard, Snow Survival, Ice Swimming Extreme

**🏔️ Overlevelse & Expedition**
- Bushcraft Avanceret, Wilderness Survival, Jungle Trekking, Desert Expedition, Arctic Expedition, Mountain Expedition, Caving (Huleekspedition), Mine Exploration, Multi-dag Overlevelse, Solo Survival, Orienteringsekstrem, Navigation i Vildmark

**🪖 Taktisk & Militær**
- Paintball, Airsoft, Laser Tag, Obstacle Course Racing (OCR), Spartan Race, Tough Mudder, Military Bootcamp, Rope Course, Survival Camp, Night Ops, Urban Exploration (Urbex)

**🦈 Dyre-Encounters**
- Shark Cage Diving, Svøm med Hvaler, Krokodille Safari, Slangeoplevelse, Rovfugle Encounter, Ulveoplevelse, Bjørnesafari, Insektæder, Vildtfotosafari Ekstrem

---

### 9. 🏎️ MOTOR (#F39C12)

**🏁 Trackday & Racing**
- Trackday Bil, DMPK, Tidskørsel, Instruktørkørsel, Club Racing, GT Cup, Touring Car, Formel 4, Endurance Race, Hillclimb, Sprint, Slalom, Rallycross, Autocross, Time Attack, Sim Racing Event

**🏍️ Motorcykel**
- MC Træf, Klubmøde, Landevejstur, Off-road, Enduro, Adventure Riding, Touring, MC Messe, MC Festival, Speedway, Supermoto, Flat Track, Trial, Scrambler, Café Racer Meet, Custom Show, MC Roadtrip

**🔧 Klassisk & Veteranbiler**
- Concours d'Élégance, Veteranrally, Swap Meet, Restaurerings Workshop, Autojumble, Classic Car Show, Heritage Run, Mille Miglia stil, Barn Find Event, Auktion, Mærketræf (Porsche, BMW, Ford, VW), Patina Meet

**🏁 Drag & Speed**
- 1/4 Mile, Grudge Race, Street Legal Drag, Import Drag, Diesel Drag, Burnout Competition, Top Speed Challenge, Roll Racing, Dyno Day, Nitrous Night, Pro Street

**🌀 Drift**
- Rookie Dag, Pro Drift, Banedag, Drift Competition, Tandem Drift, Matsuri, Grassroots Drift, Drift Taxi, Build & Drift, Drift Clinic, Formula D, Drift Games

**🎯 GoKart**
- Arrive & Drive, Endurance Race, Junior Kart, Elektrisk GoKart, Rental Racing, Kart Championship, Corporate Event, Prokart, Rotax, KZ, Bambini, Superkart

**🚗 Biltræf & Kultur**
- Cars & Coffee, Bilshow, Tuningtræf, Stance Meet, JDM Night, Euro Meet, US Car Meet, Supercar Spotting, Nat Træf, Bilbasar, Autocamper Træf, 4x4 Meetup, Offroad Day, Tesla Meet, EV Meetup

**🛠️ Værksted & Teknik**
- Mekanikerworkshop, Motor Rebuild, Brems & Undervogn, Lak & Polering, Detailing, Wrapping, Vinyl, Lydsystem, Performance Tuning, ECU Mapping, Turbo Build, Svejsekursus, Fabrication

**🏗️ Rallye & Offroad**
- Rallysprint, Gravel Rally, Navigationsrally, Regularity Rally, Classic Rally, Raid, Baja, Rock Crawling, Mudding, Overlanding, Expedition Vehicle, Trail Riding, Dune Bashing

---

### 10. ✈️ REJSER (#8E44AD)

**🏙️ Bytrip**
- Weekendtur, Storbyferie, Boutique By, Kulturhovedstad, Shoppingferie, Nightlife Tur, Foodie Trip, Arkitekturtur, Historisk By, Havneby, Universitetsby, Kunstby

**🏖️ Strand & Sol**
- Strandferie, Øferie, Middelhavet, Tropisk, Surf Destination, Diving Destination, Yacht, Bådliv, Kystlinje, Klippeø, Maldiver-stil, Caribien, Sydøstasien Strand

**🏔️ Eventyr & Trekking**
- Backpacking, Trekking, Ekspedition, Rundrejse, Jeepsafari, Cykelferie, Vandreferie, Klædeudfordringsrejse, Voluntourism, Gap Year, Multi-sport Tur, Overland

**🚂 Transport-Rejser**
- Togrejse, Motorcykeltur, Roadtrip, Cykelferie, Bådferie, Sejlerferie, Hurtigfærge, Autocamper, Vanlife, Interrail, Orient Express-stil, Scenic Rail

**👨‍👩‍👧‍👦 Grupperejser**
- Klubrejse, Tematur, Guidet Gruppe, Pilgrimsrejse, Yogaretreat Rejse, Vinsmagning Tur, Madrejse, Fodboldrejse, Festival Tur, Skiferie Gruppe, Dykkerferie Gruppe, Singlerejse, Seniorrejse

**🌍 Destinationer**
- Danmark, Sverige, Norge, Island, Finland, Færøerne, Grønland, Tyskland, Holland, Frankrig, Spanien, Italien, Grækenland, Kroatien, Portugal, UK, Østeuropa, Skandinavien, Alper, Balkan, Tyrkiet, Japan, Thailand, Bali, Australien, New Zealand, USA, Canada, Sydamerika, Afrika

**🛂 Rejsetype**
- Solo Rejse, Par Rejse, Familierejse, Luksusrejse, Budgetrejse, All-Inclusive, Slow Travel, Workation, Digital Nomad, House Swap, Sabbatrejse, Volunteerrejse

---

### 11. 🤝 COMMUNITIES (#2980B9)

**🏘️ Naboskab & Lokalt**
- Grundejerforening, Beboerforening, Gadearrangement, Bydelsfest, Nabo-hjælp, Lokal Oprydning, Fællesareal, Legepladsforening, Havnelaug, Landsbyfællesskab, Bofællesskab, Andelsforening

**🤲 Frivilligt Arbejde**
- Velgørenhed, Hjælpeorganisation, Genbrugscenter, Madredning, Folkekøkken, Suppekøkken, Besøgsven, Lektiehjælp, Flygtningehjælp, Dyreinternat, Naturpleje, Strandrensning, Bloddonor, Mentor Frivillig

**💼 Karriere & Professionelt**
- Networking, Mentoring, Workshop, Kompetenceudvikling, Startup Community, Iværksætternetværk, Co-working, Freelancer Meetup, Brancheklub, CEO Roundtable, Women in Business, Young Professionals, Alumni Netværk, Board Training

**🎨 Hobby & Interesse**
- Samlerklub (Frimærker, Mønter, Vin, Vinyl), DIY Værksted, Makerspaces, Strikkegruppe, Syforening, Haveforening, Modelbygger, Jernbane Entusiast, Fugleforening, Astronomiklub, Skakklub, Bridge, Filmklub, Bogklub, Fotoklub, Ølbryggeri, Vinlaug

**🙏 Tro & Spiritualitet**
- Kirke, Moské, Synagoge, Buddhistisk Tempel, Meditationsgruppe, Filosofisk Salon, Eksistentiel Gruppe, Bibelstudie, Mindfulness Sangha, Sufi Cirkel, Kvæker Møde, Trossamtale, Pilgrimsgruppe, Åndelig Retræte

**✊ Aktivisme & Samfund**
- Miljøbevægelse, Klimaaktivisme, Social Retfærdighed, Antiracisme, LGBTQ+ Forening, Handicaprettigheder, Byudvikling, Borgergruppe, Politisk Debatklub, Fredsbevægelse, Menneskerettigheder, Dyrerettigheder, Forbrugerbevægelse, Demokrati & Dialog

**🌍 Integration & Kultur**
- Sprogcafé, Kulturforening, Immigrantnetværk, Expat Community, Integrationsprojekt, Venner med Flygtninge, Language Tandem, Kulturudveksling, International Dinner, Folkemøde, Dialoggruppe

**👶 Familie & Generationer**
- Mødregruppe, Fædregruppe, Leggruppe, Familienetværk, Seniorcenter, Ældreforening, Generationsmøde, Børne & Ungeforening, Teenklub, Familiecamp, Tvillingeforening, Enlige Forældre

---

### 12. 🗺️ TURE (#16A085)

**🚶 Gåture**
- Byvandring, Natursti, Guidet Tur, Aftenvandring, Morgentur, Arkitekturvandring, Gourmetvandring, Pubcrawl, Spøgelsesvandring, Street Art Tour, Fotograferingstur, Historisk Byvandring, Rooftop Tour, Underground Tour, Foodie Walk, Kriminalmysterium Walk

**🚲 Cykelture**
- Dagscykling, Familiecykeltur, Gravelbike Rute, MTB Rute, Kulturcykeltur, Vinmarkstur, Kystcykeltur, Landsbycykeltur, Night Ride, Bakke-challenge, Byens Skjulte Steder, Brewery Bike Tour, Solnedgangstur Cykel

**⛵ Sejlture**
- Dagsejltur, Solnedgangssejlads, Havkajak Dagstur, Fjordtur, Kanaltour, Ø-hop, Fjordrundfart, Whalewatch Tur, Fiskertur, Vikingeskibstur, Speedbådstur, Tall Ship Tur, Pirattur

**🚌 Bus & Minibus**
- Udflugt, Dagstur, Seniorudflugt, Skoleudflugt, Slotstur, Vingårdstur, Øltur, Outlet Shopping, Naturpark Tur, Temapark Tur, Julemarked Bustur, Fjeldtur

**🏰 Guidede Oplevelser**
- Kulturvandring, Arkæologisk Tur, Historietur, Naturguide, Fugleguide, Vinylaguide, Barmix Tur, Undergrundstur, Paranormaltour, Madguide, Grafittitour, Museumstour, Ateliertour, Bagkulissen Tour

**🚗 Roadtrips**
- Dagsroadtrip, Weekend Roadtrip, Kystvejen, Margueritruten, Panoramarute, Slotslinje, Ølruten, Ostruten, Bondegårdstour, Fyrtårnsruten, Strandvejen, Hærvejsruten, Limfjordsrunden

**🏃 Aktive Ture**
- Trail Run Tur, Kajaktur, Klatretur, Canyoningtur, Snorkeltur, Dykketur, Ridertur, Segway Tour, E-scooter Tour, Løbetur, Nordic Walk Tur, Tuk Tuk Tour

---

### 13. 🏡 LOGI (#D35400)

**🏨 Hotel**
- Boutiquehotel, Designhotel, Budgethotel, Luksushotel, Kurbad Hotel, Badehotel, Kroophold, Konferencehotel, Spa Hotel, Romantisk Hotel, Historisk Hotel, Slothotel, Gårdhotel, Strandhotel

**⛺ Camping**
- Teltplads, Glamping, Autocamper Plads, Naturlejrplads, Shelter, Primitiv Overnatning, Rooftop Camping, Wild Camping, Campingferie, Luksus Camping, Eco Camp, Safari Camp, Pod Camping

**🏠 Ferieboliger**
- Sommerhus, Feriehus, Ferielejlighed, Villa, Penthouse, Stuga, Rorbuer, Vingårdshus, Ødegård, Gîte, Farmhouse, Beach House, Mountain Cabin, Lake House

**🏕️ Hytte & Shelter**
- Skovhytte, Fjeldhytte, Shelter (Naturstyrelsen), Overnatningshytte, Jagthytte, Fiskerhytte, Tømmerflådehytte, Pilgrimsherberg, DNT-hytte, Lavvo, Jerngitterhytte

**🌟 Alternativ Overnatning**
- Træhus (Treehouse), Fyrtårn, Containerhotel, Houseboats, Yurt, Tipi, Igloo, Bobble Hotel, Vinhotel, Sleeping Pod, Kapselhotel, Ishøtel, Underwater Hotel, Tårnovernatning, Vindmølle, Togvogn

**🤝 Deleøkonomi**
- Airbnb, Couchsurfing, House Sitting, Home Exchange, Workaway, WWOOF, HelpX, Trusted Housesitters, Warmshowers (Cykling), Nomad Stays

**🏖️ Resort & All-Inclusive**
- Beach Resort, Ski Resort, Golf Resort, Spa Resort, Family Resort, Adult Only, Eco Resort, Wellness Retreat Center, Yoga Retreat Center, Detox Resort, Surf Camp

---

## Summary Statistics

| Level | Count |
|---|---|
| Categories | 13 |
| Subcategories | ~89 |
| Individual tags | ~1,800+ |

## Tech Implementation Notes

- **Database column:** `interest_tags TEXT[]` on `events` table
- **Filter query:** `interest_tags.ov.{maraton,trail}` (Supabase PostgREST overlap)
- **SQL equivalent:** `WHERE interest_tags && ARRAY['maraton','trail']`
- **Tag format in DB:** lowercase, no spaces (e.g., `maraton`, `trail-running`, `havkajak`)
- **Multi-select:** User can pick tags across multiple categories; combine with AND/OR toggle
- **Key files:** `categoryContent.ts`, `events.json`, `Udforsk.tsx`, `Feed.tsx`
