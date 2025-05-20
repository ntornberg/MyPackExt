

export type GEPCode = 'FAD' | 'GLOBAL' | 'HES' | 'HUM' | 'INTERDISC' | 'MATH' | 'NATSCI' | 'SOCSCI' | 'USDIV' | 'USDEI' | 'VPA';

export const GEP_COURSES = {
  "FAD": {
    "ENG-265": {
      "course_title": "American Literature I",
      "course_id": "008479"
    },
    "FAD-295": {
      "course_title": "Foundations of American Democracy Special Topics",
      "course_id": "033562"
    },
    "HI-253": {
      "course_title": "Early U.S. History",
      "course_id": "032366"
    },
    "HI-254": {
      "course_title": "Modern U.S. History",
      "course_id": "032178"
    },
    "HI-345": {
      "course_title": "American Popular Culture",
      "course_id": "011558"
    },
    "PS-201": {
      "course_title": "American Politics and Government",
      "course_id": "017992"
    },
    "PS-362": {
      "course_title": "American Political Thought",
      "course_id": "018123"
    }
  },
  "GLOBAL": {
    "ADN-275": {
      "course_title": "Survey of Fibers in Art and Design",
      "course_id": "031347"
    },
    "AEC-245": {
      "course_title": "Practicing Conservation Ecology",
      "course_id": "032998"
    },
    "AEC-380": {
      "course_title": "Water Resources: Global Issues in Ecology, Policy, Management, and Advocacy",
      "course_id": "031894"
    },
    "AFS-240": {
      "course_title": "African Civilization",
      "course_id": "021594"
    },
    "AFS-275": {
      "course_title": "Introduction to History of South and East Africa",
      "course_id": "000365"
    },
    "AFS-276": {
      "course_title": "Introduction to History of West Africa",
      "course_id": "000366"
    },
    "AFS-342": {
      "course_title": "Introduction to the African Diaspora",
      "course_id": "000369"
    },
    "AFS-475": {
      "course_title": "History of the Republic of South Africa",
      "course_id": "000386"
    },
    "AFS-476": {
      "course_title": "Leadership in Modern Africa",
      "course_id": "000387"
    },
    "AFS-479": {
      "course_title": "Africa [sub-Saharan] in the Twentieth Century",
      "course_id": "000388"
    },
    "AFS-575": {
      "course_title": "History of the Republic of South Africa",
      "course_id": "000386"
    },
    "AFS-576": {
      "course_title": "Leadership in Modern Africa",
      "course_id": "000387"
    },
    "AFS-579": {
      "course_title": "Africa [sub-Saharan] in the Twentieth Century",
      "course_id": "000388"
    },
    "ALS-494": {
      "course_title": "International Learning Experience in Agriculture and Life Sciences",
      "course_id": "023393"
    },
    "ANS-395": {
      "course_title": "Animal Science Study Abroad",
      "course_id": "032559"
    },
    "ANT-252": {
      "course_title": "Introduction to Cultural Anthropology",
      "course_id": "000731"
    },
    "ANT-253": {
      "course_title": "Introduction to Archaeology",
      "course_id": "000736"
    },
    "ANT-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "ANT-325": {
      "course_title": "Andean South America",
      "course_id": "000757"
    },
    "ANT-330": {
      "course_title": "People and Cultures of Africa",
      "course_id": "000760"
    },
    "ANT-345": {
      "course_title": "Anthropology of the Middle East",
      "course_id": "032270"
    },
    "ANT-371": {
      "course_title": "Human Variation",
      "course_id": "000768"
    },
    "ANT-461": {
      "course_title": "Wealth, Poverty and International Aid",
      "course_id": "032948"
    },
    "ANT-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ANT-561": {
      "course_title": "Wealth, Poverty and International Aid",
      "course_id": "032948"
    },
    "ANT-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ARC-141": {
      "course_title": "Introduction to Architectural History",
      "course_id": "004903"
    },
    "ARE-345": {
      "course_title": "Global Agribusiness Management",
      "course_id": "031656"
    },
    "ARE-494": {
      "course_title": "Agribusiness Study Abroad",
      "course_id": "031704"
    },
    "ARS-251": {
      "course_title": "The Arts of a World Capital: London",
      "course_id": "001181"
    },
    "ARS-252": {
      "course_title": "The Arts of Vienna 1900",
      "course_id": "001182"
    },
    "ARS-353": {
      "course_title": "Arts and Cross-Cultural Contacts",
      "course_id": "001193"
    },
    "ARS-354": {
      "course_title": "The Arts and the Sacred",
      "course_id": "023035"
    },
    "ARS-410": {
      "course_title": "Art and History of World Puppetry",
      "course_id": "033016"
    },
    "COM-215": {
      "course_title": "The Struggle of the Free Press: Fake News & Conspiracy Theories",
      "course_id": "033546"
    },
    "COM-364": {
      "course_title": "History of Film to 1940",
      "course_id": "003876"
    },
    "COM-374": {
      "course_title": "History of Film From 1940",
      "course_id": "003878"
    },
    "COM-392": {
      "course_title": "International and Crosscultural Communication",
      "course_id": "019990"
    },
    "COM-447": {
      "course_title": "Communication and Globalization",
      "course_id": "003905"
    },
    "CS-224": {
      "course_title": "Seeds, Biotechnology and Societies",
      "course_id": "023860"
    },
    "CS-230": {
      "course_title": "Introduction to Agroecology",
      "course_id": "004115"
    },
    "DAN-122": {
      "course_title": "Dance and Society",
      "course_id": "033570"
    },
    "DAN-227": {
      "course_title": "African Dance I",
      "course_id": "032191"
    },
    "DAN-228": {
      "course_title": "African Dance II",
      "course_id": "032907"
    },
    "DAN-322": {
      "course_title": "Dance and Society",
      "course_id": "032245"
    },
    "E-480": {
      "course_title": "Namibia Wildlife Aerial Observatory",
      "course_id": "032774"
    },
    "EC-449": {
      "course_title": "International Finance",
      "course_id": "005762"
    },
    "ECD-225": {
      "course_title": "Foundations of Cultural Competence",
      "course_id": "031906"
    },
    "ENG-215": {
      "course_title": "The Struggle of the Free Press: Fake News & Conspiracy Theories",
      "course_id": "033546"
    },
    "ENG-219": {
      "course_title": "Studies in Great Works of Non-Western Literature",
      "course_id": "008431"
    },
    "ENG-220": {
      "course_title": "Studies in Great Works of Western Literature",
      "course_id": "008433"
    },
    "ENG-221": {
      "course_title": "Literature of the Western World I",
      "course_id": "008436"
    },
    "ENG-222": {
      "course_title": "Literature of the Western World II",
      "course_id": "008440"
    },
    "ENG-223": {
      "course_title": "Contemporary World Literature I",
      "course_id": "008441"
    },
    "ENG-224": {
      "course_title": "Contemporary World Literature II",
      "course_id": "008445"
    },
    "ENG-246": {
      "course_title": "Literature of the Holocaust",
      "course_id": "008453"
    },
    "ENG-255": {
      "course_title": "Beyond Britain: Literature from Colonies of the British Empire",
      "course_id": "032413"
    },
    "ENG-275": {
      "course_title": "Literature and War",
      "course_id": "032425"
    },
    "ENG-282": {
      "course_title": "Introduction to Film",
      "course_id": "008493"
    },
    "ENG-326": {
      "course_title": "History of the English Language",
      "course_id": "008557"
    },
    "ENG-329": {
      "course_title": "Language and Globalization",
      "course_id": "032664"
    },
    "ENG-364": {
      "course_title": "History of Film to 1940",
      "course_id": "003876"
    },
    "ENG-374": {
      "course_title": "History of Film From 1940",
      "course_id": "003878"
    },
    "ENG-378": {
      "course_title": "Women & Film",
      "course_id": "031326"
    },
    "ENG-380": {
      "course_title": "Modern Drama",
      "course_id": "008598"
    },
    "ENG-382": {
      "course_title": "Film and Literature",
      "course_id": "008605"
    },
    "ENG-385": {
      "course_title": "Biblical Backgrounds of English Literature",
      "course_id": "008610"
    },
    "ENG-390": {
      "course_title": "Classical Backgrounds of English Literature",
      "course_id": "008614"
    },
    "ENG-392": {
      "course_title": "Major World Author",
      "course_id": "008617"
    },
    "ENG-393": {
      "course_title": "Studies in Literary Genre",
      "course_id": "008618"
    },
    "ENG-394": {
      "course_title": "Studies in World Literature",
      "course_id": "008623"
    },
    "ENG-399": {
      "course_title": "Contemporary Literature",
      "course_id": "008641"
    },
    "ENG-406": {
      "course_title": "Modernism",
      "course_id": "008646"
    },
    "ENG-407": {
      "course_title": "Postmodernism",
      "course_id": "008647"
    },
    "ENG-439": {
      "course_title": "Studies in English Renaissance Literature",
      "course_id": "008660"
    },
    "ENG-451": {
      "course_title": "Chaucer",
      "course_id": "008665"
    },
    "ENG-464": {
      "course_title": "British Literature and the Founding of Empire",
      "course_id": "008678"
    },
    "ENG-465": {
      "course_title": "British Literature and the Dissolution of Empire",
      "course_id": "008679"
    },
    "ENG-551": {
      "course_title": "Chaucer",
      "course_id": "008665"
    },
    "ENT-207": {
      "course_title": "Insects and Human Disease",
      "course_id": "031646"
    },
    "ES-100": {
      "course_title": "Introduction to Environmental Sciences",
      "course_id": "009584"
    },
    "ES-113": {
      "course_title": "Earth from Space",
      "course_id": "032596"
    },
    "ES-150": {
      "course_title": "Water and the Environment",
      "course_id": "032222"
    },
    "ES-200": {
      "course_title": "Climate Change and Sustainability",
      "course_id": "031452"
    },
    "ES-300": {
      "course_title": "Energy and Environment",
      "course_id": "031451"
    },
    "ES-449": {
      "course_title": "Human Dimensions of Natural Resources in Australia/New Zealand",
      "course_id": "031416"
    },
    "ES-450": {
      "course_title": "Sustaining Natural Resources in Australia/New Zealand",
      "course_id": "031417"
    },
    "FOR-414": {
      "course_title": "World Forestry",
      "course_id": "010286"
    },
    "FW-221": {
      "course_title": "Conservation of Natural Resources",
      "course_id": "010229"
    },
    "GEO-220": {
      "course_title": "Cultural Geography",
      "course_id": "010994"
    },
    "HUMG-295": {
      "course_title": "Humanities and Global Knowledge Special Topics",
      "course_id": "031856"
    },
    "IPGK-295": {
      "course_title": "Interdisciplinary Perspectives and Global Knowledge Special Topics",
      "course_id": "031853"
    },
    "NSGK-295": {
      "course_title": "Natural Sciences and Global Knowledge Special Topics",
      "course_id": "031860"
    },
    "GOH-201": {
      "course_title": "Foundations of Global One Health",
      "course_id": "033422"
    },
    "GOH-302": {
      "course_title": "Global One Health Applications",
      "course_id": "033423"
    },
    "HA-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-207": {
      "course_title": "Ancient Mediterranean World",
      "course_id": "011424"
    },
    "HI-208": {
      "course_title": "The Middle Ages",
      "course_id": "011430"
    },
    "HI-209": {
      "course_title": "From Renaissance to Revolution: The Origins of Modern Europe",
      "course_id": "011435"
    },
    "HI-210": {
      "course_title": "Modern Europe 1815-Present",
      "course_id": "011440"
    },
    "HI-214": {
      "course_title": "History and Archaeology of Ancient Latin America",
      "course_id": "032074"
    },
    "HI-215": {
      "course_title": "Colonial Latin America",
      "course_id": "011446"
    },
    "HI-216": {
      "course_title": "Modern Latin America",
      "course_id": "011449"
    },
    "HI-217": {
      "course_title": "Caribbean History",
      "course_id": "032558"
    },
    "HI-221": {
      "course_title": "British History to 1688",
      "course_id": "011454"
    },
    "HI-222": {
      "course_title": "History of British Cultures and Societies From 1688",
      "course_id": "011457"
    },
    "HI-232": {
      "course_title": "The World from 1200 to 1750",
      "course_id": "031448"
    },
    "HI-233": {
      "course_title": "The World Since 1750",
      "course_id": "011459"
    },
    "HI-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-263": {
      "course_title": "Asian Civilizations to 1800",
      "course_id": "011493"
    },
    "HI-264": {
      "course_title": "Modern Asia: 1800 to Present",
      "course_id": "011495"
    },
    "HI-270": {
      "course_title": "Modern Middle East",
      "course_id": "011502"
    },
    "HI-275": {
      "course_title": "Introduction to History of South and East Africa",
      "course_id": "000365"
    },
    "HI-276": {
      "course_title": "Introduction to History of West Africa",
      "course_id": "000366"
    },
    "HI-307": {
      "course_title": "Jewish History",
      "course_id": "031952"
    },
    "HI-317": {
      "course_title": "Cuba Today: Historical and Sociopolitical Perspectives",
      "course_id": "032538"
    },
    "HI-321": {
      "course_title": "Scientific Revolution and European Society, 1500-1800",
      "course_id": "011538"
    },
    "HI-324": {
      "course_title": "History of Common Law and Constitution",
      "course_id": "031838"
    },
    "HI-325": {
      "course_title": "Law and Society in European History",
      "course_id": "033500"
    },
    "HI-332": {
      "course_title": "Germany and the World Wars",
      "course_id": "011632"
    },
    "HI-335": {
      "course_title": "The World at War",
      "course_id": "011548"
    },
    "HI-338": {
      "course_title": "Empire, War, and Revolution in Russia",
      "course_id": "032066"
    },
    "HI-340": {
      "course_title": "History of Agriculture",
      "course_id": "011551"
    },
    "HI-342": {
      "course_title": "Global Environmental History",
      "course_id": "032985"
    },
    "HI-361": {
      "course_title": "Global History of American Food and Drink",
      "course_id": "032986"
    },
    "HI-370": {
      "course_title": "Modern Egypt",
      "course_id": "011577"
    },
    "HI-371": {
      "course_title": "Modern Japan, 1850 to Present",
      "course_id": "011579"
    },
    "HI-374": {
      "course_title": "Visual Culture of Modern South Asia",
      "course_id": "031449"
    },
    "HI-375": {
      "course_title": "Global History of Travel and Tourism",
      "course_id": "032945"
    },
    "HI-376": {
      "course_title": "Global Migrations",
      "course_id": "011582"
    },
    "HI-377": {
      "course_title": "The Silk Road in the Medieval World",
      "course_id": "033009"
    },
    "HI-378": {
      "course_title": "Global Games: Sport History around the World",
      "course_id": "033501"
    },
    "HI-381": {
      "course_title": "Changemakers: The Global Context of Activism",
      "course_id": "031989"
    },
    "HI-402": {
      "course_title": "Early Christianity to the Time of Eusebius",
      "course_id": "011593"
    },
    "HI-407": {
      "course_title": "Islamic History to 1798",
      "course_id": "011599"
    },
    "HI-408": {
      "course_title": "Islam in the Modern World",
      "course_id": "011600"
    },
    "HI-410": {
      "course_title": "Italian Renaissance",
      "course_id": "011603"
    },
    "HI-411": {
      "course_title": "Trials of Faith: Religious Reformation in Early-Modern Europe",
      "course_id": "011605"
    },
    "HI-412": {
      "course_title": "The Sexes and Society in Early-Modern Europe",
      "course_id": "011606"
    },
    "HI-414": {
      "course_title": "From Kings to Revolution: The History of Early-Modern France",
      "course_id": "011608"
    },
    "HI-415": {
      "course_title": "The French Revolution",
      "course_id": "011609"
    },
    "HI-418": {
      "course_title": "Fascist Italy and Nazi Germany",
      "course_id": "011613"
    },
    "HI-419": {
      "course_title": "Modern European Imperialism",
      "course_id": "011616"
    },
    "HI-421": {
      "course_title": "European Intellectual History: The Eighteenth Century",
      "course_id": "011618"
    },
    "HI-422": {
      "course_title": "European Intellectual History: The 19th Century",
      "course_id": "011619"
    },
    "HI-423": {
      "course_title": "Women in European Enlightenment",
      "course_id": "011620"
    },
    "HI-425": {
      "course_title": "Tudor and Stuart England",
      "course_id": "011623"
    },
    "HI-429": {
      "course_title": "20th Century Britain",
      "course_id": "011629"
    },
    "HI-430": {
      "course_title": "Modern France",
      "course_id": "011630"
    },
    "HI-465": {
      "course_title": "Oil and Crisis in the Gulf",
      "course_id": "011674"
    },
    "HI-466": {
      "course_title": "History of the Palestinian-Israeli Conflict",
      "course_id": "011676"
    },
    "HI-467": {
      "course_title": "Modern Mexico",
      "course_id": "011678"
    },
    "HI-468": {
      "course_title": "Slavery in the Americas",
      "course_id": "011679"
    },
    "HI-469": {
      "course_title": "Latin American Revolutions",
      "course_id": "011680"
    },
    "HI-470": {
      "course_title": "Exploring World History",
      "course_id": "005511"
    },
    "HI-471": {
      "course_title": "Revolutionary China",
      "course_id": "011682"
    },
    "HI-472": {
      "course_title": "Fashion, Food, and Fun: Material Culture in Chinese History",
      "course_id": "011684"
    },
    "HI-473": {
      "course_title": "Japan's Empire in Asia, 1868-1945",
      "course_id": "011685"
    },
    "HI-474": {
      "course_title": "Modern India",
      "course_id": "011687"
    },
    "HI-475": {
      "course_title": "History of the Republic of South Africa",
      "course_id": "000386"
    },
    "HI-476": {
      "course_title": "Leadership in Modern Africa",
      "course_id": "000387"
    },
    "HI-477": {
      "course_title": "Women in the Middle East",
      "course_id": "011688"
    },
    "HI-478": {
      "course_title": "Islam and Christianity in Sub-Saharan Africa",
      "course_id": "011690"
    },
    "HI-479": {
      "course_title": "Africa [sub-Saharan] in the Twentieth Century",
      "course_id": "000388"
    },
    "HI-483": {
      "course_title": "Science and Religion in European History",
      "course_id": "011700"
    },
    "HI-484": {
      "course_title": "Science in European Culture",
      "course_id": "011701"
    },
    "HI-486": {
      "course_title": "Science and Empire",
      "course_id": "011705"
    },
    "HI-511": {
      "course_title": "Trials of Faith: Religious Reformation in Early-Modern Europe",
      "course_id": "011605"
    },
    "HI-512": {
      "course_title": "The Sexes and Society in Early-Modern Europe",
      "course_id": "011606"
    },
    "HI-514": {
      "course_title": "From Kings to Revolution: The History of Early-Modern France",
      "course_id": "011608"
    },
    "HI-515": {
      "course_title": "The French Revolution",
      "course_id": "011609"
    },
    "HI-518": {
      "course_title": "Fascist Italy and Nazi Germany",
      "course_id": "011613"
    },
    "HI-519": {
      "course_title": "Modern European Imperialism",
      "course_id": "011616"
    },
    "HI-521": {
      "course_title": "European Intellectual History: The Eighteenth Century",
      "course_id": "011618"
    },
    "HI-522": {
      "course_title": "European Intellectual History: The 19th Century",
      "course_id": "011619"
    },
    "HI-523": {
      "course_title": "Women in European Enlightenment",
      "course_id": "011620"
    },
    "HI-525": {
      "course_title": "Tudor and Stuart England",
      "course_id": "011623"
    },
    "HI-530": {
      "course_title": "Modern France",
      "course_id": "011630"
    },
    "HI-568": {
      "course_title": "Slavery in the Americas",
      "course_id": "011679"
    },
    "HI-569": {
      "course_title": "Latin American Revolutions",
      "course_id": "011680"
    },
    "HI-570": {
      "course_title": "Exploring World History",
      "course_id": "005511"
    },
    "HI-571": {
      "course_title": "Revolutionary China",
      "course_id": "011682"
    },
    "HI-573": {
      "course_title": "Japan's Empire in Asia, 1868-1945",
      "course_id": "011685"
    },
    "HI-575": {
      "course_title": "History of the Republic of South Africa",
      "course_id": "000386"
    },
    "HI-576": {
      "course_title": "Leadership in Modern Africa",
      "course_id": "000387"
    },
    "HI-579": {
      "course_title": "Africa [sub-Saharan] in the Twentieth Century",
      "course_id": "000388"
    },
    "HI-583": {
      "course_title": "Science and Religion in European History",
      "course_id": "011700"
    },
    "HI-584": {
      "course_title": "Science in European Culture",
      "course_id": "011701"
    },
    "HI-586": {
      "course_title": "Science and Empire",
      "course_id": "011705"
    },
    "HON-293": {
      "course_title": "Honors Special Topics - Interdisciplinary Perspectives/Global Knowledge",
      "course_id": "012029"
    },
    "HON-311": {
      "course_title": "Words through Space and Time",
      "course_id": "032086"
    },
    "HON-353": {
      "course_title": "Code Breakers: Unlocking the Mysteries of One Human Language",
      "course_id": "032087"
    },
    "HON-355": {
      "course_title": "Feelings of/from Technology: Analog Bodies in Digital Spaces",
      "course_id": "033052"
    },
    "HON-356": {
      "course_title": "Sweet: A Global History of Sugar",
      "course_id": "033149"
    },
    "HON-358": {
      "course_title": "Listening to Climate Change",
      "course_id": "033649"
    },
    "HON-359": {
      "course_title": "Music Beyond Binaries",
      "course_id": "033650"
    },
    "HON-360": {
      "course_title": "Music and Resistance",
      "course_id": "032840"
    },
    "HON-370": {
      "course_title": "Contemporary British Voices",
      "course_id": "033580"
    },
    "HON-390": {
      "course_title": "Music and the Celtic World",
      "course_id": "032451"
    },
    "IDS-201": {
      "course_title": "Environmental Ethics",
      "course_id": "021589"
    },
    "IDS-220": {
      "course_title": "The Science and Art of Happiness",
      "course_id": "032355"
    },
    "IDS-310": {
      "course_title": "Animals in the Global Community",
      "course_id": "032010"
    },
    "IS-200": {
      "course_title": "Introduction to International Studies",
      "course_id": "031469"
    },
    "IS-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "IS-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "MEA-100": {
      "course_title": "Earth System Science: Exploring the Connections",
      "course_id": "015208"
    },
    "MUS-105": {
      "course_title": "Introduction to Music in Western Society",
      "course_id": "016051"
    },
    "MUS-200": {
      "course_title": "Understanding Music: Global Perspectives",
      "course_id": "016044"
    },
    "MUS-201": {
      "course_title": "Introduction to Music Literature I",
      "course_id": "016048"
    },
    "MUS-202": {
      "course_title": "Introduction to Music Literature II",
      "course_id": "016049"
    },
    "MUS-215": {
      "course_title": "The Beatles and the British Invasion",
      "course_id": "033332"
    },
    "MUS-310": {
      "course_title": "Music of the 17th and 18th Centuries",
      "course_id": "016071"
    },
    "MUS-315": {
      "course_title": "Music of the 19th Century",
      "course_id": "016072"
    },
    "MUS-320": {
      "course_title": "Music of the 20th Century",
      "course_id": "016074"
    },
    "MUS-330": {
      "course_title": "Survey of Musical Theater",
      "course_id": "016076"
    },
    "MUS-350": {
      "course_title": "Music of Asia",
      "course_id": "016081"
    },
    "NTR-220": {
      "course_title": "Food and Culture",
      "course_id": "031981"
    },
    "PRT-449": {
      "course_title": "Human Dimensions of Natural Resources in Australia/New Zealand",
      "course_id": "031416"
    },
    "PRT-450": {
      "course_title": "Sustaining Natural Resources in Australia/New Zealand",
      "course_id": "031417"
    },
    "PS-231": {
      "course_title": "Introduction to International Relations",
      "course_id": "018019"
    },
    "PS-236": {
      "course_title": "Issues in Global Politics",
      "course_id": "018023"
    },
    "PS-335": {
      "course_title": "International Law",
      "course_id": "018104"
    },
    "PS-336": {
      "course_title": "Global Environmental Politics",
      "course_id": "018105"
    },
    "PS-339": {
      "course_title": "Politics of the World Economy",
      "course_id": "018107"
    },
    "PS-341": {
      "course_title": "European Politics",
      "course_id": "018110"
    },
    "PS-342": {
      "course_title": "Politics of China and Japan",
      "course_id": "018112"
    },
    "PS-345": {
      "course_title": "Governments and Politics in the Middle East",
      "course_id": "018116"
    },
    "PS-431": {
      "course_title": "The United Nations and Global Order",
      "course_id": "018159"
    },
    "PS-433": {
      "course_title": "Global Problems and Policies",
      "course_id": "018163"
    },
    "PS-441": {
      "course_title": "Politics and Policies of the European Union",
      "course_id": "018171"
    },
    "REL-200": {
      "course_title": "Introduction to the Study of Religion",
      "course_id": "024281"
    },
    "REL-210": {
      "course_title": "Religious Traditions of the World",
      "course_id": "019222"
    },
    "REL-220": {
      "course_title": "Religion in the Contemporary World",
      "course_id": "032583"
    },
    "REL-230": {
      "course_title": "Asian Religions",
      "course_id": "019193"
    },
    "REL-311": {
      "course_title": "Introduction to the Old Testament",
      "course_id": "019229"
    },
    "REL-312": {
      "course_title": "Introduction to the New Testament",
      "course_id": "019230"
    },
    "REL-314": {
      "course_title": "Introduction to Intertestamental Literature",
      "course_id": "019232"
    },
    "REL-317": {
      "course_title": "Christianity",
      "course_id": "019235"
    },
    "REL-327": {
      "course_title": "Issues in Contemporary Religion",
      "course_id": "019247"
    },
    "REL-331": {
      "course_title": "The Hindu Tradition",
      "course_id": "019250"
    },
    "REL-332": {
      "course_title": "The Buddhist Traditions",
      "course_id": "019251"
    },
    "REL-333": {
      "course_title": "Chinese Religions",
      "course_id": "019254"
    },
    "REL-334": {
      "course_title": "Japanese Religions",
      "course_id": "019255"
    },
    "REL-340": {
      "course_title": "Islam",
      "course_id": "019256"
    },
    "REL-350": {
      "course_title": "Judaism",
      "course_id": "019257"
    },
    "REL-383": {
      "course_title": "Religion, Globalism, and Justice",
      "course_id": "023956"
    },
    "REL-402": {
      "course_title": "Early Christianity to the Time of Eusebius",
      "course_id": "011593"
    },
    "REL-407": {
      "course_title": "Islamic History to 1798",
      "course_id": "011599"
    },
    "REL-408": {
      "course_title": "Islam in the Modern World",
      "course_id": "011600"
    },
    "REL-412": {
      "course_title": "Advanced Readings in the Christian Gospels",
      "course_id": "019265"
    },
    "REL-413": {
      "course_title": "The Life and Letters of the Apostle Paul",
      "course_id": "019266"
    },
    "REL-424": {
      "course_title": "Religion and Politics in Global Perspective",
      "course_id": "032923"
    },
    "REL-482": {
      "course_title": "Religion and Conflict",
      "course_id": "023329"
    },
    "REL-489": {
      "course_title": "Interpretations of Religion",
      "course_id": "023958"
    },
    "SOC-220": {
      "course_title": "Cultural Geography",
      "course_id": "010994"
    },
    "SOC-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "SOC-342": {
      "course_title": "International Development",
      "course_id": "019534"
    },
    "SOC-351": {
      "course_title": "Population and Planning",
      "course_id": "019535"
    },
    "STS-302": {
      "course_title": "Contemporary Science, Technology and Human Values",
      "course_id": "021617"
    },
    "STS-320": {
      "course_title": "Cycling Cities: STS, the Bicycle and Urban Transportation",
      "course_id": "021619"
    },
    "STS-323": {
      "course_title": "World Population and Food Prospects",
      "course_id": "021620"
    },
    "SW-440": {
      "course_title": "International Learning Experience in Social Work",
      "course_id": "031165"
    },
    "SW-540": {
      "course_title": "International Learning Experience in Social Work",
      "course_id": "031165"
    },
    "WL-210": {
      "course_title": "Global Literature and Culture",
      "course_id": "033023"
    },
    "WL-211": {
      "course_title": "Introduction to the French-speaking World",
      "course_id": "033060"
    },
    "WL-216": {
      "course_title": "Art and Society in France",
      "course_id": "009712"
    },
    "WL-218": {
      "course_title": "The Harlem Renaissance in Paris: Paris Noir",
      "course_id": "033223"
    },
    "WL-219": {
      "course_title": "Studies in Great Works of Non-Western Literature",
      "course_id": "008431"
    },
    "WL-220": {
      "course_title": "Studies in Great Works of Western Literature",
      "course_id": "008433"
    },
    "WL-221": {
      "course_title": "Literature of the Western World I",
      "course_id": "008436"
    },
    "WL-222": {
      "course_title": "Literature of the Western World II",
      "course_id": "008440"
    },
    "WL-223": {
      "course_title": "Contemporary World Literature I",
      "course_id": "008441"
    },
    "WL-224": {
      "course_title": "Contemporary World Literature II",
      "course_id": "008445"
    },
    "WL-246": {
      "course_title": "Literature of the Holocaust",
      "course_id": "008453"
    },
    "WL-250": {
      "course_title": "Austrian Culture Up Close",
      "course_id": "032989"
    },
    "WL-275": {
      "course_title": "Literature and War",
      "course_id": "032425"
    },
    "WL-320": {
      "course_title": "Masterpieces of French Literature in Translation",
      "course_id": "033596"
    },
    "WL-355": {
      "course_title": "Race and Ethnicity in Japan",
      "course_id": "033571"
    },
    "WL-357": {
      "course_title": "Gender and Sexuality in Japan",
      "course_id": "033548"
    },
    "WL-392": {
      "course_title": "Major World Author",
      "course_id": "008617"
    },
    "WL-393": {
      "course_title": "Studies in Literary Genre",
      "course_id": "008618"
    },
    "WL-394": {
      "course_title": "Studies in World Literature",
      "course_id": "008623"
    },
    "WL-406": {
      "course_title": "Modernism",
      "course_id": "008646"
    },
    "WL-407": {
      "course_title": "Postmodernism",
      "course_id": "008647"
    },
    "WL-451": {
      "course_title": "Migration and Diaspora",
      "course_id": "033572"
    },
    "WLAR-318": {
      "course_title": "Egyptian Culture through Film",
      "course_id": "032284"
    },
    "WLAR-320": {
      "course_title": "Arabic for Professional Purposes",
      "course_id": "033249"
    },
    "WLAR-351": {
      "course_title": "Modern Arab Popular Culture",
      "course_id": "033145"
    },
    "WLCH-202": {
      "course_title": "Intermediate Chinese II",
      "course_id": "009826"
    },
    "WLCH-351": {
      "course_title": "Modern Chinese Popular Culture",
      "course_id": "031848"
    },
    "WLCH-402": {
      "course_title": "Advanced Chinese: Readings in Literature and Science",
      "course_id": "032415"
    },
    "WLCL-210": {
      "course_title": "Classical Mythology",
      "course_id": "011168"
    },
    "WLCL-215": {
      "course_title": "The Ancient World in Modern Media",
      "course_id": "031840"
    },
    "WLCL-225": {
      "course_title": "Roman Topography",
      "course_id": "033549"
    },
    "WLCL-320": {
      "course_title": "Masterpieces of Classical Literature",
      "course_id": "031760"
    },
    "WLCL-325": {
      "course_title": "Gender, Ethnicity & Identity in the Ancient World",
      "course_id": "031761"
    },
    "WLFR-202": {
      "course_title": "Intermediate French II",
      "course_id": "009865"
    },
    "WLFR-212": {
      "course_title": "French: Language, Culture, and Technology",
      "course_id": "023169"
    },
    "WLFR-301": {
      "course_title": "Survey of French Literature from the Middle Ages through the Enlightenment",
      "course_id": "009878"
    },
    "WLFR-302": {
      "course_title": "Survey of French Literature from Romanticism to the Contemporary Period",
      "course_id": "009880"
    },
    "WLFR-315": {
      "course_title": "French Civilization and Culture",
      "course_id": "009895"
    },
    "WLFR-318": {
      "course_title": "The Heritage of French Cinema",
      "course_id": "009899"
    },
    "WLFR-320": {
      "course_title": "Franco-Belgian Comics and Graphic Arts",
      "course_id": "033573"
    },
    "WLFR-425": {
      "course_title": "Literature, Cinema and Culture of the Francophone World",
      "course_id": "009918"
    },
    "WLFR-525": {
      "course_title": "Literature, Cinema and Culture of the Francophone World",
      "course_id": "009918"
    },
    "WLGE-202": {
      "course_title": "Intermediate German II",
      "course_id": "009954"
    },
    "WLGE-212": {
      "course_title": "German Language, Culture, Science, and Technology",
      "course_id": "009963"
    },
    "WLGE-315": {
      "course_title": "Germanic Civilization and Culture",
      "course_id": "009975"
    },
    "WLGE-318": {
      "course_title": "New German Cinema and Beyond",
      "course_id": "009977"
    },
    "WLGE-320": {
      "course_title": "Introduction to German Literature",
      "course_id": "023171"
    },
    "WLGE-323": {
      "course_title": "Twentieth Century German Literature",
      "course_id": "009979"
    },
    "WLGE-325": {
      "course_title": "German Lyric Poetry",
      "course_id": "009976"
    },
    "WLGE-420": {
      "course_title": "Current Issues in German-Language Media",
      "course_id": "009985"
    },
    "WLGE-440": {
      "course_title": "Green Germany: Nature and Environment in German Speaking Cultures",
      "course_id": "031237"
    },
    "WLGR-202": {
      "course_title": "Intermediate Greek II",
      "course_id": "011167"
    },
    "WLHU-202": {
      "course_title": "Intermediate Hindi-Urdu II",
      "course_id": "010052"
    },
    "WLHU-301": {
      "course_title": "Twentieth Century Hindi & Urdu Fiction",
      "course_id": "010057"
    },
    "WLHU-302": {
      "course_title": "Modern Hindi & Urdu Poetry",
      "course_id": "010059"
    },
    "WLHU-351": {
      "course_title": "Hindi-Urdu Popular Culture",
      "course_id": "033242"
    },
    "WLHU-401": {
      "course_title": "Hindi Literature and South Asian Cultural Contexts",
      "course_id": "031374"
    },
    "WLIT-202": {
      "course_title": "Intermediate Italian II",
      "course_id": "010005"
    },
    "WLIT-315": {
      "course_title": "Made in Italy: Where Heritage, Culture & Culinary History blend with Technological Innovation",
      "course_id": "032598"
    },
    "WLIT-318": {
      "course_title": "Italian Society Through Cinema",
      "course_id": "031073"
    },
    "WLJA-202": {
      "course_title": "Intermediate Japanese II",
      "course_id": "010023"
    },
    "WLJA-342": {
      "course_title": "Classical Japanese Literature in Translation",
      "course_id": "031365"
    },
    "WLJA-344": {
      "course_title": "Early Modern Japanese Literature in Translation",
      "course_id": "031372"
    },
    "WLJA-345": {
      "course_title": "Modern Japanese Literature in Translation",
      "course_id": "031373"
    },
    "WLRU-303": {
      "course_title": "Russian Literature in Translation: The Nineteenth Century",
      "course_id": "010075"
    },
    "WLRU-304": {
      "course_title": "Russian Literature in Translation: The Twentieth Century",
      "course_id": "010076"
    },
    "WLRU-318": {
      "course_title": "Russian Cinema and Society",
      "course_id": "031163"
    },
    "WLSP-202": {
      "course_title": "Intermediate Spanish II",
      "course_id": "010105"
    },
    "WLSP-212": {
      "course_title": "Spanish: Language, Technology, Culture",
      "course_id": "010122"
    },
    "WLSP-335": {
      "course_title": "Spanish for Native and Heritage Speakers",
      "course_id": "031722"
    },
    "WLSP-338": {
      "course_title": "Advanced Spanish for Native and Heritage Speakers",
      "course_id": "033615"
    },
    "WLSP-340": {
      "course_title": "Introduction to Hispanic Literatures and Cultures",
      "course_id": "024083"
    },
    "WLSP-343": {
      "course_title": "Literature and Culture of Spain III",
      "course_id": "024086"
    },
    "WLSP-352": {
      "course_title": "Literature and Culture of Latin America II",
      "course_id": "024088"
    }
  },
  "HES": {
    "DAN-202": {
      "course_title": "Introduction to Hula Hooping",
      "course_id": "033352"
    },
    "DAN-227": {
      "course_title": "African Dance I",
      "course_id": "032191"
    },
    "DAN-228": {
      "course_title": "African Dance II",
      "course_id": "032907"
    },
    "DAN-234": {
      "course_title": "Country Dance",
      "course_id": "017001"
    },
    "DAN-240": {
      "course_title": "Social Dance",
      "course_id": "017016"
    },
    "DAN-241": {
      "course_title": "Social Dance II",
      "course_id": "017021"
    },
    "DAN-260": {
      "course_title": "Hip-hop Dance",
      "course_id": "032597"
    },
    "DAN-261": {
      "course_title": "Hip-hop Dance II",
      "course_id": "032982"
    },
    "DAN-263": {
      "course_title": "Tap Dance",
      "course_id": "017053"
    },
    "DAN-264": {
      "course_title": "Ballet I",
      "course_id": "004841"
    },
    "DAN-265": {
      "course_title": "Ballet II",
      "course_id": "032243"
    },
    "DAN-273": {
      "course_title": "Jazz Dance I",
      "course_id": "017067"
    },
    "DAN-274": {
      "course_title": "Modern Dance I",
      "course_id": "004843"
    },
    "DAN-275": {
      "course_title": "Modern Dance II",
      "course_id": "004844"
    },
    "DAN-276": {
      "course_title": "Jazz Dance II",
      "course_id": "032244"
    },
    "DAN-279": {
      "course_title": "Yoga I",
      "course_id": "017071"
    },
    "DAN-280": {
      "course_title": "Yoga II",
      "course_id": "017072"
    },
    "DAN-281": {
      "course_title": "Pilates",
      "course_id": "016995"
    },
    "DAN-285": {
      "course_title": "Advanced Dance Techniques",
      "course_id": "033229"
    },
    "HES-195": {
      "course_title": "Special Topics in Health and Exercise Studies",
      "course_id": "032450"
    },
    "HES-295": {
      "course_title": "Health and Exercise Studies Special Topics GEP",
      "course_id": "032498"
    },
    "HESA-214": {
      "course_title": "Beginning Swimming",
      "course_id": "016978"
    },
    "HESA-215": {
      "course_title": "Advanced Beginning Swimming",
      "course_id": "016979"
    },
    "HESA-221": {
      "course_title": "Intermediate Swimming",
      "course_id": "016984"
    },
    "HESA-226": {
      "course_title": "Skin and Scuba Diving I",
      "course_id": "016991"
    },
    "HESA-227": {
      "course_title": "Skin & Scuba Diving II",
      "course_id": "016992"
    },
    "HESA-229": {
      "course_title": "Scuba Leadership",
      "course_id": "016989"
    },
    "HESA-231": {
      "course_title": "Scientific Diving",
      "course_id": "016997"
    },
    "HESF-100": {
      "course_title": "Cross Training",
      "course_id": "031943"
    },
    "HESF-101": {
      "course_title": "Fitness and Wellness",
      "course_id": "016938"
    },
    "HESF-102": {
      "course_title": "Fitness Walking",
      "course_id": "016940"
    },
    "HESF-103": {
      "course_title": "Water Aerobics",
      "course_id": "016942"
    },
    "HESF-104": {
      "course_title": "Swim Conditioning",
      "course_id": "016944"
    },
    "HESF-105": {
      "course_title": "Aerobics and Body Conditioning",
      "course_id": "016945"
    },
    "HESF-107": {
      "course_title": "Run Conditioning",
      "course_id": "016948"
    },
    "HESF-108": {
      "course_title": "Water Step Aerobics",
      "course_id": "016949"
    },
    "HESF-109": {
      "course_title": "Step Aerobics",
      "course_id": "016950"
    },
    "HESF-110": {
      "course_title": "Adapted Fitness and Wellness",
      "course_id": "016952"
    },
    "HESF-111": {
      "course_title": "Indoor Group Cycling",
      "course_id": "016953"
    },
    "HESF-112": {
      "course_title": "Fitness Kickboxing",
      "course_id": "032293"
    },
    "HESF-113": {
      "course_title": "High Intensity Conditioning",
      "course_id": "032524"
    },
    "HESF-114": {
      "course_title": "Functional Training and Proprioceptive Awareness",
      "course_id": "033393"
    },
    "HESF-115": {
      "course_title": "Wellness and Resilience",
      "course_id": "033394"
    },
    "HESF-120": {
      "course_title": "Mindful Movement",
      "course_id": "033153"
    },
    "HESO-255": {
      "course_title": "Canoeing",
      "course_id": "017043"
    },
    "HESO-257": {
      "course_title": "Backpacking",
      "course_id": "017047"
    },
    "HESO-258": {
      "course_title": "Rock Climbing 1",
      "course_id": "017048"
    },
    "HESO-259": {
      "course_title": "Rock Climbing 2",
      "course_id": "017049"
    },
    "HESO-262": {
      "course_title": "Whitewater Canoeing",
      "course_id": "017052"
    },
    "HESO-263": {
      "course_title": "Whitewater Kayaking",
      "course_id": "032029"
    },
    "HESO-276": {
      "course_title": "Whitewater Rafting",
      "course_id": "017068"
    },
    "HESO-277": {
      "course_title": "Mountain Biking",
      "course_id": "017069"
    },
    "HESO-278": {
      "course_title": "Fly-Fishing",
      "course_id": "017070"
    },
    "HESO-283": {
      "course_title": "Mountaineering",
      "course_id": "017077"
    },
    "HESO-284": {
      "course_title": "Sea Kayaking",
      "course_id": "017078"
    },
    "HESR-242": {
      "course_title": "Badminton",
      "course_id": "017022"
    },
    "HESR-249": {
      "course_title": "Tennis I",
      "course_id": "017035"
    },
    "HESR-250": {
      "course_title": "Tennis II",
      "course_id": "017037"
    },
    "HESR-255": {
      "course_title": "Pickleball",
      "course_id": "032294"
    },
    "HESR-256": {
      "course_title": "Racquetball",
      "course_id": "017044"
    },
    "HESS-237": {
      "course_title": "Weight Training",
      "course_id": "017010"
    },
    "HESS-239": {
      "course_title": "Self Defense",
      "course_id": "017015"
    },
    "HESS-243": {
      "course_title": "Bowling",
      "course_id": "017025"
    },
    "HESS-245": {
      "course_title": "Golf",
      "course_id": "017028"
    },
    "HESS-251": {
      "course_title": "Target Archery",
      "course_id": "017038"
    },
    "HESS-253": {
      "course_title": "Target Archery II",
      "course_id": "033271"
    },
    "HEST-216": {
      "course_title": "Soccer",
      "course_id": "016980"
    },
    "HEST-261": {
      "course_title": "Basketball",
      "course_id": "017051"
    },
    "HEST-266": {
      "course_title": "Ultimate Frisbee",
      "course_id": "017056"
    },
    "HEST-267": {
      "course_title": "Flag Football",
      "course_id": "017057"
    },
    "HEST-269": {
      "course_title": "Volleyball I",
      "course_id": "017061"
    },
    "HEST-270": {
      "course_title": "Volleyball II",
      "course_id": "017063"
    }
  },
  "HUM": {
    "AFS-240": {
      "course_title": "African Civilization",
      "course_id": "021594"
    },
    "AFS-241": {
      "course_title": "Introduction to African American Studies",
      "course_id": "000361"
    },
    "AFS-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "AFS-275": {
      "course_title": "Introduction to History of South and East Africa",
      "course_id": "000365"
    },
    "AFS-276": {
      "course_title": "Introduction to History of West Africa",
      "course_id": "000366"
    },
    "AFS-342": {
      "course_title": "Introduction to the African Diaspora",
      "course_id": "000369"
    },
    "AFS-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "AFS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "AFS-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "AFS-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "AFS-442": {
      "course_title": "Issues in the African Diaspora",
      "course_id": "000383"
    },
    "AFS-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "AFS-470": {
      "course_title": "The Red Record and The Birth of a Nation",
      "course_id": "033154"
    },
    "AFS-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "ARS-251": {
      "course_title": "The Arts of a World Capital: London",
      "course_id": "001181"
    },
    "ARS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "COM-200": {
      "course_title": "Communication Media in a Changing World",
      "course_id": "019880"
    },
    "COM-211": {
      "course_title": "Argumentation and Advocacy",
      "course_id": "019891"
    },
    "COM-289": {
      "course_title": "Science Communication and Public Engagement",
      "course_id": "032584"
    },
    "COM-395": {
      "course_title": "Studies in Rhetoric and Digital Media",
      "course_id": "008634"
    },
    "ECD-225": {
      "course_title": "Foundations of Cultural Competence",
      "course_id": "031906"
    },
    "ENG-206": {
      "course_title": "Studies In Drama",
      "course_id": "008413"
    },
    "ENG-207": {
      "course_title": "Studies in Poetry",
      "course_id": "008415"
    },
    "ENG-208": {
      "course_title": "Studies In Fiction",
      "course_id": "008417"
    },
    "ENG-209": {
      "course_title": "Introduction to Shakespeare",
      "course_id": "008420"
    },
    "ENG-219": {
      "course_title": "Studies in Great Works of Non-Western Literature",
      "course_id": "008431"
    },
    "ENG-220": {
      "course_title": "Studies in Great Works of Western Literature",
      "course_id": "008433"
    },
    "ENG-221": {
      "course_title": "Literature of the Western World I",
      "course_id": "008436"
    },
    "ENG-222": {
      "course_title": "Literature of the Western World II",
      "course_id": "008440"
    },
    "ENG-223": {
      "course_title": "Contemporary World Literature I",
      "course_id": "008441"
    },
    "ENG-224": {
      "course_title": "Contemporary World Literature II",
      "course_id": "008445"
    },
    "ENG-232": {
      "course_title": "Literature and Medicine",
      "course_id": "008447"
    },
    "ENG-246": {
      "course_title": "Literature of the Holocaust",
      "course_id": "008453"
    },
    "ENG-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "ENG-249": {
      "course_title": "Native American Literature",
      "course_id": "024064"
    },
    "ENG-251": {
      "course_title": "Major British Writers",
      "course_id": "008456"
    },
    "ENG-252": {
      "course_title": "Major American Writers",
      "course_id": "008460"
    },
    "ENG-255": {
      "course_title": "Beyond Britain: Literature from Colonies of the British Empire",
      "course_id": "032413"
    },
    "ENG-261": {
      "course_title": "English Literature I",
      "course_id": "008466"
    },
    "ENG-262": {
      "course_title": "English Literature II",
      "course_id": "008472"
    },
    "ENG-265": {
      "course_title": "American Literature I",
      "course_id": "008479"
    },
    "ENG-266": {
      "course_title": "American Literature II",
      "course_id": "008484"
    },
    "ENG-267": {
      "course_title": "LGBTQI Literature in the U.S.",
      "course_id": "031907"
    },
    "ENG-275": {
      "course_title": "Literature and War",
      "course_id": "032425"
    },
    "ENG-305": {
      "course_title": "Women and Literature",
      "course_id": "008534"
    },
    "ENG-308": {
      "course_title": "Contemporary Issues in Ecofeminism",
      "course_id": "032060"
    },
    "ENG-326": {
      "course_title": "History of the English Language",
      "course_id": "008557"
    },
    "ENG-329": {
      "course_title": "Language and Globalization",
      "course_id": "032664"
    },
    "ENG-339": {
      "course_title": "Literature and Technology",
      "course_id": "032404"
    },
    "ENG-340": {
      "course_title": "Literature, Art, and Society",
      "course_id": "008688"
    },
    "ENG-341": {
      "course_title": "Literature and Science",
      "course_id": "032449"
    },
    "ENG-342": {
      "course_title": "Literature of Space and Place",
      "course_id": "032426"
    },
    "ENG-361": {
      "course_title": "Studies in British Poetry",
      "course_id": "032405"
    },
    "ENG-362": {
      "course_title": "Studies in the British Novel",
      "course_id": "008579"
    },
    "ENG-370": {
      "course_title": "American Fiction, Twentieth Century and Beyond",
      "course_id": "008585"
    },
    "ENG-372": {
      "course_title": "American Poetry, Twentieth Century and Beyond",
      "course_id": "008588"
    },
    "ENG-377": {
      "course_title": "Fantasy",
      "course_id": "008595"
    },
    "ENG-380": {
      "course_title": "Modern Drama",
      "course_id": "008598"
    },
    "ENG-385": {
      "course_title": "Biblical Backgrounds of English Literature",
      "course_id": "008610"
    },
    "ENG-390": {
      "course_title": "Classical Backgrounds of English Literature",
      "course_id": "008614"
    },
    "ENG-392": {
      "course_title": "Major World Author",
      "course_id": "008617"
    },
    "ENG-393": {
      "course_title": "Studies in Literary Genre",
      "course_id": "008618"
    },
    "ENG-394": {
      "course_title": "Studies in World Literature",
      "course_id": "008623"
    },
    "ENG-395": {
      "course_title": "Studies in Rhetoric and Digital Media",
      "course_id": "008634"
    },
    "ENG-399": {
      "course_title": "Contemporary Literature",
      "course_id": "008641"
    },
    "ENG-406": {
      "course_title": "Modernism",
      "course_id": "008646"
    },
    "ENG-407": {
      "course_title": "Postmodernism",
      "course_id": "008647"
    },
    "ENG-410": {
      "course_title": "Studies in Gender and Genre",
      "course_id": "008648"
    },
    "ENG-420": {
      "course_title": "Major American Authors",
      "course_id": "008650"
    },
    "ENG-439": {
      "course_title": "Studies in English Renaissance Literature",
      "course_id": "008660"
    },
    "ENG-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "ENG-451": {
      "course_title": "Chaucer",
      "course_id": "008665"
    },
    "ENG-453": {
      "course_title": "Studies in Nineteenth-Century British Literature",
      "course_id": "008670"
    },
    "ENG-460": {
      "course_title": "Major British Author",
      "course_id": "008673"
    },
    "ENG-464": {
      "course_title": "British Literature and the Founding of Empire",
      "course_id": "008678"
    },
    "ENG-465": {
      "course_title": "British Literature and the Dissolution of Empire",
      "course_id": "008679"
    },
    "ENG-466": {
      "course_title": "Transatlantic Literatures",
      "course_id": "032414"
    },
    "ENG-467": {
      "course_title": "American Colonial Literature",
      "course_id": "008680"
    },
    "ENG-468": {
      "course_title": "Studies in Nineteenth-Century American Literature",
      "course_id": "008681"
    },
    "ENG-470": {
      "course_title": "American Literature, Twentieth Century and Beyond",
      "course_id": "008685"
    },
    "ENG-476": {
      "course_title": "Southern Literature",
      "course_id": "008690"
    },
    "ENG-485": {
      "course_title": "Shakespeare: Revisions and Resources",
      "course_id": "008694"
    },
    "ENG-486": {
      "course_title": "Shakespeare, The Earlier Plays",
      "course_id": "008696"
    },
    "ENG-487": {
      "course_title": "Shakespeare, The Later Plays",
      "course_id": "008699"
    },
    "ENG-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "ENG-551": {
      "course_title": "Chaucer",
      "course_id": "008665"
    },
    "HUM-295": {
      "course_title": "Humanities Special Topics",
      "course_id": "031855"
    },
    "HUMG-295": {
      "course_title": "Humanities and Global Knowledge Special Topics",
      "course_id": "031856"
    },
    "HA-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-207": {
      "course_title": "Ancient Mediterranean World",
      "course_id": "011424"
    },
    "HI-208": {
      "course_title": "The Middle Ages",
      "course_id": "011430"
    },
    "HI-209": {
      "course_title": "From Renaissance to Revolution: The Origins of Modern Europe",
      "course_id": "011435"
    },
    "HI-210": {
      "course_title": "Modern Europe 1815-Present",
      "course_id": "011440"
    },
    "HI-214": {
      "course_title": "History and Archaeology of Ancient Latin America",
      "course_id": "032074"
    },
    "HI-215": {
      "course_title": "Colonial Latin America",
      "course_id": "011446"
    },
    "HI-216": {
      "course_title": "Modern Latin America",
      "course_id": "011449"
    },
    "HI-217": {
      "course_title": "Caribbean History",
      "course_id": "032558"
    },
    "HI-221": {
      "course_title": "British History to 1688",
      "course_id": "011454"
    },
    "HI-222": {
      "course_title": "History of British Cultures and Societies From 1688",
      "course_id": "011457"
    },
    "HI-232": {
      "course_title": "The World from 1200 to 1750",
      "course_id": "031448"
    },
    "HI-233": {
      "course_title": "The World Since 1750",
      "course_id": "011459"
    },
    "HI-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-251": {
      "course_title": "American History I",
      "course_id": "011481"
    },
    "HI-252": {
      "course_title": "American History II",
      "course_id": "011487"
    },
    "HI-253": {
      "course_title": "Early U.S. History",
      "course_id": "032366"
    },
    "HI-254": {
      "course_title": "Modern U.S. History",
      "course_id": "032178"
    },
    "HI-263": {
      "course_title": "Asian Civilizations to 1800",
      "course_id": "011493"
    },
    "HI-264": {
      "course_title": "Modern Asia: 1800 to Present",
      "course_id": "011495"
    },
    "HI-270": {
      "course_title": "Modern Middle East",
      "course_id": "011502"
    },
    "HI-275": {
      "course_title": "Introduction to History of South and East Africa",
      "course_id": "000365"
    },
    "HI-276": {
      "course_title": "Introduction to History of West Africa",
      "course_id": "000366"
    },
    "HI-305": {
      "course_title": "Frauds and Mysteries of the Past",
      "course_id": "011534"
    },
    "HI-307": {
      "course_title": "Jewish History",
      "course_id": "031952"
    },
    "HI-317": {
      "course_title": "Cuba Today: Historical and Sociopolitical Perspectives",
      "course_id": "032538"
    },
    "HI-320": {
      "course_title": "Religion in American History",
      "course_id": "011537"
    },
    "HI-321": {
      "course_title": "Scientific Revolution and European Society, 1500-1800",
      "course_id": "011538"
    },
    "HI-324": {
      "course_title": "History of Common Law and Constitution",
      "course_id": "031838"
    },
    "HI-325": {
      "course_title": "Law and Society in European History",
      "course_id": "033500"
    },
    "HI-332": {
      "course_title": "Germany and the World Wars",
      "course_id": "011632"
    },
    "HI-335": {
      "course_title": "The World at War",
      "course_id": "011548"
    },
    "HI-337": {
      "course_title": "Spy vs. Spy: Cold War Intelligence History",
      "course_id": "032288"
    },
    "HI-338": {
      "course_title": "Empire, War, and Revolution in Russia",
      "course_id": "032066"
    },
    "HI-340": {
      "course_title": "History of Agriculture",
      "course_id": "011551"
    },
    "HI-342": {
      "course_title": "Global Environmental History",
      "course_id": "032985"
    },
    "HI-343": {
      "course_title": "Topics in Urban History",
      "course_id": "011556"
    },
    "HI-345": {
      "course_title": "American Popular Culture",
      "course_id": "011558"
    },
    "HI-346": {
      "course_title": "The Civil War Era in Popular Culture",
      "course_id": "011559"
    },
    "HI-350": {
      "course_title": "American Military History",
      "course_id": "011562"
    },
    "HI-351": {
      "course_title": "U.S. Naval History",
      "course_id": "011564"
    },
    "HI-354": {
      "course_title": "The Rise of the American Empire",
      "course_id": "032203"
    },
    "HI-360": {
      "course_title": "U.S. Agricultural History",
      "course_id": "032179"
    },
    "HI-361": {
      "course_title": "Global History of American Food and Drink",
      "course_id": "032986"
    },
    "HI-364": {
      "course_title": "History of North Carolina",
      "course_id": "011570"
    },
    "HI-365": {
      "course_title": "The American West",
      "course_id": "011573"
    },
    "HI-366": {
      "course_title": "Native American History",
      "course_id": "024148"
    },
    "HI-369": {
      "course_title": "Sexuality in U.S. History",
      "course_id": "011576"
    },
    "HI-370": {
      "course_title": "Modern Egypt",
      "course_id": "011577"
    },
    "HI-371": {
      "course_title": "Modern Japan, 1850 to Present",
      "course_id": "011579"
    },
    "HI-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "HI-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "HI-374": {
      "course_title": "Visual Culture of Modern South Asia",
      "course_id": "031449"
    },
    "HI-375": {
      "course_title": "Global History of Travel and Tourism",
      "course_id": "032945"
    },
    "HI-376": {
      "course_title": "Global Migrations",
      "course_id": "011582"
    },
    "HI-377": {
      "course_title": "The Silk Road in the Medieval World",
      "course_id": "033009"
    },
    "HI-378": {
      "course_title": "Global Games: Sport History around the World",
      "course_id": "033501"
    },
    "HI-380": {
      "course_title": "History of Nonprofits, Philanthropy, and Social Change",
      "course_id": "011583"
    },
    "HI-381": {
      "course_title": "Changemakers: The Global Context of Activism",
      "course_id": "031989"
    },
    "HI-382": {
      "course_title": "History of Capitalism in America",
      "course_id": "032957"
    },
    "HI-383": {
      "course_title": "Law in the American Story",
      "course_id": "033206"
    },
    "HI-385": {
      "course_title": "Introduction to Public History",
      "course_id": "032678"
    },
    "HI-402": {
      "course_title": "Early Christianity to the Time of Eusebius",
      "course_id": "011593"
    },
    "HI-407": {
      "course_title": "Islamic History to 1798",
      "course_id": "011599"
    },
    "HI-408": {
      "course_title": "Islam in the Modern World",
      "course_id": "011600"
    },
    "HI-410": {
      "course_title": "Italian Renaissance",
      "course_id": "011603"
    },
    "HI-429": {
      "course_title": "20th Century Britain",
      "course_id": "011629"
    },
    "HI-445": {
      "course_title": "Early American Borderlands",
      "course_id": "011646"
    },
    "HI-446": {
      "course_title": "Topics in Civil War and Reconstruction",
      "course_id": "011647"
    },
    "HI-447": {
      "course_title": "Women in America to 1890",
      "course_id": "011649"
    },
    "HI-448": {
      "course_title": "American Women in the Twentieth Century",
      "course_id": "011650"
    },
    "HI-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "HI-462": {
      "course_title": "Southern History since the Civil War",
      "course_id": "011669"
    },
    "HI-486": {
      "course_title": "Science and Empire",
      "course_id": "011705"
    },
    "HI-545": {
      "course_title": "Early American Borderlands",
      "course_id": "011646"
    },
    "HI-546": {
      "course_title": "Topics in Civil War and Reconstruction",
      "course_id": "011647"
    },
    "HI-547": {
      "course_title": "Women in America to 1890",
      "course_id": "011649"
    },
    "HI-548": {
      "course_title": "American Women in the Twentieth Century",
      "course_id": "011650"
    },
    "HI-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "HI-562": {
      "course_title": "Southern History since the Civil War",
      "course_id": "011669"
    },
    "HI-586": {
      "course_title": "Science and Empire",
      "course_id": "011705"
    },
    "HON-202": {
      "course_title": "Inquiry, Discovery, and Literature",
      "course_id": "012020"
    },
    "HON-210": {
      "course_title": "How We Argue",
      "course_id": "033362"
    },
    "HON-290": {
      "course_title": "Honors Special Topics - Humanities/US Diversity",
      "course_id": "012021"
    },
    "HON-294": {
      "course_title": "Honors Special Topics-Humanities",
      "course_id": "012046"
    },
    "HON-314": {
      "course_title": "Society's Mirror: Literature in 20th-Century America",
      "course_id": "032997"
    },
    "HON-341": {
      "course_title": "Time Travel",
      "course_id": "012114"
    },
    "HON-344": {
      "course_title": "Kantian Ethics",
      "course_id": "031558"
    },
    "HON-345": {
      "course_title": "On the Human",
      "course_id": "031559"
    },
    "HON-347": {
      "course_title": "Freedom and the Self",
      "course_id": "032183"
    },
    "HON-357": {
      "course_title": "Performing the Lost Cause",
      "course_id": "033420"
    },
    "HSS-201": {
      "course_title": "Critical Thinking in American Life: Engaging Across Difference",
      "course_id": "033240"
    },
    "ID-244": {
      "course_title": "History of Industrial Design",
      "course_id": "031870"
    },
    "MUS-212": {
      "course_title": "Music of North Carolina",
      "course_id": "033593"
    },
    "MUS-215": {
      "course_title": "The Beatles and the British Invasion",
      "course_id": "033332"
    },
    "MUS-231": {
      "course_title": "Music in Film and Television",
      "course_id": "033174"
    },
    "MUS-340": {
      "course_title": "From Wax Cylinders to AI: Music Technology in Modern History",
      "course_id": "033594"
    },
    "NS-420": {
      "course_title": "Naval Leadership and Ethics",
      "course_id": "016427"
    },
    "PHI-205": {
      "course_title": "Introduction to Philosophy",
      "course_id": "017167"
    },
    "PHI-210": {
      "course_title": "Puzzles and Paradoxes",
      "course_id": "031689"
    },
    "PHI-212": {
      "course_title": "Ethical Problems in the Law",
      "course_id": "017213"
    },
    "PHI-214": {
      "course_title": "Issues in Business Ethics",
      "course_id": "017175"
    },
    "PHI-221": {
      "course_title": "Contemporary Moral Issues",
      "course_id": "017176"
    },
    "PHI-227": {
      "course_title": "Data Ethics",
      "course_id": "032991"
    },
    "PHI-300": {
      "course_title": "Ancient Philosophy",
      "course_id": "017195"
    },
    "PHI-301": {
      "course_title": "Early Modern Philosophy",
      "course_id": "017197"
    },
    "PHI-302": {
      "course_title": "19th Century Philosophy",
      "course_id": "017198"
    },
    "PHI-305": {
      "course_title": "Philosophy of Religion",
      "course_id": "017201"
    },
    "PHI-308": {
      "course_title": "History of Social and Political Philosophy",
      "course_id": "033363"
    },
    "PHI-309": {
      "course_title": "Political Philosophy",
      "course_id": "017206"
    },
    "PHI-310": {
      "course_title": "Existentialism",
      "course_id": "017208"
    },
    "PHI-312": {
      "course_title": "Philosophy of Law",
      "course_id": "017211"
    },
    "PHI-319": {
      "course_title": "Black Political Philosophy",
      "course_id": "017220"
    },
    "PHI-320": {
      "course_title": "Philosophy of Race",
      "course_id": "032452"
    },
    "PHI-325": {
      "course_title": "Bio-Medical Ethics",
      "course_id": "017229"
    },
    "PHI-330": {
      "course_title": "Metaphysics",
      "course_id": "017231"
    },
    "PHI-331": {
      "course_title": "Philosophy of Language",
      "course_id": "017233"
    },
    "PHI-332": {
      "course_title": "Philosophy of Psychology",
      "course_id": "017234"
    },
    "PHI-333": {
      "course_title": "Knowledge and Skepticism",
      "course_id": "017236"
    },
    "PHI-340": {
      "course_title": "Philosophy of Science",
      "course_id": "017239"
    },
    "PHI-347": {
      "course_title": "Neuroscience and Philosophy",
      "course_id": "032428"
    },
    "PHI-375": {
      "course_title": "Ethics",
      "course_id": "017242"
    },
    "PHI-376": {
      "course_title": "History of Ethics",
      "course_id": "023295"
    },
    "PHI-401": {
      "course_title": "Kant's Critique of Pure Reason",
      "course_id": "017244"
    },
    "PHI-403": {
      "course_title": "Continental Philosophy After 1900",
      "course_id": "023294"
    },
    "PHI-420": {
      "course_title": "Global Justice",
      "course_id": "017251"
    },
    "PHI-425": {
      "course_title": "Introduction to Cognitive Science",
      "course_id": "017253"
    },
    "PHI-440": {
      "course_title": "The Scientific Method",
      "course_id": "017254"
    },
    "PHI-447": {
      "course_title": "Philosophy, Evolution and Human Nature",
      "course_id": "031141"
    },
    "PS-361": {
      "course_title": "Introduction to Political Theory",
      "course_id": "018119"
    },
    "PS-362": {
      "course_title": "American Political Thought",
      "course_id": "018123"
    },
    "PSY-425": {
      "course_title": "Introduction to Cognitive Science",
      "course_id": "017253"
    },
    "REL-200": {
      "course_title": "Introduction to the Study of Religion",
      "course_id": "024281"
    },
    "REL-210": {
      "course_title": "Religious Traditions of the World",
      "course_id": "019222"
    },
    "REL-220": {
      "course_title": "Religion in the Contemporary World",
      "course_id": "032583"
    },
    "REL-230": {
      "course_title": "Asian Religions",
      "course_id": "019193"
    },
    "REL-240": {
      "course_title": "Religion and Popular Culture",
      "course_id": "033621"
    },
    "REL-309": {
      "course_title": "Religion and Society",
      "course_id": "019226"
    },
    "REL-311": {
      "course_title": "Introduction to the Old Testament",
      "course_id": "019229"
    },
    "REL-312": {
      "course_title": "Introduction to the New Testament",
      "course_id": "019230"
    },
    "REL-314": {
      "course_title": "Introduction to Intertestamental Literature",
      "course_id": "019232"
    },
    "REL-317": {
      "course_title": "Christianity",
      "course_id": "019235"
    },
    "REL-320": {
      "course_title": "Religion in American History",
      "course_id": "011537"
    },
    "REL-323": {
      "course_title": "Religious Cults, Sects, and Minority Faiths in America",
      "course_id": "019242"
    },
    "REL-327": {
      "course_title": "Issues in Contemporary Religion",
      "course_id": "019247"
    },
    "REL-331": {
      "course_title": "The Hindu Tradition",
      "course_id": "019250"
    },
    "REL-332": {
      "course_title": "The Buddhist Traditions",
      "course_id": "019251"
    },
    "REL-333": {
      "course_title": "Chinese Religions",
      "course_id": "019254"
    },
    "REL-334": {
      "course_title": "Japanese Religions",
      "course_id": "019255"
    },
    "REL-340": {
      "course_title": "Islam",
      "course_id": "019256"
    },
    "REL-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "REL-350": {
      "course_title": "Judaism",
      "course_id": "019257"
    },
    "REL-380": {
      "course_title": "Emotion and Religion",
      "course_id": "033037"
    },
    "REL-383": {
      "course_title": "Religion, Globalism, and Justice",
      "course_id": "023956"
    },
    "REL-402": {
      "course_title": "Early Christianity to the Time of Eusebius",
      "course_id": "011593"
    },
    "REL-407": {
      "course_title": "Islamic History to 1798",
      "course_id": "011599"
    },
    "REL-408": {
      "course_title": "Islam in the Modern World",
      "course_id": "011600"
    },
    "REL-412": {
      "course_title": "Advanced Readings in the Christian Gospels",
      "course_id": "019265"
    },
    "REL-413": {
      "course_title": "The Life and Letters of the Apostle Paul",
      "course_id": "019266"
    },
    "REL-423": {
      "course_title": "Religion and Politics in America",
      "course_id": "019267"
    },
    "REL-424": {
      "course_title": "Religion and Politics in Global Perspective",
      "course_id": "032923"
    },
    "REL-471": {
      "course_title": "Darwinism and Christianity",
      "course_id": "019268"
    },
    "REL-472": {
      "course_title": "Women and Religion",
      "course_id": "019270"
    },
    "REL-482": {
      "course_title": "Religion and Conflict",
      "course_id": "023329"
    },
    "REL-489": {
      "course_title": "Interpretations of Religion",
      "course_id": "023958"
    },
    "SOC-309": {
      "course_title": "Religion and Society",
      "course_id": "019226"
    },
    "STS-325": {
      "course_title": "Bio-Medical Ethics",
      "course_id": "017229"
    },
    "STS-471": {
      "course_title": "Darwinism and Christianity",
      "course_id": "019268"
    },
    "WGS-305": {
      "course_title": "Women and Literature",
      "course_id": "008534"
    },
    "WGS-308": {
      "course_title": "Contemporary Issues in Ecofeminism",
      "course_id": "032060"
    },
    "WGS-390": {
      "course_title": "Queer Theory",
      "course_id": "032906"
    },
    "WGS-410": {
      "course_title": "Studies in Gender and Genre",
      "course_id": "008648"
    },
    "WGS-447": {
      "course_title": "Women in America to 1890",
      "course_id": "011649"
    },
    "WGS-448": {
      "course_title": "American Women in the Twentieth Century",
      "course_id": "011650"
    },
    "WGS-472": {
      "course_title": "Women and Religion",
      "course_id": "019270"
    },
    "WGS-492": {
      "course_title": "Theoretical Issues in Women's, Gender, and Sexuality Studies",
      "course_id": "015100"
    },
    "WGS-547": {
      "course_title": "Women in America to 1890",
      "course_id": "011649"
    },
    "WGS-548": {
      "course_title": "American Women in the Twentieth Century",
      "course_id": "011650"
    },
    "WL-210": {
      "course_title": "Global Literature and Culture",
      "course_id": "033023"
    },
    "WL-211": {
      "course_title": "Introduction to the French-speaking World",
      "course_id": "033060"
    },
    "WL-219": {
      "course_title": "Studies in Great Works of Non-Western Literature",
      "course_id": "008431"
    },
    "WL-220": {
      "course_title": "Studies in Great Works of Western Literature",
      "course_id": "008433"
    },
    "WL-221": {
      "course_title": "Literature of the Western World I",
      "course_id": "008436"
    },
    "WL-222": {
      "course_title": "Literature of the Western World II",
      "course_id": "008440"
    },
    "WL-223": {
      "course_title": "Contemporary World Literature I",
      "course_id": "008441"
    },
    "WL-224": {
      "course_title": "Contemporary World Literature II",
      "course_id": "008445"
    },
    "WL-246": {
      "course_title": "Literature of the Holocaust",
      "course_id": "008453"
    },
    "WL-250": {
      "course_title": "Austrian Culture Up Close",
      "course_id": "032989"
    },
    "WL-275": {
      "course_title": "Literature and War",
      "course_id": "032425"
    },
    "WL-320": {
      "course_title": "Masterpieces of French Literature in Translation",
      "course_id": "033596"
    },
    "WL-355": {
      "course_title": "Race and Ethnicity in Japan",
      "course_id": "033571"
    },
    "WL-357": {
      "course_title": "Gender and Sexuality in Japan",
      "course_id": "033548"
    },
    "WL-392": {
      "course_title": "Major World Author",
      "course_id": "008617"
    },
    "WL-393": {
      "course_title": "Studies in Literary Genre",
      "course_id": "008618"
    },
    "WL-394": {
      "course_title": "Studies in World Literature",
      "course_id": "008623"
    },
    "WL-406": {
      "course_title": "Modernism",
      "course_id": "008646"
    },
    "WL-407": {
      "course_title": "Postmodernism",
      "course_id": "008647"
    },
    "WLAR-318": {
      "course_title": "Egyptian Culture through Film",
      "course_id": "032284"
    },
    "WLAR-351": {
      "course_title": "Modern Arab Popular Culture",
      "course_id": "033145"
    },
    "WLCH-351": {
      "course_title": "Modern Chinese Popular Culture",
      "course_id": "031848"
    },
    "WLCH-402": {
      "course_title": "Advanced Chinese: Readings in Literature and Science",
      "course_id": "032415"
    },
    "WLCL-210": {
      "course_title": "Classical Mythology",
      "course_id": "011168"
    },
    "WLCL-215": {
      "course_title": "The Ancient World in Modern Media",
      "course_id": "031840"
    },
    "WLCL-225": {
      "course_title": "Roman Topography",
      "course_id": "033549"
    },
    "WLCL-320": {
      "course_title": "Masterpieces of Classical Literature",
      "course_id": "031760"
    },
    "WLCL-325": {
      "course_title": "Gender, Ethnicity & Identity in the Ancient World",
      "course_id": "031761"
    },
    "WLFR-301": {
      "course_title": "Survey of French Literature from the Middle Ages through the Enlightenment",
      "course_id": "009878"
    },
    "WLFR-302": {
      "course_title": "Survey of French Literature from Romanticism to the Contemporary Period",
      "course_id": "009880"
    },
    "WLFR-315": {
      "course_title": "French Civilization and Culture",
      "course_id": "009895"
    },
    "WLFR-320": {
      "course_title": "Franco-Belgian Comics and Graphic Arts",
      "course_id": "033573"
    },
    "WLFR-425": {
      "course_title": "Literature, Cinema and Culture of the Francophone World",
      "course_id": "009918"
    },
    "WLFR-525": {
      "course_title": "Literature, Cinema and Culture of the Francophone World",
      "course_id": "009918"
    },
    "WLGE-315": {
      "course_title": "Germanic Civilization and Culture",
      "course_id": "009975"
    },
    "WLGE-318": {
      "course_title": "New German Cinema and Beyond",
      "course_id": "009977"
    },
    "WLGE-320": {
      "course_title": "Introduction to German Literature",
      "course_id": "023171"
    },
    "WLGE-323": {
      "course_title": "Twentieth Century German Literature",
      "course_id": "009979"
    },
    "WLGE-325": {
      "course_title": "German Lyric Poetry",
      "course_id": "009976"
    },
    "WLGE-420": {
      "course_title": "Current Issues in German-Language Media",
      "course_id": "009985"
    },
    "WLHU-301": {
      "course_title": "Twentieth Century Hindi & Urdu Fiction",
      "course_id": "010057"
    },
    "WLHU-302": {
      "course_title": "Modern Hindi & Urdu Poetry",
      "course_id": "010059"
    },
    "WLHU-351": {
      "course_title": "Hindi-Urdu Popular Culture",
      "course_id": "033242"
    },
    "WLHU-401": {
      "course_title": "Hindi Literature and South Asian Cultural Contexts",
      "course_id": "031374"
    },
    "WLIT-315": {
      "course_title": "Made in Italy: Where Heritage, Culture & Culinary History blend with Technological Innovation",
      "course_id": "032598"
    },
    "WLIT-318": {
      "course_title": "Italian Society Through Cinema",
      "course_id": "031073"
    },
    "WLJA-342": {
      "course_title": "Classical Japanese Literature in Translation",
      "course_id": "031365"
    },
    "WLJA-344": {
      "course_title": "Early Modern Japanese Literature in Translation",
      "course_id": "031372"
    },
    "WLJA-345": {
      "course_title": "Modern Japanese Literature in Translation",
      "course_id": "031373"
    },
    "WLRU-303": {
      "course_title": "Russian Literature in Translation: The Nineteenth Century",
      "course_id": "010075"
    },
    "WLRU-304": {
      "course_title": "Russian Literature in Translation: The Twentieth Century",
      "course_id": "010076"
    },
    "WLRU-318": {
      "course_title": "Russian Cinema and Society",
      "course_id": "031163"
    },
    "WLSP-335": {
      "course_title": "Spanish for Native and Heritage Speakers",
      "course_id": "031722"
    },
    "WLSP-338": {
      "course_title": "Advanced Spanish for Native and Heritage Speakers",
      "course_id": "033615"
    },
    "WLSP-340": {
      "course_title": "Introduction to Hispanic Literatures and Cultures",
      "course_id": "024083"
    },
    "WLSP-343": {
      "course_title": "Literature and Culture of Spain III",
      "course_id": "024086"
    },
    "WLSP-352": {
      "course_title": "Literature and Culture of Latin America II",
      "course_id": "024088"
    }
  },
  "INTERDISC": {
    "AEC-245": {
      "course_title": "Practicing Conservation Ecology",
      "course_id": "032998"
    },
    "AEC-380": {
      "course_title": "Water Resources: Global Issues in Ecology, Policy, Management, and Advocacy",
      "course_id": "031894"
    },
    "AEE-208": {
      "course_title": "Agricultural Biotechnology: Issues and Implications",
      "course_id": "031444"
    },
    "AFS-344": {
      "course_title": "Leadership in African American Communities",
      "course_id": "000373"
    },
    "AFS-444": {
      "course_title": "African American and African Women Leaders",
      "course_id": "033201"
    },
    "ANS-208": {
      "course_title": "Agricultural Biotechnology: Issues and Implications",
      "course_id": "031444"
    },
    "ANT-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "ANT-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ANT-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ARE-336": {
      "course_title": "Introduction to Resource and Environmental Economics",
      "course_id": "001150"
    },
    "ARS-257": {
      "course_title": "Technology in the Arts",
      "course_id": "001185"
    },
    "BAE-210": {
      "course_title": "Leadership and Ethics in Science, Technology, and Agriculture",
      "course_id": "033634"
    },
    "BCH-220": {
      "course_title": "Role of Biotechnology in Society",
      "course_id": "023406"
    },
    "BIO-227": {
      "course_title": "Understanding Structural Diversity through Biological Illustration",
      "course_id": "031537"
    },
    "BIO-230": {
      "course_title": "The Science of Studying Dinosaurs",
      "course_id": "032442"
    },
    "BIT-100": {
      "course_title": "Current Topics in Biotechnology",
      "course_id": "031446"
    },
    "BIT-214": {
      "course_title": "Biotechnology and Sustainability",
      "course_id": "033584"
    },
    "CH-345": {
      "course_title": "Chemistry and War",
      "course_id": "032502"
    },
    "COM-215": {
      "course_title": "The Struggle of the Free Press: Fake News & Conspiracy Theories",
      "course_id": "033546"
    },
    "COM-289": {
      "course_title": "Science Communication and Public Engagement",
      "course_id": "032584"
    },
    "COS-100": {
      "course_title": "Science of Change",
      "course_id": "017507"
    },
    "CS-224": {
      "course_title": "Seeds, Biotechnology and Societies",
      "course_id": "023860"
    },
    "CS-230": {
      "course_title": "Introduction to Agroecology",
      "course_id": "004115"
    },
    "CSC-110": {
      "course_title": "Computer Science Principles - The Beauty and Joy of Computing",
      "course_id": "004330"
    },
    "CSC-281": {
      "course_title": "Foundations of Interactive Game Design",
      "course_id": "031771"
    },
    "D-100": {
      "course_title": "Design Inquiry I: Methods and Processes",
      "course_id": "004828"
    },
    "D-101": {
      "course_title": "Design Inquiry II: Methods and Processes",
      "course_id": "031350"
    },
    "DAN-232": {
      "course_title": "Dance on Screen",
      "course_id": "033409"
    },
    "DAN-332": {
      "course_title": "Dance and Technology",
      "course_id": "032494"
    },
    "DSA-201": {
      "course_title": "Introduction to R/Python for Data Science",
      "course_id": "033258"
    },
    "E-102": {
      "course_title": "Engineering in the 21st Century",
      "course_id": "032346"
    },
    "E-480": {
      "course_title": "Namibia Wildlife Aerial Observatory",
      "course_id": "032774"
    },
    "EC-336": {
      "course_title": "Introduction to Resource and Environmental Economics",
      "course_id": "001150"
    },
    "ECI-305": {
      "course_title": "Equity and Education",
      "course_id": "006531"
    },
    "EED-414": {
      "course_title": "Ethics for Engineering Education",
      "course_id": "033219"
    },
    "EED-514": {
      "course_title": "Ethics for Engineering Education",
      "course_id": "033219"
    },
    "EI-201": {
      "course_title": "Exploring Interdisciplinary Entrepreneurial Thinking",
      "course_id": "031220"
    },
    "EI-331": {
      "course_title": "Interdisciplinary Entrepreneurial Thinking I: Skills and Planning Basics",
      "course_id": "031357"
    },
    "EMA-110": {
      "course_title": "Introduction to Arts Entrepreneurship",
      "course_id": "032292"
    },
    "EMA-365": {
      "course_title": "Foundations in Arts Entrepreneurship",
      "course_id": "031723"
    },
    "EMA-370": {
      "course_title": "Practical Arts Entrepreneurship",
      "course_id": "031724"
    },
    "EMS-450": {
      "course_title": "Teaching Environmental Education",
      "course_id": "032752"
    },
    "EMS-550": {
      "course_title": "Teaching Environmental Education",
      "course_id": "032752"
    },
    "ENG-215": {
      "course_title": "The Struggle of the Free Press: Fake News & Conspiracy Theories",
      "course_id": "033546"
    },
    "ENG-232": {
      "course_title": "Literature and Medicine",
      "course_id": "008447"
    },
    "ENG-308": {
      "course_title": "Contemporary Issues in Ecofeminism",
      "course_id": "032060"
    },
    "ENG-329": {
      "course_title": "Language and Globalization",
      "course_id": "032664"
    },
    "ENG-339": {
      "course_title": "Literature and Technology",
      "course_id": "032404"
    },
    "ENG-340": {
      "course_title": "Literature, Art, and Society",
      "course_id": "008688"
    },
    "ENG-341": {
      "course_title": "Literature and Science",
      "course_id": "032449"
    },
    "ENG-342": {
      "course_title": "Literature of Space and Place",
      "course_id": "032426"
    },
    "ENG-376": {
      "course_title": "Science Fiction",
      "course_id": "008592"
    },
    "ENG-425": {
      "course_title": "Analysis of Scientific and Technical Writing",
      "course_id": "008656"
    },
    "ENT-201": {
      "course_title": "Insects and People",
      "course_id": "009050"
    },
    "ENT-207": {
      "course_title": "Insects and Human Disease",
      "course_id": "031646"
    },
    "ENV-101": {
      "course_title": "Exploring the Environment",
      "course_id": "032464"
    },
    "ENV-250": {
      "course_title": "Diversity and Environmental Justice",
      "course_id": "032339"
    },
    "ES-100": {
      "course_title": "Introduction to Environmental Sciences",
      "course_id": "009584"
    },
    "ES-150": {
      "course_title": "Water and the Environment",
      "course_id": "032222"
    },
    "ES-200": {
      "course_title": "Climate Change and Sustainability",
      "course_id": "031452"
    },
    "ES-300": {
      "course_title": "Energy and Environment",
      "course_id": "031451"
    },
    "ES-449": {
      "course_title": "Human Dimensions of Natural Resources in Australia/New Zealand",
      "course_id": "031416"
    },
    "ES-450": {
      "course_title": "Sustaining Natural Resources in Australia/New Zealand",
      "course_id": "031417"
    },
    "FB-476": {
      "course_title": "Environmental Life Cycle Analysis",
      "course_id": "031772"
    },
    "FB-480": {
      "course_title": "The Sustainable Bioeconomy",
      "course_id": "032727"
    },
    "FB-576": {
      "course_title": "Environmental Life Cycle Analysis",
      "course_id": "031772"
    },
    "FB-580": {
      "course_title": "The Sustainable Bioeconomy",
      "course_id": "032727"
    },
    "FOR-248": {
      "course_title": "Forest History, Technology and Society",
      "course_id": "010230"
    },
    "FOR-414": {
      "course_title": "World Forestry",
      "course_id": "010286"
    },
    "FW-221": {
      "course_title": "Conservation of Natural Resources",
      "course_id": "010229"
    },
    "IPGE-295": {
      "course_title": "Interdisciplinary Perspectives Special Topics",
      "course_id": "031575"
    },
    "IPGK-295": {
      "course_title": "Interdisciplinary Perspectives and Global Knowledge Special Topics",
      "course_id": "031853"
    },
    "IPUS-295": {
      "course_title": "Interdisciplinary Perspectives and U.S. Diversity Special Topics",
      "course_id": "031854"
    },
    "GIS-205": {
      "course_title": "Spatial Thinking with GIS",
      "course_id": "032354"
    },
    "GN-301": {
      "course_title": "Genetics in Human Affairs",
      "course_id": "011011"
    },
    "GOH-201": {
      "course_title": "Foundations of Global One Health",
      "course_id": "033422"
    },
    "GOH-302": {
      "course_title": "Global One Health Applications",
      "course_id": "033423"
    },
    "HA-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-240": {
      "course_title": "Introduction to Visual Culture",
      "course_id": "031655"
    },
    "HI-305": {
      "course_title": "Frauds and Mysteries of the Past",
      "course_id": "011534"
    },
    "HI-318": {
      "course_title": "Environmental History of Cuba: Prehistory to the Present",
      "course_id": "032539"
    },
    "HI-321": {
      "course_title": "Scientific Revolution and European Society, 1500-1800",
      "course_id": "011538"
    },
    "HI-322": {
      "course_title": "Rise of Modern Science",
      "course_id": "011541"
    },
    "HI-323": {
      "course_title": "Science, American Style",
      "course_id": "032626"
    },
    "HI-341": {
      "course_title": "Technology in History",
      "course_id": "011553"
    },
    "HI-342": {
      "course_title": "Global Environmental History",
      "course_id": "032985"
    },
    "HI-344": {
      "course_title": "Dinomania: Dinosaurs in Culture and Science",
      "course_id": "011557"
    },
    "HI-346": {
      "course_title": "The Civil War Era in Popular Culture",
      "course_id": "011559"
    },
    "HI-361": {
      "course_title": "Global History of American Food and Drink",
      "course_id": "032986"
    },
    "HI-382": {
      "course_title": "History of Capitalism in America",
      "course_id": "032957"
    },
    "HI-383": {
      "course_title": "Law in the American Story",
      "course_id": "033206"
    },
    "HI-440": {
      "course_title": "American Environmental History",
      "course_id": "011639"
    },
    "HI-481": {
      "course_title": "History of the Life Sciences",
      "course_id": "011694"
    },
    "HI-482": {
      "course_title": "Darwinism in Science and Society",
      "course_id": "011698"
    },
    "HI-483": {
      "course_title": "Science and Religion in European History",
      "course_id": "011700"
    },
    "HI-484": {
      "course_title": "Science in European Culture",
      "course_id": "011701"
    },
    "HI-485": {
      "course_title": "History of American Technology",
      "course_id": "011702"
    },
    "HI-540": {
      "course_title": "American Environmental History",
      "course_id": "011639"
    },
    "HI-581": {
      "course_title": "History of the Life Sciences",
      "course_id": "011694"
    },
    "HI-582": {
      "course_title": "Darwinism in Science and Society",
      "course_id": "011698"
    },
    "HI-583": {
      "course_title": "Science and Religion in European History",
      "course_id": "011700"
    },
    "HI-584": {
      "course_title": "Science in European Culture",
      "course_id": "011701"
    },
    "HI-585": {
      "course_title": "History of American Technology",
      "course_id": "011702"
    },
    "HON-210": {
      "course_title": "How We Argue",
      "course_id": "033362"
    },
    "HON-293": {
      "course_title": "Honors Special Topics - Interdisciplinary Perspectives/Global Knowledge",
      "course_id": "012029"
    },
    "HON-296": {
      "course_title": "Honors Special Topics - Interdisciplinary Perspectives",
      "course_id": "012073"
    },
    "HON-297": {
      "course_title": "Honors Special Topics - Interdisciplinary Perspectives/US Diversity",
      "course_id": "012091"
    },
    "HON-310": {
      "course_title": "The Creative Process in Science: Realities, Comparisons, and Culture Perceptions",
      "course_id": "031199"
    },
    "HON-311": {
      "course_title": "Words through Space and Time",
      "course_id": "032086"
    },
    "HON-312": {
      "course_title": "Outbreak",
      "course_id": "032387"
    },
    "HON-313": {
      "course_title": "Reading Machines",
      "course_id": "032444"
    },
    "HON-340": {
      "course_title": "Religion and Freedom",
      "course_id": "032445"
    },
    "HON-341": {
      "course_title": "Time Travel",
      "course_id": "012114"
    },
    "HON-345": {
      "course_title": "On the Human",
      "course_id": "031559"
    },
    "HON-347": {
      "course_title": "Freedom and the Self",
      "course_id": "032183"
    },
    "HON-348": {
      "course_title": "Emotion and Reason",
      "course_id": "032839"
    },
    "HON-355": {
      "course_title": "Feelings of/from Technology: Analog Bodies in Digital Spaces",
      "course_id": "033052"
    },
    "HON-356": {
      "course_title": "Sweet: A Global History of Sugar",
      "course_id": "033149"
    },
    "HON-358": {
      "course_title": "Listening to Climate Change",
      "course_id": "033649"
    },
    "HON-359": {
      "course_title": "Music Beyond Binaries",
      "course_id": "033650"
    },
    "HON-360": {
      "course_title": "Music and Resistance",
      "course_id": "032840"
    },
    "HON-370": {
      "course_title": "Contemporary British Voices",
      "course_id": "033580"
    },
    "HON-390": {
      "course_title": "Music and the Celtic World",
      "course_id": "032451"
    },
    "HSS-120": {
      "course_title": "Introduction to Humanities & Social Sciences",
      "course_id": "031788"
    },
    "ID-244": {
      "course_title": "History of Industrial Design",
      "course_id": "031870"
    },
    "IDS-201": {
      "course_title": "Environmental Ethics",
      "course_id": "021589"
    },
    "IDS-203": {
      "course_title": "Humans and the Environment",
      "course_id": "021618"
    },
    "IDS-210": {
      "course_title": "Introduction to American Studies",
      "course_id": "032027"
    },
    "IDS-220": {
      "course_title": "The Science and Art of Happiness",
      "course_id": "032355"
    },
    "IDS-310": {
      "course_title": "Animals in the Global Community",
      "course_id": "032010"
    },
    "IS-200": {
      "course_title": "Introduction to International Studies",
      "course_id": "031469"
    },
    "IS-250": {
      "course_title": "Globalizing North Carolina",
      "course_id": "032775"
    },
    "IS-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "IS-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "LAR-445": {
      "course_title": "Sustainable Design and Development",
      "course_id": "013381"
    },
    "LSC-101": {
      "course_title": "Critical and Creative Thinking in the Life Sciences",
      "course_id": "032011"
    },
    "M-380": {
      "course_title": "Doing Business Globally",
      "course_id": "032590"
    },
    "MAE-398": {
      "course_title": "Relativistic Dynamics: An Evolution in Space, Time, and Matter",
      "course_id": "033329"
    },
    "MB-200": {
      "course_title": "The Fourth Horseman: Plagues that Changed the World",
      "course_id": "014811"
    },
    "MEA-100": {
      "course_title": "Earth System Science: Exploring the Connections",
      "course_id": "015208"
    },
    "MEA-260": {
      "course_title": "Human Dimensions of Climate Change",
      "course_id": "032909"
    },
    "MIE-201": {
      "course_title": "Introduction to Business",
      "course_id": "002312"
    },
    "MIE-309": {
      "course_title": "Entrepreneurship Skills for Non-Majors",
      "course_id": "033302"
    },
    "MUS-200": {
      "course_title": "Understanding Music: Global Perspectives",
      "course_id": "016044"
    },
    "MUS-212": {
      "course_title": "Music of North Carolina",
      "course_id": "033593"
    },
    "MUS-340": {
      "course_title": "From Wax Cylinders to AI: Music Technology in Modern History",
      "course_id": "033594"
    },
    "MUS-350": {
      "course_title": "Music of Asia",
      "course_id": "016081"
    },
    "NE-290": {
      "course_title": "Introduction to Health Physics",
      "course_id": "032810"
    },
    "NE-291": {
      "course_title": "Introduction to Health Physics Laboratory",
      "course_id": "033466"
    },
    "NR-203": {
      "course_title": "Humans and the Environment",
      "course_id": "021618"
    },
    "NS-420": {
      "course_title": "Naval Leadership and Ethics",
      "course_id": "016427"
    },
    "NTR-210": {
      "course_title": "Introduction to Community Food Security",
      "course_id": "032427"
    },
    "NTR-211": {
      "course_title": "Eating through American History",
      "course_id": "021591"
    },
    "PB-208": {
      "course_title": "Agricultural Biotechnology: Issues and Implications",
      "course_id": "031444"
    },
    "PB-213": {
      "course_title": "Plants and Civilization",
      "course_id": "002013"
    },
    "PB-219": {
      "course_title": "Plants in Folklore, Myth, and religion",
      "course_id": "031563"
    },
    "PCC-201": {
      "course_title": "Impact of Industry on the Environment and Society",
      "course_id": "016858"
    },
    "PCC-274": {
      "course_title": "Introduction to Forensic Science",
      "course_id": "031550"
    },
    "PHI-210": {
      "course_title": "Puzzles and Paradoxes",
      "course_id": "031689"
    },
    "PHI-212": {
      "course_title": "Ethical Problems in the Law",
      "course_id": "017213"
    },
    "PHI-227": {
      "course_title": "Data Ethics",
      "course_id": "032991"
    },
    "PHI-312": {
      "course_title": "Philosophy of Law",
      "course_id": "017211"
    },
    "PHI-325": {
      "course_title": "Bio-Medical Ethics",
      "course_id": "017229"
    },
    "PHI-331": {
      "course_title": "Philosophy of Language",
      "course_id": "017233"
    },
    "PHI-332": {
      "course_title": "Philosophy of Psychology",
      "course_id": "017234"
    },
    "PHI-340": {
      "course_title": "Philosophy of Science",
      "course_id": "017239"
    },
    "PHI-347": {
      "course_title": "Neuroscience and Philosophy",
      "course_id": "032428"
    },
    "PHI-425": {
      "course_title": "Introduction to Cognitive Science",
      "course_id": "017253"
    },
    "PHI-440": {
      "course_title": "The Scientific Method",
      "course_id": "017254"
    },
    "PHI-447": {
      "course_title": "Philosophy, Evolution and Human Nature",
      "course_id": "031141"
    },
    "PO-212": {
      "course_title": "Poultry and People: Why did the chicken cross the world?",
      "course_id": "032195"
    },
    "PO-325": {
      "course_title": "Aspects of Animal Welfare",
      "course_id": "033652"
    },
    "PO-411": {
      "course_title": "Agrosecurity",
      "course_id": "031384"
    },
    "PP-232": {
      "course_title": "Big Data in Your Pocket: Call it a Smartphone",
      "course_id": "032496"
    },
    "PP-241": {
      "course_title": "The Worm's Tale: Parasites In Our Midst",
      "course_id": "031993"
    },
    "PRT-203": {
      "course_title": "Humans and the Environment",
      "course_id": "021618"
    },
    "PRT-261": {
      "course_title": "Nature, Health, and Wellness",
      "course_id": "033599"
    },
    "PRT-449": {
      "course_title": "Human Dimensions of Natural Resources in Australia/New Zealand",
      "course_id": "031416"
    },
    "PRT-450": {
      "course_title": "Sustaining Natural Resources in Australia/New Zealand",
      "course_id": "031417"
    },
    "PSE-220": {
      "course_title": "From Papyrus to Plasma Screens: Paper and Society",
      "course_id": "031531"
    },
    "PSE-476": {
      "course_title": "Environmental Life Cycle Analysis",
      "course_id": "031772"
    },
    "PSE-576": {
      "course_title": "Environmental Life Cycle Analysis",
      "course_id": "031772"
    },
    "PSY-208": {
      "course_title": "Psychobiology of Success",
      "course_id": "032676"
    },
    "PSY-425": {
      "course_title": "Introduction to Cognitive Science",
      "course_id": "017253"
    },
    "PSY-432": {
      "course_title": "Human Sexuality and Intimate Relationships",
      "course_id": "033068"
    },
    "PSY-441": {
      "course_title": "Environmental Psychology",
      "course_id": "033358"
    },
    "PSY-442": {
      "course_title": "Psychology and Law",
      "course_id": "033598"
    },
    "REL-380": {
      "course_title": "Emotion and Religion",
      "course_id": "033037"
    },
    "REL-471": {
      "course_title": "Darwinism and Christianity",
      "course_id": "019268"
    },
    "SIP-112": {
      "course_title": "Wicked Problems, Wolfpack Solutions: [Y]Our Health",
      "course_id": "033152"
    },
    "SIP-114": {
      "course_title": "Wicked Problems, Wolfpack Solutions: [Y]Our Changing World",
      "course_id": "033132"
    },
    "SIP-116": {
      "course_title": "Wicked Problems, Wolfpack Solutions: The Future of Food",
      "course_id": "033189"
    },
    "SLC-202": {
      "course_title": "CREATE: Carolina Regional Entrepreneurship Albright Team Experience",
      "course_id": "033069"
    },
    "SLC-250": {
      "course_title": "Critical and Creative Decision Making Models",
      "course_id": "032118"
    },
    "SLC-350": {
      "course_title": "Leadership and Negotiation",
      "course_id": "032924"
    },
    "SMT-201": {
      "course_title": "Sustainable Materials for Green Housing",
      "course_id": "031945"
    },
    "SMT-232": {
      "course_title": "Recycling to Create a Sustainable Environment",
      "course_id": "031727"
    },
    "SMT-310": {
      "course_title": "Introduction to Industrial Ecology",
      "course_id": "022511"
    },
    "SOC-207": {
      "course_title": "Language and Society",
      "course_id": "032506"
    },
    "SOC-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "SOC-381": {
      "course_title": "Sociology of Medicine",
      "course_id": "019538"
    },
    "SSC-185": {
      "course_title": "Land and Life",
      "course_id": "020085"
    },
    "STS-210": {
      "course_title": "Women and Gender in Science and Technology",
      "course_id": "015005"
    },
    "STS-214": {
      "course_title": "Introduction to Science, Technology, and Society",
      "course_id": "015009"
    },
    "STS-257": {
      "course_title": "Technology in the Arts",
      "course_id": "001185"
    },
    "STS-301": {
      "course_title": "Science and Civilization",
      "course_id": "021615"
    },
    "STS-302": {
      "course_title": "Contemporary Science, Technology and Human Values",
      "course_id": "021617"
    },
    "STS-304": {
      "course_title": "Ethical Dimensions of Progress",
      "course_id": "015051"
    },
    "STS-310": {
      "course_title": "Science, Psi, Sasquatch, & Spirits",
      "course_id": "033243"
    },
    "STS-315": {
      "course_title": "Feminist Futures",
      "course_id": "033194"
    },
    "STS-320": {
      "course_title": "Cycling Cities: STS, the Bicycle and Urban Transportation",
      "course_id": "021619"
    },
    "STS-322": {
      "course_title": "Technological Catastrophes",
      "course_id": "015059"
    },
    "STS-323": {
      "course_title": "World Population and Food Prospects",
      "course_id": "021620"
    },
    "STS-325": {
      "course_title": "Bio-Medical Ethics",
      "course_id": "017229"
    },
    "STS-402": {
      "course_title": "Peace and War in the Nuclear Age",
      "course_id": "021626"
    },
    "STS-405": {
      "course_title": "Technology and American Culture",
      "course_id": "021628"
    },
    "STS-471": {
      "course_title": "Darwinism and Christianity",
      "course_id": "019268"
    },
    "SW-260": {
      "course_title": "Introduction to Gerontology: An Interdisciplinary Field of Practice",
      "course_id": "032181"
    },
    "SW-290": {
      "course_title": "The Development of Social Welfare and Social Work in the U.S.",
      "course_id": "020530"
    },
    "USC-116": {
      "course_title": "Introduction to Sustainability for EcoVillage",
      "course_id": "032461"
    },
    "USC-260": {
      "course_title": "Research as a Profession",
      "course_id": "032777"
    },
    "WGS-210": {
      "course_title": "Women and Gender in Science and Technology",
      "course_id": "015005"
    },
    "WGS-215": {
      "course_title": "Abolitionist Futures",
      "course_id": "033156"
    },
    "WGS-308": {
      "course_title": "Contemporary Issues in Ecofeminism",
      "course_id": "032060"
    },
    "WGS-315": {
      "course_title": "Feminist Futures",
      "course_id": "033194"
    },
    "WGS-330": {
      "course_title": "Women and Health",
      "course_id": "031342"
    },
    "WGS-370": {
      "course_title": "Advanced Studies of Gender in Science",
      "course_id": "032059"
    },
    "WLCL-225": {
      "course_title": "Roman Topography",
      "course_id": "033549"
    },
    "WLFR-212": {
      "course_title": "French: Language, Culture, and Technology",
      "course_id": "023169"
    },
    "WLFR-320": {
      "course_title": "Franco-Belgian Comics and Graphic Arts",
      "course_id": "033573"
    },
    "WLGE-212": {
      "course_title": "German Language, Culture, Science, and Technology",
      "course_id": "009963"
    },
    "WLGE-440": {
      "course_title": "Green Germany: Nature and Environment in German Speaking Cultures",
      "course_id": "031237"
    },
    "WLSP-212": {
      "course_title": "Spanish: Language, Technology, Culture",
      "course_id": "010122"
    },
    "WPS-201": {
      "course_title": "Sustainable Materials for Green Housing",
      "course_id": "031532"
    },
    "ZO-233": {
      "course_title": "Human-Animal Interactions",
      "course_id": "031445"
    }
  },
  "MATH": {
    "GC-320": {
      "course_title": "3D Spatial Relations",
      "course_id": "010850"
    },
    "HON-291": {
      "course_title": "Honors Special Topics-Mathematics",
      "course_id": "012022"
    },
    "LOG-201": {
      "course_title": "Logic",
      "course_id": "017165"
    },
    "LOG-335": {
      "course_title": "Symbolic Logic",
      "course_id": "013572"
    },
    "MA-103": {
      "course_title": "Topics in Contemporary Mathematics",
      "course_id": "013632"
    },
    "MA-103A": {
      "course_title": "Topics in Contemporary Mathematics",
      "course_id": "013632"
    },
    "MA-105": {
      "course_title": "Mathematics of Finance",
      "course_id": "013638"
    },
    "MA-107": {
      "course_title": "Precalculus I",
      "course_id": "013606"
    },
    "MA-111": {
      "course_title": "Precalculus Algebra and Trigonometry",
      "course_id": "013609"
    },
    "MA-114": {
      "course_title": "Introduction to Finite Mathematics with Applications",
      "course_id": "013623"
    },
    "MA-121": {
      "course_title": "Elements of Calculus",
      "course_id": "013621"
    },
    "MA-131": {
      "course_title": "Calculus for Life and Management Sciences A",
      "course_id": "013615"
    },
    "MA-141": {
      "course_title": "Calculus I",
      "course_id": "013594"
    },
    "MA-151": {
      "course_title": "Calculus for Elementary Education I",
      "course_id": "031921"
    },
    "MA-152": {
      "course_title": "Calculus for Elementary Education II",
      "course_id": "031922"
    },
    "MA-231": {
      "course_title": "Calculus for Life and Management Sciences B",
      "course_id": "013665"
    },
    "MA-241": {
      "course_title": "Calculus II",
      "course_id": "013653"
    },
    "MA-335": {
      "course_title": "Symbolic Logic",
      "course_id": "013572"
    },
    "PHI-250": {
      "course_title": "Thinking Logically",
      "course_id": "017179"
    },
    "ST-101": {
      "course_title": "Statistics by Example",
      "course_id": "020185"
    },
    "ST-311": {
      "course_title": "Introduction to Statistics",
      "course_id": "020196"
    },
    "ST-312": {
      "course_title": "Introduction to Statistics II",
      "course_id": "020204"
    }
  },
  "NATSCI": {
    "AEC-203": {
      "course_title": "An Introduction to the Honey Bee and Beekeeping",
      "course_id": "009053"
    },
    "AEC-437": {
      "course_title": "Gut Microbial Ecology",
      "course_id": "033346"
    },
    "AEC-537": {
      "course_title": "Gut Microbial Ecology",
      "course_id": "033346"
    },
    "ANS-105": {
      "course_title": "Introduction to Companion Animal Science",
      "course_id": "000507"
    },
    "ANS-110": {
      "course_title": "Introduction to Equine Science",
      "course_id": "000510"
    },
    "ANS-215": {
      "course_title": "Agricultural Genetics",
      "course_id": "000522"
    },
    "BIO-105": {
      "course_title": "Biology in the Modern World",
      "course_id": "002238"
    },
    "BIO-106": {
      "course_title": "Biology in the Modern World Laboratory",
      "course_id": "001626"
    },
    "BIO-181": {
      "course_title": "Introductory Biology: Ecology, Evolution, and Biodiversity",
      "course_id": "000447"
    },
    "BIO-183": {
      "course_title": "Introductory Biology: Cellular and Molecular Biology",
      "course_id": "000449"
    },
    "BIO-227": {
      "course_title": "Understanding Structural Diversity through Biological Illustration",
      "course_id": "031537"
    },
    "BIO-230": {
      "course_title": "The Science of Studying Dinosaurs",
      "course_id": "032442"
    },
    "BIT-100": {
      "course_title": "Current Topics in Biotechnology",
      "course_id": "031446"
    },
    "BIT-200": {
      "course_title": "Early Research in Biotechnology",
      "course_id": "031909"
    },
    "BIT-210": {
      "course_title": "Phage Hunters",
      "course_id": "031148"
    },
    "BIT-211": {
      "course_title": "Phage Genomics",
      "course_id": "031253"
    },
    "CH-100": {
      "course_title": "Chemistry and Society",
      "course_id": "003233"
    },
    "CH-101": {
      "course_title": "Chemistry - A Molecular Science",
      "course_id": "003237"
    },
    "CH-102": {
      "course_title": "General Chemistry Laboratory",
      "course_id": "003266"
    },
    "CH-103": {
      "course_title": "General Chemistry I for Students in Chemical Sciences",
      "course_id": "003251"
    },
    "CH-104": {
      "course_title": "General Chemistry Laboratory I for Students in Chemical Sciences",
      "course_id": "003254"
    },
    "CH-111": {
      "course_title": "Preparatory Chemistry",
      "course_id": "003265"
    },
    "CH-201": {
      "course_title": "Chemistry - A Quantitative Science",
      "course_id": "003279"
    },
    "CH-202": {
      "course_title": "Quantitative Chemistry Laboratory",
      "course_id": "003282"
    },
    "CH-203": {
      "course_title": "General Chemistry II for Students in Chemical Sciences",
      "course_id": "032034"
    },
    "CH-204": {
      "course_title": "General Chemistry Laboratory II for Students in Chemical Sciences",
      "course_id": "032035"
    },
    "CS-210": {
      "course_title": "Lawns and Sports Turf",
      "course_id": "004109"
    },
    "CS-213": {
      "course_title": "Crop Science",
      "course_id": "004112"
    },
    "ENT-201": {
      "course_title": "Insects and People",
      "course_id": "009050"
    },
    "ENT-207": {
      "course_title": "Insects and Human Disease",
      "course_id": "031646"
    },
    "ENT-305": {
      "course_title": "Introduction to Forensic Entomology",
      "course_id": "023146"
    },
    "ENT-402": {
      "course_title": "Forest Entomology",
      "course_id": "009062"
    },
    "ENT-425": {
      "course_title": "General Entomology",
      "course_id": "009065"
    },
    "ES-113": {
      "course_title": "Earth from Space",
      "course_id": "032596"
    },
    "FOR-318": {
      "course_title": "Forest Pathology",
      "course_id": "010264"
    },
    "FOR-402": {
      "course_title": "Forest Entomology",
      "course_id": "009062"
    },
    "FS-201": {
      "course_title": "Introduction to Food Science",
      "course_id": "010630"
    },
    "FS-221": {
      "course_title": "Discover: Chocolate, Coffee and Tea",
      "course_id": "033311"
    },
    "FS-222": {
      "course_title": "Discover: Conventional, Organic and Genetically Engineered Foods",
      "course_id": "033377"
    },
    "FS-301": {
      "course_title": "Introduction to Human Nutrition",
      "course_id": "000533"
    },
    "FW-221": {
      "course_title": "Conservation of Natural Resources",
      "course_id": "010229"
    },
    "NSGK-295": {
      "course_title": "Natural Sciences and Global Knowledge Special Topics",
      "course_id": "031860"
    },
    "GN-301": {
      "course_title": "Genetics in Human Affairs",
      "course_id": "011011"
    },
    "HON-292": {
      "course_title": "Honors Special Topics-Natural Sciences",
      "course_id": "012024"
    },
    "HS-200": {
      "course_title": "Home Horticulture",
      "course_id": "012175"
    },
    "HS-201": {
      "course_title": "The World of Horticulture: Principles and Practices",
      "course_id": "012181"
    },
    "HS-201A": {
      "course_title": "The World of Horticulture: Principles and Practices",
      "course_id": "033651"
    },
    "HS-203": {
      "course_title": "Home Plant Propagation",
      "course_id": "031456"
    },
    "HS-204": {
      "course_title": "Home Landscape Maintenance",
      "course_id": "031740"
    },
    "HS-215": {
      "course_title": "Agricultural Genetics",
      "course_id": "000522"
    },
    "HS-303": {
      "course_title": "Ornamental Plant Identification I",
      "course_id": "012184"
    },
    "HS-304": {
      "course_title": "Ornamental Plant Identification II",
      "course_id": "012187"
    },
    "MB-200": {
      "course_title": "The Fourth Horseman: Plagues that Changed the World",
      "course_id": "014811"
    },
    "MB-210": {
      "course_title": "Phage Hunters",
      "course_id": "031148"
    },
    "MB-211": {
      "course_title": "Phage Genomics",
      "course_id": "031253"
    },
    "MEA-100": {
      "course_title": "Earth System Science: Exploring the Connections",
      "course_id": "015208"
    },
    "MEA-101": {
      "course_title": "Geology I: Physical",
      "course_id": "015210"
    },
    "MEA-110": {
      "course_title": "Geology I Laboratory",
      "course_id": "015215"
    },
    "MEA-130": {
      "course_title": "Introduction to Weather and Climate",
      "course_id": "015223"
    },
    "MEA-135": {
      "course_title": "Introduction to Weather and Climate Laboratory",
      "course_id": "015226"
    },
    "MEA-150": {
      "course_title": "Environmental Issues in Water Resources",
      "course_id": "015228"
    },
    "MEA-200": {
      "course_title": "Introduction to Oceanography",
      "course_id": "015229"
    },
    "MEA-202": {
      "course_title": "Geology II: Historical",
      "course_id": "015234"
    },
    "MEA-210": {
      "course_title": "Oceanography Lab",
      "course_id": "015238"
    },
    "MEA-211": {
      "course_title": "Geology II Laboratory",
      "course_id": "015240"
    },
    "MEA-220": {
      "course_title": "Marine Biology",
      "course_id": "015245"
    },
    "MEA-240": {
      "course_title": "The Planets of Our Solar System",
      "course_id": "032586"
    },
    "MEA-250": {
      "course_title": "Introduction to Coastal Environments",
      "course_id": "015248"
    },
    "NE-290": {
      "course_title": "Introduction to Health Physics",
      "course_id": "032810"
    },
    "NE-291": {
      "course_title": "Introduction to Health Physics Laboratory",
      "course_id": "033466"
    },
    "NTR-301": {
      "course_title": "Introduction to Human Nutrition",
      "course_id": "000533"
    },
    "PB-200": {
      "course_title": "Plant Life",
      "course_id": "002009"
    },
    "PB-205": {
      "course_title": "Our Green World",
      "course_id": "031703"
    },
    "PB-220": {
      "course_title": "Local Flora",
      "course_id": "002018"
    },
    "PB-277": {
      "course_title": "Space Biology",
      "course_id": "002026"
    },
    "PO-201": {
      "course_title": "Poultry Science and Production",
      "course_id": "017523"
    },
    "PO-201A": {
      "course_title": "Poultry Science and Production",
      "course_id": "017523"
    },
    "PO-202": {
      "course_title": "Poultry Science and Production Laboratory",
      "course_id": "031662"
    },
    "PO-202A": {
      "course_title": "Poultry Science and Production Laboratory",
      "course_id": "031662"
    },
    "PP-222": {
      "course_title": "Kingdom of Fungi",
      "course_id": "002019"
    },
    "PP-318": {
      "course_title": "Forest Pathology",
      "course_id": "010264"
    },
    "PY-123": {
      "course_title": "Stellar and Galactic Astronomy",
      "course_id": "018959"
    },
    "PY-124": {
      "course_title": "Solar System Astronomy",
      "course_id": "018961"
    },
    "PY-125": {
      "course_title": "Astronomy Laboratory",
      "course_id": "018963"
    },
    "PY-131": {
      "course_title": "Conceptual Physics",
      "course_id": "018965"
    },
    "PY-205": {
      "course_title": "Physics for Engineers and Scientists I",
      "course_id": "018981"
    },
    "PY-206": {
      "course_title": "Physics for Engineers and Scientists I Laboratory",
      "course_id": "019002"
    },
    "PY-208": {
      "course_title": "Physics for Engineers and Scientists II",
      "course_id": "019006"
    },
    "PY-209": {
      "course_title": "Physics for Engineers and Scientists II Laboratory",
      "course_id": "019026"
    },
    "PY-211": {
      "course_title": "College Physics I",
      "course_id": "019027"
    },
    "PY-212": {
      "course_title": "College Physics II",
      "course_id": "019029"
    },
    "SMT-202": {
      "course_title": "Anatomy and Properties of Renewable Materials",
      "course_id": "010220"
    },
    "SSC-200": {
      "course_title": "Soil Science",
      "course_id": "020087"
    },
    "SSC-201": {
      "course_title": "Soil Science Laboratory",
      "course_id": "031459"
    },
    "TMS-211": {
      "course_title": "Introduction to Fiber Science",
      "course_id": "021160"
    },
    "TOX-201": {
      "course_title": "Poisons, People and the Environment",
      "course_id": "021261"
    }
  },
  "SOCSCI": {
    "AEE-323": {
      "course_title": "Leadership Development in Agriculture and Life Sciences",
      "course_id": "000267"
    },
    "AEE-350": {
      "course_title": "Personal Leadership Development in Agriculture and Life Sciences",
      "course_id": "023024"
    },
    "AFS-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "ANT-251": {
      "course_title": "Introduction to Biological Anthropology",
      "course_id": "000727"
    },
    "ANT-252": {
      "course_title": "Introduction to Cultural Anthropology",
      "course_id": "000731"
    },
    "ANT-253": {
      "course_title": "Introduction to Archaeology",
      "course_id": "000736"
    },
    "ANT-254": {
      "course_title": "Introduction to Linguistic Anthropology",
      "course_id": "000740"
    },
    "ANT-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "ANT-310": {
      "course_title": "Native Peoples and Cultures of North America",
      "course_id": "000752"
    },
    "ANT-325": {
      "course_title": "Andean South America",
      "course_id": "000757"
    },
    "ANT-330": {
      "course_title": "People and Cultures of Africa",
      "course_id": "000760"
    },
    "ANT-345": {
      "course_title": "Anthropology of the Middle East",
      "course_id": "032270"
    },
    "ANT-370": {
      "course_title": "Introduction to Forensic Anthropology",
      "course_id": "000766"
    },
    "ANT-461": {
      "course_title": "Wealth, Poverty and International Aid",
      "course_id": "032948"
    },
    "ANT-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ANT-481": {
      "course_title": "Zooarchaeology",
      "course_id": "033158"
    },
    "ANT-561": {
      "course_title": "Wealth, Poverty and International Aid",
      "course_id": "032948"
    },
    "ANT-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "ANT-581": {
      "course_title": "Zooarchaeology",
      "course_id": "033158"
    },
    "ARE-201": {
      "course_title": "Introduction to Agricultural & Resource Economics",
      "course_id": "001131"
    },
    "ARE-201A": {
      "course_title": "Introduction to Agricultural & Resource Economics",
      "course_id": "001131"
    },
    "ARE-309": {
      "course_title": "Environmental Law & Economic Policy",
      "course_id": "001142"
    },
    "ARE-311": {
      "course_title": "Agricultural Markets",
      "course_id": "005460"
    },
    "ARE-433": {
      "course_title": "U.S. Agricultural Policy",
      "course_id": "005497"
    },
    "BAE-210": {
      "course_title": "Leadership and Ethics in Science, Technology, and Agriculture",
      "course_id": "033634"
    },
    "COM-112": {
      "course_title": "Interpersonal Communication",
      "course_id": "019873"
    },
    "COM-289": {
      "course_title": "Science Communication and Public Engagement",
      "course_id": "032584"
    },
    "COM-292": {
      "course_title": "Language, Communication, and Culture",
      "course_id": "032552"
    },
    "COM-392": {
      "course_title": "International and Crosscultural Communication",
      "course_id": "019990"
    },
    "EC-201": {
      "course_title": "Principles of Microeconomics",
      "course_id": "005659"
    },
    "EC-202": {
      "course_title": "Principles of Macroeconomics",
      "course_id": "005663"
    },
    "EC-205": {
      "course_title": "Fundamentals of Economics",
      "course_id": "005667"
    },
    "EDP-304": {
      "course_title": "Educational Psychology",
      "course_id": "018506"
    },
    "EDP-370": {
      "course_title": "Applied Child Development",
      "course_id": "007759"
    },
    "ENG-210": {
      "course_title": "Introduction to Language and Linguistics",
      "course_id": "008423"
    },
    "GEO-200": {
      "course_title": "Principles of Geography",
      "course_id": "010984"
    },
    "GEO-220": {
      "course_title": "Cultural Geography",
      "course_id": "010994"
    },
    "HON-295": {
      "course_title": "Honors Special Topics-Social Science",
      "course_id": "012061"
    },
    "HON-352": {
      "course_title": "Self, Schooling, and the Social Order: A Critical Examination",
      "course_id": "032119"
    },
    "HON-353": {
      "course_title": "Code Breakers: Unlocking the Mysteries of One Human Language",
      "course_id": "032087"
    },
    "HON-354": {
      "course_title": "The Winners and Losers of U.S. Agricultural Policy",
      "course_id": "033027"
    },
    "IS-471": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "IS-571": {
      "course_title": "Understanding Latino Migration",
      "course_id": "032949"
    },
    "LPS-315": {
      "course_title": "Public Leadership",
      "course_id": "018089"
    },
    "MIE-209": {
      "course_title": "Survey of Entrepreneurship",
      "course_id": "033303"
    },
    "MS-302": {
      "course_title": "Applied Leadership in Small Unit Operations",
      "course_id": "015831"
    },
    "NR-219": {
      "course_title": "Natural Resource Markets",
      "course_id": "032720"
    },
    "NR-460": {
      "course_title": "Renewable Natural Resource Management and Policy",
      "course_id": "010296"
    },
    "NR-560": {
      "course_title": "Renewable Natural Resource Management and Policy",
      "course_id": "010296"
    },
    "NS-210": {
      "course_title": "Leadership and Management",
      "course_id": "016419"
    },
    "PA-203": {
      "course_title": "Introduction to Nonprofits",
      "course_id": "018001"
    },
    "PA-312": {
      "course_title": "Introduction to Public Administration",
      "course_id": "018081"
    },
    "PRT-152": {
      "course_title": "Introduction to Parks, Recreation, Tourism, and Event Management",
      "course_id": "019307"
    },
    "PRT-200": {
      "course_title": "Health, Wellness and the Pursuit of Happiness",
      "course_id": "019310"
    },
    "PS-201": {
      "course_title": "American Politics and Government",
      "course_id": "017992"
    },
    "PS-202": {
      "course_title": "State and Local Government",
      "course_id": "017999"
    },
    "PS-203": {
      "course_title": "Introduction to Nonprofits",
      "course_id": "018001"
    },
    "PS-231": {
      "course_title": "Introduction to International Relations",
      "course_id": "018019"
    },
    "PS-236": {
      "course_title": "Issues in Global Politics",
      "course_id": "018023"
    },
    "PS-301": {
      "course_title": "The Presidency and Congress",
      "course_id": "018062"
    },
    "PS-302": {
      "course_title": "Campaigns and Elections in the US Political System",
      "course_id": "018065"
    },
    "PS-303": {
      "course_title": "Race in U.S. Politics",
      "course_id": "018066"
    },
    "PS-305": {
      "course_title": "The Justice System in the American Political Process",
      "course_id": "018068"
    },
    "PS-306": {
      "course_title": "Gender and Politics in the United States",
      "course_id": "018069"
    },
    "PS-309": {
      "course_title": "Equality and Justice in United States Law",
      "course_id": "018076"
    },
    "PS-310": {
      "course_title": "Public Policy",
      "course_id": "018078"
    },
    "PS-312": {
      "course_title": "Introduction to Public Administration",
      "course_id": "018081"
    },
    "PS-314": {
      "course_title": "Science, Technology and Public Policy",
      "course_id": "018086"
    },
    "PS-320": {
      "course_title": "U.S. Environmental Law and Politics",
      "course_id": "018090"
    },
    "PS-325": {
      "course_title": "Introduction to Political Psychology",
      "course_id": "033421"
    },
    "PS-331": {
      "course_title": "U.S. Foreign Policy",
      "course_id": "018098"
    },
    "PS-332": {
      "course_title": "Causes of War and Peace",
      "course_id": "018102"
    },
    "PS-335": {
      "course_title": "International Law",
      "course_id": "018104"
    },
    "PS-336": {
      "course_title": "Global Environmental Politics",
      "course_id": "018105"
    },
    "PS-341": {
      "course_title": "European Politics",
      "course_id": "018110"
    },
    "PS-342": {
      "course_title": "Politics of China and Japan",
      "course_id": "018112"
    },
    "PS-345": {
      "course_title": "Governments and Politics in the Middle East",
      "course_id": "018116"
    },
    "PS-353": {
      "course_title": "Issues in Latin American and Caribbean Politics",
      "course_id": "032503"
    },
    "PSY-200": {
      "course_title": "Introduction to Psychology",
      "course_id": "018448"
    },
    "PSY-208": {
      "course_title": "Psychobiology of Success",
      "course_id": "032676"
    },
    "PSY-311": {
      "course_title": "Social Psychology",
      "course_id": "018520"
    },
    "PSY-325": {
      "course_title": "Introduction to Political Psychology",
      "course_id": "033421"
    },
    "PSY-376": {
      "course_title": "Developmental Psychology",
      "course_id": "018551"
    },
    "PSY-406": {
      "course_title": "Psychology of Gender",
      "course_id": "018558"
    },
    "PSY-412": {
      "course_title": "Social Relationships",
      "course_id": "018562"
    },
    "PSY-432": {
      "course_title": "Human Sexuality and Intimate Relationships",
      "course_id": "033068"
    },
    "PSY-441": {
      "course_title": "Environmental Psychology",
      "course_id": "033358"
    },
    "PSY-442": {
      "course_title": "Psychology and Law",
      "course_id": "033598"
    },
    "PSY-471": {
      "course_title": "Psychology and Media",
      "course_id": "033334"
    },
    "PSY-477": {
      "course_title": "Psychology of Aging",
      "course_id": "033250"
    },
    "REL-309": {
      "course_title": "Religion and Society",
      "course_id": "019226"
    },
    "SOC-202": {
      "course_title": "Principles of Sociology",
      "course_id": "019446"
    },
    "SOC-203": {
      "course_title": "Current Social Problems",
      "course_id": "019453"
    },
    "SOC-203A": {
      "course_title": "Current Social Problems",
      "course_id": "019453"
    },
    "SOC-204": {
      "course_title": "Sociology of Family",
      "course_id": "019459"
    },
    "SOC-205": {
      "course_title": "Jobs and Work",
      "course_id": "019466"
    },
    "SOC-206": {
      "course_title": "Social Deviance",
      "course_id": "019468"
    },
    "SOC-207": {
      "course_title": "Language and Society",
      "course_id": "032506"
    },
    "SOC-211": {
      "course_title": "Community and Health",
      "course_id": "032848"
    },
    "SOC-212": {
      "course_title": "Race in America",
      "course_id": "032823"
    },
    "SOC-220": {
      "course_title": "Cultural Geography",
      "course_id": "010994"
    },
    "SOC-241": {
      "course_title": "Sociology of Agriculture and Rural Society",
      "course_id": "019487"
    },
    "SOC-241A": {
      "course_title": "Sociology of Agriculture and Rural Society",
      "course_id": "019487"
    },
    "SOC-261": {
      "course_title": "Technology in Society and Culture",
      "course_id": "000744"
    },
    "SOC-300": {
      "course_title": "Social Research Methods",
      "course_id": "019501"
    },
    "SOC-301": {
      "course_title": "Human Behavior",
      "course_id": "019504"
    },
    "SOC-304": {
      "course_title": "Gender and Society",
      "course_id": "019511"
    },
    "SOC-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "SOC-306": {
      "course_title": "Criminology",
      "course_id": "019518"
    },
    "SOC-307": {
      "course_title": "Sociology of Immigration",
      "course_id": "019520"
    },
    "SOC-309": {
      "course_title": "Religion and Society",
      "course_id": "019226"
    },
    "SOC-311": {
      "course_title": "Community Relationships",
      "course_id": "019526"
    },
    "SOC-320": {
      "course_title": "Survey Design",
      "course_id": "033024"
    },
    "SOC-342": {
      "course_title": "International Development",
      "course_id": "019534"
    },
    "SOC-350": {
      "course_title": "Food and Society",
      "course_id": "032028"
    },
    "SOC-351": {
      "course_title": "Population and Planning",
      "course_id": "019535"
    },
    "SW-300": {
      "course_title": "Research Methods in Social Work",
      "course_id": "020532"
    },
    "SW-307": {
      "course_title": "Social Welfare Policy: Analysis and Advocacy",
      "course_id": "020533"
    },
    "SW-310": {
      "course_title": "Human Behavior Theory for Social Work Practice",
      "course_id": "020537"
    },
    "WGS-204": {
      "course_title": "Sociology of Family",
      "course_id": "019459"
    },
    "WGS-304": {
      "course_title": "Gender and Society",
      "course_id": "019511"
    },
    "WGS-306": {
      "course_title": "Gender and Politics in the United States",
      "course_id": "018069"
    },
    "WGS-406": {
      "course_title": "Psychology of Gender",
      "course_id": "018558"
    },
    "WL-451": {
      "course_title": "Migration and Diaspora",
      "course_id": "033572"
    }
  },
  "USDIV": {
    "AFS-241": {
      "course_title": "Introduction to African American Studies",
      "course_id": "000361"
    },
    "AFS-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "AFS-260": {
      "course_title": "History of Jazz",
      "course_id": "000364"
    },
    "AFS-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "AFS-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "AFS-344": {
      "course_title": "Leadership in African American Communities",
      "course_id": "000373"
    },
    "AFS-345": {
      "course_title": "Psychology and the African American Experience",
      "course_id": "000374"
    },
    "AFS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "AFS-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "AFS-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "AFS-375": {
      "course_title": "African American Cinema",
      "course_id": "000380"
    },
    "AFS-380": {
      "course_title": "Black Feminist Theory",
      "course_id": "032677"
    },
    "AFS-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "AFS-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "ALS-103": {
      "course_title": "First-year Success in Agriculture and Life Sciences",
      "course_id": "000439"
    },
    "ALS-303": {
      "course_title": "Transfer Success in Agriculture and Life Sciences",
      "course_id": "000459"
    },
    "ANT-254": {
      "course_title": "Introduction to Linguistic Anthropology",
      "course_id": "000740"
    },
    "ANT-310": {
      "course_title": "Native Peoples and Cultures of North America",
      "course_id": "000752"
    },
    "ARS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "BIO-440": {
      "course_title": "The Human Animal: An Evolutionary Perspective",
      "course_id": "031780"
    },
    "CNR-110": {
      "course_title": "CNR First-year Advancement Seminar",
      "course_id": "033305"
    },
    "COM-292": {
      "course_title": "Language, Communication, and Culture",
      "course_id": "032552"
    },
    "COM-392": {
      "course_title": "International and Crosscultural Communication",
      "course_id": "019990"
    },
    "COM-417": {
      "course_title": "Communication & Race",
      "course_id": "003892"
    },
    "COS-110": {
      "course_title": "Exploring Issues of Diversity, Equity, and Inclusion in the Sciences",
      "course_id": "033036"
    },
    "DAN-230": {
      "course_title": "The Horton Dance Technique and Legacy",
      "course_id": "032271"
    },
    "ENG-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "ENG-265": {
      "course_title": "American Literature I",
      "course_id": "008479"
    },
    "ENG-375": {
      "course_title": "African American Cinema",
      "course_id": "000380"
    },
    "ENG-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "ENG-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "HI-253": {
      "course_title": "Early U.S. History",
      "course_id": "032366"
    },
    "HI-254": {
      "course_title": "Modern U.S. History",
      "course_id": "032178"
    },
    "HI-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "HI-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "HI-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "HI-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "MUS-260": {
      "course_title": "History of Jazz",
      "course_id": "000364"
    },
    "PSY-345": {
      "course_title": "Psychology and the African American Experience",
      "course_id": "000374"
    },
    "REL-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "SOC-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "WGS-380": {
      "course_title": "Black Feminist Theory",
      "course_id": "032677"
    }
  },
  "USDEI": {
    "AFS-241": {
      "course_title": "Introduction to African American Studies",
      "course_id": "000361"
    },
    "AFS-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "AFS-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "AFS-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "AFS-344": {
      "course_title": "Leadership in African American Communities",
      "course_id": "000373"
    },
    "AFS-345": {
      "course_title": "Psychology and the African American Experience",
      "course_id": "000374"
    },
    "AFS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "AFS-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "AFS-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "AFS-375": {
      "course_title": "African American Cinema",
      "course_id": "000380"
    },
    "AFS-380": {
      "course_title": "Black Feminist Theory",
      "course_id": "032677"
    },
    "AFS-444": {
      "course_title": "African American and African Women Leaders",
      "course_id": "033201"
    },
    "AFS-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "AFS-470": {
      "course_title": "The Red Record and The Birth of a Nation",
      "course_id": "033154"
    },
    "AFS-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "AFS-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "ANT-254": {
      "course_title": "Introduction to Linguistic Anthropology",
      "course_id": "000740"
    },
    "ANT-310": {
      "course_title": "Native Peoples and Cultures of North America",
      "course_id": "000752"
    },
    "ARS-346": {
      "course_title": "Black Popular Culture",
      "course_id": "000375"
    },
    "BIO-440": {
      "course_title": "The Human Animal: An Evolutionary Perspective",
      "course_id": "031780"
    },
    "CNR-110": {
      "course_title": "CNR First-year Advancement Seminar",
      "course_id": "033305"
    },
    "COM-292": {
      "course_title": "Language, Communication, and Culture",
      "course_id": "032552"
    },
    "COM-392": {
      "course_title": "International and Crosscultural Communication",
      "course_id": "019990"
    },
    "COM-417": {
      "course_title": "Communication & Race",
      "course_id": "003892"
    },
    "DAN-230": {
      "course_title": "The Horton Dance Technique and Legacy",
      "course_id": "032271"
    },
    "ENG-248": {
      "course_title": "Survey of African-American Literature",
      "course_id": "000363"
    },
    "ENG-265": {
      "course_title": "American Literature I",
      "course_id": "008479"
    },
    "ENG-375": {
      "course_title": "African American Cinema",
      "course_id": "000380"
    },
    "ENG-448": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "ENG-548": {
      "course_title": "African-American Literature",
      "course_id": "000384"
    },
    "HI-253": {
      "course_title": "Early U.S. History",
      "course_id": "032366"
    },
    "HI-254": {
      "course_title": "Modern U.S. History",
      "course_id": "032178"
    },
    "HI-372": {
      "course_title": "African-American History Through the Civil War, 1619-1865",
      "course_id": "000378"
    },
    "HI-373": {
      "course_title": "African-American History Since 1865",
      "course_id": "000379"
    },
    "HI-455": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "HI-555": {
      "course_title": "History of the Civil Rights Movement",
      "course_id": "000385"
    },
    "HSS-201": {
      "course_title": "Critical Thinking in American Life: Engaging Across Difference",
      "course_id": "033240"
    },
    "PSY-345": {
      "course_title": "Psychology and the African American Experience",
      "course_id": "000374"
    },
    "REL-343": {
      "course_title": "African American Religions",
      "course_id": "000371"
    },
    "SOC-305": {
      "course_title": "Racial and Ethnic Relations",
      "course_id": "000367"
    },
    "WGS-380": {
      "course_title": "Black Feminist Theory",
      "course_id": "032677"
    }
  },
  "VPA": {
    "ADN-275": {
      "course_title": "Survey of Fibers in Art and Design",
      "course_id": "031347"
    },
    "AFS-260": {
      "course_title": "History of Jazz",
      "course_id": "000364"
    },
    "ARC-140": {
      "course_title": "Experiencing Architecture",
      "course_id": "004902"
    },
    "ARC-141": {
      "course_title": "Introduction to Architectural History",
      "course_id": "004903"
    },
    "ARS-251": {
      "course_title": "The Arts of a World Capital: London",
      "course_id": "001181"
    },
    "ARS-252": {
      "course_title": "The Arts of Vienna 1900",
      "course_id": "001182"
    },
    "ARS-259": {
      "course_title": "The Arts and Politics",
      "course_id": "001188"
    },
    "ARS-306": {
      "course_title": "Music Composition with Computers",
      "course_id": "001189"
    },
    "ARS-351": {
      "course_title": "Arts, Ideas and Values",
      "course_id": "001191"
    },
    "ARS-353": {
      "course_title": "Arts and Cross-Cultural Contacts",
      "course_id": "001193"
    },
    "ARS-354": {
      "course_title": "The Arts and the Sacred",
      "course_id": "023035"
    },
    "ARS-410": {
      "course_title": "Art and History of World Puppetry",
      "course_id": "033016"
    },
    "COM-110": {
      "course_title": "Public Speaking",
      "course_id": "019869"
    },
    "COM-364": {
      "course_title": "History of Film to 1940",
      "course_id": "003876"
    },
    "COM-374": {
      "course_title": "History of Film From 1940",
      "course_id": "003878"
    },
    "D-231": {
      "course_title": "Design History for Engineers and Scientists",
      "course_id": "000154"
    },
    "DAN-120": {
      "course_title": "Movement Improvisation",
      "course_id": "032192"
    },
    "DAN-122": {
      "course_title": "Dance and Society",
      "course_id": "033570"
    },
    "DAN-230": {
      "course_title": "The Horton Dance Technique and Legacy",
      "course_id": "032271"
    },
    "DAN-232": {
      "course_title": "Dance on Screen",
      "course_id": "033409"
    },
    "DAN-260": {
      "course_title": "Hip-hop Dance",
      "course_id": "032597"
    },
    "DAN-265": {
      "course_title": "Ballet II",
      "course_id": "032243"
    },
    "DAN-272": {
      "course_title": "Dance Composition - Solo Forms",
      "course_id": "004842"
    },
    "DAN-276": {
      "course_title": "Jazz Dance II",
      "course_id": "032244"
    },
    "DAN-305": {
      "course_title": "Dance Repertory and Performance",
      "course_id": "033369"
    },
    "DAN-310": {
      "course_title": "Panoramic Dance Project",
      "course_id": "033464"
    },
    "DAN-311": {
      "course_title": "State Dance Company",
      "course_id": "033425"
    },
    "DAN-315": {
      "course_title": "Site-Specific Dance Performance",
      "course_id": "033370"
    },
    "DAN-322": {
      "course_title": "Dance and Society",
      "course_id": "032245"
    },
    "DAN-324": {
      "course_title": "U.S. Concert Dance History",
      "course_id": "032306"
    },
    "DAN-326": {
      "course_title": "Current Trends in Dance",
      "course_id": "032272"
    },
    "DAN-328": {
      "course_title": "Dance Composition - Group Forms",
      "course_id": "032193"
    },
    "ENG-282": {
      "course_title": "Introduction to Film",
      "course_id": "008493"
    },
    "ENG-292": {
      "course_title": "Writing About Film",
      "course_id": "008492"
    },
    "ENG-364": {
      "course_title": "History of Film to 1940",
      "course_id": "003876"
    },
    "ENG-374": {
      "course_title": "History of Film From 1940",
      "course_id": "003878"
    },
    "ENG-378": {
      "course_title": "Women & Film",
      "course_id": "031326"
    },
    "ENG-382": {
      "course_title": "Film and Literature",
      "course_id": "008605"
    },
    "FTM-400": {
      "course_title": "Major Fashion Designers",
      "course_id": "024111"
    },
    "GC-120": {
      "course_title": "Foundations of Graphics",
      "course_id": "010836"
    },
    "GD-203": {
      "course_title": "History of Graphic Design",
      "course_id": "010890"
    },
    "GD-303": {
      "course_title": "Graphic Design Theory and Practice",
      "course_id": "010874"
    },
    "HA-201": {
      "course_title": "History of Art from Caves to the Renaissance",
      "course_id": "011246"
    },
    "HA-202": {
      "course_title": "History of Art From the Renaissance Through the 20th Century",
      "course_id": "011248"
    },
    "HA-203": {
      "course_title": "History of American Art",
      "course_id": "011252"
    },
    "HA-410": {
      "course_title": "History of the Art of Photography",
      "course_id": "011268"
    },
    "HON-299": {
      "course_title": "Honors Special Topics - Visual and Performing Arts",
      "course_id": "012110"
    },
    "HON-390": {
      "course_title": "Music and the Celtic World",
      "course_id": "032451"
    },
    "HS-242": {
      "course_title": "Landscape Design Introduction",
      "course_id": "012195"
    },
    "HS-275": {
      "course_title": "Floral Design",
      "course_id": "033148"
    },
    "MUS-103": {
      "course_title": "Theory and Musicianship I",
      "course_id": "016067"
    },
    "MUS-105": {
      "course_title": "Introduction to Music in Western Society",
      "course_id": "016051"
    },
    "MUS-120": {
      "course_title": "Introduction to Music Theory",
      "course_id": "016039"
    },
    "MUS-180": {
      "course_title": "Introduction to Musical Experiences",
      "course_id": "016042"
    },
    "MUS-181": {
      "course_title": "Exploring Music Theory",
      "course_id": "031159"
    },
    "MUS-200": {
      "course_title": "Understanding Music: Global Perspectives",
      "course_id": "016044"
    },
    "MUS-201": {
      "course_title": "Introduction to Music Literature I",
      "course_id": "016048"
    },
    "MUS-202": {
      "course_title": "Introduction to Music Literature II",
      "course_id": "016049"
    },
    "MUS-206": {
      "course_title": "America's Music",
      "course_id": "016052"
    },
    "MUS-210": {
      "course_title": "Introduction to Popular Music: 1950s-1970s",
      "course_id": "016053"
    },
    "MUS-211": {
      "course_title": "Introduction to Popular Music: 1980s-Present",
      "course_id": "032323"
    },
    "MUS-230": {
      "course_title": "Introduction to African-American Music",
      "course_id": "000359"
    },
    "MUS-240": {
      "course_title": "Introduction to the Music Industry",
      "course_id": "016058"
    },
    "MUS-260": {
      "course_title": "History of Jazz",
      "course_id": "000364"
    },
    "MUS-270": {
      "course_title": "Songwriting Using Digital Audio Workstations",
      "course_id": "032325"
    },
    "MUS-305": {
      "course_title": "Music Composition",
      "course_id": "016070"
    },
    "MUS-306": {
      "course_title": "Music Composition with Computers",
      "course_id": "001189"
    },
    "MUS-310": {
      "course_title": "Music of the 17th and 18th Centuries",
      "course_id": "016071"
    },
    "MUS-315": {
      "course_title": "Music of the 19th Century",
      "course_id": "016072"
    },
    "MUS-320": {
      "course_title": "Music of the 20th Century",
      "course_id": "016074"
    },
    "MUS-330": {
      "course_title": "Survey of Musical Theater",
      "course_id": "016076"
    },
    "MUS-350": {
      "course_title": "Music of Asia",
      "course_id": "016081"
    },
    "MUS-360": {
      "course_title": "Women In Music",
      "course_id": "016084"
    },
    "TDE-351": {
      "course_title": "Ceramics: The Art and Craft of Clay",
      "course_id": "021042"
    },
    "THE-103": {
      "course_title": "Introduction to the Theatre",
      "course_id": "019867"
    },
    "THE-203": {
      "course_title": "Theory and Practice of Acting",
      "course_id": "019886"
    },
    "WGS-360": {
      "course_title": "Women In Music",
      "course_id": "016084"
    },
    "WL-216": {
      "course_title": "Art and Society in France",
      "course_id": "009712"
    },
    "WL-218": {
      "course_title": "The Harlem Renaissance in Paris: Paris Noir",
      "course_id": "033223"
    },
    "WLFR-318": {
      "course_title": "The Heritage of French Cinema",
      "course_id": "009899"
    },
    "WLFR-320": {
      "course_title": "Franco-Belgian Comics and Graphic Arts",
      "course_id": "033573"
    },
    "WLGE-318": {
      "course_title": "New German Cinema and Beyond",
      "course_id": "009977"
    }
  }
} as const;


/* Utility types */
export interface CourseInfo {
  course_title: string;
  course_id: string;
}

export type CourseCode<G extends GEPCode = GEPCode> =
  keyof typeof GEP_COURSES[G];

export type GEPCourseDetails<
  G extends GEPCode = GEPCode,
  C extends CourseCode<G> = CourseCode<G>
> = typeof GEP_COURSES[G][C];

/** Get course info by GEP code and catalog */
export function getGEPCourse<
  G extends GEPCode,
  C extends CourseCode<G>
>(code: G, catalog: C): GEPCourseDetails<G, C> {
  return GEP_COURSES[code][catalog];
}
