export interface RwandaProvince {
  name: string;
  districts: {
    name: string;
    sectors: string[];
  }[];
}

export const RWANDA_LOCATIONS: RwandaProvince[] = [
  {
    name: "Kigali City (Umujyi wa Kigali)",
    districts: [
      {
        name: "Gasabo",
        sectors: [
          "Bumbogo", "Gatsata", "Gikomero", "Gisozi", "Jabana", 
          "Jali", "Kacyiru", "Kimihurura", "Kimironko", "Kinyinya", 
          "Ndera", "Nduba", "Remera", "Rusororo", "Rutunga"
        ],
      },
      {
        name: "Kicukiro",
        sectors: [
          "Gahanga", "Gatenga", "Gikondo", "Kagarama", "Kanombe", 
          "Kicukiro", "Kigarama", "Masaka", "Niboye", "Nyarugunga"
        ],
      },
      {
        name: "Nyarugenge",
        sectors: [
          "Gitega", "Kanyinya", "Kigali", "Kimisagara", "Mageragere", 
          "Muhima", "Nyakabanda", "Nyamirambo", "Nyarugenge", "Rwezamenyo"
        ],
      },
    ],
  },
  {
    name: "Northern Province (Amajyaruguru)",
    districts: [
      {
        name: "Musanze",
        sectors: ["Busogo", "Cyuve", "Gacaca", "Gashaki", "Gataraga", "Kimonyi", "Kinigi", "Muhoza", "Muko", "Musanze", "Nkotsi", "Nyange", "Remera", "Rwaza", "Shingiro"],
      },
      {
        name: "Gicumbi",
        sectors: ["Bukure", "Bwisige", "Byumba", "Cyumba", "Giti", "Kaniga", "Manyagiro", "Miyove", "Kageyo", "Mukarange", "Muko", "Mutete", "Nyamiyaga", "Nyankenke", "Rubaya", "Rukomo", "Rushaki", "Rutare", "Ruvune", "Rwamiko", "Shangasha"],
      },
      {
        name: "Rulindo",
        sectors: ["Base", "Burega", "Bushoki", "Buyoga", "Cyinzuzi", "Cyungo", "Kinihira", "Kisaro", "Masoro", "Mbogo", "Murambi", "Ngoma", "Ntarabana", "Rukozo", "Rusiga", "Shyorongi", "Tumba"],
      },
      {
        name: "Burera",
        sectors: ["Bungwe", "Butaro", "Cyanika", "Cyeru", "Gahunga", "Gatebe", "Gitovu", "Kagogo", "Kinoni", "Kinyababa", "Kivuye", "Nemba", "Rugarama", "Rugendabari", "Ruhunde", "Rusarabuye", "Rwerere"],
      },
      {
        name: "Gakenke",
        sectors: ["Busengo", "Coko", "Cyabingo", "Gakenke", "Gashenyi", "Mugunga", "Janja", "Kamubuga", "Karambo", "Kivuruga", "Mataba", "Minazi", "Muhondo", "Muyongwe", "Muzo", "Nemba", "Ruli", "Rusasa", "Rushashi"],
      },
    ],
  },
  {
    name: "Southern Province (Amajyepfo)",
    districts: [
      {
        name: "Huye",
        sectors: ["Gishamvu", "Karama", "Kigoma", "Kinazi", "Maraba", "Mbazi", "Mukura", "Ngoma", "Ruhashya", "Huye", "Rusatira", "Rwaniro", "Simbi", "Tumba"],
      },
      {
        name: "Muhanga",
        sectors: ["Cyeza", "Kabacuzi", "Kibangu", "Kiyumba", "Muhanga", "Mushishiro", "Nyabinoni", "Nyamabuye", "Nyarusange", "Rongi", "Rugendabari", "Shyogwe"],
      },
      {
        name: "Nyanza",
        sectors: ["Busasamana", "Busoro", "Cyabakamyi", "Kibilizi", "Kigoma", "Mukingo", "Muyira", "Ntyazo", "Nyagisozi", "Rwabicuma"],
      },
      {
        name: "Ruhango",
        sectors: ["Bweramana", "Byimana", "Kabagali", "Kinazi", "Kinihira", "Mbuye", "Mwendo", "Ntongwe", "Ruhango"],
      },
    ],
  },
  {
    name: "Eastern Province (Iburasirazuba)",
    districts: [
      {
        name: "Rwamagana",
        sectors: ["Fumbwe", "Gahengeri", "Gishari", "Karenge", "Kigabiro", "Muhazi", "Munyaga", "Munyiginya", "Musha", "Muyumbu", "Mwulire", "Nyakaliro", "Nzige", "Rubona"],
      },
      {
        name: "Bugesera",
        sectors: ["Gashora", "Juru", "Kamabuye", "Ntarama", "Mareba", "Mayange", "Musenyi", "Mwogo", "Ngeruka", "Nyamata", "Nyarugenge", "Rilima", "Ruhuha", "Rweru", "Shyara"],
      },
      {
        name: "Kayonza",
        sectors: ["Gahini", "Kabare", "Kabarondo", "Mukarange", "Murama", "Murundi", "Mwiri", "Ndego", "Nyamirama", "Rukara", "Ruramira", "Rwinkwavu"],
      },
    ],
  },
  {
    name: "Western Province (Iburengerazuba)",
    districts: [
      {
        name: "Rubavu",
        sectors: ["Bugeshi", "Busasamana", "Cyanzarwe", "Gisenyi", "Kanama", "Kanzenze", "Mudende", "Nyakiliba", "Nyamyumba", "Nyundo", "Rubavu", "Rugerero"],
      },
      {
        name: "Rusizi",
        sectors: ["Bugarama", "Butare", "Bweyeye", "Gikundamvura", "Gashonga", "Giheke", "Gihundwe", "Gitambi", "Kamembe", "Muganza", "Mururu", "Nkanka", "Nkombo", "Nkungu", "Nyakabuye", "Nyakarenzo", "Nzahaha", "Rwimbogo"],
      },
      {
        name: "Karongi",
        sectors: ["Bwishyura", "Gishyita", "Gisovu", "Gitesi", "Mubuga", "Murambi", "Murundi", "Mutuntu", "Rubengera", "Rugabano", "Ruganda", "Rwankuba", "Twumba"],
      },
    ],
  },
];

export const ALL_DISTRICTS = RWANDA_LOCATIONS.flatMap((p) => p.districts.map((d) => d.name)).sort();

export const KIGALI_DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge"];

export function getSectorsForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  for (const prov of RWANDA_LOCATIONS) {
    const match = prov.districts.find(
      (d) => d.name.toLowerCase() === districtName.trim().toLowerCase()
    );
    if (match) {
      return [...match.sectors].sort();
    }
  }
  return [];
}

