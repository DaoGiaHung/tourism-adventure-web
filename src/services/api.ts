import { toast } from "sonner";

export interface TouristPlace {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  address: string;
  category: string;
  specialFeatures?: string[];
  bestTimeToVisit?: string;
  businessFeatures?: {
    website?: string;
    phone?: string;
    openingHours?: string;
    amenities?: string[];
    isBusinessFriendly?: boolean;
    conferenceSpace?: boolean;
    wifiAvailable?: boolean;
  };
}

const mockPlaces: TouristPlace[] = [
  {
    id: "1",
    name: "Saigon Railway Station",
    rating: 4.2,
    imageUrl: "https://vietnamtraintickets.info/wp-content/uploads/2018/10/Front-entrance-to-Saigon-Railway-Station-e1583724874267.jpg",
    description: "Historic railway station in the heart of Ho Chi Minh City. Built during the French colonial era, it serves as the main railway hub for the city and the southern terminus of the North-South Railway.",
    location: { lat: 10.774, lng: 106.676 },
    address: "1 Nguyen Thong Street, Ward 9, District 3, Ho Chi Minh City",
    category: "Transport Hub",
    specialFeatures: ["Colonial Architecture", "Multiple Platforms", "Food Stalls", "Ticket Booking Office"],
    bestTimeToVisit: "Early morning for train departures",
    businessFeatures: { isBusinessFriendly: true, wifiAvailable: true, amenities: ["Waiting Areas", "Food Vendors", "Taxi Services"], openingHours: "24/7" }
  },
  {
    id: "2",
    name: "Notre-Dame Cathedral Basilica of Saigon",
    rating: 4.6,
    imageUrl: "https://statics.vinwonders.com/Saigon-Notre-Dame-cathedral-6_1692257373.jpg",
    description: "Historic Catholic cathedral built in 1880 by French colonists. Features twin bell towers made from materials imported from France and serves as the seat of the Roman Catholic Archdiocese of Ho Chi Minh City.",
    location: { lat: 10.7798, lng: 106.699 },
    address: "Cong Xa Paris Square, Ben Nghe Ward, District 1, Ho Chi Minh City",
    category: "Religious Site",
    specialFeatures: ["Twin Bell Towers", "Red Bricks from Toulouse", "Statue of Our Lady of Peace", "Stained Glass Windows"],
    bestTimeToVisit: "October to March when the weather is pleasant",
    businessFeatures: { website: "www.sgnourbasilica.org", openingHours: "7:00 AM - 5:00 PM", amenities: ["Guided Tours", "Religious Services"], conferenceSpace: true }
  },
  {
    id: "3",
    name: "Ben Thanh Market",
    rating: 4.0,
    imageUrl: "https://vietnamdiscovery.com/wp-content/uploads/2019/10/Ben-Thanh-market-Saigon.jpeg",
    description: "Iconic market in the heart of Ho Chi Minh City, established in 1914. Known for its vibrant atmosphere, local goods, street food, and the famous clock tower.",
    location: { lat: 10.7725, lng: 106.698 },
    address: "Le Loi Street, Ben Thanh Ward, District 1, Ho Chi Minh City",
    category: "Shopping",
    specialFeatures: ["Clock Tower", "Street Food Stalls", "Souvenirs", "Textiles and Crafts"],
    bestTimeToVisit: "Evening hours for vibrant atmosphere",
    businessFeatures: { openingHours: "6:00 AM - 10:00 PM", amenities: ["Food Courts", "Shopping Stalls", "Night Market Nearby"], wifiAvailable: false }
  },
  {
    id: "4",
    name: "Independence Palace",
    rating: 4.5,
    imageUrl: "https://vietravelasia.com/media/images/2024/7/the-outside-area-2cd1f5c66cbd3d9eb83fd8a0e1301bc4.jpg",
    description: "Historic site where the Fall of Saigon occurred in 1975. Built in 1966, it served as the presidential palace of South Vietnam and now functions as a museum.",
    location: { lat: 10.7769, lng: 106.6953 },
    address: "135 Nam Ky Khoi Nghia Street, Ben Thanh Ward, District 1, Ho Chi Minh City",
    category: "Historic Site",
    specialFeatures: ["Helipad", "Tanks from 1975", "Presidential Chambers", "Conference Halls"],
    bestTimeToVisit: "Early morning or just before sunset for the best lighting",
    businessFeatures: { website: "www.dinhdoclap.gov.vn", openingHours: "7:30 AM - 11:30 AM, 1:00 PM - 4:00 PM", amenities: ["Guided Tours", "Exhibits"] }
  },
  {
    id: "5",
    name: "Jade Emperor Pagoda",
    rating: 4.7,
    imageUrl: "https://tourinsaigon.com/wp-content/uploads/jade-emperor-pagoda.jpg",
    description: "Taoist temple built in 1909 by the Chinese community. Famous for its intricate carvings, tortoise pond, and statues of deities.",
    location: { lat: 10.7917, lng: 106.6979 },
    address: "73 Mai Thi Luu Street, Da Kao Ward, District 1, Ho Chi Minh City",
    category: "Religious Site",
    specialFeatures: ["Jade Emperor Statue", "Tortoise Pond", "Intricate Carvings", "Incense Burning"],
    bestTimeToVisit: "During festival celebrations or for evening rituals",
    businessFeatures: { website: "www.ngochoang.com", openingHours: "7:00 AM - 6:00 PM", phone: "+84 28 3829 8549", amenities: ["Prayer Areas", "Turtle Release"], conferenceSpace: true }
  },
  {
    id: "6",
    name: "War Remnants Museum",
    rating: 4.5,
    imageUrl: "https://myfavouriteescapes.com/wp-content/uploads/2025/05/Vietnam-Ho-Chi-Minh-City-War-Remnants-Museum.jpg",
    description: "Museum documenting the Vietnam War and its aftermath, featuring aircraft, tanks, and exhibits on war crimes and Agent Orange effects.",
    location: { lat: 10.7797, lng: 106.6923 },
    address: "28 Vo Van Tan Street, Ward 6, District 3, Ho Chi Minh City",
    category: "Historic Site",
    specialFeatures: ["US Aircraft", "Tanks", "Photographic Exhibits", "Agent Orange Display"],
    bestTimeToVisit: "October to March, preferably during early morning",
    businessFeatures: { openingHours: "7:30 AM - 6:00 PM", amenities: ["Exhibits", "Gift Shop"] }
  },
  {
    id: "7",
    name: "Bitexco Financial Tower",
    rating: 4.4,
    imageUrl: "https://lsvinacns.vn/Upload/project/bitexco-tower-3-s.jpg",
    description: "Modern skyscraper inspired by the lotus flower, featuring offices, shopping, and the Saigon Skydeck observation deck.",
    location: { lat: 10.7717, lng: 106.7044 },
    address: "2 Hai Trieu Street, Ben Nghe Ward, District 1, Ho Chi Minh City",
    category: "Shopping",
    specialFeatures: ["Saigon Skydeck", "Helipad", "Lotus Design", "Retail Floors"],
    bestTimeToVisit: "Weekdays to avoid crowds, especially during sale seasons",
    businessFeatures: { website: "www.bitexcofinancialtower.com", openingHours: "9:00 AM - 10:00 PM", phone: "+84 28 3919 3199", amenities: ["Observation Deck", "Shops", "Restaurants"], isBusinessFriendly: true, wifiAvailable: true, conferenceSpace: true }
  },
  {
    id: "8",
    name: "Ho Chi Minh City Opera House",
    rating: 4.6,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Saigon_Opera_House_2014.jpg",
    description: "French colonial theater built in 1900, hosting ballet, symphony, and cultural performances. A landmark of belle époque architecture.",
    location: { lat: 10.7767, lng: 106.7021 },
    address: "7 Lam Son Square, Ben Nghe Ward, District 1, Ho Chi Minh City",
    category: "Cultural Site",
    specialFeatures: ["Belle Époque Architecture", "Performance Hall", "Symphony Orchestra", "Ballet Shows"],
    bestTimeToVisit: "October to March for the best weather when enjoying performances",
    businessFeatures: { website: "www.hbsovo.org.vn", openingHours: "Varies by show", phone: "+84 28 3823 9419", amenities: ["Theater Shows", "Ticket Office"], isBusinessFriendly: true, wifiAvailable: true, conferenceSpace: true }
  },
  {
    id: "101",
    name: "Hoan Kiem Lake",
    rating: 4.7,
    imageUrl: "https://lilystravelagency.com/wp-content/uploads/2024/09/hoan-kiem-lake1.png",
    description: "Biểu tượng của Hà Nội với Ngọc Sơn Temple nằm giữa hồ. Nơi lý tưởng để đi dạo, chụp ảnh và tham gia các hoạt động văn hóa.",
    location: { lat: 21.0285, lng: 105.8542 },
    address: "Hoan Kiem, Hanoi",
    category: "Scenic Spot",
    specialFeatures: ["Ngoc Son Temple", "The Huc Bridge", "Turtle Tower"],
    bestTimeToVisit: "Sáng sớm hoặc chiều tối để tránh nắng gắt",
    businessFeatures: { wifiAvailable: false, amenities: ["Walking Paths", "Photography Spots"] }
  },
  {
    id: "102",
    name: "Old Quarter",
    rating: 4.6,
    imageUrl: "https://cdn.hoabinhevents.com/hbt/wp-content/uploads/2025/01/22105911/architectural-features-filled-with-nostalgia-are-easily-spotted-in-hanoi.jpg",
    description: "Khu phố cổ nổi tiếng với kiến trúc truyền thống, cửa hàng thủ công và ẩm thực đường phố độc đáo.",
    location: { lat: 21.0333, lng: 105.85 },
    address: "Hoan Kiem District, Hanoi",
    category: "Historic Site",
    specialFeatures: ["Street Food", "Traditional Shops", "Ancient Architecture"],
    bestTimeToVisit: "Chiều tối để trải nghiệm chợ đêm",
    businessFeatures: { openingHours: "8:00 AM - 10:00 PM", amenities: ["Guided Tours", "Souvenir Shops"] }
  },
  {
    id: "103",
    name: "Temple of Literature",
    rating: 4.8,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Hanoi_Temple_of_Literature_%28cropped%29.jpg",
    description: "Ngôi đền cổ kính, nơi tôn vinh Khổng Tử và là trường đại học đầu tiên của Việt Nam.",
    location: { lat: 21.0287, lng: 105.835 },
    address: "58 Quoc Tu Giam, Dong Da, Hanoi",
    category: "Religious Site",
    specialFeatures: ["Ancient Architecture", "Stone Steles of Doctors", "Traditional Gardens"],
    bestTimeToVisit: "Sáng sớm để tránh đông đúc",
    businessFeatures: { openingHours: "8:00 AM - 5:00 PM", amenities: ["Guided Tours", "Photography"] }
  },
  {
    id: "104",
    name: "Ho Chi Minh Mausoleum",
    rating: 4.5,
    imageUrl: "https://statics.vinwonders.com/ho-chi-minh-mausoleum-thumb_1662726979.jpeg",
    description: "Nơi an nghỉ của Chủ tịch Hồ Chí Minh, biểu tượng lịch sử quan trọng của Việt Nam.",
    location: { lat: 21.0333, lng: 105.8508 },
    address: "2 Hung Vuong, Ba Dinh, Hanoi",
    category: "Historic Site",
    specialFeatures: ["Guard Ceremony", "Marble Architecture", "Ba Dinh Square"],
    bestTimeToVisit: "Sáng sớm, tránh cuối tuần nếu đông khách",
    businessFeatures: { openingHours: "8:00 AM - 11:00 AM, 2:00 PM - 5:00 PM", amenities: ["Guided Tours"] }
  },
  {
    id: "105",
    name: "West Lake",
    rating: 4.6,
    imageUrl: "https://app-api.glodival.vn/storage/4/images/west-lake-1749539315JFpzz.jpg",
    description: "Hồ lớn nhất Hà Nội, nổi tiếng với quán cà phê, nhà hàng ven hồ và phong cảnh yên bình.",
    location: { lat: 21.057, lng: 105.832 },
    address: "Tay Ho District, Hanoi",
    category: "Scenic Spot",
    specialFeatures: ["Sunset Views", "Cycling Path", "Ngoc Son Temple Nearby"],
    bestTimeToVisit: "Hoàng hôn hoặc sáng sớm",
    businessFeatures: { amenities: ["Restaurants", "Cafes", "Boat Rentals"], wifiAvailable: true, isBusinessFriendly: true }
  }
];

export const getPopularDestinations = async (): Promise<string[]> => {
  return [
    "Ho Chi Minh City",
    "Hanoi",
    "Da Nang",
    "Hoi An",
    "Hue",
    "Nha Trang",
    "Phu Quoc",
    "Sapa",
    "Ha Long Bay",
    "Ninh Binh"
  ];
};

export const searchPlaces = async (query: string): Promise<TouristPlace[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  try {
    if (query.toLowerCase().includes('ho chi minh city') || query.toLowerCase().includes('saigon') || query.toLowerCase().includes('hanoi')) {
      return mockPlaces;
    }
    return [];
  } catch (error) {
    console.error("Error searching places:", error);
    toast.error("Failed to search places. Please try again.");
    return [];
  }
};

export const getBusinessFriendlyPlaces = async (): Promise<TouristPlace[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  try {
    return mockPlaces.filter(place => place.businessFeatures?.isBusinessFriendly);
  } catch (error) {
    console.error("Error getting business places:", error);
    toast.error("Failed to get business places");
    return [];
  }
};

export const filterPlacesByCategory = async (category: string): Promise<TouristPlace[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  try {
    return mockPlaces.filter(place => place.category === category);
  } catch (error) {
    console.error("Error filtering places:", error);
    toast.error("Failed to filter places");
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<TouristPlace | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  try {
    const place = mockPlaces.find(p => p.id === placeId);
    return place || null;
  } catch (error) {
    console.error("Error getting place details:", error);
    toast.error("Failed to get place details");
    return null;
  }
};
