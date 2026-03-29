// US City coordinates for geolocation detection
// Covers all cities referenced in cityToState (trades.ts) - the core routed cities
// Kept SEPARATE from UK coordinates per localization architecture
export const usCityCoordinates: Record<string, { lat: number; lng: number }> = {
    // === California (CA) ===
    "Los Angeles": { lat: 34.0522, lng: -118.2437 },
    "San Diego": { lat: 32.7157, lng: -117.1611 },
    "San Francisco": { lat: 37.7749, lng: -122.4194 },
    "Sacramento": { lat: 38.5816, lng: -121.4944 },
    "San Jose": { lat: 37.3382, lng: -121.8863 },
    "Fresno": { lat: 36.7378, lng: -119.7871 },
    "Long Beach": { lat: 33.7701, lng: -118.1937 },
    "Oakland": { lat: 37.8044, lng: -122.2712 },
    "Bakersfield": { lat: 35.3733, lng: -119.0187 },
    "Anaheim": { lat: 33.8366, lng: -117.9143 },
    "Santa Ana": { lat: 33.7455, lng: -117.8677 },
    "Riverside": { lat: 33.9533, lng: -117.3962 },
    "Stockton": { lat: 37.9577, lng: -121.2908 },

    // === Texas (TX) ===
    "Dallas": { lat: 32.7767, lng: -96.7970 },
    "Houston": { lat: 29.7604, lng: -95.3698 },
    "Austin": { lat: 30.2672, lng: -97.7431 },
    "San Antonio": { lat: 29.4241, lng: -98.4936 },
    "Fort Worth": { lat: 32.7555, lng: -97.3308 },
    "Arlington": { lat: 32.7357, lng: -97.1081 },
    "Plano": { lat: 33.0198, lng: -96.6989 },
    "Irving": { lat: 32.8140, lng: -96.9489 },
    "Garland": { lat: 32.9126, lng: -96.6389 },
    "Frisco": { lat: 33.1507, lng: -96.8236 },
    "McKinney": { lat: 33.1972, lng: -96.6397 },
    "El Paso": { lat: 31.7619, lng: -106.4850 },
    "Corpus Christi": { lat: 27.8006, lng: -97.3964 },
    "Lubbock": { lat: 33.5779, lng: -101.8552 },
    "Laredo": { lat: 27.5036, lng: -99.5076 },
    "Amarillo": { lat: 35.2220, lng: -101.8313 },
    "Midland": { lat: 31.9973, lng: -102.0779 },
    "Abilene": { lat: 32.4487, lng: -99.7331 },
    "Denton": { lat: 33.2148, lng: -97.1331 },
    "Waco": { lat: 31.5493, lng: -97.1467 },
    "Carrollton": { lat: 32.9537, lng: -96.8903 },
    "Richardson": { lat: 32.9483, lng: -96.7299 },
    "Lewisville": { lat: 33.0462, lng: -96.9942 },
    "Round Rock": { lat: 30.5083, lng: -97.6789 },
    "College Station": { lat: 30.6280, lng: -96.3344 },
    "Tyler": { lat: 32.3513, lng: -95.3011 },
    "Pearland": { lat: 29.5636, lng: -95.2860 },
    "Sugar Land": { lat: 29.6197, lng: -95.6349 },
    "Allen": { lat: 33.1032, lng: -96.6706 },
    "League City": { lat: 29.5075, lng: -95.0949 },
    "Conroe": { lat: 30.3119, lng: -95.4560 },
    "New Braunfels": { lat: 29.7030, lng: -98.1245 },
    "Edinburg": { lat: 26.3017, lng: -98.1633 },
    "Mission": { lat: 26.2159, lng: -98.3253 },
    "Bryan": { lat: 30.6744, lng: -96.3700 },
    "Pharr": { lat: 26.1948, lng: -98.1836 },
    "Baytown": { lat: 29.7355, lng: -94.9774 },
    "Missouri City": { lat: 29.6186, lng: -95.5377 },
    "Temple": { lat: 31.0982, lng: -97.3428 },
    "Flower Mound": { lat: 33.0146, lng: -97.0970 },
    "North Richland Hills": { lat: 32.8343, lng: -97.2289 },
    "Mansfield": { lat: 32.5632, lng: -97.1417 },
    "Victoria": { lat: 28.8053, lng: -96.9850 },
    "Rowlett": { lat: 32.9029, lng: -96.5639 },
    "Harlingen": { lat: 26.1906, lng: -97.6961 },
    "Pflugerville": { lat: 30.4394, lng: -97.6200 },
    "San Marcos": { lat: 29.8833, lng: -97.9414 },
    "Euless": { lat: 32.8371, lng: -97.0820 },
    "Port Arthur": { lat: 29.8850, lng: -93.9400 },
    "Grapevine": { lat: 32.9343, lng: -97.0781 },

    // === Florida (FL) ===
    "Miami": { lat: 25.7617, lng: -80.1918 },
    "Orlando": { lat: 28.5383, lng: -81.3792 },
    "Jacksonville": { lat: 30.3322, lng: -81.6557 },
    "Tampa": { lat: 27.9506, lng: -82.4572 },
    "Gainesville": { lat: 29.6516, lng: -82.3248 },
    "Ocala": { lat: 29.1872, lng: -82.1401 },
    "Pensacola": { lat: 30.4213, lng: -87.2169 },
    "Panama City": { lat: 30.1588, lng: -85.6602 },

    // === Arizona (AZ) ===
    "Phoenix": { lat: 33.4484, lng: -112.0740 },
    "Scottsdale": { lat: 33.4942, lng: -111.9261 },
    "Mesa": { lat: 33.4152, lng: -111.8315 },
    "Tucson": { lat: 32.2226, lng: -110.9747 },

    // === Washington (WA) ===
    "Seattle": { lat: 47.6062, lng: -122.3321 },
    "Tacoma": { lat: 47.2529, lng: -122.4443 },
    "Spokane": { lat: 47.6588, lng: -117.4260 },

    // === Oregon (OR) ===
    "Portland": { lat: 45.5152, lng: -122.6784 },
    "Eugene": { lat: 44.0521, lng: -123.0868 },

    // === Connecticut (CT) ===
    "Stratford": { lat: 41.1845, lng: -73.1332 },
    "Trumbull": { lat: 41.2429, lng: -73.2007 },
    "Shelton": { lat: 41.3165, lng: -73.0932 },
    "Hartford": { lat: 41.7658, lng: -72.6734 },

    // === Nevada (NV) ===
    "Las Vegas": { lat: 36.1699, lng: -115.1398 },
    "Henderson": { lat: 36.0395, lng: -114.9817 },
    "North Las Vegas": { lat: 36.1989, lng: -115.1175 },
    "Paradise": { lat: 36.0972, lng: -115.1468 },
    "Reno": { lat: 39.5296, lng: -119.8138 },

    // === Utah (UT) ===
    "Salt Lake City": { lat: 40.7608, lng: -111.8910 },
    "West Valley City": { lat: 40.6916, lng: -112.0011 },
    "West Jordan": { lat: 40.6097, lng: -111.9391 },
    "Sandy": { lat: 40.5649, lng: -111.8590 },

    // === Louisiana (LA) ===
    "New Orleans": { lat: 29.9511, lng: -90.0715 },
    "Metairie": { lat: 29.9841, lng: -90.1526 },
    "Kenner": { lat: 29.9941, lng: -90.2417 },
    "Marrero": { lat: 29.8994, lng: -90.1004 },
    "Baton Rouge": { lat: 30.4515, lng: -91.1871 },
    "Shreveport": { lat: 32.5252, lng: -93.7502 },

    // === Michigan (MI) ===
    "Detroit": { lat: 42.3314, lng: -83.0458 },
    "Lansing": { lat: 42.7325, lng: -84.5555 },
    "Ann Arbor": { lat: 42.2808, lng: -83.7430 },
    "Flint": { lat: 43.0125, lng: -83.6875 },
    "Grand Rapids": { lat: 42.9634, lng: -85.6681 },

    // === Ohio (OH) ===
    "Cleveland": { lat: 41.4993, lng: -81.6944 },
    "Columbus": { lat: 39.9612, lng: -82.9988 },
    "Cincinnati": { lat: 39.1031, lng: -84.5120 },
    "Toledo": { lat: 41.6528, lng: -83.5379 },

    // === Pennsylvania (PA) ===
    "Pittsburgh": { lat: 40.4406, lng: -79.9959 },
    "Philadelphia": { lat: 39.9526, lng: -75.1652 },
    "Scranton": { lat: 41.4090, lng: -75.6624 },
    "Allentown": { lat: 40.6084, lng: -75.4902 },
    "Harrisburg": { lat: 40.2732, lng: -76.8867 },
    "Erie": { lat: 42.1292, lng: -80.0851 },

    // === New York (NY) ===
    "Buffalo": { lat: 42.8864, lng: -78.8784 },
    "New York City": { lat: 40.7128, lng: -74.0060 },
    "Syracuse": { lat: 43.0481, lng: -76.1474 },
    "Yonkers": { lat: 40.9312, lng: -73.8987 },
    "Rochester": { lat: 43.1566, lng: -77.6088 },

    // === Indiana (IN) ===
    "Indianapolis": { lat: 39.7684, lng: -86.1581 },
    "Carmel": { lat: 39.9784, lng: -86.1180 },
    "Fishers": { lat: 39.9568, lng: -86.0131 },
    "Greenwood": { lat: 39.6137, lng: -86.1066 },
    "Fort Wayne": { lat: 41.0793, lng: -85.1394 },
    "Evansville": { lat: 37.9716, lng: -87.5711 },
    "South Bend": { lat: 41.6764, lng: -86.2520 },

    // === North Carolina (NC) ===
    "Charlotte": { lat: 35.2271, lng: -80.8431 },
    "Raleigh": { lat: 35.7796, lng: -78.6382 },
    "Greensboro": { lat: 36.0726, lng: -79.7920 },
    "Durham": { lat: 35.9940, lng: -78.8986 },
    "Winston-Salem": { lat: 36.0999, lng: -80.2442 },
    "Fayetteville": { lat: 35.0527, lng: -78.8784 },
    "Asheville": { lat: 35.5951, lng: -82.5515 },

    // === Illinois (IL) ===
    "Chicago": { lat: 41.8781, lng: -87.6298 },
    "Rockford": { lat: 42.2711, lng: -89.0940 },
    "Joliet": { lat: 41.5250, lng: -88.0817 },

    // === Colorado (CO) ===
    "Denver": { lat: 39.7392, lng: -104.9903 },
    "Colorado Springs": { lat: 38.8339, lng: -104.8214 },
    "Aurora": { lat: 39.7294, lng: -104.8319 },

    // === Oklahoma (OK) ===
    "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
    "Norman": { lat: 35.2226, lng: -97.4395 },
    "Edmond": { lat: 35.6528, lng: -97.4781 },
    "Moore": { lat: 35.3395, lng: -97.4867 },
    "Tulsa": { lat: 36.1540, lng: -95.9928 },
    "Lawton": { lat: 34.6036, lng: -98.3959 },

    // === Tennessee (TN) ===
    "Nashville": { lat: 36.1627, lng: -86.7816 },
    "Memphis": { lat: 35.1495, lng: -90.0490 },
    "Knoxville": { lat: 35.9606, lng: -83.9207 },
    "Chattanooga": { lat: 35.0456, lng: -85.3097 },

    // === District of Columbia ===
    "Washington, D.C.": { lat: 38.9072, lng: -77.0369 },

    // === Massachusetts (MA) ===
    "Boston": { lat: 42.3601, lng: -71.0589 },
    "Worcester": { lat: 42.2626, lng: -71.8023 },

    // === Kentucky (KY) ===
    "Louisville": { lat: 38.2527, lng: -85.7585 },
    "Lexington": { lat: 38.0406, lng: -84.5037 },

    // === Maryland (MD) ===
    "Baltimore": { lat: 39.2904, lng: -76.6122 },
    "Annapolis": { lat: 38.9784, lng: -76.4922 },
    "Frederick": { lat: 39.4143, lng: -77.4105 },
    "Hagerstown": { lat: 39.6418, lng: -77.7200 },
    "Salisbury": { lat: 38.3607, lng: -75.5994 },
    "Bowie": { lat: 38.9428, lng: -76.7309 },

    // === Wisconsin (WI) ===
    "Milwaukee": { lat: 43.0389, lng: -87.9065 },
    "Madison": { lat: 43.0731, lng: -89.4012 },
    "Green Bay": { lat: 44.5133, lng: -88.0133 },
    "Kenosha": { lat: 42.5847, lng: -87.8212 },

    // === New Mexico (NM) ===
    "Albuquerque": { lat: 35.0844, lng: -106.6504 },

    // === Missouri (MO) ===
    "Kansas City": { lat: 39.0997, lng: -94.5786 },
    "St. Louis": { lat: 38.6270, lng: -90.1994 },

    // === Georgia (GA) ===
    "Atlanta": { lat: 33.7490, lng: -84.3880 },
    "Augusta": { lat: 33.4735, lng: -82.0105 },
    "Savannah": { lat: 32.0809, lng: -81.0912 },

    // === Nebraska (NE) ===
    "Omaha": { lat: 41.2565, lng: -95.9345 },
    "Lincoln": { lat: 40.8136, lng: -96.7026 },

    // === Virginia (VA) ===
    "Virginia Beach": { lat: 36.8529, lng: -75.9780 },
    "Norfolk": { lat: 36.8508, lng: -76.2859 },
    "Richmond": { lat: 37.5407, lng: -77.4360 },
    "Newport News": { lat: 37.0871, lng: -76.4730 },
    "Chesapeake": { lat: 36.7682, lng: -76.2875 },
    "Alexandria": { lat: 38.8048, lng: -77.0469 },
    "Roanoke": { lat: 37.2710, lng: -79.9414 },

    // === Minnesota (MN) ===
    "Minneapolis": { lat: 44.9778, lng: -93.2650 },
    "St. Paul": { lat: 44.9537, lng: -93.0900 },

    // === Kansas (KS) ===
    "Wichita": { lat: 37.6872, lng: -97.3301 },

    // === Hawaii (HI) ===
    "Honolulu": { lat: 21.3069, lng: -157.8583 },

    // === Alaska (AK) ===
    "Anchorage": { lat: 61.2181, lng: -149.9003 },

    // === Arkansas (AR) ===
    "Little Rock": { lat: 34.7465, lng: -92.2896 },

    // === Mississippi (MS) ===
    "Gulfport": { lat: 30.3674, lng: -89.0928 },
    "Hattiesburg": { lat: 31.3271, lng: -89.2903 },
    "Meridian": { lat: 32.3643, lng: -88.7037 },
    "Jackson": { lat: 32.2988, lng: -90.1848 },

    // === Alabama (AL) ===
    "Birmingham": { lat: 33.5186, lng: -86.8104 },
    "Huntsville": { lat: 34.7304, lng: -86.5861 },
    "Auburn": { lat: 32.6099, lng: -85.4808 },
    "Tuscaloosa": { lat: 33.2098, lng: -87.5692 },
    "Mobile": { lat: 30.6954, lng: -88.0399 },
    "Montgomery": { lat: 32.3668, lng: -86.3000 },

    // === South Carolina (SC) ===
    "Charleston": { lat: 32.7765, lng: -79.9311 },
    "Columbia": { lat: 34.0007, lng: -81.0348 },
    "Greenville": { lat: 34.8526, lng: -82.3940 },

    // === West Virginia (WV) ===
    "Charleston, WV": { lat: 38.3498, lng: -81.6326 },
    "Huntington": { lat: 38.4192, lng: -82.4452 },
    "Morgantown": { lat: 39.6295, lng: -79.9559 },
    "Parkersburg": { lat: 39.2667, lng: -81.5615 },
    "Wheeling": { lat: 40.0640, lng: -80.7209 },

    // === New Jersey (NJ) ===
    "Newark": { lat: 40.7357, lng: -74.1724 },
    "Jersey City": { lat: 40.7282, lng: -74.0776 },
    "Paterson": { lat: 40.9168, lng: -74.1718 },
    "Elizabeth": { lat: 40.6640, lng: -74.2107 },

    // === Iowa (IA) ===
    "Des Moines": { lat: 41.5868, lng: -93.6250 },

    // === Rhode Island (RI) ===
    "Providence": { lat: 41.8240, lng: -71.4128 },

    // === Idaho (ID) ===
    "Boise": { lat: 43.6150, lng: -116.2023 },

    // === South Dakota (SD) ===
    "Sioux Falls": { lat: 43.5460, lng: -96.7313 },

    // === North Dakota (ND) ===
    "Fargo": { lat: 46.8772, lng: -96.7898 },
};
