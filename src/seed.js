// ===== Standaardproducten (merkloos) =====
// Waarden per 100 g of 100 ml: [kcal, eiwit, koolhydraten, vet, vezels]. Gemiddelden, afgerond.
// Porties: [omschrijving, gram, vaste punten | koffielepels (bij vetregel)]
// Labels voor eetdrang: zoet hartig knap warm fris vult direct royaal
const SEED_VERSION = 1;

const CATS = ['Groenten', 'Fruit', 'Peulvruchten & tofu', 'Eieren', 'Vlees & gevogelte', 'Vis & zeevruchten',
  'Zuivel', 'Kaas', 'Brood & crackers', 'Granen & aardappelen', 'Noten & zaden', 'Bereidingsvet',
  'Sauzen & smeersels', 'Snacks & zoet', 'Dranken', 'Kant-en-klaar', 'Eigen producten'];

const TAGS = [
  ['zoet', 'Iets zoets'], ['hartig', 'Iets hartigs'], ['knap', 'Iets knapperigs'], ['warm', 'Iets warms'],
  ['fris', 'Iets fris'], ['vult', 'Iets dat goed vult'], ['direct', 'Iets dat meteen klaar is'], ['royaal', 'Een royale portie']
];

const ML = { eenheid: 'ml' };
const VET = { regel: 'vet' };

const SEED = [
  // Groenten (ZeroPoints)
  ['tomaat', 'Tomaat', 'Groenten', 1, [18, 0.9, 3.9, 0.2, 1.2], [['stuk', 120], ['handje kerstomaatjes', 100]], 'fris direct hartig'],
  ['komkommer', 'Komkommer', 'Groenten', 1, [12, 0.6, 2, 0.1, 0.7], [['halve', 150], ['hele', 300]], 'fris knap direct royaal'],
  ['paprika', 'Paprika', 'Groenten', 1, [27, 1, 5, 0.3, 1.8], [['stuk', 150], ['halve', 75]], 'knap fris direct'],
  ['wortel', 'Wortel', 'Groenten', 1, [35, 0.8, 7, 0.2, 2.8], [['stuk', 80], ['kom geraspt', 100]], 'knap fris direct royaal'],
  ['radijs', 'Radijsjes', 'Groenten', 1, [16, 0.7, 2.5, 0.1, 1.6], [['handje', 80]], 'knap fris direct hartig'],
  ['selder', 'Bleekselder', 'Groenten', 1, [14, 0.7, 2, 0.2, 1.6], [['stengel', 40]], 'knap fris direct'],
  ['witloof', 'Witloof', 'Groenten', 1, [17, 1, 2.5, 0.1, 1.5], [['stuk', 100]], 'fris knap direct'],
  ['sla', 'Sla', 'Groenten', 1, [15, 1.2, 1.5, 0.2, 1.3], [['kom', 50]], 'fris royaal'],
  ['spinazie', 'Spinazie', 'Groenten', 1, [23, 2.9, 1.4, 0.4, 2.2], [['kom', 150]], 'warm'],
  ['broccoli', 'Broccoli', 'Groenten', 1, [34, 2.8, 4, 0.4, 2.6], [['kom', 150]], 'warm vult'],
  ['bloemkool', 'Bloemkool', 'Groenten', 1, [25, 1.9, 3, 0.3, 2], [['kom', 150]], 'warm'],
  ['courgette', 'Courgette', 'Groenten', 1, [17, 1.2, 2.2, 0.3, 1], [['halve', 125], ['hele', 250]], 'warm'],
  ['aubergine', 'Aubergine', 'Groenten', 1, [25, 1, 4, 0.2, 3], [['halve', 150], ['hele', 300]], 'warm'],
  ['champignons', 'Champignons', 'Groenten', 1, [22, 3, 0.5, 0.3, 1.5], [['kom', 100], ['bakje', 250]], 'warm hartig'],
  ['ui', 'Ui', 'Groenten', 1, [40, 1.1, 8, 0.1, 1.7], [['stuk', 100]], ''],
  ['prei', 'Prei', 'Groenten', 1, [30, 1.5, 5, 0.3, 2.2], [['stengel', 150]], 'warm'],
  ['boontjes', 'Groene boontjes', 'Groenten', 1, [31, 1.8, 4.5, 0.2, 3.4], [['kom', 150]], 'warm'],
  ['spruitjes', 'Spruitjes', 'Groenten', 1, [43, 3.4, 5, 0.3, 3.8], [['kom', 150]], 'warm'],
  ['wokgroenten', 'Wokgroenten', 'Groenten', 1, [30, 2, 4, 0.3, 2.5], [['kom', 200], ['zak', 400]], 'warm royaal'],
  ['tomblik', 'Tomatenblokjes (blik)', 'Groenten', 1, [21, 1.1, 3.5, 0.2, 1], [['blik', 400], ['halve blik', 200]], ''],
  ['passata', 'Passata (zuivere tomaat)', 'Groenten', 1, [35, 1.5, 6, 0.2, 1.5], [['kom', 150], ['fles', 500]], ''],
  ['tompuree', 'Tomatenpuree', 'Groenten', 1, [82, 4.3, 14, 0.5, 4], [['eetlepel', 15]], ''],
  ['augurk', 'Augurk', 'Groenten', 1, [12, 0.5, 2, 0.1, 1], [['stuk', 30]], 'hartig knap fris direct'],
  ['groentesoep', 'Groentesoep (zelfgemaakt, zonder room)', 'Groenten', 1, [30, 1.3, 4, 0.5, 1.5], [['kom', 250]], 'warm hartig vult royaal'],
  ['avocado', 'Avocado', 'Groenten', 0, [160, 2, 8.5, 14.7, 6.7], [['¼ avocado', 40, 2], ['½ avocado', 80, 4], ['1 hele avocado', 160, 8]], 'vult', { regel: 'vast', notitie: 'Vaste punten, ongeacht de grootte.' }],

  // Fruit
  ['banaan', 'Banaan', 'Fruit', 1, [89, 1.1, 20, 0.3, 2.6], [['stuk', 120]], 'zoet vult direct'],
  ['appel', 'Appel', 'Fruit', 1, [52, 0.3, 12, 0.2, 2.4], [['stuk', 150]], 'zoet knap fris direct'],
  ['peer', 'Peer', 'Fruit', 1, [57, 0.4, 13, 0.1, 3.1], [['stuk', 170]], 'zoet fris direct'],
  ['sinaasappel', 'Sinaasappel', 'Fruit', 1, [47, 0.9, 10, 0.1, 2.2], [['stuk', 150]], 'zoet fris direct'],
  ['mandarijn', 'Mandarijn', 'Fruit', 1, [53, 0.8, 12, 0.3, 1.8], [['stuk', 70]], 'zoet fris direct'],
  ['druiven', 'Druiven', 'Fruit', 1, [69, 0.7, 17, 0.2, 0.9], [['handje', 100], ['kom', 150]], 'zoet fris direct royaal'],
  ['watermeloen', 'Watermeloen', 'Fruit', 1, [30, 0.6, 7.5, 0.2, 0.4], [['partje', 250], ['kom', 200]], 'zoet fris direct royaal'],
  ['cavaillon', 'Cavaillonmeloen', 'Fruit', 1, [34, 0.8, 8, 0.2, 0.9], [['halve', 250], ['kom', 200]], 'zoet fris direct royaal'],
  ['vijg', 'Vijg (vers)', 'Fruit', 1, [74, 0.8, 19, 0.3, 2.9], [['stuk', 50]], 'zoet direct'],
  ['granaatappel', 'Granaatappel', 'Fruit', 1, [83, 1.7, 19, 1.2, 4], [['halve (pitjes)', 85], ['hele (pitjes)', 170]], 'zoet fris'],
  ['aardbeien', 'Aardbeien', 'Fruit', 1, [32, 0.7, 7.7, 0.3, 2], [['kom', 150], ['bakje', 250]], 'zoet fris direct royaal'],
  ['blauwebes', 'Blauwe bessen', 'Fruit', 1, [57, 0.7, 14, 0.3, 2.4], [['kom', 125]], 'zoet fris direct'],
  ['frambozen', 'Frambozen', 'Fruit', 1, [52, 1.2, 12, 0.7, 6.5], [['kom', 125]], 'zoet fris direct'],
  ['roodfruit', 'Rood fruit (diepvries)', 'Fruit', 1, [40, 0.9, 8, 0.3, 3.5], [['kom', 150]], 'zoet fris royaal'],
  ['kiwi', 'Kiwi', 'Fruit', 1, [61, 1.1, 15, 0.5, 3], [['stuk', 75]], 'zoet fris direct'],
  ['mango', 'Mango', 'Fruit', 1, [60, 0.8, 15, 0.4, 1.6], [['halve', 150]], 'zoet fris'],
  ['ananas', 'Ananas', 'Fruit', 1, [50, 0.5, 13, 0.1, 1.4], [['kom', 150]], 'zoet fris royaal'],
  ['pruim', 'Pruim', 'Fruit', 1, [46, 0.7, 11, 0.3, 1.4], [['stuk', 60]], 'zoet direct'],
  ['perzik', 'Perzik of nectarine', 'Fruit', 1, [44, 1, 10, 0.3, 1.7], [['stuk', 140]], 'zoet fris direct'],
  ['dadelmedjool', 'Dadel, Medjool (gedroogd)', 'Fruit', 0, [282, 2.5, 75, 0.4, 8], [['stuk', 24]], 'zoet direct', { notitie: 'Gedroogd fruit valt niet onder je regel "vers fruit". Zet ZeroPoints aan als je dat anders wil.' }],
  ['dadelklein', 'Dadel, klein (gedroogd)', 'Fruit', 0, [282, 2.5, 75, 0.4, 8], [['stuk', 8]], 'zoet direct', { notitie: 'Gedroogd fruit valt niet onder je regel "vers fruit".' }],
  ['vijggedroogd', 'Vijg (gedroogd)', 'Fruit', 0, [250, 3.3, 64, 0.9, 9.8], [['stuk', 20]], 'zoet direct', { notitie: 'Gedroogd fruit valt niet onder je regel "vers fruit".' }],
  ['rozijnen', 'Rozijnen', 'Fruit', 0, [300, 3, 70, 0.5, 4], [['handje', 30]], 'zoet direct'],

  // Peulvruchten & tofu (ZeroPoints)
  ['linzen', 'Linzen (gekookt)', 'Peulvruchten & tofu', 1, [116, 9, 20, 0.4, 8], [['kom', 150], ['halve kom', 75]], 'warm vult hartig'],
  ['rodelinzen', 'Rode linzen (droog)', 'Peulvruchten & tofu', 1, [350, 24, 50, 1.5, 11], [['portie', 50], ['100 g', 100]], 'warm vult'],
  ['kikkererwten', 'Kikkererwten (blik, uitgelekt)', 'Peulvruchten & tofu', 1, [140, 7.5, 20, 2.5, 7], [['kom', 150], ['blik', 240]], 'vult hartig'],
  ['kidney', 'Kidneybonen', 'Peulvruchten & tofu', 1, [110, 8, 15, 0.5, 7], [['kom', 150]], 'vult'],
  ['zwartebonen', 'Zwarte bonen', 'Peulvruchten & tofu', 1, [120, 8, 17, 0.5, 7], [['kom', 150]], 'vult'],
  ['wittebonen', 'Witte bonen (zonder saus)', 'Peulvruchten & tofu', 1, [100, 7, 14, 0.5, 6], [['kom', 150]], 'vult'],
  ['erwten', 'Doperwten', 'Peulvruchten & tofu', 1, [70, 5, 9, 0.4, 5], [['kom', 150]], 'warm'],
  ['edamame', 'Edamame', 'Peulvruchten & tofu', 1, [121, 12, 9, 5, 5], [['kom', 100]], 'warm hartig vult'],
  ['tofu', 'Tofu', 'Peulvruchten & tofu', 1, [125, 13, 2, 7, 1], [['portie', 125], ['blok', 250]], 'vult hartig'],
  ['bonentomaat', 'Witte bonen in tomatensaus', 'Peulvruchten & tofu', 0, [85, 5, 13, 0.4, 4.5], [['kom', 200]], 'warm hartig vult'],

  // Eieren
  ['ei', 'Ei', 'Eieren', 1, [143, 12.6, 0.7, 9.9, 0], [['stuk', 60]], 'hartig vult warm'],

  // Vlees & gevogelte
  ['kipfilet', 'Kipfilet', 'Vlees & gevogelte', 1, [110, 23, 0, 1.5, 0], [['portie', 150], ['kleine portie', 100]], 'hartig vult warm'],
  ['kalkoen', 'Kalkoenfilet', 'Vlees & gevogelte', 1, [105, 24, 0, 1, 0], [['portie', 150]], 'hartig vult warm'],
  ['gehaktmager', 'Rundergehakt mager (max. 5% vet)', 'Vlees & gevogelte', 1, [130, 21, 0, 5, 0], [['portie', 100], ['grote portie', 150]], 'hartig vult warm'],
  ['steak', 'Steak, mager', 'Vlees & gevogelte', 1, [125, 22, 0, 4, 0], [['portie', 150]], 'hartig vult warm'],
  ['varkenshaas', 'Varkenshaas', 'Vlees & gevogelte', 1, [110, 22, 0, 2, 0], [['portie', 150]], 'hartig vult warm'],
  ['kippendij', 'Kippendij zonder vel', 'Vlees & gevogelte', 0, [150, 19, 0, 8, 0], [['portie', 150]], 'hartig vult warm'],
  ['gehakthoh', 'Gehakt half-om-half', 'Vlees & gevogelte', 0, [240, 18, 0, 18, 0], [['portie', 100], ['grote portie', 150]], 'hartig vult warm'],
  ['kipbeleg', 'Kipfilet (beleg)', 'Vlees & gevogelte', 0, [100, 20, 1, 1.5, 0], [['plakje', 15]], 'hartig direct'],
  ['ham', 'Gekookte ham', 'Vlees & gevogelte', 0, [110, 18, 1, 4, 0], [['plakje', 20]], 'hartig direct'],
  ['salami', 'Salami', 'Vlees & gevogelte', 0, [400, 22, 1, 34, 0], [['plakje', 10]], 'hartig direct'],
  ['spek', 'Spek (gebakken)', 'Vlees & gevogelte', 0, [400, 14, 0, 38, 0], [['reepje', 10]], 'hartig warm'],
  ['americain', 'Américain préparé', 'Vlees & gevogelte', 0, [230, 13, 2, 19, 0], [['portie op brood', 40]], 'hartig direct'],

  // Vis & zeevruchten (alle vis ZeroPoints)
  ['zalm', 'Zalm', 'Vis & zeevruchten', 1, [200, 20, 0, 13, 0], [['portie', 150], ['kleine portie', 100]], 'hartig vult warm'],
  ['gerooktezalm', 'Gerookte zalm', 'Vis & zeevruchten', 1, [180, 22, 0, 10, 0], [['plakje', 20], ['portie', 100]], 'hartig direct'],
  ['kabeljauw', 'Kabeljauw', 'Vis & zeevruchten', 1, [82, 18, 0, 0.7, 0], [['portie', 150]], 'hartig vult warm'],
  ['tonijn', 'Tonijn in water (blik)', 'Vis & zeevruchten', 1, [110, 25, 0, 1, 0], [['blikje', 110]], 'hartig vult direct'],
  ['makreel', 'Makreel (gerookt)', 'Vis & zeevruchten', 1, [300, 19, 0, 25, 0], [['halve filet', 50], ['hele filet', 100]], 'hartig vult direct'],
  ['haring', 'Haring (maatjes)', 'Vis & zeevruchten', 1, [200, 15, 0, 15, 0], [['stuk', 70]], 'hartig fris direct'],
  ['sardines', 'Sardines (blik, uitgelekt)', 'Vis & zeevruchten', 1, [210, 24, 0, 12, 0], [['blikje', 90]], 'hartig direct'],
  ['garnalen', 'Grijze garnalen', 'Vis & zeevruchten', 1, [90, 18, 0, 1.5, 0], [['eetlepel', 20], ['portie', 100]], 'hartig fris direct'],
  ['scampi', 'Scampi', 'Vis & zeevruchten', 1, [100, 21, 0, 1.5, 0], [['portie', 150]], 'warm hartig'],
  ['mosselen', 'Mosselen (zonder schelp)', 'Vis & zeevruchten', 1, [110, 18, 4, 2.5, 0], [['kilo mosselen', 250]], 'warm hartig vult royaal'],
  ['vissticks', 'Vissticks', 'Vis & zeevruchten', 0, [200, 13, 17, 9, 1], [['stuk', 30]], 'warm hartig', { notitie: 'Het paneermeel kost punten, de vis zelf niet.' }],

  // Zuivel
  ['yoghurt', 'Magere natuuryoghurt', 'Zuivel', 1, [40, 4, 5, 0.1, 0], [['kom', 150], ['grote kom', 250]], 'fris vult direct'],
  ['skyr', 'Skyr naturel', 'Zuivel', 1, [63, 11, 4, 0.2, 0], [['kom', 150]], 'fris vult direct'],
  ['griekse0', 'Griekse yoghurt 0% (natuur)', 'Zuivel', 1, [55, 10, 4, 0, 0], [['kom', 150]], 'fris vult direct'],
  ['griekse10', 'Griekse yoghurt 10%', 'Zuivel', 0, [120, 4, 4, 10, 0], [['kom', 150]], 'fris vult direct'],
  ['plattekaas', 'Plattekaas mager', 'Zuivel', 0, [50, 8, 4, 0.2, 0], [['kom', 150]], 'fris vult direct'],
  ['cottage', 'Cottage cheese', 'Zuivel', 0, [95, 12, 3, 4, 0], [['kom', 100]], 'hartig vult direct'],
  ['fruityoghurt', 'Fruityoghurt (gesuikerd)', 'Zuivel', 0, [90, 3.5, 14, 2, 0], [['potje', 125]], 'zoet direct'],
  ['sojayoghurt', 'Sojayoghurt natuur', 'Zuivel', 0, [50, 4, 2, 2.5, 1], [['kom', 150]], 'fris direct'],
  ['melkhalf', 'Halfvolle melk', 'Zuivel', 0, [46, 3.5, 4.8, 1.5, 0], [['glas', 200], ['scheutje', 30]], '', ML],
  ['melkmager', 'Magere melk', 'Zuivel', 0, [35, 3.5, 5, 0.1, 0], [['glas', 200], ['scheutje', 30]], '', ML],
  ['melkvol', 'Volle melk', 'Zuivel', 0, [64, 3.3, 4.7, 3.6, 0], [['glas', 200]], '', ML],
  ['kookroom', 'Kookroom 20%', 'Zuivel', 0, [200, 2.5, 4, 20, 0], [['eetlepel', 15], ['100 ml', 100]], '', ML],

  // Kaas
  ['gouda', 'Kaas, jong of belegen', 'Kaas', 0, [360, 25, 0, 28, 0], [['dunne plak', 20], ['dikke plak', 30]], 'hartig direct'],
  ['kaaslight', 'Kaas light (20+ of 30+)', 'Kaas', 0, [270, 30, 0, 16, 0], [['plak', 25]], 'hartig direct'],
  ['mozzarella', 'Mozzarella', 'Kaas', 0, [250, 18, 1, 19, 0], [['halve bol', 62.5], ['bol', 125]], 'hartig'],
  ['mozzalight', 'Mozzarella light', 'Kaas', 0, [160, 20, 1, 9, 0], [['halve bol', 62.5], ['bol', 125]], 'hartig'],
  ['feta', 'Feta', 'Kaas', 0, [265, 14, 1, 22, 0], [['blokje', 30], ['portie', 50]], 'hartig'],
  ['parmezaan', 'Parmezaan (geraspt)', 'Kaas', 0, [390, 33, 0, 28, 0], [['eetlepel', 5]], 'hartig'],
  ['geraspt', 'Geraspte kaas', 'Kaas', 0, [380, 27, 0, 30, 0], [['handje', 30]], 'hartig'],
  ['brie', 'Brie of camembert', 'Kaas', 0, [330, 20, 0, 28, 0], [['portie', 30]], 'hartig direct'],
  ['ricotta', 'Ricotta', 'Kaas', 0, [140, 10, 3, 10, 0], [['eetlepel', 30]], ''],
  ['halloumi', 'Halloumi', 'Kaas', 0, [320, 22, 2, 25, 0], [['plak', 30]], 'hartig warm'],
  ['smeerkaas', 'Smeerkaas natuur', 'Kaas', 0, [230, 5, 4, 21, 0], [['eetlepel', 15]], 'hartig direct'],
  ['smeerkaaslight', 'Smeerkaas light', 'Kaas', 0, [130, 8, 5, 8, 0], [['eetlepel', 15]], 'hartig direct'],

  // Brood & crackers
  ['volkorenbrood', 'Volkorenbrood', 'Brood & crackers', 0, [230, 10, 40, 3, 7], [['sneetje', 35]], 'vult direct'],
  ['meergranen', 'Meergranenbrood', 'Brood & crackers', 0, [250, 10, 40, 5, 6.5], [['sneetje', 35]], 'vult direct'],
  ['witbrood', 'Wit brood', 'Brood & crackers', 0, [250, 9, 48, 2, 2.5], [['sneetje', 30]], 'direct'],
  ['pistolet', 'Pistolet (wit)', 'Brood & crackers', 0, [270, 9, 53, 2.5, 2.5], [['stuk', 55]], 'direct'],
  ['volkorenpistolet', 'Volkoren pistolet', 'Brood & crackers', 0, [240, 10, 43, 3, 6], [['stuk', 60]], 'vult direct'],
  ['croissant', 'Croissant', 'Brood & crackers', 0, [410, 8, 45, 21, 2.5], [['stuk', 50]], 'zoet direct'],
  ['cracker', 'Volkorencracker (knäckebröd)', 'Brood & crackers', 0, [340, 10, 60, 1.5, 15], [['stuk', 11]], 'knap direct'],
  ['rijstwafel', 'Rijstwafel', 'Brood & crackers', 0, [385, 8, 80, 3, 3], [['stuk', 7.5]], 'knap direct'],
  ['maiswafel', 'Maïswafel', 'Brood & crackers', 0, [380, 8, 80, 3, 3], [['stuk', 6]], 'knap direct'],
  ['beschuit', 'Beschuit', 'Brood & crackers', 0, [410, 10, 75, 6, 4], [['stuk', 10]], 'knap direct'],
  ['wrap', 'Wrap (tortilla)', 'Brood & crackers', 0, [300, 8, 50, 7, 3], [['stuk', 60]], ''],
  ['wrapvolkoren', 'Volkoren wrap', 'Brood & crackers', 0, [290, 9, 45, 7, 6], [['stuk', 60]], ''],
  ['pita', 'Pitabroodje', 'Brood & crackers', 0, [275, 9, 55, 1.2, 2.2], [['stuk', 70]], ''],
  ['naan', 'Naan', 'Brood & crackers', 0, [290, 8, 50, 6, 2], [['stuk', 90]], 'warm'],

  // Granen & aardappelen
  ['rijst', 'Rijst (gekookt)', 'Granen & aardappelen', 0, [130, 2.7, 28, 0.3, 0.4], [['kom', 150], ['halve kom', 75]], 'warm vult'],
  ['zilvervlies', 'Volkorenrijst (gekookt)', 'Granen & aardappelen', 0, [123, 2.7, 26, 1, 1.8], [['kom', 150], ['halve kom', 75]], 'warm vult'],
  ['pasta', 'Pasta (gekookt)', 'Granen & aardappelen', 0, [150, 5.5, 30, 0.9, 1.7], [['kom', 150], ['bord', 250]], 'warm vult'],
  ['pastavolkoren', 'Volkorenpasta (gekookt)', 'Granen & aardappelen', 0, [140, 5.5, 26, 1, 4], [['kom', 150], ['bord', 250]], 'warm vult'],
  ['couscous', 'Couscous (gekookt)', 'Granen & aardappelen', 0, [112, 3.8, 23, 0.2, 1.4], [['kom', 150]], 'warm vult'],
  ['bulgur', 'Bulgur (gekookt)', 'Granen & aardappelen', 0, [83, 3, 19, 0.2, 4.5], [['kom', 150]], 'warm vult'],
  ['quinoa', 'Quinoa (gekookt)', 'Granen & aardappelen', 0, [120, 4.4, 21, 1.9, 2.8], [['kom', 150]], 'warm vult'],
  ['noedels', 'Eiernoedels (gekookt)', 'Granen & aardappelen', 0, [140, 5, 26, 2, 1.5], [['kom', 150]], 'warm vult'],
  ['rijstnoedels', 'Rijstnoedels (gekookt)', 'Granen & aardappelen', 0, [110, 2, 25, 0.2, 1], [['kom', 150]], 'warm vult'],
  ['gnocchi', 'Gnocchi', 'Granen & aardappelen', 0, [150, 3.5, 32, 0.5, 1.5], [['portie', 200]], 'warm vult'],
  ['havermout', 'Havermout (droog)', 'Granen & aardappelen', 0, [370, 13, 60, 7, 10], [['portie', 40], ['eetlepel', 10]], 'warm vult'],
  ['muesli', 'Muesli (ongezoet)', 'Granen & aardappelen', 0, [360, 10, 60, 6, 8], [['portie', 45]], 'knap vult'],
  ['cornflakes', 'Cornflakes', 'Granen & aardappelen', 0, [370, 7, 84, 0.9, 3], [['kom', 30]], 'knap direct'],
  ['aardappel', 'Aardappel (gekookt)', 'Granen & aardappelen', 0, [77, 2, 17, 0.1, 2], [['stuk', 120], ['portie', 200]], 'warm vult'],
  ['puree', 'Puree (met melk en boter)', 'Granen & aardappelen', 0, [100, 2, 14, 4, 1.5], [['portie', 200]], 'warm vult'],
  ['zoeteaardappel', 'Zoete aardappel', 'Granen & aardappelen', 0, [86, 1.6, 20, 0.1, 3], [['stuk', 200]], 'warm vult'],
  ['frieten', 'Frieten (frituur)', 'Granen & aardappelen', 0, [300, 3.5, 37, 15, 3.5], [['klein pakje', 150], ['middel pakje', 250]], 'warm hartig'],
  ['ovenfrieten', 'Ovenfrieten', 'Granen & aardappelen', 0, [150, 2.5, 24, 5, 2.5], [['portie', 150]], 'warm hartig'],
  ['mais', 'Maïs', 'Granen & aardappelen', 0, [86, 3.3, 19, 1.4, 2.7], [['kom', 100]], ''],

  // Noten & zaden
  ['amandelen', 'Amandelen', 'Noten & zaden', 0, [600, 21, 9, 52, 12], [['handje', 30], ['half handje', 15]], 'knap direct hartig'],
  ['walnoten', 'Walnoten', 'Noten & zaden', 0, [680, 15, 7, 65, 6.7], [['handje', 30]], 'knap direct'],
  ['cashew', 'Cashewnoten', 'Noten & zaden', 0, [580, 18, 30, 46, 3.3], [['handje', 30]], 'knap direct'],
  ['notenmix', 'Gemengde noten (ongezouten)', 'Noten & zaden', 0, [620, 18, 15, 55, 7], [['handje', 30]], 'knap direct'],
  ['pindas', "Pinda's (gezouten)", 'Noten & zaden', 0, [600, 26, 12, 50, 8], [['handje', 30]], 'knap hartig direct'],
  ['pindakaas', 'Pindakaas', 'Noten & zaden', 0, [600, 25, 13, 50, 7], [['koffielepel', 5], ['eetlepel', 15]], ''],
  ['pompoenpitten', 'Pompoenpitten', 'Noten & zaden', 0, [570, 30, 10, 49, 6], [['eetlepel', 10]], 'knap'],
  ['zonnepitten', 'Zonnebloempitten', 'Noten & zaden', 0, [600, 21, 12, 51, 9], [['eetlepel', 10]], 'knap'],
  ['chiazaad', 'Chiazaad', 'Noten & zaden', 0, [490, 17, 8, 31, 34], [['eetlepel', 12]], ''],
  ['lijnzaad', 'Lijnzaad', 'Noten & zaden', 0, [530, 18, 1.6, 42, 27], [['eetlepel', 10]], ''],
  ['tahin', 'Tahin', 'Noten & zaden', 0, [600, 20, 10, 54, 9], [['eetlepel', 15]], ''],

  // Bereidingsvet (vetregel: elk vet telt hetzelfde)
  ['olijfolie', 'Olijfolie', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['boter', 'Boter', 'Bereidingsvet', 0, [740, 0.7, 0.6, 82, 0], [['1 koffielepel', 5, 1], ['2 koffielepels', 10, 2], ['3 koffielepels', 15, 3]], '', VET],
  ['zonneolie', 'Zonnebloemolie', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['koolzaadolie', 'Koolzaadolie', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['kokosolie', 'Kokosolie', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['sesamolie', 'Sesamolie', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['ghee', 'Ghee', 'Bereidingsvet', 0, [900, 0, 0, 100, 0], [['1 koffielepel', 4.5, 1], ['2 koffielepels', 9, 2], ['3 koffielepels', 13.5, 3]], '', VET],
  ['bakboter', 'Vloeibare bakboter of margarine', 'Bereidingsvet', 0, [720, 0, 0, 80, 0], [['1 koffielepel', 5, 1], ['2 koffielepels', 10, 2], ['3 koffielepels', 15, 3]], '', VET],

  // Sauzen & smeersels
  ['hummus', 'Hummus', 'Sauzen & smeersels', 0, [290, 7, 14, 22, 6], [['eetlepel', 20]], 'hartig direct'],
  ['tzatziki', 'Tzatziki', 'Sauzen & smeersels', 0, [100, 4, 4, 7, 0], [['eetlepel', 25]], 'hartig fris direct'],
  ['mayo', 'Mayonaise', 'Sauzen & smeersels', 0, [700, 1, 1, 77, 0], [['koffielepel', 5], ['eetlepel', 15]], ''],
  ['mayolight', 'Mayonaise light', 'Sauzen & smeersels', 0, [300, 1, 8, 30, 0], [['eetlepel', 15]], ''],
  ['ketchup', 'Ketchup', 'Sauzen & smeersels', 0, [110, 1.5, 24, 0.2, 0.5], [['eetlepel', 15]], ''],
  ['mosterd', 'Mosterd', 'Sauzen & smeersels', 0, [100, 6, 5, 6, 3], [['koffielepel', 5]], ''],
  ['sojasaus', 'Sojasaus', 'Sauzen & smeersels', 0, [60, 8, 6, 0, 0], [['eetlepel', 15]], '', ML],
  ['pesto', 'Pesto', 'Sauzen & smeersels', 0, [450, 5, 6, 45, 2], [['eetlepel', 15]], ''],
  ['vinaigrette', 'Vinaigrette', 'Sauzen & smeersels', 0, [450, 0, 5, 48, 0], [['eetlepel', 15]], '', ML],
  ['pastasaus', 'Pastasaus (kant-en-klaar)', 'Sauzen & smeersels', 0, [60, 1.5, 8, 2.5, 1.5], [['kom', 150]], ''],
  ['kokosmelk', 'Kokosmelk', 'Sauzen & smeersels', 0, [180, 1.8, 3, 18, 0], [['100 ml', 100], ['blik', 400]], '', ML],
  ['kokoslight', 'Kokosmelk light', 'Sauzen & smeersels', 0, [70, 0.7, 2, 7, 0], [['100 ml', 100], ['blik', 400]], '', ML],
  ['currypasta', 'Currypasta (rood of groen)', 'Sauzen & smeersels', 0, [120, 2, 10, 8, 3], [['eetlepel', 15]], ''],
  ['harissa', 'Harissa', 'Sauzen & smeersels', 0, [100, 3, 10, 5, 5], [['koffielepel', 5]], ''],
  ['sriracha', 'Hete saus (sriracha)', 'Sauzen & smeersels', 0, [100, 2, 20, 1, 1], [['koffielepel', 5]], ''],
  ['balsamico', 'Balsamicoazijn', 'Sauzen & smeersels', 0, [90, 0.5, 17, 0, 0], [['eetlepel', 15]], '', ML],
  ['choco', 'Choco (hazelnootpasta)', 'Sauzen & smeersels', 0, [540, 6, 57, 31, 3.4], [['koffielepel', 7], ['eetlepel', 15]], 'zoet'],
  ['speculoospasta', 'Speculoospasta', 'Sauzen & smeersels', 0, [580, 2.5, 57, 38, 1.5], [['koffielepel', 7]], 'zoet'],
  ['confituur', 'Confituur', 'Sauzen & smeersels', 0, [240, 0.4, 59, 0, 1], [['koffielepel', 10]], 'zoet'],
  ['honing', 'Honing', 'Sauzen & smeersels', 0, [305, 0.3, 82, 0, 0], [['koffielepel', 7]], 'zoet'],
  ['bouillon', 'Bouillon (groente of kip)', 'Sauzen & smeersels', 0, [5, 0.5, 0.5, 0.2, 0], [['kom', 250]], 'warm hartig direct', ML],

  // Snacks & zoet
  ['puur', 'Pure chocolade 70%', 'Snacks & zoet', 0, [580, 8, 35, 42, 11], [['blokje', 10]], 'zoet direct'],
  ['melkchoc', 'Melkchocolade', 'Snacks & zoet', 0, [540, 7, 57, 31, 2], [['blokje', 10]], 'zoet direct'],
  ['chips', 'Chips', 'Snacks & zoet', 0, [530, 6, 52, 33, 4.5], [['handje', 15], ['zakje', 30]], 'hartig knap direct'],
  ['popcorn', 'Popcorn (zelf gepoft, zout)', 'Snacks & zoet', 0, [390, 12, 62, 9, 14], [['kom', 20], ['grote kom', 40]], 'hartig knap royaal'],
  ['olijven', 'Olijven', 'Snacks & zoet', 0, [145, 1, 1, 15, 3], [['handje', 30]], 'hartig direct'],
  ['kikkersnack', 'Geroosterde kikkererwten', 'Snacks & zoet', 0, [380, 18, 45, 12, 15], [['handje', 30]], 'hartig knap direct vult'],
  ['speculoos', 'Speculoos', 'Snacks & zoet', 0, [480, 5.5, 70, 19, 2], [['koekje', 7]], 'zoet knap direct'],
  ['koekje', 'Droog koekje (bv. Maria)', 'Snacks & zoet', 0, [430, 7, 75, 10, 2.5], [['koekje', 6]], 'zoet knap direct'],
  ['rijstwafelchoc', 'Rijstwafel met chocolade', 'Snacks & zoet', 0, [490, 6, 65, 22, 3], [['stuk', 16]], 'zoet knap direct'],
  ['ijs', 'Roomijs', 'Snacks & zoet', 0, [200, 3.5, 24, 10, 0.5], [['bolletje', 50]], 'zoet fris'],
  ['waterijs', 'Waterijsje', 'Snacks & zoet', 0, [80, 0, 20, 0, 0], [['stuk', 60]], 'zoet fris direct'],
  ['eiwitreep', 'Eiwitreep', 'Snacks & zoet', 0, [360, 30, 35, 10, 8], [['reep', 45]], 'zoet vult direct'],
  ['snoep', 'Snoepjes (winegums)', 'Snacks & zoet', 0, [330, 5, 77, 0, 0], [['handje', 25]], 'zoet direct'],
  ['luiksewafel', 'Luikse wafel', 'Snacks & zoet', 0, [450, 6, 50, 24, 1.5], [['stuk', 90]], 'zoet direct'],

  // Dranken
  ['koffie', 'Koffie of thee (zonder suiker)', 'Dranken', 0, [1, 0.1, 0, 0, 0], [['tas', 200]], 'warm direct', ML],
  ['cappuccino', 'Cappuccino (halfvolle melk)', 'Dranken', 0, [40, 2.2, 3, 1.4, 0], [['tas', 200]], 'warm', ML],
  ['latte', 'Latte macchiato', 'Dranken', 0, [45, 2.5, 3.5, 1.6, 0], [['glas', 300]], 'warm', ML],
  ['frisdrank', 'Frisdrank (cola, limonade)', 'Dranken', 0, [42, 0, 10.6, 0, 0], [['blikje', 330], ['glas', 200]], 'zoet fris', ML],
  ['frisdrankzero', 'Frisdrank zero of light', 'Dranken', 0, [0.5, 0, 0, 0, 0], [['blikje', 330]], 'fris', ML],
  ['fruitsap', 'Fruitsap', 'Dranken', 0, [45, 0.7, 10, 0.2, 0.2], [['glas', 200]], 'zoet fris', ML],
  ['smoothie', 'Fruitsmoothie', 'Dranken', 0, [55, 0.7, 12, 0.3, 1.5], [['glas', 250]], 'zoet fris', ML],
  ['havermelk', 'Havermelk', 'Dranken', 0, [45, 1, 6.5, 1.5, 0.8], [['glas', 200]], '', ML],
  ['sojamelk', 'Sojamelk (ongezoet)', 'Dranken', 0, [33, 3.3, 0.5, 1.8, 0.5], [['glas', 200]], '', ML],
  ['pils', 'Bier (pils)', 'Dranken', 0, [43, 0.5, 3.1, 0, 0], [['glas', 250], ['flesje', 330]], '', ML],
  ['tripel', 'Speciaalbier (tripel)', 'Dranken', 0, [80, 0.6, 5, 0, 0], [['glas', 330]], '', ML],
  ['bier0', 'Alcoholvrij bier', 'Dranken', 0, [20, 0.3, 4.5, 0, 0], [['blikje', 330]], 'fris', ML],
  ['wijn', 'Wijn', 'Dranken', 0, [83, 0.1, 2.6, 0, 0], [['glas', 150]], '', ML],

  // Kant-en-klaar
  ['kantklaar', 'Kant-en-klaarmaaltijd (gemiddeld)', 'Kant-en-klaar', 0, [120, 6, 14, 4.5, 2], [['bakje', 400]], 'warm vult direct'],
  ['bolognese', 'Spaghetti bolognese (kant-en-klaar)', 'Kant-en-klaar', 0, [140, 7, 17, 4.5, 1.5], [['bord', 400]], 'warm vult'],
  ['lasagne', 'Lasagne', 'Kant-en-klaar', 0, [150, 8, 13, 7, 1.5], [['portie', 350]], 'warm vult'],
  ['pizza', 'Pizza margherita', 'Kant-en-klaar', 0, [250, 11, 30, 9, 2], [['halve pizza', 175], ['hele pizza', 350]], 'warm hartig'],
  ['soepkk', 'Groentesoep (kant-en-klaar)', 'Kant-en-klaar', 0, [30, 1, 4, 1, 1], [['kom', 250]], 'warm hartig direct', ML],
  ['sushi', 'Sushi', 'Kant-en-klaar', 0, [150, 5, 28, 2, 1], [['stuk', 30]], 'hartig fris'],
  ['falafel', 'Falafel', 'Kant-en-klaar', 0, [330, 13, 32, 18, 5], [['balletje', 20]], 'hartig warm'],
  ['durum', 'Dürüm (kip)', 'Kant-en-klaar', 0, [220, 12, 20, 10, 2], [['stuk', 350]], 'warm hartig vult'],
  ['frikandel', 'Frikandel', 'Kant-en-klaar', 0, [270, 11, 10, 20, 1], [['stuk', 70]], 'warm hartig'],
  ['kroket', 'Kroket', 'Kant-en-klaar', 0, [230, 6, 20, 14, 1.5], [['stuk', 70]], 'warm hartig'],
];

// Snelle ideeën bij eetdrang: [product-id, portie-index, aantal]
const IDEEEN = [
  { id: 'i_skyr', naam: 'Skyr met rood fruit', uitleg: 'Romig, fris en het vult lang. Diepvriesfruit maakt het bijna ijs.', items: [['skyr', 0, 1], ['roodfruit', 0, 1]], tags: 'zoet fris vult direct royaal' },
  { id: 'i_appel', naam: 'Warme appel met kaneel', uitleg: 'Appel in partjes, twee minuten in de microgolf, flink wat kaneel erover.', items: [['appel', 0, 1]], tags: 'zoet warm' },
  { id: 'i_druiven', naam: 'Diepvriesdruiven', uitleg: 'Leg druiven een uur in de vriezer. Knapperig, en je eet ze vanzelf trager.', items: [['druiven', 1, 1]], tags: 'zoet fris knap royaal' },
  { id: 'i_bananenijs', naam: 'Bananenijs', uitleg: 'Bevroren banaan met een scheut yoghurt mixen tot zacht ijs.', items: [['banaan', 0, 1], ['yoghurt', 0, 0.5]], tags: 'zoet fris' },
  { id: 'i_yoggra', naam: 'Yoghurt met granaatappel', uitleg: 'Een kom yoghurt met granaatappelpitjes en wat kaneel of vanille.', items: [['yoghurt', 0, 1], ['granaatappel', 0, 1]], tags: 'zoet fris direct vult' },
  { id: 'i_staafjes', naam: 'Groentestaafjes met tzatziki', uitleg: 'Komkommer, wortel en paprika in reepjes om te dippen.', items: [['komkommer', 0, 1], ['wortel', 0, 1], ['paprika', 1, 1], ['tzatziki', 0, 2]], tags: 'hartig knap fris direct royaal' },
  { id: 'i_witloof', naam: 'Witloofbootjes met grijze garnalen', uitleg: 'Witloofblaadjes vullen met garnalen, citroen en peterselie.', items: [['witloof', 0, 1], ['garnalen', 0, 2]], tags: 'hartig fris knap direct' },
  { id: 'i_tonijn', naam: 'Tonijnsalade met mosterd', uitleg: 'Tonijn met mosterd, citroen en peper in plaats van mayonaise, met tomaat en komkommer.', items: [['tonijn', 0, 1], ['tomaat', 0, 1], ['komkommer', 0, 1], ['mosterd', 0, 1]], tags: 'hartig fris vult direct' },
  { id: 'i_makreel', naam: 'Gerookte makreel op knäckebröd', uitleg: 'Met wat citroen en zwarte peper.', items: [['makreel', 0, 1], ['cracker', 0, 2]], tags: 'hartig knap vult direct' },
  { id: 'i_rijstwafel', naam: 'Rijstwafels met hummus en komkommer', uitleg: 'Knapperig, romig en fris tegelijk.', items: [['rijstwafel', 0, 2], ['hummus', 0, 1], ['komkommer', 0, 1]], tags: 'hartig knap direct' },
  { id: 'i_bouillonei', naam: 'Bouillon met ei', uitleg: 'Klop een ei door kokende bouillon, met lente-ui of chili.', items: [['bouillon', 0, 1], ['ei', 0, 1]], tags: 'warm hartig vult' },
  { id: 'i_edamame', naam: 'Edamame met zeezout', uitleg: 'Diepvries edamame vier minuten koken, zeezout en chili erover.', items: [['edamame', 0, 1]], tags: 'warm hartig vult' },
  { id: 'i_soep', naam: 'Kom groentesoep', uitleg: 'Maak op zondag een grote pot, dan staat er altijd een kom klaar.', items: [['groentesoep', 0, 1]], tags: 'warm hartig vult royaal' },
  { id: 'i_linzen', naam: 'Linzen met citroen en komijn', uitleg: 'Opwarmen met komijn, citroensap en wat peterselie.', items: [['linzen', 0, 1]], tags: 'warm hartig vult' },
  { id: 'i_omelet', naam: 'Omelet met spinazie', uitleg: 'Twee eieren, een kom spinazie, een koffielepel olie.', items: [['ei', 0, 2], ['spinazie', 0, 1], ['olijfolie', 0, 1]], tags: 'warm hartig vult' },
  { id: 'i_bloemkool', naam: 'Geroosterde bloemkool met komijn', uitleg: 'Twintig minuten in de oven op 220 °C met komijn en zout.', items: [['bloemkool', 0, 2], ['olijfolie', 0, 1]], tags: 'warm hartig royaal' },
  { id: 'i_popcorn', naam: 'Popcorn met paprikapoeder', uitleg: 'Zelf poffen zonder boter, paprikapoeder en zout erover.', items: [['popcorn', 0, 1]], tags: 'hartig knap royaal' },
  { id: 'i_meloen', naam: 'Watermeloen met feta en munt', uitleg: 'Zoet en zout samen, heerlijk fris.', items: [['watermeloen', 1, 1], ['feta', 0, 1]], tags: 'zoet hartig fris' },
];

function seedProducts() {
  return SEED.map(([id, naam, cat, zero, n, porties, tags, o]) => {
    o = o || {};
    return {
      id, naam, cat, zero: !!zero, regel: o.regel || 'formule', eenheid: o.eenheid || 'g',
      n: { kcal: n[0], eiwit: n[1], kh: n[2], vet: n[3], vezels: n[4] },
      porties: porties.map(([label, g, x]) => {
        const p = { label, g };
        if (o.regel === 'vet') p.kl = x || 1; else if (x !== undefined) p.punten = x;
        return p;
      }),
      tags: (tags || '').split(' ').filter(Boolean), fav: false, std: true, notitie: o.notitie || ''
    };
  });
}
