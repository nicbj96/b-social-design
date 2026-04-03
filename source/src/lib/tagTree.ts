/* ═══════════════════════════════════════════════
   B-Social Tag Tree — 3-niveau hierarki
   OVERKATEGORI → KATEGORI → UNDERKATEGORI
   Eksempel: Motion & Fitness → Cykling → racercykling, mtb, gravel …
   ═══════════════════════════════════════════════ */

export interface TagNode {
  tag: string;
  emoji: string;
  label: string;
  children?: TagNode[];
}

export const TAG_TREE: TagNode[] = [
  // ══════════════════════════════════════════════
  // 1. MOTION & FITNESS
  // ══════════════════════════════════════════════
  {
    tag: "motion-fitness",
    emoji: "🏃",
    label: "Motion & Fitness",
    children: [
      {
        tag: "løb", emoji: "🏃", label: "Løb", children: [
          { tag: "maraton", emoji: "🏅", label: "Maraton" },
          { tag: "trailløb", emoji: "🌲", label: "Trailløb" },
          { tag: "halvmaraton", emoji: "🥈", label: "Halvmaraton" },
          { tag: "5k", emoji: "🎯", label: "5K" },
          { tag: "intervalløb", emoji: "⚡", label: "Intervalløb" },
          { tag: "parkrun", emoji: "🌳", label: "Parkrun" },
          { tag: "crossfit-løb", emoji: "🔥", label: "CrossFit" },
          { tag: "ultraløb", emoji: "🏔️", label: "Ultraløb" },
          { tag: "10k", emoji: "🎖️", label: "10K" },
        ],
      },
      {
        tag: "cykling", emoji: "🚴", label: "Cykling", children: [
          { tag: "racercykling", emoji: "🏎️", label: "Racercykling" },
          { tag: "mtb", emoji: "🚵", label: "Mountainbike" },
          { tag: "e-mtb", emoji: "⚡", label: "E-MTB" },
          { tag: "gravel", emoji: "🛤️", label: "Gravel" },
          { tag: "landevejscykling", emoji: "🛣️", label: "Landevejscykling" },
          { tag: "bmx", emoji: "🤸", label: "BMX" },
          { tag: "singletrack", emoji: "🌲", label: "Singletrack" },
          { tag: "cykelløb", emoji: "🏁", label: "Cykelløb" },
          { tag: "ebike", emoji: "⚡", label: "E-cykel" },
          { tag: "bycykling", emoji: "🚲", label: "Bycykling" },
        ],
      },
      {
        tag: "bold", emoji: "⚽", label: "Bold", children: [
          { tag: "fodbold", emoji: "⚽", label: "Fodbold" },
          { tag: "basketball", emoji: "🏀", label: "Basketball" },
          { tag: "volleyball", emoji: "🏐", label: "Volleyball" },
          { tag: "tennis", emoji: "🎾", label: "Tennis" },
          { tag: "håndbold", emoji: "🤾", label: "Håndbold" },
          { tag: "padel", emoji: "🏓", label: "Padel" },
          { tag: "badminton", emoji: "🏸", label: "Badminton" },
          { tag: "pickleball", emoji: "🏓", label: "Pickleball" },
          { tag: "squash", emoji: "🎾", label: "Squash" },
          { tag: "bordtennis", emoji: "🏓", label: "Bordtennis" },
          { tag: "rugby", emoji: "🏉", label: "Rugby" },
          { tag: "amerikansk-fodbold", emoji: "🏈", label: "Amerikansk fodbold" },
          { tag: "cricket", emoji: "🏏", label: "Cricket" },
          { tag: "hockey", emoji: "🏒", label: "Hockey" },
          { tag: "disc-golf", emoji: "🥏", label: "Disc Golf" },
        ],
      },
      {
        tag: "svømning", emoji: "🏊", label: "Svømning", children: [
          { tag: "frisvømning", emoji: "🏊", label: "Frisvømning" },
          { tag: "havsvømning", emoji: "🌊", label: "Havsvømning" },
          { tag: "havnebad", emoji: "🚿", label: "Havnebad" },
          { tag: "vinterbadning", emoji: "🥶", label: "Vinterbadning" },
          { tag: "svømmestævne", emoji: "🏅", label: "Svømmestævne" },
          { tag: "svømmeskole", emoji: "🎓", label: "Svømmeskole" },
        ],
      },
      {
        tag: "fitness", emoji: "💪", label: "Fitness", children: [
          { tag: "styrketræning", emoji: "🏋️", label: "Styrketræning" },
          { tag: "crossfit", emoji: "🔥", label: "CrossFit" },
          { tag: "calisthenics", emoji: "🤸", label: "Calisthenics" },
          { tag: "udendørs-fitness", emoji: "🌳", label: "Udendørs fitness" },
          { tag: "hiit", emoji: "⚡", label: "HIIT" },
          { tag: "pilates", emoji: "🧘", label: "Pilates" },
          { tag: "funktionstræning", emoji: "🏋️", label: "Funktionstræning" },
          { tag: "bootcamp", emoji: "🪖", label: "Bootcamp" },
          { tag: "aerobic", emoji: "💃", label: "Aerobic" },
          { tag: "triathlon", emoji: "🏅", label: "Triathlon" },
        ],
      },
      {
        tag: "kampsport", emoji: "🥊", label: "Kampsport", children: [
          { tag: "boksning", emoji: "🥊", label: "Boksning" },
          { tag: "mma", emoji: "🤼", label: "MMA" },
          { tag: "jiu-jitsu", emoji: "🥋", label: "Jiu-Jitsu" },
          { tag: "karate", emoji: "🥋", label: "Karate" },
          { tag: "taekwondo", emoji: "🦶", label: "Taekwondo" },
          { tag: "kickboxing", emoji: "🦵", label: "Kickboxing" },
          { tag: "wrestling", emoji: "🤼", label: "Wrestling" },
          { tag: "judo", emoji: "🥋", label: "Judo" },
          { tag: "kung-fu", emoji: "🥋", label: "Kung Fu" },
        ],
      },
      {
        tag: "vandsport", emoji: "🌊", label: "Vandsport", children: [
          { tag: "surfing", emoji: "🏄", label: "Surfing" },
          { tag: "sup", emoji: "🚣", label: "SUP" },
          { tag: "kajak", emoji: "🚣", label: "Kajak" },
          { tag: "kano", emoji: "🛶", label: "Kano" },
          { tag: "sejlads", emoji: "⛵", label: "Sejlads" },
          { tag: "wakeboard", emoji: "🏄", label: "Wakeboard" },
          { tag: "dykning", emoji: "🤿", label: "Dykning" },
          { tag: "kitesurfing", emoji: "🪁", label: "Kitesurfing" },
          { tag: "snorkling", emoji: "🤿", label: "Snorkling" },
          { tag: "windsurfing", emoji: "🌊", label: "Windsurfing" },
          { tag: "roning", emoji: "🚣", label: "Roning" },
        ],
      },
      {
        tag: "ekstrem-sport", emoji: "🪂", label: "Ekstremsport", children: [
          { tag: "parkour", emoji: "🏙️", label: "Parkour" },
          { tag: "skateboarding", emoji: "🛹", label: "Skateboarding" },
          { tag: "fægtning", emoji: "🤺", label: "Fægtning" },
          { tag: "bueskydning", emoji: "🏹", label: "Bueskydning" },
          { tag: "orientering", emoji: "🗺️", label: "Orientering" },
          { tag: "faldskærm", emoji: "🪂", label: "Faldskærm" },
          { tag: "klatring-sport", emoji: "🧗", label: "Klatring" },
          { tag: "bouldering", emoji: "🪨", label: "Bouldering" },
        ],
      },
      {
        tag: "vinter-sport", emoji: "⛷️", label: "Vintersport", children: [
          { tag: "skiløb", emoji: "⛷️", label: "Skiløb" },
          { tag: "snowboard", emoji: "🏂", label: "Snowboard" },
          { tag: "langrend", emoji: "🎿", label: "Langrend" },
          { tag: "piste", emoji: "⛷️", label: "Piste" },
          { tag: "curling", emoji: "🥌", label: "Curling" },
          { tag: "skøjteløb", emoji: "⛸️", label: "Skøjteløb" },
          { tag: "inline-skating", emoji: "🛼", label: "Inline skating" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 2. SPORT (TILSKUER)
  // ══════════════════════════════════════════════
  {
    tag: "sport-tilskuer",
    emoji: "🏟️",
    label: "Sport (tilskuer)",
    children: [
      {
        tag: "fodbold-tilskuer", emoji: "⚽", label: "Fodbold", children: [
          { tag: "superliga", emoji: "🏆", label: "Superliga" },
          { tag: "champions-league", emoji: "⭐", label: "Champions League" },
          { tag: "vm-fodbold", emoji: "🌍", label: "VM" },
          { tag: "em-fodbold", emoji: "🇪🇺", label: "EM" },
          { tag: "lokal-fodbold", emoji: "🏘️", label: "Lokalfodbold" },
        ],
      },
      {
        tag: "motorsport-tilskuer", emoji: "🏎️", label: "Motorsport", children: [
          { tag: "formel1", emoji: "🏎️", label: "Formel 1" },
          { tag: "rally", emoji: "🚗", label: "Rally" },
          { tag: "dtm", emoji: "🚙", label: "DTM" },
          { tag: "motocross", emoji: "🏍️", label: "Motocross" },
          { tag: "karting", emoji: "🏎️", label: "Karting" },
        ],
      },
      {
        tag: "cykelsport-tilskuer", emoji: "🚴", label: "Cykelsport", children: [
          { tag: "tour-de-france", emoji: "🇫🇷", label: "Tour de France" },
          { tag: "paris-roubaix", emoji: "🏆", label: "Paris-Roubaix" },
          { tag: "cykling-dm", emoji: "🇩🇰", label: "DM Cykling" },
        ],
      },
      {
        tag: "andre-sportsgrene", emoji: "🥇", label: "Andre sportsgrene", children: [
          { tag: "håndbold-tilskuer", emoji: "🤾", label: "Håndbold" },
          { tag: "basketball-tilskuer", emoji: "🏀", label: "Basketball" },
          { tag: "tennis-tilskuer", emoji: "🎾", label: "Tennis" },
          { tag: "boksning-tilskuer", emoji: "🥊", label: "Boksning" },
          { tag: "esport-tilskuer", emoji: "🎮", label: "Esport" },
          { tag: "atletik", emoji: "🏃", label: "Atletik" },
          { tag: "svømning-stævne", emoji: "🏊", label: "Svømmestævne" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 3. MUSIK & LYD
  // ══════════════════════════════════════════════
  {
    tag: "musik-lyd",
    emoji: "🎵",
    label: "Musik & Lyd",
    children: [
      {
        tag: "koncert", emoji: "🎤", label: "Koncert", children: [
          { tag: "rock", emoji: "🎸", label: "Rock" },
          { tag: "pop", emoji: "🎶", label: "Pop" },
          { tag: "jazz", emoji: "🎷", label: "Jazz" },
          { tag: "klassisk-musik", emoji: "🎻", label: "Klassisk" },
          { tag: "metal", emoji: "🤘", label: "Metal" },
          { tag: "edm", emoji: "🎧", label: "EDM" },
          { tag: "hip-hop", emoji: "🎤", label: "Hip-hop" },
          { tag: "indie", emoji: "🎸", label: "Indie" },
          { tag: "rnb", emoji: "🎶", label: "R&B" },
          { tag: "reggae", emoji: "🌴", label: "Reggae" },
          { tag: "soul", emoji: "🎼", label: "Soul" },
          { tag: "funk", emoji: "🕺", label: "Funk" },
          { tag: "blues", emoji: "🎸", label: "Blues" },
          { tag: "country", emoji: "🤠", label: "Country" },
          { tag: "punk", emoji: "🎸", label: "Punk" },
          { tag: "grunge", emoji: "🎸", label: "Grunge" },
          { tag: "techno", emoji: "🔊", label: "Techno" },
          { tag: "house", emoji: "🏠", label: "House" },
          { tag: "trance", emoji: "🎵", label: "Trance" },
          { tag: "drum-and-bass", emoji: "🥁", label: "Drum & Bass" },
          { tag: "dubstep", emoji: "🔊", label: "Dubstep" },
          { tag: "ambient", emoji: "🌌", label: "Ambient" },
          { tag: "lo-fi", emoji: "📻", label: "Lo-Fi" },
          { tag: "k-pop", emoji: "🇰🇷", label: "K-Pop" },
          { tag: "j-pop", emoji: "🇯🇵", label: "J-Pop" },
          { tag: "afrobeats", emoji: "🌍", label: "Afrobeats" },
          { tag: "latin", emoji: "🌶️", label: "Latin" },
          { tag: "cumbia", emoji: "💃", label: "Cumbia" },
          { tag: "reggaeton", emoji: "🔥", label: "Reggaeton" },
          { tag: "folk", emoji: "🪕", label: "Folk" },
          { tag: "singer-songwriter", emoji: "🎵", label: "Singer-Songwriter" },
          { tag: "a-capella", emoji: "🎤", label: "A Capella" },
          { tag: "kor", emoji: "🎶", label: "Kor" },
          { tag: "electronic", emoji: "🎛️", label: "Electronic" },
          { tag: "psytrance", emoji: "🌀", label: "Psytrance" },
          { tag: "goa-trance", emoji: "🌀", label: "Goa Trance" },
          { tag: "techno", emoji: "🎚️", label: "Techno" },
          { tag: "house", emoji: "🎛️", label: "House" },
          { tag: "gospel", emoji: "🙏", label: "Gospel" },
        ],
      },
      {
        tag: "festival-musik", emoji: "🎪", label: "Musikfestival", children: [
          { tag: "sommerfestival", emoji: "☀️", label: "Sommerfestival" },
          { tag: "vinterfestival", emoji: "❄️", label: "Vinterfestival" },
          { tag: "gadefestival", emoji: "🏙️", label: "Gadefestival" },
          { tag: "klassisk-festival", emoji: "🎻", label: "Klassisk festival" },
          { tag: "jazz-festival", emoji: "🎷", label: "Jazzfestival" },
          { tag: "elektronisk-festival", emoji: "🎛️", label: "Elektronisk festival" },
          { tag: "psytrance-festival", emoji: "🌀", label: "Psytrance festival" },
          { tag: "goa-festival", emoji: "🌀", label: "Goa festival" },
          { tag: "openair", emoji: "🌳", label: "Open air" },
          { tag: "ravenight", emoji: "🕺", label: "Rave" },
        ],
      },
      {
        tag: "musik-spille", emoji: "🎸", label: "Spille musik", children: [
          { tag: "guitar", emoji: "🎸", label: "Guitar" },
          { tag: "klaver", emoji: "🎹", label: "Klaver" },
          { tag: "trommer", emoji: "🥁", label: "Trommer" },
          { tag: "sang", emoji: "🎤", label: "Sang" },
          { tag: "bas", emoji: "🎸", label: "Bas" },
          { tag: "violin", emoji: "🎻", label: "Violin" },
          { tag: "dj", emoji: "🎛️", label: "DJ" },
          { tag: "musikproduktion", emoji: "🎚️", label: "Musikproduktion" },
          { tag: "open-mic", emoji: "🎤", label: "Open Mic" },
          { tag: "jam-session", emoji: "🎶", label: "Jam Session" },
        ],
      },
      {
        tag: "dans", emoji: "💃", label: "Dans", children: [
          { tag: "salsa", emoji: "💃", label: "Salsa" },
          { tag: "bachata", emoji: "💃", label: "Bachata" },
          { tag: "hip-hop-dans", emoji: "🕺", label: "Hip-hop dans" },
          { tag: "swing", emoji: "🕺", label: "Swing" },
          { tag: "tango", emoji: "💃", label: "Tango" },
          { tag: "ballet", emoji: "🩰", label: "Ballet" },
          { tag: "zumba", emoji: "🏋️", label: "Zumba" },
          { tag: "kontaktimprovisation", emoji: "🤝", label: "Kontaktimprovisation" },
          { tag: "lindy-hop", emoji: "🕺", label: "Lindy Hop" },
          { tag: "kizomba", emoji: "💃", label: "Kizomba" },
          { tag: "flamenco", emoji: "💃", label: "Flamenco" },
          { tag: "samba", emoji: "🌴", label: "Samba" },
          { tag: "moderne-dans", emoji: "🎭", label: "Moderne dans" },
          { tag: "folkloredan", emoji: "👘", label: "Folkloredan" },
        ],
      },
      {
        tag: "podcast-lyd", emoji: "🎙️", label: "Podcast & Lyd", children: [
          { tag: "podcast", emoji: "🎙️", label: "Podcast" },
          { tag: "lydbøger", emoji: "🎧", label: "Lydbøger" },
          { tag: "radioshow", emoji: "📻", label: "Radio" },
          { tag: "asmr", emoji: "🔇", label: "ASMR" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 4. KULTUR & KUNST
  // ══════════════════════════════════════════════
  {
    tag: "kultur-kunst",
    emoji: "🎨",
    label: "Kultur & Kunst",
    children: [
      {
        tag: "teater", emoji: "🎭", label: "Teater", children: [
          { tag: "drama", emoji: "🎭", label: "Drama" },
          { tag: "komedie", emoji: "😂", label: "Komedie" },
          { tag: "børneteater", emoji: "🧸", label: "Børneteater" },
          { tag: "musical", emoji: "🎵", label: "Musical" },
          { tag: "stand-up", emoji: "🎤", label: "Stand-up" },
          { tag: "improv", emoji: "🎭", label: "Improv" },
          { tag: "opera", emoji: "🎼", label: "Opera" },
          { tag: "kabaret", emoji: "🌹", label: "Kabaret" },
        ],
      },
      {
        tag: "kunst", emoji: "🖼️", label: "Kunst", children: [
          { tag: "galleri", emoji: "🖼️", label: "Galleri" },
          { tag: "museum", emoji: "🏛️", label: "Museum" },
          { tag: "street-art", emoji: "🎨", label: "Street Art" },
          { tag: "udstilling", emoji: "🖼️", label: "Udstilling" },
          { tag: "keramik", emoji: "🏺", label: "Keramik" },
          { tag: "maleri", emoji: "🖌️", label: "Maleri" },
          { tag: "skulptur", emoji: "🗿", label: "Skulptur" },
          { tag: "fotografi-kunst", emoji: "📷", label: "Fotografi" },
          { tag: "tegning", emoji: "✏️", label: "Tegning" },
          { tag: "tekstilkunst", emoji: "🧵", label: "Tekstilkunst" },
          { tag: "digitalt-kunst", emoji: "💻", label: "Digital kunst" },
          { tag: "kunsthåndværk", emoji: "✂️", label: "Kunsthåndværk" },
          { tag: "graffiti", emoji: "🎨", label: "Graffiti" },
        ],
      },
      {
        tag: "litteratur", emoji: "📖", label: "Litteratur", children: [
          { tag: "bogklub", emoji: "📚", label: "Bogklub" },
          { tag: "skrivning", emoji: "✍️", label: "Skrivning" },
          { tag: "poesi", emoji: "🌸", label: "Poesi" },
          { tag: "forfatter", emoji: "📝", label: "Forfatter" },
          { tag: "litteraturfestival", emoji: "📖", label: "Litteraturfestival" },
          { tag: "spoken-word", emoji: "🎤", label: "Spoken Word" },
          { tag: "krimier", emoji: "🔍", label: "Krimier" },
          { tag: "fantasy", emoji: "🐉", label: "Fantasy" },
        ],
      },
      {
        tag: "kulturevents", emoji: "🏛️", label: "Kulturevents", children: [
          { tag: "kulturnat", emoji: "🌙", label: "Kulturnat" },
          { tag: "åben-ateliere", emoji: "🎨", label: "Åbne Atelierer" },
          { tag: "kulturfestival", emoji: "🎪", label: "Kulturfestival" },
          { tag: "arkitektur", emoji: "🏗️", label: "Arkitektur" },
          { tag: "design", emoji: "🖊️", label: "Design" },
          { tag: "mode-show", emoji: "👗", label: "Modeshow" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 5. NATUR & OUTDOOR
  // ══════════════════════════════════════════════
  {
    tag: "natur-outdoor",
    emoji: "🌲",
    label: "Natur & Outdoor",
    children: [
      {
        tag: "vandring", emoji: "🥾", label: "Vandring", children: [
          { tag: "dagture", emoji: "🥾", label: "Dagture" },
          { tag: "flerdag", emoji: "🎒", label: "Flerdagsture" },
          { tag: "bjergvandring", emoji: "🏔️", label: "Bjergvandring" },
          { tag: "nationalpark", emoji: "🌿", label: "Nationalpark" },
          { tag: "pilgrimsrute", emoji: "🛤️", label: "Pilgrimsrute" },
          { tag: "klittur", emoji: "🏖️", label: "Klittur" },
          { tag: "skovtur", emoji: "🌲", label: "Skovtur" },
        ],
      },
      {
        tag: "camping", emoji: "⛺", label: "Camping", children: [
          { tag: "shelter", emoji: "🏕️", label: "Shelter" },
          { tag: "telt", emoji: "⛺", label: "Telt" },
          { tag: "autocamping", emoji: "🚐", label: "Autocamping" },
          { tag: "glamping", emoji: "✨", label: "Glamping" },
          { tag: "primitiv-overnatning", emoji: "🌲", label: "Primitiv overnatning" },
          { tag: "hammock-camping", emoji: "🌿", label: "Hammock Camping" },
        ],
      },
      {
        tag: "klatring", emoji: "🧗", label: "Klatring", children: [
          { tag: "indendørs-klatring", emoji: "🏢", label: "Indendørs" },
          { tag: "udendørs-klatring", emoji: "⛰️", label: "Udendørs" },
          { tag: "boulder", emoji: "🧗", label: "Boulder" },
          { tag: "via-ferrata", emoji: "⛰️", label: "Via Ferrata" },
        ],
      },
      {
        tag: "fiskeri", emoji: "🎣", label: "Fiskeri", children: [
          { tag: "lystfiskeri", emoji: "🎣", label: "Lystfiskeri" },
          { tag: "havfiskeri", emoji: "🌊", label: "Havfiskeri" },
          { tag: "fluefiskeri", emoji: "🪰", label: "Fluefiskeri" },
          { tag: "isfiskeri", emoji: "🧊", label: "Isfiskeri" },
        ],
      },
      {
        tag: "jagt", emoji: "🦌", label: "Jagt", children: [
          { tag: "riffeljagt", emoji: "🎯", label: "Riffeljagt" },
          { tag: "buejagt", emoji: "🏹", label: "Buejagt" },
          { tag: "jagttur", emoji: "🌲", label: "Jagttur" },
        ],
      },
      {
        tag: "natur-oplevelser", emoji: "🌿", label: "Naturoplevelser", children: [
          { tag: "overlevelse", emoji: "🏕️", label: "Overlevelse" },
          { tag: "geocaching", emoji: "📍", label: "Geocaching" },
          { tag: "orienteringsløb", emoji: "🗺️", label: "Orienteringsløb" },
          { tag: "rafting", emoji: "🚣", label: "Rafting" },
          { tag: "paintball", emoji: "🔫", label: "Paintball" },
          { tag: "svampeture", emoji: "🍄", label: "Svampeture" },
          { tag: "strandtur", emoji: "🏖️", label: "Strandtur" },
          { tag: "solnedgang-tur", emoji: "🌅", label: "Solnedgangstur" },
          { tag: "nordlys", emoji: "🌌", label: "Nordlys" },
          { tag: "fuglekiggeri", emoji: "🦅", label: "Fuglekiggeri" },
          { tag: "botanik", emoji: "🌸", label: "Botanik" },
          { tag: "stjerneobservation", emoji: "⭐", label: "Stjerneobservation" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 6. MAD & DRIKKE
  // ══════════════════════════════════════════════
  {
    tag: "mad-drikke",
    emoji: "🍽️",
    label: "Mad & Drikke",
    children: [
      {
        tag: "restaurant", emoji: "🍽️", label: "Restaurant", children: [
          { tag: "dansk-mad", emoji: "🇩🇰", label: "Dansk" },
          { tag: "italiensk", emoji: "🇮🇹", label: "Italiensk" },
          { tag: "asiatisk", emoji: "🥢", label: "Asiatisk" },
          { tag: "vegansk", emoji: "🥬", label: "Vegansk" },
          { tag: "brunch", emoji: "🥞", label: "Brunch" },
          { tag: "sushi-restaurant", emoji: "🍣", label: "Sushi" },
          { tag: "ramen", emoji: "🍜", label: "Ramen" },
          { tag: "bbq", emoji: "🍖", label: "BBQ" },
          { tag: "fine-dining", emoji: "🕯️", label: "Fine Dining" },
          { tag: "vegetarisk", emoji: "🥦", label: "Vegetarisk" },
          { tag: "glutenfri", emoji: "🌾", label: "Glutenfri" },
          { tag: "mexicansk", emoji: "🌮", label: "Mexicansk" },
          { tag: "indisk", emoji: "🍛", label: "Indisk" },
          { tag: "mellemøstlig", emoji: "🧆", label: "Mellemøstlig" },
          { tag: "japansk", emoji: "🍱", label: "Japansk" },
          { tag: "koreansk", emoji: "🥘", label: "Koreansk" },
        ],
      },
      {
        tag: "bar", emoji: "🍸", label: "Bar", children: [
          { tag: "cocktailbar", emoji: "🍹", label: "Cocktailbar" },
          { tag: "ølbar", emoji: "🍺", label: "Ølbar" },
          { tag: "vinbar", emoji: "🍷", label: "Vinbar" },
          { tag: "natklub", emoji: "🪩", label: "Natklub" },
          { tag: "whiskybar", emoji: "🥃", label: "Whiskybar" },
          { tag: "rooftopbar", emoji: "🌆", label: "Rooftopbar" },
          { tag: "sports-bar", emoji: "📺", label: "Sportsbar" },
        ],
      },
      {
        tag: "café", emoji: "☕", label: "Café", children: [
          { tag: "specialkaffe", emoji: "☕", label: "Specialkaffe" },
          { tag: "brunch-café", emoji: "🥐", label: "Brunch-café" },
          { tag: "takeaway", emoji: "🥡", label: "Takeaway" },
          { tag: "te-ceremoni", emoji: "🍵", label: "Te-ceremoni" },
          { tag: "kakaobar", emoji: "🍫", label: "Kakaobar" },
          { tag: "barista", emoji: "☕", label: "Barista" },
          { tag: "kattecafé", emoji: "🐱", label: "Kattecafé" },
        ],
      },
      {
        tag: "marked", emoji: "🏪", label: "Marked", children: [
          { tag: "madfestival-marked", emoji: "🍽️", label: "Madfestival" },
          { tag: "streetfood", emoji: "🌮", label: "Streetfood" },
          { tag: "bøndermarked", emoji: "🥕", label: "Bøndermarked" },
          { tag: "food-truck", emoji: "🚚", label: "Food Truck" },
          { tag: "madmarked", emoji: "🛒", label: "Madmarked" },
          { tag: "vintagemarket", emoji: "🏺", label: "Vintagemarked" },
        ],
      },
      {
        tag: "madlavning", emoji: "👩‍🍳", label: "Madlavning", children: [
          { tag: "kursus-mad", emoji: "📋", label: "Kursus" },
          { tag: "workshop-mad", emoji: "🛠️", label: "Workshop" },
          { tag: "pop-up-dinner", emoji: "🍽️", label: "Pop-up dinner" },
          { tag: "grillaften", emoji: "🥩", label: "Grillaften" },
          { tag: "sushi-kursus", emoji: "🍣", label: "Sushi-kursus" },
          { tag: "bagning", emoji: "🥖", label: "Bagning" },
          { tag: "fermentering", emoji: "🫙", label: "Fermentering" },
          { tag: "ølbrygning", emoji: "🍺", label: "Ølbrygning" },
          { tag: "cocktail-kursus", emoji: "🍹", label: "Cocktailkursus" },
          { tag: "dessert", emoji: "🍰", label: "Dessert" },
          { tag: "madklub", emoji: "👥", label: "Madklub" },
        ],
      },
      {
        tag: "smagning", emoji: "👅", label: "Smagning", children: [
          { tag: "vinsmagning", emoji: "🍷", label: "Vinsmagning" },
          { tag: "whisky-smagning", emoji: "🥃", label: "Whiskysmagning" },
          { tag: "ølsmagning", emoji: "🍺", label: "Ølsmagning" },
          { tag: "ostesmagning", emoji: "🧀", label: "Ostesmagning" },
          { tag: "chokoladsmagning", emoji: "🍫", label: "Chokoladsmagning" },
          { tag: "te-smagning", emoji: "🍵", label: "Tesmagning" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 7. SOCIALE & HOBBY
  // ══════════════════════════════════════════════
  {
    tag: "social-hobby",
    emoji: "👋",
    label: "Social & Hobby",
    children: [
      {
        tag: "fotografering", emoji: "📸", label: "Fotografering", children: [
          { tag: "portræt", emoji: "📸", label: "Portræt" },
          { tag: "landskab", emoji: "🏞️", label: "Landskab" },
          { tag: "gadebilleder", emoji: "🏙️", label: "Gadebilleder" },
          { tag: "drone", emoji: "🛸", label: "Drone" },
          { tag: "film-foto", emoji: "📷", label: "Filmfoto" },
          { tag: "vlogging", emoji: "📹", label: "Vlogging" },
          { tag: "naturfoto", emoji: "🦋", label: "Naturfoto" },
          { tag: "makrofoto", emoji: "🔍", label: "Makrofoto" },
          { tag: "streetfoto", emoji: "🌆", label: "Streetfoto" },
        ],
      },
      {
        tag: "kreative-hobbyer", emoji: "🎨", label: "Kreative hobbyer", children: [
          { tag: "strik", emoji: "🧶", label: "Strik" },
          { tag: "syning", emoji: "🧵", label: "Syning" },
          { tag: "hækling", emoji: "🧶", label: "Hækling" },
          { tag: "perler", emoji: "📿", label: "Perler" },
          { tag: "origami", emoji: "🦢", label: "Origami" },
          { tag: "scrapbooking", emoji: "📒", label: "Scrapbooking" },
          { tag: "modelbygning", emoji: "✈️", label: "Modelbygning" },
          { tag: "lego", emoji: "🧱", label: "LEGO" },
          { tag: "have-hobby", emoji: "🌱", label: "Have & Dyrkning" },
          { tag: "lodning", emoji: "🔧", label: "Elektronik DIY" },
          { tag: "macrame", emoji: "🪢", label: "Macramé" },
        ],
      },
      {
        tag: "quiz-spil", emoji: "🧠", label: "Quiz & Spil", children: [
          { tag: "pubquiz", emoji: "🍺", label: "Pub Quiz" },
          { tag: "escape-room", emoji: "🔐", label: "Escape Room" },
          { tag: "spil-aften", emoji: "🎲", label: "Spilaften" },
          { tag: "trivia", emoji: "❓", label: "Trivia" },
          { tag: "bingo", emoji: "🎯", label: "Bingo" },
        ],
      },
      {
        tag: "collect-interesse", emoji: "🏛️", label: "Samlere & Interesse", children: [
          { tag: "samler", emoji: "🗂️", label: "Samler" },
          { tag: "møntsamling", emoji: "🪙", label: "Møntsamling" },
          { tag: "frimærker", emoji: "📬", label: "Frimærker" },
          { tag: "vinyl", emoji: "💽", label: "Vinyl & Plader" },
          { tag: "antikviteter", emoji: "🏺", label: "Antikviteter" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 8. GAMING & TECH
  // ══════════════════════════════════════════════
  {
    tag: "gaming-tech",
    emoji: "🎮",
    label: "Gaming & Tech",
    children: [
      {
        tag: "video-gaming", emoji: "🎮", label: "Video Gaming", children: [
          { tag: "pc-gaming", emoji: "🖥️", label: "PC Gaming" },
          { tag: "console", emoji: "🎮", label: "Konsol" },
          { tag: "vr-gaming", emoji: "🥽", label: "VR Gaming" },
          { tag: "esport", emoji: "🏆", label: "E-sport" },
          { tag: "lan-party", emoji: "🖧", label: "LAN Party" },
          { tag: "speedrunning", emoji: "⏱️", label: "Speedrunning" },
          { tag: "retro-gaming", emoji: "👾", label: "Retro Gaming" },
          { tag: "game-jam", emoji: "🕹️", label: "Game Jam" },
          { tag: "minecraft", emoji: "⛏️", label: "Minecraft" },
          { tag: "fortnite", emoji: "🔫", label: "Fortnite" },
          { tag: "league-of-legends", emoji: "⚔️", label: "League of Legends" },
          { tag: "counter-strike", emoji: "🎯", label: "Counter-Strike" },
          { tag: "ar-gaming", emoji: "📱", label: "AR Gaming" },
          { tag: "mobil-gaming", emoji: "📱", label: "Mobil Gaming" },
        ],
      },
      {
        tag: "brætspil-rollespil", emoji: "🎲", label: "Brætspil & Rollespil", children: [
          { tag: "brætspil", emoji: "🎲", label: "Brætspil" },
          { tag: "dnd", emoji: "🐉", label: "D&D" },
          { tag: "rollespil", emoji: "🐉", label: "Rollespil" },
          { tag: "cosplay", emoji: "🦸", label: "Cosplay" },
          { tag: "kortspil", emoji: "🃏", label: "Kortspil" },
          { tag: "warhammer", emoji: "⚔️", label: "Warhammer" },
          { tag: "miniaturespil", emoji: "🏰", label: "Miniaturespil" },
        ],
      },
      {
        tag: "tech-interesser", emoji: "💻", label: "Tech & Innovation", children: [
          { tag: "programmering", emoji: "👨‍💻", label: "Programmering" },
          { tag: "ai-tech", emoji: "🤖", label: "AI" },
          { tag: "webdesign", emoji: "🌐", label: "Webdesign" },
          { tag: "hackathon", emoji: "💻", label: "Hackathon" },
          { tag: "robotik", emoji: "🤖", label: "Robotik" },
          { tag: "cybersikkerhed", emoji: "🔐", label: "Cybersikkerhed" },
          { tag: "3d-print", emoji: "🖨️", label: "3D Print" },
          { tag: "blockchain", emoji: "🔗", label: "Blockchain" },
          { tag: "open-source", emoji: "💾", label: "Open Source" },
          { tag: "app-udvikling", emoji: "📱", label: "App-udvikling" },
          { tag: "iot", emoji: "📡", label: "Internet of Things" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 9. REJSER & EVENTYR
  // ══════════════════════════════════════════════
  {
    tag: "rejser-eventyr",
    emoji: "✈️",
    label: "Rejser & Eventyr",
    children: [
      {
        tag: "rejser", emoji: "✈️", label: "Rejser", children: [
          { tag: "tog", emoji: "🚆", label: "Tog" },
          { tag: "samkørsel", emoji: "🚗", label: "Samkørsel" },
          { tag: "cykelruter", emoji: "🚴", label: "Cykelruter" },
          { tag: "færge", emoji: "⛴️", label: "Færge" },
          { tag: "roadtrip", emoji: "🛣️", label: "Road Trip" },
          { tag: "flydeals", emoji: "✈️", label: "Fly-deals" },
          { tag: "interrail", emoji: "🚂", label: "Interrail" },
          { tag: "backpacking", emoji: "🎒", label: "Backpacking" },
          { tag: "grupperejse", emoji: "👥", label: "Grupperejse" },
        ],
      },
      {
        tag: "logi", emoji: "🏕️", label: "Logi", children: [
          { tag: "shelter-logi", emoji: "⛺", label: "Shelter" },
          { tag: "vandrerhjem", emoji: "🏠", label: "Vandrerhjem" },
          { tag: "hytter", emoji: "🛖", label: "Hytter" },
          { tag: "glamping-logi", emoji: "✨", label: "Glamping" },
          { tag: "couchsurfing", emoji: "🛋️", label: "Couchsurfing" },
          { tag: "airbnb", emoji: "🏡", label: "Airbnb" },
        ],
      },
      {
        tag: "rejsedestination", emoji: "🗺️", label: "Destination", children: [
          { tag: "storby", emoji: "🏙️", label: "Storby" },
          { tag: "strand-rejse", emoji: "🏖️", label: "Strand" },
          { tag: "bjerg-rejse", emoji: "🏔️", label: "Bjerg" },
          { tag: "safari", emoji: "🦁", label: "Safari" },
          { tag: "ørejse", emoji: "🏝️", label: "Ø-rejse" },
          { tag: "krydstogt", emoji: "🚢", label: "Krydstogt" },
          { tag: "vulkaner", emoji: "🌋", label: "Vulkaner" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 10. SUNDHED & WELLNESS
  // ══════════════════════════════════════════════
  {
    tag: "sundhed-wellness",
    emoji: "🧘",
    label: "Sundhed & Wellness",
    children: [
      {
        tag: "yoga", emoji: "🧘", label: "Yoga", children: [
          { tag: "hatha", emoji: "🧘", label: "Hatha" },
          { tag: "vinyasa", emoji: "🌊", label: "Vinyasa" },
          { tag: "yin", emoji: "🌙", label: "Yin" },
          { tag: "hot-yoga", emoji: "🔥", label: "Hot Yoga" },
          { tag: "kundalini", emoji: "🌀", label: "Kundalini" },
          { tag: "ashtanga", emoji: "🧘", label: "Ashtanga" },
          { tag: "yoga-nidra", emoji: "😴", label: "Yoga Nidra" },
          { tag: "aerial-yoga", emoji: "🎪", label: "Aerial Yoga" },
        ],
      },
      {
        tag: "meditation", emoji: "🧘", label: "Meditation", children: [
          { tag: "mindfulness", emoji: "🌿", label: "Mindfulness" },
          { tag: "guidet-meditation", emoji: "🎧", label: "Guidet" },
          { tag: "retreat", emoji: "🏡", label: "Retreat" },
          { tag: "breathwork", emoji: "💨", label: "Breathwork" },
          { tag: "vipassana", emoji: "🙏", label: "Vipassana" },
          { tag: "transcendental", emoji: "✨", label: "Transcendental" },
        ],
      },
      {
        tag: "terapi-healing", emoji: "💆", label: "Terapi & Healing", children: [
          { tag: "massage", emoji: "💆", label: "Massage" },
          { tag: "spa", emoji: "🛁", label: "Spa" },
          { tag: "akupunktur", emoji: "🪡", label: "Akupunktur" },
          { tag: "reiki", emoji: "✋", label: "Reiki" },
          { tag: "healing", emoji: "💫", label: "Healing" },
          { tag: "kraniosakral", emoji: "🧠", label: "Kraniosakral" },
          { tag: "osteopati", emoji: "🦴", label: "Osteopati" },
        ],
      },
      {
        tag: "kold-terapi", emoji: "🥶", label: "Kold-terapi & Varme", children: [
          { tag: "vinterbadning-ws", emoji: "🥶", label: "Vinterbadning" },
          { tag: "sauna", emoji: "🧖", label: "Sauna" },
          { tag: "float-tank", emoji: "🌊", label: "Float Tank" },
          { tag: "kold-bruser", emoji: "🚿", label: "Kold bruser" },
          { tag: "dampbad", emoji: "💨", label: "Dampbad" },
          { tag: "infrared-sauna", emoji: "☀️", label: "Infrared Sauna" },
        ],
      },
      {
        tag: "biohacking", emoji: "🔬", label: "Biohacking & Optimering", children: [
          { tag: "fastetræning", emoji: "⏳", label: "Fastetræning" },
          { tag: "søvn-optimering", emoji: "😴", label: "Søvnoptimering" },
          { tag: "ernæring", emoji: "🥗", label: "Ernæring" },
          { tag: "kosttilskud", emoji: "💊", label: "Kosttilskud" },
          { tag: "hormonoptimering", emoji: "⚗️", label: "Hormonoptimering" },
        ],
      },
      {
        tag: "mental-sundhed", emoji: "🧠", label: "Mental Sundhed", children: [
          { tag: "stresshåndtering", emoji: "🌬️", label: "Stresshåndtering" },
          { tag: "psykoterapi", emoji: "🗣️", label: "Psykoterapi" },
          { tag: "selvudvikling", emoji: "📈", label: "Selvudvikling" },
          { tag: "coach", emoji: "🎯", label: "Coaching" },
          { tag: "mindset", emoji: "💡", label: "Mindset" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 11. MODE & SKØNHED
  // ══════════════════════════════════════════════
  {
    tag: "mode-skønhed",
    emoji: "👗",
    label: "Mode & Skønhed",
    children: [
      {
        tag: "mode", emoji: "👗", label: "Mode & Styling", children: [
          { tag: "streetwear", emoji: "👟", label: "Streetwear" },
          { tag: "high-fashion", emoji: "💎", label: "High Fashion" },
          { tag: "vintage-mode", emoji: "🕰️", label: "Vintage" },
          { tag: "thrift", emoji: "♻️", label: "Thrifting" },
          { tag: "styling", emoji: "✂️", label: "Styling" },
          { tag: "accessories", emoji: "👜", label: "Accessories" },
          { tag: "sneakers", emoji: "👟", label: "Sneakers" },
          { tag: "bæredygtig-mode", emoji: "🌱", label: "Bæredygtig mode" },
        ],
      },
      {
        tag: "skønhed", emoji: "💄", label: "Skønhed", children: [
          { tag: "makeup", emoji: "💄", label: "Makeup" },
          { tag: "hudpleje", emoji: "🧴", label: "Hudpleje" },
          { tag: "parfume", emoji: "🌸", label: "Parfume" },
          { tag: "frisør", emoji: "✂️", label: "Frisør" },
          { tag: "negle", emoji: "💅", label: "Negle" },
          { tag: "hårpleje", emoji: "💇", label: "Hårpleje" },
          { tag: "naturlig-skønhed", emoji: "🌿", label: "Naturlig skønhed" },
        ],
      },
      {
        tag: "kropsmodificering", emoji: "🎨", label: "Kropsmodificering", children: [
          { tag: "tatovering", emoji: "🖊️", label: "Tatovering" },
          { tag: "piercinger", emoji: "💍", label: "Piercinger" },
          { tag: "tatovering-event", emoji: "🎨", label: "Tatoveringskonvention" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 12. DYR & NATUR
  // ══════════════════════════════════════════════
  {
    tag: "dyr-natur",
    emoji: "🐾",
    label: "Dyr & Natur",
    children: [
      {
        tag: "kæledyr", emoji: "🐕", label: "Kæledyr", children: [
          { tag: "hunde", emoji: "🐕", label: "Hunde" },
          { tag: "katte", emoji: "🐱", label: "Katte" },
          { tag: "fugle-husdyr", emoji: "🦜", label: "Fugle" },
          { tag: "akvarium", emoji: "🐠", label: "Akvarium" },
          { tag: "eksotiske-dyr", emoji: "🦎", label: "Eksotiske dyr" },
          { tag: "hamster-gnaver", emoji: "🐹", label: "Gnavere" },
        ],
      },
      {
        tag: "dyreaktiviteter", emoji: "🐾", label: "Aktiviteter med dyr", children: [
          { tag: "hundetræning", emoji: "🐕", label: "Hundetræning" },
          { tag: "ridning", emoji: "🐴", label: "Ridning" },
          { tag: "kattecafé-bes", emoji: "🐱", label: "Kattecafé" },
          { tag: "dogpark", emoji: "🌳", label: "Hundeparken" },
          { tag: "agility", emoji: "🏆", label: "Agility" },
        ],
      },
      {
        tag: "dyrevelfærd-natur", emoji: "🌿", label: "Dyrevelfærd & Natur", children: [
          { tag: "dyrevelfærd", emoji: "💚", label: "Dyrevelfærd" },
          { tag: "dyrepark", emoji: "🦁", label: "Dyrepark" },
          { tag: "safari-oplevelse", emoji: "🦒", label: "Safari" },
          { tag: "fuglekiggeri-dyr", emoji: "🦅", label: "Fuglekiggeri" },
          { tag: "dyreinternat-vol", emoji: "🐕", label: "Dyreinternat" },
          { tag: "hval-watching", emoji: "🐋", label: "Hvalobservation" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 13. MOTOR & KØRETØJER
  // ══════════════════════════════════════════════
  {
    tag: "motor-køretøjer",
    emoji: "🚗",
    label: "Motor & Køretøjer",
    children: [
      {
        tag: "biler", emoji: "🚗", label: "Biler", children: [
          { tag: "klassiske-biler", emoji: "🏎️", label: "Klassiske biler" },
          { tag: "elbiler", emoji: "⚡", label: "Elbiler" },
          { tag: "tuning", emoji: "🔧", label: "Tuning" },
          { tag: "bil-show", emoji: "🚗", label: "Bilshow" },
          { tag: "roadtrip-bil", emoji: "🛣️", label: "Road Trip" },
          { tag: "autocamper", emoji: "🚐", label: "Autocamper" },
          { tag: "bil-klub", emoji: "🏁", label: "Bilklub" },
        ],
      },
      {
        tag: "motorsport-aktiv", emoji: "🏎️", label: "Motorsport", children: [
          { tag: "karting-aktiv", emoji: "🏎️", label: "Karting" },
          { tag: "rally-aktiv", emoji: "🚗", label: "Rally" },
          { tag: "circuit-racing", emoji: "🏁", label: "Circuit Racing" },
          { tag: "drifting", emoji: "💨", label: "Drifting" },
        ],
      },
      {
        tag: "motorcykler", emoji: "🏍️", label: "Motorcykler", children: [
          { tag: "mc-tur", emoji: "🏍️", label: "MC-tur" },
          { tag: "mc-klub", emoji: "🏍️", label: "MC-klub" },
          { tag: "enduro", emoji: "🌲", label: "Enduro" },
          { tag: "scooter", emoji: "🛵", label: "Scooter" },
          { tag: "custom-mc", emoji: "🔧", label: "Custom MC" },
        ],
      },
      {
        tag: "vandfartøjer", emoji: "⛵", label: "Vandfartøjer", children: [
          { tag: "båd", emoji: "🚤", label: "Båd" },
          { tag: "sejlads-sport", emoji: "⛵", label: "Sejlads" },
          { tag: "speedbåd", emoji: "🚤", label: "Speedbåd" },
          { tag: "jetski", emoji: "🌊", label: "Jetski" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 14. VIDENSKAB & LÆRING
  // ══════════════════════════════════════════════
  {
    tag: "videnskab-læring",
    emoji: "🔬",
    label: "Videnskab & Læring",
    children: [
      {
        tag: "naturvidenskab", emoji: "🔭", label: "Naturvidenskab", children: [
          { tag: "astronomi", emoji: "🔭", label: "Astronomi" },
          { tag: "biologi", emoji: "🦠", label: "Biologi" },
          { tag: "kemi", emoji: "⚗️", label: "Kemi" },
          { tag: "fysik", emoji: "⚡", label: "Fysik" },
          { tag: "matematik", emoji: "📐", label: "Matematik" },
          { tag: "geologi", emoji: "🪨", label: "Geologi" },
          { tag: "oceanografi", emoji: "🌊", label: "Oceanografi" },
          { tag: "meteorologi", emoji: "🌤️", label: "Meteorologi" },
        ],
      },
      {
        tag: "humanvidenskab", emoji: "🧠", label: "Humanvidenskab", children: [
          { tag: "filosofi", emoji: "🤔", label: "Filosofi" },
          { tag: "psykologi", emoji: "🧠", label: "Psykologi" },
          { tag: "historie", emoji: "📜", label: "Historie" },
          { tag: "arkæologi", emoji: "⛏️", label: "Arkæologi" },
          { tag: "antropologi", emoji: "🌍", label: "Antropologi" },
          { tag: "sociologi", emoji: "👥", label: "Sociologi" },
          { tag: "økonomi", emoji: "📊", label: "Økonomi" },
        ],
      },
      {
        tag: "sprogkurser", emoji: "🗣️", label: "Sprog & Kommunikation", children: [
          { tag: "engelsk", emoji: "🇬🇧", label: "Engelsk" },
          { tag: "spansk", emoji: "🇪🇸", label: "Spansk" },
          { tag: "tysk", emoji: "🇩🇪", label: "Tysk" },
          { tag: "fransk", emoji: "🇫🇷", label: "Fransk" },
          { tag: "japansk-sprog", emoji: "🇯🇵", label: "Japansk" },
          { tag: "arabisk", emoji: "🌙", label: "Arabisk" },
          { tag: "retorik", emoji: "🎙️", label: "Retorik" },
          { tag: "debat", emoji: "💬", label: "Debat" },
          { tag: "tegnsprog", emoji: "🤟", label: "Tegnsprog" },
        ],
      },
      {
        tag: "tech-lære", emoji: "💻", label: "Tech & Digital", children: [
          { tag: "programmering-kursus", emoji: "👨‍💻", label: "Programmering" },
          { tag: "ai-lære", emoji: "🤖", label: "AI & Machine Learning" },
          { tag: "robotik-lære", emoji: "🦾", label: "Robotik" },
          { tag: "cybersecurity", emoji: "🔒", label: "Cybersikkerhed" },
          { tag: "dataanalyse", emoji: "📊", label: "Dataanalyse" },
          { tag: "ux-design", emoji: "🖊️", label: "UX Design" },
        ],
      },
      {
        tag: "foredrag-lær", emoji: "🎤", label: "Foredrag & Talks", children: [
          { tag: "inspiration-foredrag", emoji: "✨", label: "Inspiration" },
          { tag: "videnskab-foredrag", emoji: "🔬", label: "Videnskab" },
          { tag: "politik-foredrag", emoji: "🏛️", label: "Politik" },
          { tag: "ted-talks", emoji: "🎤", label: "TED Talks" },
          { tag: "paneldebat", emoji: "💬", label: "Paneldebat" },
          { tag: "netværksforedrag", emoji: "🤝", label: "Netværksforedrag" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 15. BØRN & FAMILIE
  // ══════════════════════════════════════════════
  {
    tag: "børn-familie",
    emoji: "👨‍👩‍👧‍👦",
    label: "Børn & Familie",
    children: [
      {
        tag: "familieaktiviteter", emoji: "👨‍👩‍👧", label: "Familieaktiviteter", children: [
          { tag: "familieudflugter", emoji: "🚗", label: "Familieudflugter" },
          { tag: "familievandring-børn", emoji: "🥾", label: "Familievandring" },
          { tag: "familiecykling", emoji: "🚲", label: "Familiecykling" },
          { tag: "strandtur-familie", emoji: "🏖️", label: "Strandtur" },
          { tag: "picnic", emoji: "🧺", label: "Picnic" },
          { tag: "skattejagt", emoji: "🗺️", label: "Skattejagt" },
        ],
      },
      {
        tag: "børneevents", emoji: "🧸", label: "Børneevents", children: [
          { tag: "børneteater-event", emoji: "🎭", label: "Børneteater" },
          { tag: "baby-events", emoji: "👶", label: "Baby-events" },
          { tag: "børnemusik", emoji: "🎵", label: "Børnemusik" },
          { tag: "børnefestival", emoji: "🎪", label: "Børnefestival" },
          { tag: "legeplads", emoji: "🛝", label: "Legeplads" },
          { tag: "børnebiograf", emoji: "🎬", label: "Børnebiograf" },
          { tag: "julenisse", emoji: "🎅", label: "Juleevents" },
        ],
      },
      {
        tag: "læringsaktiviteter", emoji: "🎓", label: "Læring & Aktiviteter", children: [
          { tag: "svømmeskole-børn", emoji: "🏊", label: "Svømmeskole" },
          { tag: "dyreparker", emoji: "🦁", label: "Dyrepark" },
          { tag: "videnskabscenter", emoji: "🔬", label: "Videnskabscenter" },
          { tag: "museum-børn", emoji: "🏛️", label: "Museum" },
          { tag: "kreative-workshops-børn", emoji: "🎨", label: "Kreative workshops" },
          { tag: "sport-børn", emoji: "⚽", label: "Sport for børn" },
        ],
      },
      {
        tag: "seniorer", emoji: "👴", label: "Seniorer", children: [
          { tag: "senior-aktiviteter", emoji: "👴", label: "Senioraktiviteter" },
          { tag: "petanque", emoji: "🎯", label: "Pétanque" },
          { tag: "senior-yoga", emoji: "🧘", label: "Seniorvoga" },
          { tag: "bridge", emoji: "🃏", label: "Bridge" },
          { tag: "senior-vandring", emoji: "🥾", label: "Seniorvandring" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 16. FRIVILLIGT & COMMUNITY
  // ══════════════════════════════════════════════
  {
    tag: "frivilligt-community",
    emoji: "🤝",
    label: "Frivilligt & Community",
    children: [
      {
        tag: "frivilligt", emoji: "🫲", label: "Frivilligt arbejde", children: [
          { tag: "strandrensning", emoji: "🏖️", label: "Strandrensning" },
          { tag: "genbrugsbutik", emoji: "♻️", label: "Genbrugsbutik" },
          { tag: "dyreinternat", emoji: "🐕", label: "Dyreinternat" },
          { tag: "frivillig-mentoring", emoji: "🎓", label: "Mentoring" },
          { tag: "cleanups", emoji: "🌿", label: "Cleanups" },
          { tag: "socialt-arbejde", emoji: "💙", label: "Socialt arbejde" },
          { tag: "velgørenhed", emoji: "💝", label: "Velgørenhed" },
          { tag: "madbanken", emoji: "🍞", label: "Madbank" },
          { tag: "røde-kors", emoji: "🏥", label: "Røde Kors" },
        ],
      },
      {
        tag: "bæredygtighed", emoji: "🌱", label: "Bæredygtighed & Miljø", children: [
          { tag: "genbrugsprojekter", emoji: "♻️", label: "Genbrugsprojekter" },
          { tag: "miljøaktivisme", emoji: "🌍", label: "Miljøaktivisme" },
          { tag: "urban-dyrkning", emoji: "🥬", label: "Urban dyrkning" },
          { tag: "reparationscafé", emoji: "🔧", label: "Reparationscafé" },
          { tag: "zero-waste", emoji: "🌿", label: "Zero Waste" },
          { tag: "bæredygtig-livsstil", emoji: "💚", label: "Bæredygtig livsstil" },
        ],
      },
      {
        tag: "lokalpolitik", emoji: "🏛️", label: "Politik & Samfund", children: [
          { tag: "lokalpolitik-act", emoji: "🏘️", label: "Lokalpolitik" },
          { tag: "debataften", emoji: "💬", label: "Debataften" },
          { tag: "borgerinddragelse", emoji: "🗳️", label: "Borgerinddragelse" },
          { tag: "klimaaktivisme", emoji: "🌡️", label: "Klimaaktivisme" },
          { tag: "feminisme", emoji: "♀️", label: "Feminisme" },
          { tag: "lgbtq", emoji: "🏳️‍🌈", label: "LGBTQ+" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 17. BUSINESS & NETWORKING
  // ══════════════════════════════════════════════
  {
    tag: "business-networking",
    emoji: "💼",
    label: "Business & Networking",
    children: [
      {
        tag: "netværk", emoji: "🤝", label: "Netværk", children: [
          { tag: "startup", emoji: "🚀", label: "Startup" },
          { tag: "professionelt-net", emoji: "💼", label: "Professionelt" },
          { tag: "business-lunch", emoji: "🍽️", label: "Business Lunch" },
          { tag: "speed-networking", emoji: "⚡", label: "Speed Networking" },
          { tag: "women-in-business", emoji: "👩‍💼", label: "Women in Business" },
          { tag: "alumni", emoji: "🎓", label: "Alumni" },
        ],
      },
      {
        tag: "iværksætteri", emoji: "🚀", label: "Iværksætteri", children: [
          { tag: "pitching", emoji: "🎤", label: "Pitching" },
          { tag: "investor-møde", emoji: "💰", label: "Investor-møde" },
          { tag: "demo-day", emoji: "📱", label: "Demo Day" },
          { tag: "startup-weekend", emoji: "🗓️", label: "Startup Weekend" },
          { tag: "bootcamp-biz", emoji: "🪖", label: "Business Bootcamp" },
        ],
      },
      {
        tag: "konference-event", emoji: "🎙️", label: "Konference & Events", children: [
          { tag: "konference", emoji: "🎙️", label: "Konference" },
          { tag: "workshop-biz", emoji: "🛠️", label: "Workshop" },
          { tag: "hackathon-biz", emoji: "💻", label: "Hackathon" },
          { tag: "coworking", emoji: "🏢", label: "Coworking" },
          { tag: "summermeetup", emoji: "☀️", label: "Sommermøde" },
          { tag: "afterwork", emoji: "🍸", label: "After Work" },
        ],
      },
      {
        tag: "personlig-udvikling-biz", emoji: "📈", label: "Personlig Udvikling", children: [
          { tag: "mentorskab", emoji: "🎓", label: "Mentorskab" },
          { tag: "leder-kursus", emoji: "👤", label: "Lederkursus" },
          { tag: "offentlig-tale", emoji: "🎤", label: "Offentlig Tale" },
          { tag: "forhandling", emoji: "🤝", label: "Forhandling" },
          { tag: "salg-kursus", emoji: "💰", label: "Salgskursus" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 18. FILM & MEDIER
  // ══════════════════════════════════════════════
  {
    tag: "film-medier",
    emoji: "🎬",
    label: "Film & Medier",
    children: [
      {
        tag: "film-bio", emoji: "🎬", label: "Film & Biograf", children: [
          { tag: "biograf", emoji: "🎬", label: "Biograf" },
          { tag: "udendørs-kino", emoji: "🌙", label: "Udendørs kino" },
          { tag: "premiere", emoji: "⭐", label: "Premiere" },
          { tag: "filmklub", emoji: "📽️", label: "Filmklub" },
          { tag: "dokumentar-film", emoji: "📹", label: "Dokumentar" },
          { tag: "kortfilm", emoji: "🎞️", label: "Kortfilm" },
          { tag: "animation", emoji: "✏️", label: "Animation" },
          { tag: "vr-film", emoji: "🥽", label: "VR Film" },
          { tag: "filmfestival-event", emoji: "🎪", label: "Filmfestival" },
        ],
      },
      {
        tag: "genre-film", emoji: "🎭", label: "Genre", children: [
          { tag: "action-film", emoji: "💥", label: "Action" },
          { tag: "komedie-film", emoji: "😂", label: "Komedie" },
          { tag: "horror-film", emoji: "👻", label: "Horror" },
          { tag: "sci-fi-film", emoji: "🚀", label: "Sci-Fi" },
          { tag: "romantik-film", emoji: "💕", label: "Romantik" },
          { tag: "thriller-film", emoji: "😰", label: "Thriller" },
          { tag: "drama-film", emoji: "🎭", label: "Drama" },
        ],
      },
      {
        tag: "serier-streaming", emoji: "📺", label: "Serier & Streaming", children: [
          { tag: "serier", emoji: "📺", label: "Serier" },
          { tag: "netflix-klub", emoji: "🍿", label: "Netflix-klub" },
          { tag: "anime", emoji: "🎌", label: "Anime" },
          { tag: "youtube", emoji: "▶️", label: "YouTube" },
          { tag: "twitch", emoji: "🎮", label: "Twitch" },
        ],
      },
      {
        tag: "medieproduktion", emoji: "🎥", label: "Medieproduktion", children: [
          { tag: "filmproduktion", emoji: "🎥", label: "Filmproduktion" },
          { tag: "podcast-produktion", emoji: "🎙️", label: "Podcast" },
          { tag: "content-creation", emoji: "📱", label: "Content Creation" },
          { tag: "fotografering-media", emoji: "📸", label: "Fotografering" },
          { tag: "grafisk-design", emoji: "🎨", label: "Grafisk design" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 19. ROMANTIK & DATING
  // ══════════════════════════════════════════════
  {
    tag: "romantik-dating",
    emoji: "💕",
    label: "Romantik & Dating",
    children: [
      {
        tag: "single-events", emoji: "💖", label: "Single-events", children: [
          { tag: "speeddating", emoji: "💕", label: "Speeddating" },
          { tag: "single-events-gen", emoji: "💖", label: "Single-events" },
          { tag: "quiz-night-singler", emoji: "❓", label: "Quiz Night Singler" },
          { tag: "hiking-singles", emoji: "🥾", label: "Hiking for singler" },
          { tag: "vinsmagning-singler", emoji: "🍷", label: "Vinsmagning for singler" },
          { tag: "singles-fester", emoji: "🎉", label: "Singlesfest" },
        ],
      },
      {
        tag: "par-aktiviteter", emoji: "💑", label: "Aktiviteter for par", children: [
          { tag: "madlavning-par", emoji: "👫", label: "Madlavning for to" },
          { tag: "dansekursus-par", emoji: "💃", label: "Dansekursus for par" },
          { tag: "par-yoga", emoji: "🧘", label: "Par-yoga" },
          { tag: "par-massage", emoji: "💆", label: "Par-massage" },
          { tag: "romantisk-weekend", emoji: "🌹", label: "Romantisk weekend" },
        ],
      },
      {
        tag: "dating-interesser", emoji: "❤️", label: "Dating-interesser", children: [
          { tag: "aktivitets-dating", emoji: "🏃", label: "Aktivitetsdating" },
          { tag: "kulturel-dating", emoji: "🎭", label: "Kulturdating" },
          { tag: "outdoor-dating", emoji: "🌲", label: "Outdoordating" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 20. LÆRING & UDVIKLING
  // ══════════════════════════════════════════════
  {
    tag: "læring-udvikling",
    emoji: "📚",
    label: "Læring & Udvikling",
    children: [
      {
        tag: "workshop", emoji: "🛠️", label: "Workshop", children: [
          { tag: "kreativt-ws", emoji: "🎨", label: "Kreativt" },
          { tag: "teknologi-ws", emoji: "💻", label: "Teknologi" },
          { tag: "business-ws", emoji: "💼", label: "Business" },
          { tag: "håndværk", emoji: "🔨", label: "Håndværk" },
          { tag: "madlavning-ws", emoji: "👩‍🍳", label: "Madlavning" },
          { tag: "kunst-ws", emoji: "🖌️", label: "Kunst" },
          { tag: "musik-ws", emoji: "🎵", label: "Musik" },
          { tag: "sprog-ws", emoji: "🗣️", label: "Sprog" },
        ],
      },
      {
        tag: "kursus", emoji: "📋", label: "Kursus", children: [
          { tag: "online-kursus", emoji: "💻", label: "Online" },
          { tag: "fysisk-kursus", emoji: "🏫", label: "Fysisk" },
          { tag: "certificering", emoji: "📜", label: "Certificering" },
          { tag: "mba", emoji: "🎓", label: "MBA" },
          { tag: "masterclass", emoji: "👑", label: "Masterclass" },
        ],
      },
      {
        tag: "bøger", emoji: "📚", label: "Bøger & Skrivning", children: [
          { tag: "bogklub-læring", emoji: "📖", label: "Bogklub" },
          { tag: "skrivning-kursus", emoji: "✍️", label: "Skrivning" },
          { tag: "lydbøger-læring", emoji: "🎧", label: "Lydbøger" },
          { tag: "bibliotek", emoji: "🏛️", label: "Bibliotek" },
          { tag: "faglitteratur", emoji: "📕", label: "Faglitteratur" },
          { tag: "selvhjælp", emoji: "💡", label: "Selvhjælp" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 21. SPIRITUALITET & LIVSSYN
  // ══════════════════════════════════════════════
  {
    tag: "spiritualitet-livssyn",
    emoji: "🙏",
    label: "Spiritualitet & Livssyn",
    children: [
      {
        tag: "spirituel-praksis", emoji: "🕯️", label: "Spirituel praksis", children: [
          { tag: "tarot", emoji: "🃏", label: "Tarot" },
          { tag: "astrologi", emoji: "⭐", label: "Astrologi" },
          { tag: "healing-spirit", emoji: "💫", label: "Healing" },
          { tag: "krystal-terapi", emoji: "💎", label: "Krystalterapi" },
          { tag: "chakra", emoji: "🌀", label: "Chakra" },
          { tag: "shamanism", emoji: "🪶", label: "Shamanisme" },
          { tag: "ayurveda", emoji: "🌿", label: "Ayurveda" },
        ],
      },
      {
        tag: "religion-tro", emoji: "🕌", label: "Religion & Tro", children: [
          { tag: "kristendom", emoji: "✝️", label: "Kristendom" },
          { tag: "buddhisme", emoji: "☸️", label: "Buddhisme" },
          { tag: "islam", emoji: "☪️", label: "Islam" },
          { tag: "jødedom", emoji: "✡️", label: "Jødedom" },
          { tag: "hinduisme", emoji: "🕉️", label: "Hinduisme" },
          { tag: "nypaganism", emoji: "🌙", label: "Neopaganisme" },
        ],
      },
      {
        tag: "filosofi-livssyn", emoji: "🤔", label: "Filosofi & Livssyn", children: [
          { tag: "stoicisme", emoji: "🏛️", label: "Stoicisme" },
          { tag: "eksistentialisme", emoji: "💭", label: "Eksistentialisme" },
          { tag: "etik", emoji: "⚖️", label: "Etik" },
          { tag: "humanisme", emoji: "🤝", label: "Humanisme" },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════
  // 22. HAVE & HÅNDVÆRK
  // ══════════════════════════════════════════════
  {
    tag: "have-håndværk",
    emoji: "🌱",
    label: "Have & Håndværk",
    children: [
      {
        tag: "havearbejde", emoji: "🌻", label: "Have", children: [
          { tag: "kolonihave", emoji: "🏡", label: "Kolonihave" },
          { tag: "urban-havearbejde", emoji: "🌱", label: "Urban dyrkning" },
          { tag: "blomster", emoji: "🌸", label: "Blomster" },
          { tag: "grøntsager", emoji: "🥕", label: "Grøntsager" },
          { tag: "permakultur", emoji: "🌿", label: "Permakultur" },
          { tag: "bier", emoji: "🐝", label: "Biavl" },
        ],
      },
      {
        tag: "diy-håndværk", emoji: "🔨", label: "DIY & Håndværk", children: [
          { tag: "snedkeri", emoji: "🪵", label: "Snedkeri" },
          { tag: "smedning", emoji: "⚒️", label: "Smedning" },
          { tag: "maling-istandsæt", emoji: "🖌️", label: "Maling & Istandsættelse" },
          { tag: "el-arbejde", emoji: "⚡", label: "El-arbejde" },
          { tag: "murværk", emoji: "🧱", label: "Murværk" },
          { tag: "reparation", emoji: "🔧", label: "Reparation" },
          { tag: "3d-print-diy", emoji: "🖨️", label: "3D Print" },
          { tag: "metal-arbejde", emoji: "⚙️", label: "Metalarbejde" },
        ],
      },
      {
        tag: "tekstil-sy", emoji: "🧵", label: "Tekstil & Sy", children: [
          { tag: "syning-hobby", emoji: "🧵", label: "Syning" },
          { tag: "strik-hobby", emoji: "🧶", label: "Strik" },
          { tag: "hækling-hobby", emoji: "🧶", label: "Hækling" },
          { tag: "broderi", emoji: "🌸", label: "Broderi" },
          { tag: "quilting", emoji: "🟦", label: "Quilting" },
          { tag: "weaving", emoji: "🟩", label: "Vævning" },
        ],
      },
    ],
  },
];

/* ── Helper: smart match for short vs long queries ── */
function smartMatch(text: string, q: string): boolean {
  const t = text.toLowerCase();
  if (q.length <= 3) {
    return t === q || t.startsWith(q) || t.includes("-" + q) || t.includes(" " + q);
  }
  return t.includes(q);
}

/* ── Flatten: get all tags as flat array (all 3 levels) ── */
export function getAllTagsFlat(): TagNode[] {
  const flat: TagNode[] = [];
  for (const over of TAG_TREE) {
    flat.push({ tag: over.tag, emoji: over.emoji, label: over.label });
    if (over.children) {
      for (const kat of over.children) {
        flat.push({ tag: kat.tag, emoji: kat.emoji, label: kat.label });
        if (kat.children) {
          for (const under of kat.children) {
            flat.push(under);
          }
        }
      }
    }
  }
  return flat;
}

/* ── Search: search across all 3 levels ── */
export function searchTags(query: string): TagNode[] {
  if (!query.trim()) return TAG_TREE.map(p => ({ tag: p.tag, emoji: p.emoji, label: p.label }));

  const q = query.toLowerCase().trim();
  const results: TagNode[] = [];
  const seen = new Set<string>();

  function addIfNew(node: TagNode) {
    if (!seen.has(node.tag)) {
      results.push({ tag: node.tag, emoji: node.emoji, label: node.label });
      seen.add(node.tag);
    }
  }

  for (const over of TAG_TREE) {
    const overMatch = smartMatch(over.tag, q) || smartMatch(over.label, q);

    if (overMatch) {
      // Match on overkategori → show it + all kategorier + all underkategorier
      addIfNew(over);
      if (over.children) {
        for (const kat of over.children) {
          addIfNew(kat);
          if (kat.children) {
            for (const under of kat.children) {
              addIfNew(under);
            }
          }
        }
      }
      continue;
    }

    // Check kategorier
    if (over.children) {
      for (const kat of over.children) {
        const katMatch = smartMatch(kat.tag, q) || smartMatch(kat.label, q);

        if (katMatch) {
          // Match on kategori → show overkategori + kategori + all underkategorier
          addIfNew(over);
          addIfNew(kat);
          if (kat.children) {
            for (const under of kat.children) {
              addIfNew(under);
            }
          }
        } else if (kat.children) {
          // Check underkategorier
          for (const under of kat.children) {
            if (smartMatch(under.tag, q) || smartMatch(under.label, q)) {
              // Match on underkategori → show overkategori + kategori + matching underkategori
              addIfNew(over);
              addIfNew(kat);
              addIfNew(under);
            }
          }
        }
      }
    }
  }

  return results;
}

/* ── Get children of a tag (works at any level) ── */
export function getChildren(tag: string): TagNode[] {
  // Check overkategorier
  for (const over of TAG_TREE) {
    if (over.tag === tag) return over.children || [];
    // Check kategorier
    if (over.children) {
      for (const kat of over.children) {
        if (kat.tag === tag) return kat.children || [];
      }
    }
  }
  return [];
}

/* ── Get parent categories (kategorier — the middle level) ── */
export function getParentCategories(): TagNode[] {
  const cats: TagNode[] = [];
  for (const over of TAG_TREE) {
    if (over.children) {
      for (const kat of over.children) {
        cats.push({ tag: kat.tag, emoji: kat.emoji, label: kat.label });
      }
    }
  }
  return cats;
}

/* ── Get overkategorier (top-level only) ── */
export function getOverkategorier(): TagNode[] {
  return TAG_TREE.map(o => ({ tag: o.tag, emoji: o.emoji, label: o.label }));
}

/**
 * LAZY LOADING SUPPORT — Reduce Initial Bundle Size
 * ───────────────────────────────────────────────────
 * tagTree.ts is 72KB and imported synchronously across 9 files.
 * However, most pages (Udforsk, Kort, Onboarding, CategoryDetail, etc.)
 * don't need tagTree until after initial render.
 *
 * MIGRATION: Pages that don't need tagTree immediately can use dynamic import:
 *
 * BEFORE (blocking initial load):
 *   import { TAG_TREE, searchTags } from "@/lib/tagTree";
 *   const parent = TAG_TREE.find(p => p.tag === "cykling");
 *
 * AFTER (lazy load on demand):
 *   const [tagTree, setTagTree] = useState<TagNode[] | null>(null);
 *   useEffect(() => {
 *     import('@/lib/tagTree').then(m => setTagTree(m.TAG_TREE));
 *   }, []);
 *
 *   if (!tagTree) return <Spinner />; // or render without tag features
 *   const parent = tagTree.find(p => p.tag === "cykling");
 *
 * CANDIDATES for lazy loading (decreasing priority):
 * 1. CategoryDetail.tsx (only 2 uses, non-critical search)
 * 2. Kort.tsx (searchTags called on user input, not on mount)
 * 3. Udforsk.tsx (renders tag tree UI, but not on initial page load)
 * 4. Onboarding.tsx (user opt-in flow, deferred)
 * 5. FirmaRekruttering.tsx (admin page, less critical)
 * 6. FirmaTargeting.tsx (admin page, less critical)
 *
 * KEEP STATIC (always needed):
 * - tagEngine.ts (imported by many features, needed for user tag storage)
 * - newsEngine.ts (news feed, high priority)
 * - FeedTagEditor.tsx (tag UI, immediately visible on pages)
 *
 * Expected savings: ~30-40KB reduction per deferred page
 * (tagTree won't be in critical path for pages 1-5 above)
 */

// Async versions for convenience (mirrors categoryContent pattern)
export async function loadTagTree(): Promise<TagNode[]> {
  return TAG_TREE;
}

export async function loadSearchTags(query: string): Promise<TagNode[]> {
  return searchTags(query);
}
