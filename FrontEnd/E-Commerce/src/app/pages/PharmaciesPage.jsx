import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, MapPin, Phone, Clock, Search, Navigation } from "lucide-react";
const pharmacies = [
  { id: 1, name: "Long Ch\xE2u - C\u1EA7u Gi\u1EA5y", address: "17 Duy T\xE2n, C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i", phone: "024 3795 1234", hours: "07:00 - 22:00", district: "C\u1EA7u Gi\u1EA5y", city: "H\xE0 N\u1ED9i", open: true },
  { id: 2, name: "Long Ch\xE2u - \u0110\u1ED1ng \u0110a", address: "52 Kh\xE2m Thi\xEAn, \u0110\u1ED1ng \u0110a, H\xE0 N\u1ED9i", phone: "024 3852 5678", hours: "07:00 - 22:00", district: "\u0110\u1ED1ng \u0110a", city: "H\xE0 N\u1ED9i", open: true },
  { id: 3, name: "Long Ch\xE2u - Hai B\xE0 Tr\u01B0ng", address: "128 Ph\u1ED1 Hu\u1EBF, Hai B\xE0 Tr\u01B0ng, H\xE0 N\u1ED9i", phone: "024 3945 9012", hours: "07:30 - 21:30", district: "Hai B\xE0 Tr\u01B0ng", city: "H\xE0 N\u1ED9i", open: false },
  { id: 4, name: "Long Ch\xE2u - Qu\u1EADn 1", address: "45 Nguy\u1EC5n Hu\u1EC7, Qu\u1EADn 1, TP.HCM", phone: "028 3824 3456", hours: "07:00 - 22:00", district: "Qu\u1EADn 1", city: "TP.HCM", open: true },
  { id: 5, name: "Long Ch\xE2u - Qu\u1EADn 7", address: "321 Nguy\u1EC5n Th\u1ECB Th\u1EADp, Qu\u1EADn 7, TP.HCM", phone: "028 3773 7890", hours: "07:00 - 22:00", district: "Qu\u1EADn 7", city: "TP.HCM", open: true },
  { id: 6, name: "Long Ch\xE2u - B\xECnh Th\u1EA1nh", address: "88 \u0110inh Ti\xEAn Ho\xE0ng, B\xECnh Th\u1EA1nh, TP.HCM", phone: "028 3841 2345", hours: "07:30 - 21:30", district: "B\xECnh Th\u1EA1nh", city: "TP.HCM", open: true },
  { id: 7, name: "Long Ch\xE2u - H\u1EA3i Ch\xE2u", address: "156 Phan Chu Trinh, H\u1EA3i Ch\xE2u, \u0110\xE0 N\u1EB5ng", phone: "0236 3822 6789", hours: "07:00 - 21:00", district: "H\u1EA3i Ch\xE2u", city: "\u0110\xE0 N\u1EB5ng", open: true },
  { id: 8, name: "Long Ch\xE2u - Ninh Ki\u1EC1u", address: "45 Nguy\u1EC5n Tr\xE3i, Ninh Ki\u1EC1u, C\u1EA7n Th\u01A1", phone: "0292 3811 0123", hours: "07:00 - 21:00", district: "Ninh Ki\u1EC1u", city: "C\u1EA7n Th\u01A1", open: false }
];
const cities = ["T\u1EA5t c\u1EA3", "H\xE0 N\u1ED9i", "TP.HCM", "\u0110\xE0 N\u1EB5ng", "C\u1EA7n Th\u01A1"];
function PharmaciesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("T\u1EA5t c\u1EA3");
  const [selected, setSelected] = useState(null);
  const filtered = pharmacies.filter((p) => {
    const matchCity = city === "T\u1EA5t c\u1EA3" || p.city === city;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });
  return <div className="max-w-7xl mx-auto px-4 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Tìm nhà thuốc</span>
      </nav>

      <div className="text-center mb-8">
        <h1 className="font-bold text-gray-800 mb-2" style={{ fontSize: "1.6rem" }}>Hệ thống nhà thuốc Long Châu</h1>
        <p className="text-gray-500">Hơn 3.200 nhà thuốc trên toàn quốc, phục vụ bạn mọi lúc mọi nơi</p>
      </div>

      {
    /* Stats */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
    { num: "3.200+", label: "Nh\xE0 thu\u1ED1c to\xE0n qu\u1ED1c" },
    { num: "63", label: "T\u1EC9nh th\xE0nh ph\u1EE7 s\xF3ng" },
    { num: "24/7", label: "Gi\u1EDD ho\u1EA1t \u0111\u1ED9ng" },
    { num: "50.000+", label: "S\u1EA3n ph\u1EA9m c\xF3 s\u1EB5n" }
  ].map((s) => <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="font-bold mb-1" style={{ fontSize: "1.5rem", color: "#1250dc" }}>{s.num}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {
    /* List */
  }
        <div className="lg:col-span-2">
          {
    /* Filters */
  }
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Tìm theo tên, địa chỉ..."
    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
  />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {cities.map((c) => <button
    key={c}
    onClick={() => setCity(c)}
    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${city === c ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
    style={city === c ? { backgroundColor: "#1250dc" } : {}}
  >
                  {c}
                </button>)}
            </div>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {filtered.map((pharmacy) => <button
    key={pharmacy.id}
    onClick={() => setSelected(pharmacy.id)}
    className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${selected === pharmacy.id ? "border-blue-400 shadow-md" : "border-gray-100"}`}
  >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-gray-800 text-sm">{pharmacy.name}</div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${pharmacy.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {pharmacy.open ? "\u25CF \u0110ang m\u1EDF" : "\u25CB \u0110\xF3ng c\u1EEDa"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1.5">
                  <MapPin size={12} className="shrink-0 mt-0.5" style={{ color: "#1250dc" }} />
                  {pharmacy.address}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Phone size={11} />
                    {pharmacy.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    {pharmacy.hours}
                  </div>
                </div>
              </button>)}
            {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy nhà thuốc phù hợp</div>}
          </div>
        </div>

        {
    /* Map placeholder */
  }
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full min-h-[500px] relative">
            <img
    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop&auto=format"
    alt="Map"
    className="w-full h-full object-cover opacity-30"
  />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-xs">
                <Navigation size={36} className="mx-auto mb-3" style={{ color: "#1250dc" }} />
                <h3 className="font-bold text-gray-800 mb-2">Bản đồ nhà thuốc</h3>
                <p className="text-sm text-gray-500 mb-4">Tích hợp Google Maps để xem vị trí nhà thuốc gần nhất</p>
                {selected && <div className="bg-blue-50 rounded-xl p-3 text-left">
                    <div className="font-semibold text-sm" style={{ color: "#1250dc" }}>
                      {pharmacies.find((p) => p.id === selected)?.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {pharmacies.find((p) => p.id === selected)?.address}
                    </div>
                  </div>}
                <button className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: "#1250dc" }}>
                  Mở Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  PharmaciesPage as default
};
