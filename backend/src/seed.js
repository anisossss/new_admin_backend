import "dotenv/config";
import mongoose from "mongoose";
import Website from "./models/Website.js";
import Article from "./models/Article.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tunisia_news";

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const WEBSITES = [
  {
    name: "Carthage Courier",
    slug: "carthage-courier",
    url: "http://localhost:3001",
    description: "Tunisia's English-language paper of record — measured reporting in a classic broadsheet tradition.",
    language: "en",
    themeColor: "#a41623",
  },
  {
    name: "Tunis Wire",
    slug: "tunis-wire",
    url: "http://localhost:3002",
    description: "Le fil d'actualité tunisien qui ne dort jamais — breaking news, en continu.",
    language: "fr",
    themeColor: "#d4ff3f",
  },
  {
    name: "Médina Post",
    slug: "medina-post",
    url: "http://localhost:3003",
    description: "Magazine culturel et sociétal — la Tunisie racontée avec chaleur, des souks aux oasis.",
    language: "fr",
    themeColor: "#c0573b",
  },
  {
    name: "Jasmine Journal",
    slug: "jasmine-journal",
    url: "http://localhost:3004",
    description: "An airy, considered read on Tunisian life, culture and ideas — white space and one green thread.",
    language: "en",
    themeColor: "#1f7a5c",
  },
  {
    name: "Sahel Express",
    slug: "sahel-express",
    url: "http://localhost:3005",
    description: "L'info qui frappe fort — sport, société et actu chaude du Sahel et de toute la Tunisie.",
    language: "fr",
    themeColor: "#ffd400",
  },
];

const ARTICLES = [
  // ─────────────────────────────────────────────── EN — Carthage Courier + Jasmine Journal
  {
    title: "Record Olive Oil Season Turns Tunisia Into a Global Heavyweight",
    slug: "tunisia-olive-oil-record-exports",
    excerpt:
      "With shipments at historic highs and bottled brands finally winning shelf space abroad, Tunisia's olive oil sector is quietly rewriting its place in the global market.",
    category: "Économie",
    tags: ["olive oil", "exports", "agriculture", "trade"],
    author: { name: "Sarah Mejri" },
    websites: ["carthage-courier", "jasmine-journal"],
    featured: true,
    publishedAt: daysAgo(1.2),
    content: `<p>From the silvery groves of Sfax to the terraced hills of Zaghouan, Tunisia has just closed one of the strongest olive oil campaigns in its modern history. Exporters, millers and the state-run Office National de l'Huile all describe the same picture: near-record volumes leaving the ports of Radès and Sfax, and — more significantly — a growing share of that oil travelling in branded, bottled form rather than in anonymous bulk tankers.</p>
<h2>A harvest that outgrew expectations</h2>
<p>Tunisia is, depending on the season, the world's second or third largest exporter of olive oil, behind Spain and in close contest with Italy and Greece. This campaign benefited from a rare alignment: generous autumn rains across the central groves, mild temperatures during flowering, and a biennial production cycle that swung in the country's favour. Professional bodies estimate output well above the ten-year average, with some southern regions reporting their best yields in a generation.</p>
<p>The windfall matters far beyond the farm gate. Olive oil is consistently among Tunisia's top agricultural exports and one of its most reliable sources of foreign currency. In years of strong harvests, the sector alone can offset a meaningful slice of the national trade deficit — a fact rarely lost on the Ministry of Agriculture when budget season arrives.</p>
<h2>From bulk to bottle</h2>
<p>For decades, the frustration of Tunisian producers could be summed up in one sentence: the country exported excellent oil that other nations bottled, branded and sold at three times the price. That equation is finally shifting. Dozens of Tunisian brands now sit on shelves in Paris, Berlin, Montreal and Dubai, and several have collected gold medals at international competitions in New York and Tokyo.</p>
<p>Industry groups credit a combination of export-support programmes, EU quota access and a new generation of producers who treat extra-virgin oil the way winemakers treat a vintage — with traceability, single-estate labels and harvest-date transparency. <strong>Packaged exports remain a minority of total volume</strong>, but their share has climbed steadily for five consecutive seasons.</p>
<h3>The organic advantage</h3>
<p>Tunisia is also one of the world's largest producers of organic olive oil, a legacy of groves that were never intensively treated in the first place. Buyers in Northern Europe and North America increasingly pay a premium for certified organic Tunisian oil, and certification bodies report long waiting lists of farmers seeking conversion.</p>
<h2>The water question</h2>
<p>Behind the celebration sits a sober reality: the olive tree, hardy as it is, is not immune to the multi-year droughts that have strained Tunisian reservoirs. Agronomists are urging investment in supplemental drip irrigation, drought-resistant varieties and soil-conservation techniques to protect the next decade of harvests, not just the next season.</p>
<p>For now, though, the mood in the groves is unmistakably bright. As one veteran miller in Sfax put it: <em>"The world has always eaten our oil. It is finally learning our name."</em></p>`,
    seo: {
      metaTitle: "Tunisia's Record Olive Oil Season Reshapes Exports",
      metaDescription:
        "Tunisia closes a near-record olive oil campaign as bottled brands win shelf space abroad. What the boom means for trade, farmers and the next harvests.",
      keywords: ["tunisia olive oil", "olive oil exports", "tunisian agriculture", "extra virgin", "organic olive oil", "trade balance"],
    },
  },
  {
    title: "Inside the Startup Renaissance Reshaping Downtown Tunis",
    slug: "tunis-startup-renaissance",
    excerpt:
      "Seven years after the Startup Act, a dense ecosystem of founders, funds and AI engineers is turning the capital into one of Africa's most watched tech scenes.",
    category: "Tech",
    tags: ["startups", "startup act", "tech", "innovation", "ai"],
    author: { name: "Adam Belhadj" },
    websites: ["carthage-courier", "jasmine-journal"],
    featured: false,
    publishedAt: daysAgo(9.4),
    content: `<p>On a weekday morning in the streets around Avenue Habib Bourguiba, the signs of a quiet transformation are easy to miss: a co-working space tucked above a century-old café, a fintech team huddled over laptops in a renovated colonial-era building, a venture fund's nameplate beside a notary's office. Tunis has, almost discreetly, become one of the most productive startup cities on the African continent relative to its size.</p>
<h2>A law that changed the climate</h2>
<p>Much of the momentum traces back to the Startup Act, the 2018 framework law that gave labelled startups tax holidays, simplified currency accounts for international operations, and even a state-backed salary for founders during their first year. Several hundred companies now carry the label, and the model has been studied — and partially copied — by lawmakers from Dakar to Kigali.</p>
<p>The law did not fix everything. Founders still wrestle with foreign-exchange restrictions when paying for cloud services or receiving investment, and the banking system remains conservative. But it did something subtler and arguably more important: it told a generation of engineers that building a company at home was a legitimate career.</p>
<h2>From outsourcing to ownership</h2>
<p>Tunisia's deep bench of engineering talent — the country graduates thousands of ICT engineers every year — long served European clients through outsourcing contracts. The new generation wants equity instead of invoices. The watershed moment came when InstaDeep, the AI company founded in Tunis by Karim Beguir and Zohra Slim, was acquired by Germany's BioNTech in a deal worth hundreds of millions of euros — the largest exit in the history of the Tunisian ecosystem.</p>
<blockquote><p>"InstaDeep proved the ceiling was imaginary. Every founder in Tunis recalibrated their ambitions overnight."</p></blockquote>
<p>That recalibration is visible across sectors: agritech platforms connecting smallholder farmers to markets, healthtech companies digitising clinics, and a wave of applied-AI studios serving clients in Europe and the Gulf from offices in the Lac district and the Technopark of El Ghazala.</p>
<h3>The diaspora dividend</h3>
<p>Another engine is the returning diaspora. Engineers and product managers who spent a decade in Paris, Berlin or Montreal are coming home to found or join startups, bringing networks and standards with them. Remote work has amplified the effect: many keep European salaries while living — and increasingly investing — in Tunis.</p>
<h2>What founders still need</h2>
<p>Ecosystem veterans are clear-eyed about the gaps: seed funding has improved, but Series A and beyond still usually requires foreign investors; administrative friction persists; and the brain drain has not stopped, merely slowed. Their wish list is short and consistent — faster currency reform, deeper local capital, and procurement rules that let startups sell to the state.</p>
<p>Still, on the terraces where founders trade term-sheet stories over mint tea, the consensus is striking. The question is no longer whether Tunis can produce world-class companies. It is how many, and how soon.</p>`,
    seo: {
      metaTitle: "Tunis Startup Renaissance: Africa's Quiet Tech Capital",
      metaDescription:
        "Seven years after the Startup Act, Tunis hosts one of Africa's densest tech ecosystems. Inside the funds, founders and AI talent driving the boom.",
      keywords: ["tunis startups", "startup act tunisia", "instadeep", "african tech", "ai tunisia", "venture capital"],
    },
  },
  {
    title: "Sidi Bou Saïd Confronts the Cost of Its Own Beauty",
    slug: "sidi-bou-said-tourism-balance",
    excerpt:
      "The blue-and-white village above the Gulf of Tunis draws more visitors than ever. Residents and conservators are asking how much fame a 1,300-person village can absorb.",
    category: "Société",
    tags: ["tourism", "sidi bou saïd", "heritage", "overtourism"],
    author: { name: "Lina Chaabane" },
    websites: ["carthage-courier", "jasmine-journal"],
    featured: false,
    publishedAt: daysAgo(6.8),
    content: `<p>By ten in the morning, the cobbled climb of Rue Habib Thameur is already a slow river of sunhats and selfie sticks. By noon, the queue for a glass of pine-nut tea at Café des Nattes curls past the mosque. Sidi Bou Saïd — the cliff-top village whose blue shutters and whitewashed walls have become visual shorthand for Tunisia itself — is having its busiest seasons on record, and not everyone is celebrating.</p>
<h2>A village built on light</h2>
<p>The village owes its famous palette to a 1915 protection decree — among the first heritage-conservation orders in the world — championed by the French painter and musicologist Baron Rodolphe d'Erlanger, whose palace, Ennejma Ezzahra, still crowns the hillside and houses a centre for Arab and Mediterranean music. The decree froze the village's colours and forms: white lime walls, blue mashrabiya windows, studded doors framed in ochre stone.</p>
<p>That century-old foresight is precisely what now draws coach tours from the cruise terminal at La Goulette, day-trippers on the TGM railway, and a steady stream of influencers chasing the same three photogenic doorways.</p>
<h2>The crowds and the cracks</h2>
<p>Local associations point to the strains: souvenir shops replacing grocers and bakers, rents that push young families down the hill, and foot traffic eroding steps that were never engineered for millions of soles. Conservation architects warn that ad-hoc renovations — a satellite dish here, a rooftop extension there — chip away at the ensemble the 1915 decree was meant to protect.</p>
<blockquote><p>"We are not a postcard. We are a parish, a market, a school run. The village must stay alive, not just photogenic," says a member of the local heritage association.</p></blockquote>
<h3>Lessons from elsewhere</h3>
<p>Municipal officials have studied how Santorini, Chefchaouen and the Cinque Terre manage similar pressures: timed entry for tour groups, incentives for artisan businesses over souvenir importers, and strict permitting for façade works. Pilot measures under discussion include a residents-first parking scheme and a charter for tour operators that staggers coach arrivals across the day.</p>
<h2>Living village or open-air museum?</h2>
<p>The stakes go beyond one village. Sidi Bou Saïd anchors the tourist circuit that links Carthage's ruins to the beaches of La Marsa, and its image sells Tunisia abroad more effectively than any campaign. Getting the balance right — welcoming the world without dissolving the place the world comes to see — has become a test case for heritage tourism across the country.</p>
<p>In the late afternoon, when the tour groups drain away and the light turns the Gulf of Tunis to hammered silver, the village briefly belongs to its residents again. The question on every doorstep is how to make that feeling last longer than an hour.</p>`,
    seo: {
      metaTitle: "Sidi Bou Saïd and the Price of Picture-Perfect Fame",
      metaDescription:
        "Record visitor numbers are testing Tunisia's most photogenic village. How Sidi Bou Saïd is trying to stay a living community, not an open-air museum.",
      keywords: ["sidi bou said", "tunisia tourism", "overtourism", "heritage conservation", "blue and white village", "gulf of tunis"],
    },
  },
  {
    title: "The Bardo Reborn: How Tunisia's Greatest Museum Found Its Voice Again",
    slug: "bardo-museum-new-chapter",
    excerpt:
      "Home to the world's most important collection of Roman mosaics, the Bardo National Museum is drawing new crowds — and rethinking who it speaks to.",
    category: "Culture",
    tags: ["bardo museum", "mosaics", "heritage", "museums", "history"],
    author: { name: "Nour El Houda Slim" },
    websites: ["carthage-courier", "jasmine-journal"],
    featured: false,
    publishedAt: daysAgo(11.5),
    content: `<p>There is a moment, standing beneath the coffered ceilings of the former beylical palace in the western suburbs of Tunis, when the floor itself seems to breathe. Spread across the walls and pavements of the Bardo National Museum lies the densest collection of Roman mosaics anywhere on earth — thousands of square metres of tesserae depicting fishing fleets, banquets, gods and grain harvests from Africa Proconsularis, the province that fed Rome.</p>
<h2>The world's finest Roman mosaics</h2>
<p>The museum's signature piece needs little introduction: the third-century portrait of the poet Virgil flanked by the muses Clio and Melpomene, discovered in Sousse and believed to be the only surviving contemporary likeness of the author of the Aeneid. Around it orbit masterworks from Dougga, El Jem, Carthage and Utica — the triumph of Neptune, the binding of Ulysses to his mast, scenes of rural estates so detailed that historians read them like census documents.</p>
<p>The setting amplifies the collection. The Bardo occupies a 19th-century Husseinite palace whose carved stucco, painted ceilings and tiled courtyards are exhibits in their own right, joined to a modern wing of raw concrete and filtered light added during the museum's major extension.</p>
<h2>Reopening and renewal</h2>
<p>After a period of closure, the museum reopened its doors in 2023 with restored galleries and a renewed sense of purpose. Curators used the pause to rethink the visitor journey: clearer chronological routes, bilingual interpretation, improved lighting that lets the smallest tesserae catch the eye, and a calmer presentation of the palace's ceremonial rooms.</p>
<p>The museum has also leaned into its role as a civic symbol. Concerts in the courtyard, temporary exhibitions pairing ancient works with contemporary Tunisian artists, and late openings during Ramadan have pulled in audiences who once thought of the Bardo as a place you visit twice: once on a school trip, once with foreign guests.</p>
<h3>A museum for Tunisians first</h3>
<p>That shift is deliberate. Education teams now run year-round workshops where children assemble their own mosaics, and partnerships with the Ministry of Education have made the museum a standard stop in the national curriculum. Attendance figures increasingly show what curators call the most important metric: <strong>repeat visits by Tunisian families</strong>.</p>
<p>International recognition continues — loan requests from major museums arrive constantly, and the Bardo's conservation workshop trains mosaic restorers from across North Africa. But the institution's quiet revolution is local. As one curator put it, the mosaics survived seventeen centuries in Tunisian soil; the museum's task is to make sure they live in Tunisian imaginations too.</p>`,
    seo: {
      metaTitle: "Bardo Museum Reborn: Inside Tunisia's Mosaic Treasury",
      metaDescription:
        "The Bardo National Museum, home to the world's greatest Roman mosaics, is drawing new crowds with restored galleries and a Tunisians-first mission.",
      keywords: ["bardo museum", "roman mosaics", "virgil mosaic", "tunis museums", "tunisian heritage", "carthage"],
    },
  },
  {
    title: "Tunisia Bets on the Sahara Sun to Rewire Its Energy Future",
    slug: "tunisia-solar-energy-transition",
    excerpt:
      "With a 35 percent renewables target for 2030 and a subsea cable to Italy on the drawing board, Tunisia is turning its southern desert into an energy asset.",
    category: "Économie",
    tags: ["renewable energy", "solar", "elmed", "energy transition", "sahara"],
    author: { name: "Omar Fendri" },
    websites: ["carthage-courier"],
    featured: false,
    publishedAt: daysAgo(4.3),
    content: `<p>Drive south from Gabès towards Tataouine and the landscape makes the argument by itself: vast, flat, cloudless. Tunisia's deep south receives some of the most reliable solar irradiation in the Mediterranean basin, and after years of studies, tenders and false starts, the country is finally moving to convert that sunlight into a pillar of its economy.</p>
<h2>A 35 percent target</h2>
<p>Tunisia's official energy strategy calls for renewables to supply 35 percent of electricity by 2030 — an ambitious leap for a grid that has historically run almost entirely on natural gas, much of it imported from Algeria. Successive tender rounds have awarded hundreds of megawatts of solar capacity to developers in Kairouan, Gafsa, Sidi Bouzid and Tataouine, with the national utility STEG contracted as the buyer.</p>
<p>The economics are compelling. Every megawatt-hour of solar power displaces imported gas paid for in scarce foreign currency, and recent tenders have produced some of the lowest solar prices recorded in North Africa. For a state budget strained by energy subsidies, the arithmetic is hard to ignore.</p>
<h2>ELMED: a cable to Europe</h2>
<p>The boldest piece of the puzzle runs under the sea. The ELMED interconnector — a roughly 200-kilometre high-voltage link between Cap Bon and Sicily, developed jointly by STEG and Italy's Terna with European Union backing — would for the first time connect the North African and European grids through Tunisia. Designed for 600 megawatts, the cable would let Tunisia import power when needed and, eventually, export desert sunlight to European consumers.</p>
<p>Energy economists describe ELMED as a geopolitical instrument as much as an electrical one: it anchors Tunisia in Europe's energy planning at the very moment the continent is hungry for low-carbon imports.</p>
<h3>Beyond the megaprojects</h3>
<p>The transition is also happening at rooftop scale. The long-running PROSOL programme has put solar water heaters on hundreds of thousands of Tunisian homes, and net-metering rules allow households and businesses to feed surplus power from rooftop panels into the grid. Farmers in the centre of the country increasingly pair drip irrigation with solar pumping, cutting diesel costs.</p>
<p>Obstacles remain — grid reinforcement, land tenure in the south, the pace of administrative approvals — and analysts caution that targets have slipped before. But the direction is set, the costs keep falling, and the resource above Tataouine is not going anywhere. As one engineer at a recently commissioned solar park put it: <em>"We spent a century importing energy. The next century, the energy is already here."</em></p>`,
    seo: {
      metaTitle: "Tunisia's Solar Bet: Sahara Sun and a Cable to Europe",
      metaDescription:
        "Tunisia targets 35% renewable electricity by 2030, backed by desert solar parks and the ELMED subsea link to Italy. Inside the energy transition.",
      keywords: ["tunisia solar", "elmed interconnector", "renewable energy tunisia", "energy transition", "steg", "north africa energy"],
    },
  },
  {
    title: "Jasmine Season: The Scent That Sets the Tunisian Summer's Clock",
    slug: "jasmine-harvest-tunisian-summer",
    excerpt:
      "Every June, the white flower that gave Tunisia its national symbol begins its nightly bloom — feeding a ritual economy of pickers, threaders and evening vendors.",
    category: "Culture",
    tags: ["jasmine", "traditions", "summer", "craft", "cap bon"],
    author: { name: "Yasmine Karoui" },
    websites: ["jasmine-journal"],
    featured: false,
    publishedAt: daysAgo(2.6),
    content: `<p>The flower works at night. Jasmine buds picked in the cool hours before dawn stay closed until evening, when they open all at once and release the scent that, for Tunisians, simply means summer. From June to September, that nightly bloom sets a quiet clockwork in motion across the country — in the gardens of Cap Bon, the alleys of Sidi Bou Saïd and the café terraces of every coastal town.</p>
<h2>Picked before dawn</h2>
<p>In the villages around Soliman and Dar Chaabane, picking begins around four in the morning, when the buds are tight and the heat has not yet bruised them. Families move along rows of shrubs by headlamp, filling shallow baskets with thousands of pale commas of flower. Speed matters: a bud picked too late opens in the basket and is worthless by evening.</p>
<p>The harvest is overwhelmingly a household economy — grandmothers, students on summer break, neighbours paid by the basket. The best pickers are spoken of with the respect reserved elsewhere for master craftsmen.</p>
<h2>The machmoum, a wearable ritual</h2>
<p>The picked buds travel to the threaders, who bind them around stiff stems of esparto grass into the <strong>machmoum</strong> — the tight, cone-shaped bouquet that is Tunisia's signature ornament. Tucked behind the ear (the right side, tradition says, for the unmarried; the left for the spoken-for), handed to guests, hung from rear-view mirrors, the machmoum is less a product than a gesture: a way of offering the evening to someone.</p>
<blockquote><p>"You do not buy a machmoum because you need it. You buy it because the night smells better shared."</p></blockquote>
<p>The vendors — often boys balancing trays of bouquets, calling out through café terraces — are as much a part of the summer soundscape as the cicadas. In Sidi Bou Saïd, a machmoum pressed into a visitor's hand has sealed a thousand first impressions of the country.</p>
<h3>An economy of small hands</h3>
<p>Beyond the ritual, jasmine is serious agriculture. Tunisian jasmine extract has long interested perfumers, and exporters of natural absolutes count the country among the Mediterranean's historic growing regions, alongside Grasse and the Nile Delta. Cooperatives in Cap Bon have begun experimenting with controlled extraction to capture more value locally rather than shipping raw flowers.</p>
<p>Climate pressure is real — jasmine drinks deeply, and drought years thin the bloom — and growers are testing shade nets and drip lines to protect the shrubs. But the season, so far, keeps its promise. The proof arrives every evening around seven, when the first trays of machmoum appear and an entire coastline turns its head toward the scent.</p>`,
    seo: {
      metaTitle: "Jasmine Season in Tunisia: A Ritual Economy of Scent",
      metaDescription:
        "From pre-dawn picking in Cap Bon to evening machmoum vendors, Tunisia's jasmine harvest is a craft, an economy and the smell of summer itself.",
      keywords: ["tunisian jasmine", "machmoum", "jasmine harvest", "cap bon", "tunisia traditions", "national flower"],
    },
  },

  // ─────────────────────────────────────────────── FR — Tunis Wire / Médina Post / Sahel Express
  {
    title: "Les Aigles de Carthage lancent leur opération reconquête vers la CAN 2027",
    slug: "aigles-carthage-route-can-2027",
    excerpt:
      "Nouveau cycle, nouvelle ossature : la sélection tunisienne entame sa campagne vers la Coupe d'Afrique des nations 2027 avec une génération à intégrer et un public à reconquérir.",
    category: "Sport",
    tags: ["équipe nationale", "can 2027", "football", "aigles de carthage"],
    author: { name: "Walid Jaziri" },
    websites: ["tunis-wire", "medina-post", "sahel-express"],
    featured: true,
    publishedAt: daysAgo(0.7),
    content: `<p>Le rendez-vous est pris. À l'horizon de la Coupe d'Afrique des nations 2027, organisée pour la première fois en Afrique de l'Est par le trio Kenya–Ouganda–Tanzanie, la sélection tunisienne ouvre un nouveau chapitre. Après des campagnes continentales en demi-teinte qui ont laissé le public de Radès sur sa faim, le mot d'ordre du staff technique tient en un mot : reconstruction.</p>
<h2>Un nouveau cycle, de nouvelles ambitions</h2>
<p>Le constat est partagé jusque dans les travées du stade Hammadi-Agrebi : les Aigles de Carthage, quarts-de-finalistes historiques et vainqueurs de l'édition 2004 à domicile, n'ont plus dépassé ce cap depuis trop longtemps. La fédération a fixé un objectif clair pour le prochain cycle — retrouver le dernier carré continental — et donné au staff le temps long que réclame ce type de chantier.</p>
<p>La feuille de route passe par les éliminatoires, où la Tunisie aborde son groupe avec le statut de tête de série mais sans le droit à l'arrogance : les dernières campagnes ont rappelé qu'aucun déplacement africain ne se gagne sur le papier.</p>
<h2>Une génération à intégrer</h2>
<p>Le vivier ne manque pas. Entre les cadres évoluant en Europe, les révélations du championnat national et une liste croissante de binationaux séduits par le projet, la concurrence fait rage à presque tous les postes. Le staff assume une politique de rajeunissement progressif : les jeunes issus des sélections U20 et U23, brillants lors des derniers tournois de catégorie, frappent à la porte.</p>
<ul>
<li>En défense, la relève s'appuie sur des profils formés à l'Espérance, au Club Africain et à l'Étoile du Sahel ;</li>
<li>au milieu, la création reste le chantier prioritaire identifié par les observateurs ;</li>
<li>devant, la concurrence entre les attaquants expatriés relance une animation offensive longtemps critiquée.</li>
</ul>
<h3>Radès, douzième homme à reconquérir</h3>
<p>Reste la question du public. Les dernières affluences en matchs officiels ont rappelé que la ferveur ne se décrète pas. <strong>La reconquête des tribunes passera par le jeu</strong>, répète-t-on au sein du staff, conscient qu'une qualification ne suffira pas : c'est la manière qui ramènera les familles à Radès.</p>
<p>Le calendrier offre aux Aigles une rampe de lancement idéale : deux journées d'éliminatoires avant la trêve, puis une fenêtre de matchs amicaux contre des adversaires de calibre mondialiste. De quoi roder une ossature avant les échéances qui comptent. La route vers l'Afrique de l'Est commence maintenant — et cette fois, la Tunisie veut la parcourir en favorite assumée.</p>`,
    seo: {
      metaTitle: "CAN 2027 : les Aigles de Carthage en reconquête",
      metaDescription:
        "Nouveau cycle pour la sélection tunisienne : jeunes talents, binationaux et objectif dernier carré à la CAN 2027. Le point sur la feuille de route.",
      keywords: ["équipe de tunisie", "can 2027", "aigles de carthage", "éliminatoires", "football tunisien", "radès"],
    },
  },
  {
    title: "Festival de Carthage : une affiche entre légendes et nouvelles scènes",
    slug: "festival-carthage-programmation",
    excerpt:
      "L'amphithéâtre romain s'apprête à rallumer ses projecteurs : la nouvelle édition du Festival international de Carthage promet un équilibre entre grandes voix arabes et création tunisienne.",
    category: "Culture",
    tags: ["festival de carthage", "musique", "été", "spectacles"],
    author: { name: "Selma Trabelsi" },
    websites: ["tunis-wire", "medina-post", "sahel-express"],
    featured: true,
    publishedAt: daysAgo(3.1),
    content: `<p>Chaque été, le même miracle se reproduit sur la colline de Carthage : un amphithéâtre romain du IIe siècle se remplit de milliers de spectateurs venus écouter, sous les étoiles, ce que la scène arabe et internationale compte de plus vibrant. La nouvelle édition du Festival international de Carthage s'annonce, et avec elle le rituel national des soirées de juillet et d'août.</p>
<h2>L'amphithéâtre romain, écrin d'un rendez-vous national</h2>
<p>Né en 1964, le festival est le doyen des grands rendez-vous culturels tunisiens et l'un des plus anciens du monde arabe. Sur ses gradins de pierre se sont succédé Oum Kalthoum, Fairouz, Miriam Makeba, James Brown ou Cheb Khaled — une mémoire sonore que chaque édition vient prolonger. Pour des générations de Tunisiens, « monter à Carthage » un soir d'été relève moins de la sortie culturelle que du pèlerinage familial.</p>
<p>La direction du festival promet cette année une programmation « fidèle à l'ADN du lieu » : grandes voix arabes en têtes d'affiche, soirées dédiées aux musiques du monde, et une place renforcée pour les productions tunisiennes.</p>
<h2>Entre légendes arabes et création tunisienne</h2>
<p>C'est l'équilibre le plus scruté par les habitués : celui entre les stars régionales qui remplissent les gradins et les artistes locaux qui font la sève du festival. Les dernières éditions ont montré la voie, avec des créations 100 % tunisiennes — spectacles choraux, hommages au malouf, fusions électro-traditionnelles — qui ont rivalisé d'affluence avec les plus grands noms du Machrek.</p>
<blockquote><p>« Carthage n'est pas une salle de concert, c'est un théâtre de mémoire. Ce qui s'y joue doit être à la hauteur des pierres », confie un programmateur historique du festival.</p></blockquote>
<h3>Un enjeu économique pour tout l'été</h3>
<p>Au-delà de l'affiche, le festival irrigue toute une économie saisonnière : hôtellerie de la banlieue nord, restaurateurs de Sidi Bou Saïd et de La Marsa, taxis, artisans et vendeurs de machmoum trouvent dans ces six semaines un pic d'activité comparable aux meilleures années touristiques. Les soirées de Carthage s'inscrivent dans une constellation de festivals — Hammamet, Sousse, El Jem et sa féerie symphonique — qui font de l'été tunisien une saison culturelle à part entière.</p>
<p>Les billets des premières têtes d'affiche partent traditionnellement en quelques heures. Une certitude demeure, elle, inchangée depuis soixante ans : quand les projecteurs s'allument sur la scène de l'amphithéâtre et que la brise marine traverse les gradins, la Tunisie entière a rendez-vous avec elle-même.</p>`,
    seo: {
      metaTitle: "Festival de Carthage : l'affiche de la nouvelle édition",
      metaDescription:
        "Grandes voix arabes, créations tunisiennes et soirées sous les étoiles : ce qui attend le public de l'amphithéâtre romain pour la nouvelle édition.",
      keywords: ["festival de carthage", "amphithéâtre carthage", "concerts tunisie", "été culturel", "musique arabe", "spectacles tunis"],
    },
  },
  {
    title: "Dans la médina de Tunis, la restauration patiente d'un trésor vivant",
    slug: "medina-tunis-restauration-patrimoine",
    excerpt:
      "Classée au patrimoine mondial de l'UNESCO depuis 1979, la médina de Tunis fait l'objet de chantiers de restauration qui veulent sauver les pierres sans chasser les habitants.",
    category: "Société",
    tags: ["médina de tunis", "patrimoine", "unesco", "restauration", "artisanat"],
    author: { name: "Aïcha Gharbi" },
    websites: ["tunis-wire", "medina-post", "sahel-express"],
    featured: false,
    publishedAt: daysAgo(8.2),
    content: `<p>Il faut lever les yeux dans la rue du Pacha pour comprendre l'ampleur de la tâche : au-dessus des étals et des passants, des façades du XVIIIe siècle attendent, sous les étais, la main qui les sauvera. La médina de Tunis, inscrite au patrimoine mondial de l'UNESCO depuis 1979, est à la fois l'un des ensembles urbains arabes les mieux préservés au monde et un chantier permanent que se partagent institutions, associations et habitants.</p>
<h2>Sept siècles de pierre, sept cents monuments</h2>
<p>Fondée au VIIe siècle autour de la mosquée Zitouna, la médina concentre sur moins de trois kilomètres carrés près de 700 monuments classés : palais, medersas, fondouks, zaouïas, souks couverts et demeures patriciennes. C'est ce tissu — pas seulement ses joyaux, mais la trame ordinaire des ruelles — que protège l'inscription de l'UNESCO.</p>
<p>Depuis plus de cinquante ans, l'Association de sauvegarde de la médina de Tunis (ASM) joue les chefs d'orchestre : inventaires, plans de sauvegarde, restaurations exemplaires comme celles du quartier Hafsia, qui valurent à la ville deux prix Aga Khan d'architecture. Son credo n'a pas varié : une médina-musée serait une médina morte.</p>
<h2>Des chantiers écoles pour les mains de demain</h2>
<p>Le nerf de la guerre n'est pas que financier : il est humain. Stucateurs, spécialistes du bois peint, poseurs de kadhal, maîtres de la chaux traditionnelle — les savoir-faire qui ont bâti la médina se transmettent de moins en moins. Pour inverser la tendance, plusieurs chantiers de restauration fonctionnent désormais en « chantiers écoles », où des jeunes apprennent les gestes anciens sur les monuments mêmes qu'ils contribuent à sauver.</p>
<blockquote><p>« Restaurer un plafond peint, c'est un dialogue avec l'artisan d'il y a deux siècles. On ne répare pas, on répond », explique une architecte du patrimoine engagée sur un palais de la rue Sidi-Brahim.</p></blockquote>
<h3>Habiter un monument</h3>
<p>Car la médina n'est pas un décor : plus de 100 000 personnes y vivent et y travaillent. Les défis sont ceux d'un centre ancien habité — vétusté, statuts fonciers enchevêtrés, spéculation naissante autour des maisons d'hôtes. Les acteurs du secteur plaident pour un équilibre : encourager la réhabilitation privée, encadrer la touristification, et maintenir coûte que coûte commerces de proximité et ateliers d'artisans.</p>
<p>Les signaux positifs se multiplient : cafés culturels dans des fondouks restaurés, jeunes créateurs installés dans les souks, visiteurs plus curieux des cours cachées que des seules échoppes de souvenirs. La médina de Tunis a traversé treize siècles en restant vivante. C'est précisément cette vie, disent ses défenseurs, qui demeure son meilleur plan de sauvegarde.</p>`,
    seo: {
      metaTitle: "Médina de Tunis : restaurer sans chasser les habitants",
      metaDescription:
        "Chantiers écoles, savoir-faire artisanaux, équilibre entre tourisme et vie de quartier : comment la médina de Tunis, classée UNESCO, prépare son avenir.",
      keywords: ["médina de tunis", "patrimoine unesco", "restauration", "asm tunis", "artisanat tunisien", "centre historique"],
    },
  },
  {
    title: "Deglet Nour : à Tozeur, une saison record qui interroge l'avenir des oasis",
    slug: "deglet-nour-tozeur-saison-record",
    excerpt:
      "Les exportations de la « datte de lumière » battent des records et font du Djérid un pilier du commerce extérieur. Mais sous les palmes, la question de l'eau devient brûlante.",
    category: "Économie",
    tags: ["dattes", "deglet nour", "tozeur", "oasis", "export"],
    author: { name: "Mehdi Bouazizi" },
    websites: ["medina-post", "sahel-express"],
    featured: false,
    publishedAt: daysAgo(12.6),
    content: `<p>On l'appelle la « datte de lumière » : tenue à contre-jour, la Deglet Nour laisse voir son noyau à travers une chair ambrée et translucide. C'est elle qui a fait la réputation mondiale des oasis du Djérid, et c'est elle encore qui vient d'offrir à la Tunisie l'une de ses meilleures saisons d'exportation, confirmant le pays parmi les tout premiers exportateurs mondiaux de dattes en valeur.</p>
<h2>Un fruit qui pèse lourd dans la balance commerciale</h2>
<p>D'octobre aux dernières expéditions du printemps, les stations de conditionnement de Tozeur, Kébili et Douz tournent à plein régime. Triées, calibrées, parfois dénoyautées ou enrobées, les dattes tunisiennes partent vers plus de quatre-vingts marchés — Maroc, France, Italie, Allemagne, Asie du Sud-Est — avec un pic traditionnel à l'approche du mois de Ramadan, dont la datte est le fruit emblématique.</p>
<p>Pour les régions du Sud-Ouest, l'enjeu dépasse la statistique : la filière fait vivre des dizaines de milliers de familles, du grimpeur de palmier au transporteur frigorifique, et constitue avec le tourisme saharien l'épine dorsale de l'économie locale.</p>
<h2>L'eau, talon d'Achille du Djérid</h2>
<p>Mais le record cache une équation de plus en plus tendue. Le palmier dattier est un gros buveur, et les oasis puisent dans des nappes fossiles qui se rechargent peu ou pas. La multiplication d'extensions privées hors des oasis historiques, forées parfois sans autorisation, inquiète hydrologues et agronomes : à force de pomper, c'est tout l'écosystème oasien — ses trois étages de cultures, son microclimat, ses ombrages — qui se fragilise.</p>
<ul>
<li>Les périmètres irrigués modernes privilégient la monoculture de la Deglet Nour, plus rentable mais plus vulnérable ;</li>
<li>les oasis anciennes, elles, perdent leurs jeunes bras au profit des villes ;</li>
<li>et les épisodes de chaleur extrême compliquent la pollinisation comme le séchage des régimes.</li>
</ul>
<h3>Moderniser sans dénaturer</h3>
<p>Les réponses existent et s'expérimentent déjà : irrigation au goutte-à-goutte enterré, réutilisation des eaux de drainage, valorisation des sous-produits du palmier, labels biologiques et indications de provenance qui tirent les prix vers le haut plutôt que les volumes. Des coopératives de Hazoua et de Nefta démontrent qu'une oasis traditionnelle bien conduite peut rester compétitive tout en économisant l'eau.</p>
<p>Le débat, désormais, est moins technique que stratégique : quelle part de la rente dattière réinvestir dans la durabilité des oasis qui la produisent ? De la réponse dépendra la couleur des prochaines décennies dans le Djérid — celle, dorée, de la Deglet Nour, ou celle, grise, des palmeraies épuisées.</p>`,
    seo: {
      metaTitle: "Deglet Nour : saison record et défi de l'eau à Tozeur",
      metaDescription:
        "Exportations record pour la datte tunisienne, mais les nappes du Djérid s'épuisent. Enquête sur une filière phare face au défi de la durabilité.",
      keywords: ["deglet nour", "dattes tunisie", "tozeur", "oasis djérid", "exportation dattes", "stress hydrique"],
    },
  },
  {
    title: "Handball : la Tunisie veut retrouver son trône africain",
    slug: "handball-tunisie-trone-africain",
    excerpt:
      "Dix titres continentaux, une école reconnue, mais une concurrence égyptienne devenue féroce : le sept tunisien prépare sa reconquête de l'Afrique avec une génération régénérée.",
    category: "Sport",
    tags: ["handball", "équipe nationale", "championnat d'afrique", "sport tunisien"],
    author: { name: "Karim Ben Romdhane" },
    websites: ["tunis-wire", "sahel-express"],
    featured: false,
    publishedAt: daysAgo(5.5),
    content: `<p>Dans le panthéon du sport tunisien, le handball occupe une place à part. Dix fois championne d'Afrique, habituée des Mondiaux depuis un demi-siècle, la sélection nationale a longtemps régné sans partage sur le continent aux côtés de son éternel rival égyptien. Mais les dernières éditions du championnat d'Afrique ont rappelé une vérité dérangeante : le trône s'est éloigné, et sa reconquête est devenue l'obsession de toute une discipline.</p>
<h2>Une tradition de géant</h2>
<p>L'âge d'or reste gravé dans les mémoires : le sacre mondial junior, les épopées des Mondiaux à domicile en 2005 — et cette demi-finale planétaire qui avait fait vibrer tout le pays — puis les générations dorées emmenées par des gauchers de légende. Le handball est, avec le football, le seul sport collectif tunisien à remplir les salles d'El Menzah et de Radès les soirs de derby continental.</p>
<p>La rivalité avec l'Égypte structure toute la discipline : finales à répétition, transferts croisés, débats sans fin sur les écoles de formation. Ces dernières années, les Pharaons, professionnalisés à marche forcée, ont pris l'ascendant. La Tunisie, elle, a connu un passage à vide que les techniciens attribuent moins au talent qu'à la transition générationnelle mal anticipée.</p>
<h2>Le réservoir des clubs</h2>
<p>La bonne nouvelle vient des salles. L'Espérance de Tunis et le Club Africain continuent de dominer les compétitions africaines de clubs, l'Étoile du Sahel et El Makarem de Mahdia alimentent la sélection en jeunes talents, et les centres de formation fédéraux ont relancé le travail à la base. Plusieurs internationaux évoluent désormais dans les championnats français, allemand et polonais — une exposition au très haut niveau dont le sept national récolte les fruits.</p>
<blockquote><p>« Notre école n'a jamais cessé de produire. Ce qui nous a manqué, c'est la continuité du projet entre deux générations », analyse un ancien international devenu formateur.</p></blockquote>
<h3>Objectif : l'Afrique, puis le monde</h3>
<p>La feuille de route fédérale est assumée : remonter sur le toit du continent lors de la prochaine Coupe d'Afrique des nations, condition d'une qualification directe aux échéances mondiales et olympiques, et y arriver avec un collectif rajeuni autour de trois ou quatre cadres expatriés. Les stages se multiplient, les confrontations amicales contre les nations européennes aussi.</p>
<p>Dans les gradins comme sur les bancs, un sentiment domine : le handball tunisien n'a pas dit son dernier mot. Le géant s'est assoupi ; tout, dans ses salles combles et ses écoles de jeunes, indique qu'il est en train de rouvrir les yeux.</p>`,
    seo: {
      metaTitle: "Handball : la reconquête africaine du sept tunisien",
      metaDescription:
        "Dix titres continentaux, une rivalité brûlante avec l'Égypte et une génération montante : comment le handball tunisien prépare son retour au sommet.",
      keywords: ["handball tunisie", "championnat d'afrique handball", "équipe nationale", "espérance de tunis", "sport tunisien"],
    },
  },
  {
    title: "Réforme de l'éducation : l'école tunisienne à l'heure des choix",
    slug: "reforme-education-ecole-tunisienne",
    excerpt:
      "Programmes, rythmes scolaires, numérique, métier d'enseignant : le chantier de la réforme éducative s'ouvre sur un consensus rare — l'école tunisienne doit se réinventer.",
    category: "Société",
    tags: ["éducation", "réforme", "école", "jeunesse", "enseignement"],
    author: { name: "Rim Mathlouthi" },
    websites: ["tunis-wire", "medina-post"],
    featured: false,
    publishedAt: daysAgo(13.4),
    content: `<p>C'est un paradoxe que chaque famille tunisienne connaît par cœur. Le pays qui fit de l'école publique, dès l'indépendance, l'ascenseur social par excellence — et qui en tira ses médecins, ses ingénieurs et ses cadres essaimés sur trois continents — regarde aujourd'hui son système éducatif avec inquiétude. Décrochage scolaire, poids des cours particuliers, classements internationaux décevants : le diagnostic fait consensus. La réforme, elle, reste à écrire.</p>
<h2>Un consensus sur le diagnostic</h2>
<p>Les assises nationales de l'éducation, les rapports d'experts et les enquêtes de terrain convergent vers les mêmes constats : des dizaines de milliers d'élèves quittent l'école chaque année sans qualification ; les évaluations internationales situent les acquis en lecture, mathématiques et sciences en deçà du potentiel du pays ; et l'école publique, jadis grande niveleuse, reproduit de plus en plus les inégalités entre régions côtières et intérieures.</p>
<p>S'y ajoute une économie parallèle que tout le monde dénonce et que tout le monde alimente : celle des cours particuliers, devenus quasi obligatoires à l'approche des concours, au prix d'un budget écrasant pour les familles modestes.</p>
<h2>Programmes, rythmes, numérique : les chantiers</h2>
<p>Le chantier de la réforme s'articule autour de plusieurs axes débattus publiquement :</p>
<ol>
<li><strong>Les programmes</strong>, jugés encyclopédiques et vieillissants, que les pédagogues veulent recentrer sur les compétences — compréhension, raisonnement, esprit critique — plutôt que sur la restitution ;</li>
<li><strong>les rythmes scolaires</strong>, parmi les plus chargés du bassin méditerranéen, avec des journées que les chronobiologistes jugent contre-productives ;</li>
<li><strong>le numérique éducatif</strong>, accéléré par les expériences de continuité pédagogique, mais qui bute sur l'équipement inégal des établissements ;</li>
<li><strong>l'orientation et la formation professionnelle</strong>, à revaloriser pour cesser d'en faire la voie par défaut.</li>
</ol>
<h3>Les enseignants au centre du jeu</h3>
<p>Aucune réforme ne se fera sans les 150 000 femmes et hommes qui font classe chaque matin. Revalorisation du métier, formation continue digne de ce nom, allègement des effectifs par classe dans les zones difficiles : les syndicats en font un préalable, le ministère un objectif. Entre les deux, la négociation sera le vrai juge de paix du calendrier de la réforme.</p>
<p>Reste l'essentiel, que rappellent les acteurs de terrain : derrière les pourcentages, il y a deux millions d'élèves et une promesse républicaine à honorer. L'école tunisienne a déjà prouvé, par le passé, qu'elle pouvait transformer un pays en une génération. Le pari de la réforme est de démontrer qu'elle peut le refaire.</p>`,
    seo: {
      metaTitle: "Réforme de l'éducation : les chantiers de l'école tunisienne",
      metaDescription:
        "Décrochage, programmes, numérique, statut des enseignants : tour d'horizon des chantiers de la réforme éducative qui s'ouvre en Tunisie.",
      keywords: ["réforme éducation tunisie", "école tunisienne", "décrochage scolaire", "enseignants", "programmes scolaires", "jeunesse"],
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    console.error(`[seed] Could not connect to MongoDB at ${MONGODB_URI}`);
    console.error(`[seed] ${err.message}`);
    console.error("[seed] Start MongoDB, then run `npm run seed` again.");
    process.exit(1);
  }

  console.log("[seed] Connected. Dropping existing websites and articles…");
  await Promise.all([Website.deleteMany({}), Article.deleteMany({})]);

  const websites = await Website.insertMany(WEBSITES);
  const siteIdBySlug = Object.fromEntries(websites.map((w) => [w.slug, w._id]));
  console.log(`[seed] Created ${websites.length} websites.`);

  const created = [];
  for (const data of ARTICLES) {
    const article = await Article.create({
      ...data,
      status: "published",
      coverImage: {
        url: `https://picsum.photos/seed/${data.slug}/1200/675`,
        alt: data.title,
      },
      websites: data.websites.map((slug) => siteIdBySlug[slug]),
      seo: {
        ...data.seo,
        ogImage: `https://picsum.photos/seed/${data.slug}/1200/675`,
        canonicalUrl: "",
        noIndex: false,
      },
    });
    created.push(article);
  }
  console.log(`[seed] Created ${created.length} published articles.\n`);

  console.log("Per-website summary:");
  console.table(
    websites.map((site) => ({
      Site: site.name,
      Slug: site.slug,
      Langue: site.language,
      Articles: created.filter((a) => a.websites.some((id) => id.equals(site._id))).length,
    }))
  );

  console.log("Articles:");
  console.table(
    created.map((a) => ({
      Titre: a.title.length > 52 ? `${a.title.slice(0, 52)}…` : a.title,
      Catégorie: a.category,
      Sites: a.websites.length,
      "Publié le": a.publishedAt.toISOString().slice(0, 10),
      "À la une": a.featured ? "oui" : "—",
    }))
  );

  await mongoose.disconnect();
  console.log("[seed] Done.");
  process.exit(0);
}

seed();
