const categories = [
  {
    id: "products",
    name: "Thu\u1ED1c",
    icon: "\u{1F48A}",
    count: 2547,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "functional-foods",
    name: "Th\u1EF1c ph\u1EA9m ch\u1EE9c n\u0103ng",
    icon: "\u{1F33F}",
    count: 1823,
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "cosmetics",
    name: "Ch\u0103m s\xF3c s\u1EAFc \u0111\u1EB9p",
    icon: "\u2728",
    count: 1205,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "personal-care",
    name: "Ch\u0103m s\xF3c c\xE1 nh\xE2n",
    icon: "\u{1F9F4}",
    count: 965,
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "medical-devices",
    name: "Thi\u1EBFt b\u1ECB y t\u1EBF",
    icon: "\u{1FA7A}",
    count: 643,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: "mother-baby",
    name: "M\u1EB9 & B\xE9",
    icon: "\u{1F476}",
    count: 812,
    image:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=200&fit=crop&auto=format",
  },
];
const supplementImg =
  "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop&auto=format";
const pillsImg =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&auto=format";
const vitaminImg =
  "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop&auto=format";
const healthImg =
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format";
const skincareImg =
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format";
const babyImg =
  "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop&auto=format";
const deviceImg =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&auto=format";
const omega3Img =
  "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop&auto=format";
const products = [
  {
    id: 1,
    name: "Vitamin C 1000mg Blackmores",
    brand: "Blackmores",
    category: "functional-foods",
    price: 189e3,
    originalPrice: 259e3,
    discount: 27,
    rating: 4.8,
    reviewCount: 1243,
    sold: 5621,
    stock: 120,
    image: vitaminImg,
    images: [vitaminImg, supplementImg, pillsImg],
    description:
      "Vitamin C 1000mg h\u1ED7 tr\u1EE3 t\u0103ng c\u01B0\u1EDDng h\u1EC7 mi\u1EC5n d\u1ECBch, ch\u1ED1ng oxy h\xF3a v\xE0 b\u1EA3o v\u1EC7 s\u1EE9c kh\u1ECFe t\u1ED5ng th\u1EC3. S\u1EA3n ph\u1EA9m t\u1EEB th\u01B0\u01A1ng hi\u1EC7u Blackmores n\u1ED5i ti\u1EBFng c\u1EE7a \xDAc.",
    ingredients:
      "Acid ascorbic (Vitamin C) 1000mg, Cellulose, Silica dioxide, Magnesium stearate.",
    usage:
      "Ng\u01B0\u1EDDi l\u1EDBn: 1 vi\xEAn/ng\xE0y sau b\u1EEFa \u0103n ho\u1EB7c theo ch\u1EC9 d\u1EABn c\u1EE7a b\xE1c s\u0129.",
    tags: ["vitamin c", "mi\u1EC5n d\u1ECBch", "blackmores", "\xFAc"],
    isFlashSale: true,
    isBestSeller: true,
    unit: "H\u1ED9p 60 vi\xEAn",
  },
  {
    id: 2,
    name: "Omega-3 Fish Oil 1000mg",
    brand: "Nature Made",
    category: "functional-foods",
    price: 245e3,
    originalPrice: 32e4,
    discount: 23,
    rating: 4.9,
    reviewCount: 987,
    sold: 3412,
    stock: 85,
    image: omega3Img,
    images: [omega3Img, supplementImg],
    description:
      "D\u1EA7u c\xE1 Omega-3 h\u1ED7 tr\u1EE3 s\u1EE9c kh\u1ECFe tim m\u1EA1ch, n\xE3o b\u1ED9 v\xE0 m\u1EAFt. Chi\u1EBFt xu\u1EA5t t\u1EEB c\xE1 bi\u1EC3n s\xE2u, gi\xE0u DHA v\xE0 EPA.",
    ingredients:
      "D\u1EA7u c\xE1 (c\xE1 tr\xEDch, c\xE1 thu) 1000mg, DHA 120mg, EPA 180mg.",
    usage: "1-2 vi\xEAn/ng\xE0y c\xF9ng b\u1EEFa \u0103n.",
    tags: ["omega-3", "tim m\u1EA1ch", "d\u1EA7u c\xE1", "nature made"],
    isFlashSale: true,
    isBestSeller: true,
    unit: "H\u1ED9p 100 vi\xEAn",
  },
  {
    id: 3,
    name: "Probiotic Lactomin Plus",
    brand: "Lactomin",
    category: "functional-foods",
    price: 215e3,
    originalPrice: 28e4,
    discount: 23,
    rating: 4.7,
    reviewCount: 654,
    sold: 2891,
    stock: 60,
    image: supplementImg,
    images: [supplementImg, pillsImg],
    description:
      "Men vi sinh h\u1ED7 tr\u1EE3 c\xE2n b\u1EB1ng h\u1EC7 vi sinh \u0111\u01B0\u1EDDng ru\u1ED9t, gi\u1EA3m ti\xEAu ch\u1EA3y v\xE0 t\xE1o b\xF3n, t\u0103ng c\u01B0\u1EDDng h\u1EC7 mi\u1EC5n d\u1ECBch.",
    ingredients:
      "Lactobacillus acidophilus 2 t\u1EF7 CFU, Bifidobacterium longum 1 t\u1EF7 CFU.",
    usage:
      "1 g\xF3i/ng\xE0y, pha v\u1EDBi n\u01B0\u1EDBc \u1EA5m ho\u1EB7c s\u1EEFa.",
    tags: ["probiotic", "\u0111\u01B0\u1EDDng ru\u1ED9t", "ti\xEAu h\xF3a"],
    isFlashSale: true,
    unit: "H\u1ED9p 30 g\xF3i",
  },
  {
    id: 4,
    name: "Multivitamin Centrum Adults",
    brand: "Centrum",
    category: "functional-foods",
    price: 299e3,
    originalPrice: 389e3,
    discount: 23,
    rating: 4.6,
    reviewCount: 2341,
    sold: 8923,
    stock: 200,
    image: vitaminImg,
    images: [vitaminImg, supplementImg],
    description:
      "B\u1ED5 sung 23 lo\u1EA1i vitamin v\xE0 kho\xE1ng ch\u1EA5t thi\u1EBFt y\u1EBFu cho c\u01A1 th\u1EC3 m\u1ED7i ng\xE0y. Ph\xF9 h\u1EE3p cho ng\u01B0\u1EDDi tr\u01B0\u1EDFng th\xE0nh b\u1EADn r\u1ED9n.",
    ingredients:
      "Vitamin A, B1, B2, B3, B5, B6, B12, C, D3, E, K, Folate, Biotin, Calcium, Iron, Zinc...",
    usage: "1 vi\xEAn/ng\xE0y sau b\u1EEFa s\xE1ng.",
    tags: ["multivitamin", "centrum", "vitamin t\u1ED5ng h\u1EE3p"],
    isFlashSale: true,
    isBestSeller: true,
    unit: "H\u1ED9p 100 vi\xEAn",
  },
  {
    id: 5,
    name: "Glucosamine 1500mg Orihiro",
    brand: "Orihiro",
    category: "functional-foods",
    price: 345e3,
    originalPrice: 42e4,
    discount: 18,
    rating: 4.9,
    reviewCount: 1876,
    sold: 4567,
    stock: 75,
    image: pillsImg,
    images: [pillsImg, supplementImg],
    description:
      "H\u1ED7 tr\u1EE3 b\u1EA3o v\u1EC7 v\xE0 t\xE1i t\u1EA1o s\u1EE5n kh\u1EDBp, gi\u1EA3m \u0111au nh\u1EE9c x\u01B0\u01A1ng kh\u1EDBp. Ph\xF9 h\u1EE3p cho ng\u01B0\u1EDDi tr\xEAn 40 tu\u1ED5i.",
    ingredients: "Glucosamine HCl 1500mg, Chondroitin 400mg, Collagen 100mg.",
    usage:
      "3 vi\xEAn/ng\xE0y chia 3 l\u1EA7n, u\u1ED1ng c\xF9ng b\u1EEFa \u0103n.",
    tags: [
      "glucosamine",
      "x\u01B0\u01A1ng kh\u1EDBp",
      "orihiro",
      "nh\u1EADt b\u1EA3n",
    ],
    isBestSeller: true,
    unit: "H\u1ED9p 180 vi\xEAn",
  },
  {
    id: 6,
    name: "Collagen Shiseido EX Plus",
    brand: "Shiseido",
    category: "functional-foods",
    price: 89e4,
    originalPrice: 11e5,
    discount: 19,
    rating: 4.8,
    reviewCount: 3241,
    sold: 12034,
    stock: 45,
    image: healthImg,
    images: [healthImg, skincareImg],
    description:
      "Collagen d\u1EA1ng vi\xEAn u\u1ED1ng t\u1EEB Nh\u1EADt B\u1EA3n, gi\xFAp l\xE0n da s\u0103n ch\u1EAFc, \u0111\xE0n h\u1ED3i v\xE0 ch\u1ED1ng l\xE3o h\xF3a hi\u1EC7u qu\u1EA3.",
    ingredients:
      "Collagen peptide 10000mg, Vitamin C 200mg, Hyaluronic acid 20mg, Ceramide.",
    usage: "6 vi\xEAn/ng\xE0y, c\xF3 th\u1EC3 chia l\xE0m 2-3 l\u1EA7n.",
    tags: [
      "collagen",
      "da",
      "shiseido",
      "nh\u1EADt b\u1EA3n",
      "ch\u1ED1ng l\xE3o h\xF3a",
    ],
    isBestSeller: true,
    isFeatured: true,
    unit: "H\u1ED9p 120 vi\xEAn",
  },
  {
    id: 7,
    name: "Magnesium 500mg NOW Foods",
    brand: "NOW Foods",
    category: "functional-foods",
    price: 178e3,
    originalPrice: 23e4,
    discount: 23,
    rating: 4.7,
    reviewCount: 432,
    sold: 1823,
    stock: 95,
    image: supplementImg,
    images: [supplementImg, pillsImg],
    description:
      "B\u1ED5 sung Magie thi\u1EBFt y\u1EBFu h\u1ED7 tr\u1EE3 ch\u1EE9c n\u0103ng c\u01A1 v\xE0 th\u1EA7n kinh, gi\xFAp ng\u1EE7 ngon, gi\u1EA3m c\u0103ng th\u1EB3ng.",
    ingredients: "Magnesium oxide 500mg.",
    usage: "1 vi\xEAn/ng\xE0y tr\u01B0\u1EDBc khi ng\u1EE7.",
    tags: ["magie", "ng\u1EE7 ngon", "c\u0103ng th\u1EB3ng", "now foods"],
    unit: "H\u1ED9p 100 vi\xEAn",
  },
  {
    id: 8,
    name: "B-Complex Vitamin Solgar",
    brand: "Solgar",
    category: "functional-foods",
    price: 234e3,
    originalPrice: 29e4,
    discount: 19,
    rating: 4.6,
    reviewCount: 765,
    sold: 2341,
    stock: 110,
    image: vitaminImg,
    images: [vitaminImg, pillsImg],
    description:
      "Vitamin nh\xF3m B t\u1ED5ng h\u1EE3p h\u1ED7 tr\u1EE3 chuy\u1EC3n h\xF3a n\u0103ng l\u01B0\u1EE3ng, t\u0103ng c\u01B0\u1EDDng s\u1EE9c kh\u1ECFe th\u1EA7n kinh v\xE0 gi\u1EA3m m\u1EC7t m\u1ECFi.",
    ingredients:
      "Vitamin B1 25mg, B2 25mg, B3 25mg, B5 25mg, B6 25mg, B7 25mcg, B9 400mcg, B12 25mcg.",
    usage: "1 vi\xEAn/ng\xE0y sau b\u1EEFa \u0103n.",
    tags: ["vitamin b", "n\u0103ng l\u01B0\u1EE3ng", "solgar"],
    isBestSeller: true,
    unit: "H\u1ED9p 100 vi\xEAn",
  },
  {
    id: 9,
    name: "Kem ch\u1ED1ng n\u1EAFng Anessa SPF50+",
    brand: "Anessa",
    category: "cosmetics",
    price: 395e3,
    originalPrice: 49e4,
    discount: 19,
    rating: 4.9,
    reviewCount: 5432,
    sold: 18923,
    stock: 150,
    image: skincareImg,
    images: [skincareImg, healthImg],
    description:
      "Kem ch\u1ED1ng n\u1EAFng Perfect UV Sunscreen SPF50+/PA++++ b\u1EA3o v\u1EC7 da kh\u1ECFi tia UV, ch\u1ED1ng th\u1EA5m n\u01B0\u1EDBc v\xE0 m\u1ED3 h\xF4i.",
    ingredients:
      "SPF50+, PA++++, Titanium dioxide, Zinc oxide, Water-resistant technology.",
    usage:
      "Thoa \u0111\u1EC1u l\xEAn da m\u1EB7t v\xE0 c\u1ED5 tr\u01B0\u1EDBc khi ra n\u1EAFng 15-20 ph\xFAt. Thoa l\u1EA1i sau m\u1ED7i 2-3 ti\u1EBFng.",
    tags: ["ch\u1ED1ng n\u1EAFng", "anessa", "nh\u1EADt b\u1EA3n", "spf50"],
    isFeatured: true,
    isBestSeller: true,
    unit: "Tu\xFDp 60ml",
  },
  {
    id: 10,
    name: "M\xE1y \u0111o huy\u1EBFt \xE1p Omron HEM-7156",
    brand: "Omron",
    category: "medical-devices",
    price: 125e4,
    originalPrice: 155e4,
    discount: 19,
    rating: 4.8,
    reviewCount: 2341,
    sold: 7823,
    stock: 30,
    image: deviceImg,
    images: [deviceImg],
    description:
      "M\xE1y \u0111o huy\u1EBFt \xE1p b\u1EAFp tay t\u1EF1 \u0111\u1ED9ng v\u1EDBi c\xF4ng ngh\u1EC7 IntelliSense ch\xEDnh x\xE1c, ph\xE1t hi\u1EC7n rung tim v\xE0 nh\u1ECBp tim kh\xF4ng \u0111\u1EC1u.",
    ingredients: "N/A",
    usage:
      "\u0110o huy\u1EBFt \xE1p b\u1EAFp tay tr\xE1i khi ngh\u1EC9 ng\u01A1i, ng\u1ED3i th\u1EB3ng l\u01B0ng. \u0110\u1ECDc k\u1EBFt qu\u1EA3 sau 30 gi\xE2y.",
    tags: [
      "huy\u1EBFt \xE1p",
      "omron",
      "thi\u1EBFt b\u1ECB y t\u1EBF",
      "tim m\u1EA1ch",
    ],
    isFeatured: true,
    unit: "M\xE1y",
  },
  {
    id: 11,
    name: "S\u1EEFa Similac Newborn 0-6 th\xE1ng",
    brand: "Similac",
    category: "mother-baby",
    price: 435e3,
    originalPrice: 51e4,
    discount: 15,
    rating: 4.7,
    reviewCount: 1567,
    sold: 4321,
    stock: 80,
    image: babyImg,
    images: [babyImg],
    description:
      "S\u1EEFa c\xF4ng th\u1EE9c cao c\u1EA5p cho tr\u1EBB t\u1EEB 0-6 th\xE1ng, b\u1ED5 sung DHA, ARA, Prebiotics h\u1ED7 tr\u1EE3 ph\xE1t tri\u1EC3n n\xE3o b\u1ED9 v\xE0 h\u1EC7 mi\u1EC5n d\u1ECBch.",
    ingredients:
      "Lactose, D\u1EA7u th\u1EF1c v\u1EADt, Whey protein, DHA, ARA, Prebiotics GOS.",
    usage:
      "Pha theo h\u01B0\u1EDBng d\u1EABn tr\xEAn h\u1ED9p, kh\xF4ng \u0111un s\xF4i s\u1EEFa \u0111\xE3 pha.",
    tags: [
      "s\u1EEFa b\u1ED9t",
      "tr\u1EBB s\u01A1 sinh",
      "similac",
      "m\u1EB9 v\xE0 b\xE9",
    ],
    unit: "H\u1ED9p 900g",
  },
  {
    id: 12,
    name: "Paracetamol 500mg Hapacol",
    brand: "DHG Pharma",
    category: "products",
    price: 45e3,
    rating: 4.5,
    reviewCount: 8923,
    sold: 45231,
    stock: 500,
    image: pillsImg,
    images: [pillsImg],
    description:
      "Thu\u1ED1c gi\u1EA3m \u0111au, h\u1EA1 s\u1ED1t Hapacol 500mg. Gi\u1EA3m c\xE1c tri\u1EC7u ch\u1EE9ng \u0111au \u0111\u1EA7u, \u0111au r\u0103ng, \u0111au c\u01A1, s\u1ED1t.",
    ingredients: "Paracetamol 500mg.",
    usage:
      "Ng\u01B0\u1EDDi l\u1EDBn: 1-2 vi\xEAn/l\u1EA7n, t\u1ED1i \u0111a 4 l\u1EA7n/ng\xE0y, c\xE1ch nhau \xEDt nh\u1EA5t 4-6 ti\u1EBFng.",
    tags: ["paracetamol", "gi\u1EA3m \u0111au", "h\u1EA1 s\u1ED1t", "hapacol"],
    isBestSeller: true,
    unit: "H\u1ED9p 100 vi\xEAn",
  },
  {
    id: 13,
    name: "N\u01B0\u1EDBc s\xFAc mi\u1EC7ng Listerine Cool Mint",
    brand: "Listerine",
    category: "personal-care",
    price: 89e3,
    originalPrice: 115e3,
    discount: 23,
    rating: 4.6,
    reviewCount: 4231,
    sold: 23456,
    stock: 300,
    image: healthImg,
    images: [healthImg],
    description:
      "N\u01B0\u1EDBc s\xFAc mi\u1EC7ng kh\xE1ng khu\u1EA9n Listerine gi\xFAp di\u1EC7t khu\u1EA9n 99.9%, ng\u0103n ng\u1EEBa s\xE2u r\u0103ng, m\u1EA3ng b\xE1m v\xE0 h\u01A1i th\u1EDF kh\xF4ng t\u1ED1t.",
    ingredients:
      "Eucalyptol 0.092%, Menthol 0.042%, Methyl salicylate 0.06%, Thymol 0.064%.",
    usage:
      "S\xFAc mi\u1EC7ng 20ml trong 30 gi\xE2y, 2 l\u1EA7n/ng\xE0y sau khi \u0111\xE1nh r\u0103ng.",
    tags: [
      "n\u01B0\u1EDBc s\xFAc mi\u1EC7ng",
      "listerine",
      "ch\u0103m s\xF3c r\u0103ng mi\u1EC7ng",
    ],
    unit: "Chai 500ml",
  },
  {
    id: 14,
    name: "Vitamin D3 2000IU Now Foods",
    brand: "NOW Foods",
    category: "functional-foods",
    price: 156e3,
    originalPrice: 195e3,
    discount: 20,
    rating: 4.8,
    reviewCount: 876,
    sold: 3421,
    stock: 130,
    image: supplementImg,
    images: [supplementImg],
    description:
      "Vitamin D3 h\u1ED7 tr\u1EE3 h\u1EA5p th\u1EE5 Canxi, t\u0103ng c\u01B0\u1EDDng h\u1EC7 x\u01B0\u01A1ng kh\u1EDBp v\xE0 h\u1EC7 mi\u1EC5n d\u1ECBch, ph\xF2ng ch\u1ED1ng lo\xE3ng x\u01B0\u01A1ng.",
    ingredients: "Vitamin D3 (cholecalciferol) 2000IU.",
    usage:
      "1 vi\xEAn/ng\xE0y sau b\u1EEFa \u0103n ho\u1EB7c theo ch\u1EC9 d\u1EABn c\u1EE7a b\xE1c s\u0129.",
    tags: ["vitamin d3", "x\u01B0\u01A1ng", "mi\u1EC5n d\u1ECBch", "now foods"],
    isFlashSale: true,
    unit: "H\u1ED9p 240 vi\xEAn",
  },
  {
    id: 15,
    name: "Canxi Nano Kirkland",
    brand: "Kirkland",
    category: "functional-foods",
    price: 289e3,
    originalPrice: 36e4,
    discount: 20,
    rating: 4.7,
    reviewCount: 1234,
    sold: 5671,
    stock: 90,
    image: pillsImg,
    images: [pillsImg, supplementImg],
    description:
      "Canxi Nano d\u1EC5 h\u1EA5p th\u1EE5 k\u1EBFt h\u1EE3p Vitamin D3 v\xE0 K2 gi\xFAp x\u01B0\u01A1ng ch\u1EAFc kh\u1ECFe, ph\xF2ng ng\u1EEBa lo\xE3ng x\u01B0\u01A1ng.",
    ingredients: "Calcium carbonate 600mg, Vitamin D3 800IU, Vitamin K2 50mcg.",
    usage:
      "2 vi\xEAn/ng\xE0y chia 2 l\u1EA7n, u\u1ED1ng c\xF9ng b\u1EEFa \u0103n.",
    tags: ["canxi", "x\u01B0\u01A1ng", "kirkland", "lo\xE3ng x\u01B0\u01A1ng"],
    unit: "H\u1ED9p 500 vi\xEAn",
  },
  {
    id: 16,
    name: "Serum Vitamin C Obagi",
    brand: "Obagi",
    category: "cosmetics",
    price: 125e4,
    originalPrice: 158e4,
    discount: 21,
    rating: 4.9,
    reviewCount: 2145,
    sold: 8234,
    stock: 40,
    image: skincareImg,
    images: [skincareImg, healthImg],
    description:
      "Serum Vitamin C Professional-C 20% gi\xFAp l\xE0m s\xE1ng da, m\u1EDD th\xE2m s\u1EA1m, ch\u1ED1ng oxy h\xF3a v\xE0 t\u0103ng c\u01B0\u1EDDng collagen.",
    ingredients:
      "L-Ascorbic Acid 20%, Niacinamide, Ferulic Acid, Hyaluronic Acid.",
    usage:
      "Thoa 4-5 gi\u1ECDt l\xEAn m\u1EB7t \u0111\xE3 l\xE0m s\u1EA1ch v\xE0o bu\u1ED5i s\xE1ng tr\u01B0\u1EDBc khi d\xF9ng kem ch\u1ED1ng n\u1EAFng.",
    tags: ["serum", "vitamin c", "obagi", "l\xE0m s\xE1ng da"],
    isFeatured: true,
    unit: "L\u1ECD 30ml",
  },
  {
    id: 17,
    name: "M\xE1y \u0111o \u0111\u01B0\u1EDDng huy\u1EBFt Accu-Chek",
    brand: "Accu-Chek",
    category: "medical-devices",
    price: 89e4,
    originalPrice: 11e5,
    discount: 19,
    rating: 4.8,
    reviewCount: 1543,
    sold: 5234,
    stock: 25,
    image: deviceImg,
    images: [deviceImg],
    description:
      "M\xE1y \u0111o \u0111\u01B0\u1EDDng huy\u1EBFt c\xE1 nh\xE2n Accu-Chek Instant cho k\u1EBFt qu\u1EA3 ch\xEDnh x\xE1c trong 4 gi\xE2y, nh\u1EDB 720 l\u1EA7n \u0111o.",
    ingredients: "N/A",
    usage:
      "\u0110o b\u1EB1ng m\xE1u mao qu\u1EA3n \u0111\u1EA7u ng\xF3n tay. \u0110\u1ECDc k\u1EBFt qu\u1EA3 sau 4 gi\xE2y.",
    tags: [
      "\u0111\u01B0\u1EDDng huy\u1EBFt",
      "ti\u1EC3u \u0111\u01B0\u1EDDng",
      "accu-chek",
      "thi\u1EBFt b\u1ECB y t\u1EBF",
    ],
    unit: "B\u1ED9",
  },
  {
    id: 18,
    name: "T\xE3 d\xE1n Pampers Newborn NB",
    brand: "Pampers",
    category: "mother-baby",
    price: 165e3,
    originalPrice: 195e3,
    discount: 15,
    rating: 4.8,
    reviewCount: 5678,
    sold: 34521,
    stock: 200,
    image: babyImg,
    images: [babyImg],
    description:
      "T\xE3 d\xE1n Pampers Swaddlers si\xEAu m\u1EC1m m\u1EA1i, si\xEAu th\u1EA5m, v\u1EDBi ch\u1EC9 b\xE1o \u1EA9m \u01B0\u1EDBt gi\xFAp m\u1EB9 bi\u1EBFt khi n\xE0o c\u1EA7n thay t\xE3.",
    ingredients: "N/A",
    usage:
      "Thay t\xE3 khi \u01B0\u1EDBt ho\u1EB7c b\u1EA9n. Ki\u1EC3m tra \u0111\u01B0\u1EDDng ch\u1EC9 b\xE1o xanh \u0111\xE3 \u0111\u1ED5i v\xE0ng.",
    tags: [
      "t\xE3 d\xE1n",
      "pampers",
      "tr\u1EBB s\u01A1 sinh",
      "m\u1EB9 v\xE0 b\xE9",
    ],
    isFlashSale: true,
    unit: "G\xF3i 54 mi\u1EBFng",
  },
  {
    id: 19,
    name: "Kem d\u01B0\u1EE1ng \u1EA9m CeraVe Moisturizing",
    brand: "CeraVe",
    category: "cosmetics",
    price: 325e3,
    originalPrice: 395e3,
    discount: 18,
    rating: 4.8,
    reviewCount: 7823,
    sold: 25634,
    stock: 180,
    image: skincareImg,
    images: [skincareImg],
    description:
      "Kem d\u01B0\u1EE1ng \u1EA9m CeraVe v\u1EDBi ceramides v\xE0 hyaluronic acid gi\xFAp ph\u1EE5c h\u1ED3i h\xE0ng r\xE0o b\u1EA3o v\u1EC7 da, d\u01B0\u1EE1ng \u1EA9m 24 gi\u1EDD.",
    ingredients:
      "Ceramide NP, AP, EOP, Cholesterol, Hyaluronic Acid, Niacinamide.",
    usage:
      "Thoa \u0111\u1EC1u l\xEAn da m\u1EB7t v\xE0 c\u01A1 th\u1EC3 sau khi l\xE0m s\u1EA1ch. D\xF9ng ng\xE0y 2 l\u1EA7n s\xE1ng v\xE0 t\u1ED1i.",
    tags: [
      "d\u01B0\u1EE1ng \u1EA9m",
      "cerave",
      "ceramide",
      "da nh\u1EA1y c\u1EA3m",
    ],
    isFeatured: true,
    unit: "H\u0169 250ml",
  },
  {
    id: 20,
    name: "Zinc 30mg Solgar",
    brand: "Solgar",
    category: "functional-foods",
    price: 145e3,
    originalPrice: 185e3,
    discount: 22,
    rating: 4.7,
    reviewCount: 543,
    sold: 2134,
    stock: 100,
    image: supplementImg,
    images: [supplementImg],
    description:
      "K\u1EBDm Picolinate d\u1EC5 h\u1EA5p th\u1EE5 h\u1ED7 tr\u1EE3 h\u1EC7 mi\u1EC5n d\u1ECBch, l\xE0n da kh\u1ECFe m\u1EA1nh, v\u1ECB gi\xE1c v\xE0 kh\u1EE9u gi\xE1c.",
    ingredients: "Zinc picolinate 30mg.",
    usage: "1 vi\xEAn/ng\xE0y sau b\u1EEFa \u0103n.",
    tags: ["k\u1EBDm", "zinc", "mi\u1EC5n d\u1ECBch", "da", "solgar"],
    unit: "H\u1ED9p 100 vi\xEAn",
  },
];
const blogPosts = [
  {
    id: 1,
    slug: "vitamin-c-cho-he-mien-dich",
    title:
      "Vitamin C v\xE0 vai tr\xF2 quan tr\u1ECDng trong t\u0103ng c\u01B0\u1EDDng h\u1EC7 mi\u1EC5n d\u1ECBch",
    excerpt:
      "Vitamin C l\xE0 m\u1ED9t trong nh\u1EEFng vitamin quan tr\u1ECDng nh\u1EA5t \u0111\u1ED1i v\u1EDBi s\u1EE9c kh\u1ECFe con ng\u01B0\u1EDDi. T\xECm hi\u1EC3u c\xE1ch b\u1ED5 sung Vitamin C \u0111\xFAng c\xE1ch \u0111\u1EC3 t\u0103ng c\u01B0\u1EDDng s\u1EE9c \u0111\u1EC1 kh\xE1ng.",
    content: `
# Vitamin C v\xE0 h\u1EC7 mi\u1EC5n d\u1ECBch

Vitamin C (axit ascorbic) l\xE0 m\u1ED9t vitamin thi\u1EBFt y\u1EBFu m\xE0 c\u01A1 th\u1EC3 ng\u01B0\u1EDDi kh\xF4ng t\u1EF1 t\u1ED5ng h\u1EE3p \u0111\u01B0\u1EE3c. Ch\xFAng ta c\u1EA7n b\u1ED5 sung t\u1EEB th\u1EF1c ph\u1EA9m ho\u1EB7c th\u1EF1c ph\u1EA9m b\u1ED5 sung h\xE0ng ng\xE0y.

## L\u1EE3i \xEDch c\u1EE7a Vitamin C

Vitamin C \u0111\xF3ng vai tr\xF2 quan tr\u1ECDng trong nhi\u1EC1u ch\u1EE9c n\u0103ng c\u1EE7a c\u01A1 th\u1EC3:

- **T\u0103ng c\u01B0\u1EDDng h\u1EC7 mi\u1EC5n d\u1ECBch**: K\xEDch th\xEDch s\u1EA3n xu\u1EA5t v\xE0 ho\u1EA1t \u0111\u1ED9ng c\u1EE7a b\u1EA1ch c\u1EA7u
- **Ch\u1ED1ng oxy h\xF3a**: B\u1EA3o v\u1EC7 t\u1EBF b\xE0o kh\u1ECFi t\u1ED5n th\u01B0\u01A1ng do g\u1ED1c t\u1EF1 do
- **T\u1ED5ng h\u1EE3p collagen**: C\u1EA7n thi\u1EBFt cho da, x\u01B0\u01A1ng v\xE0 m\xF4 li\xEAn k\u1EBFt
- **H\u1EA5p th\u1EE5 s\u1EAFt**: T\u0103ng c\u01B0\u1EDDng h\u1EA5p th\u1EE5 s\u1EAFt t\u1EEB th\u1EF1c ph\u1EA9m

## Li\u1EC1u l\u01B0\u1EE3ng khuy\u1EBFn ngh\u1ECB

Ng\u01B0\u1EDDi tr\u01B0\u1EDFng th\xE0nh: 75-90mg/ng\xE0y
Ph\u1EE5 n\u1EEF c\xF3 thai: 85-120mg/ng\xE0y
Ng\u01B0\u1EDDi h\xFAt thu\u1ED1c: c\u1EA7n th\xEAm 35mg/ng\xE0y

## Ngu\u1ED3n th\u1EF1c ph\u1EA9m gi\xE0u Vitamin C

- Cam, b\u01B0\u1EDFi, chanh
- \u1ED4i, kiwi, d\xE2u t\xE2y
- \u1EDAt chu\xF4ng, b\xF4ng c\u1EA3i xanh
- C\xE0 chua, khoai t\xE2y
    `,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&auto=format",
    author: "DS. Nguy\u1EC5n Th\u1ECB Mai",
    authorAvatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format",
    date: "2026-06-10",
    readTime: 5,
    category: "S\u1EE9c kh\u1ECFe",
    tags: ["vitamin c", "mi\u1EC5n d\u1ECBch", "dinh d\u01B0\u1EE1ng"],
  },
  {
    id: 2,
    slug: "omega-3-loi-ich-suc-khoe",
    title:
      "Omega-3: Nh\u1EEFng l\u1EE3i \xEDch s\u1EE9c kh\u1ECFe kh\xF4ng th\u1EC3 b\u1ECF qua",
    excerpt:
      'Axit b\xE9o Omega-3 \u0111\u01B0\u1EE3c coi l\xE0 "ch\u1EA5t b\xE9o l\xE0nh m\u1EA1nh" v\u1EDBi v\xF4 s\u1ED1 l\u1EE3i \xEDch cho tim m\u1EA1ch, n\xE3o b\u1ED9 v\xE0 s\u1EE9c kh\u1ECFe t\u1ED5ng th\u1EC3.',
    content: "N\u1ED9i dung chi ti\u1EBFt v\u1EC1 Omega-3...",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop&auto=format",
    author: "ThS. BS. Tr\u1EA7n V\u0103n \u0110\u1EE9c",
    authorAvatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format",
    date: "2026-06-08",
    readTime: 7,
    category: "Dinh d\u01B0\u1EE1ng",
    tags: ["omega-3", "tim m\u1EA1ch", "n\xE3o b\u1ED9"],
  },
  {
    id: 3,
    slug: "cach-bao-quan-thuoc-dung-cach",
    title:
      "C\xE1ch b\u1EA3o qu\u1EA3n thu\u1ED1c \u0111\xFAng c\xE1ch \u0111\u1EC3 \u0111\u1EA3m b\u1EA3o hi\u1EC7u qu\u1EA3 \u0111i\u1EC1u tr\u1ECB",
    excerpt:
      "B\u1EA3o qu\u1EA3n thu\u1ED1c sai c\xE1ch c\xF3 th\u1EC3 l\xE0m gi\u1EA3m hi\u1EC7u qu\u1EA3 \u0111i\u1EC1u tr\u1ECB th\u1EADm ch\xED g\xE2y h\u1EA1i. H\xE3y t\xECm hi\u1EC3u c\xE1c nguy\xEAn t\u1EAFc c\u01A1 b\u1EA3n \u0111\u1EC3 b\u1EA3o qu\u1EA3n thu\u1ED1c an to\xE0n.",
    content:
      "N\u1ED9i dung chi ti\u1EBFt v\u1EC1 b\u1EA3o qu\u1EA3n thu\u1ED1c...",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=500&fit=crop&auto=format",
    author: "DS. L\xEA Th\u1ECB H\u1ED3ng",
    authorAvatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format",
    date: "2026-06-05",
    readTime: 4,
    category: "Thu\u1ED1c",
    tags: [
      "b\u1EA3o qu\u1EA3n thu\u1ED1c",
      "an to\xE0n",
      "d\u01B0\u1EE3c ph\u1EA9m",
    ],
  },
  {
    id: 4,
    slug: "collagen-lam-dep-tu-ben-trong",
    title:
      "Collagen - B\xED quy\u1EBFt l\xE0m \u0111\u1EB9p t\u1EEB b\xEAn trong cho l\xE0n da tr\u1EBB trung",
    excerpt:
      "Collagen chi\u1EBFm 75% c\u1EA5u tr\xFAc da, l\xE0 n\u1EC1n t\u1EA3ng cho l\xE0n da c\u0103ng m\u1ECBn v\xE0 \u0111\xE0n h\u1ED3i. T\xECm hi\u1EC3u c\xE1ch b\u1ED5 sung collagen hi\u1EC7u qu\u1EA3 nh\u1EA5t.",
    content: "N\u1ED9i dung chi ti\u1EBFt v\u1EC1 collagen...",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=500&fit=crop&auto=format",
    author: "BS. CK1 Ph\u1EA1m Th\u1ECB Lan",
    authorAvatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format",
    date: "2026-06-03",
    readTime: 6,
    category: "L\xE0m \u0111\u1EB9p",
    tags: [
      "collagen",
      "l\xE0m \u0111\u1EB9p",
      "da",
      "ch\u1ED1ng l\xE3o h\xF3a",
    ],
  },
  {
    id: 5,
    slug: "tap-the-duc-dung-cach",
    title:
      "T\u1EADp th\u1EC3 d\u1EE5c \u0111\xFAng c\xE1ch: H\u01B0\u1EDBng d\u1EABn cho ng\u01B0\u1EDDi m\u1EDBi b\u1EAFt \u0111\u1EA7u",
    excerpt:
      "Vi\u1EC7c t\u1EADp th\u1EC3 d\u1EE5c \u0111\xFAng k\u1EF9 thu\u1EADt v\xE0 c\xF3 k\u1EBF ho\u1EA1ch s\u1EBD mang l\u1EA1i k\u1EBFt qu\u1EA3 t\u1ED1t nh\u1EA5t \u0111\u1ED3ng th\u1EDDi tr\xE1nh ch\u1EA5n th\u01B0\u01A1ng kh\xF4ng mong mu\u1ED1n.",
    content:
      "N\u1ED9i dung chi ti\u1EBFt v\u1EC1 t\u1EADp th\u1EC3 d\u1EE5c...",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop&auto=format",
    author: "ThS. V\u0169 Minh Tu\u1EA5n",
    authorAvatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format",
    date: "2026-06-01",
    readTime: 8,
    category: "Luy\u1EC7n t\u1EADp",
    tags: ["th\u1EC3 d\u1EE5c", "s\u1EE9c kh\u1ECFe", "luy\u1EC7n t\u1EADp"],
  },
  {
    id: 6,
    slug: "giac-ngu-va-suc-khoe",
    title:
      "Gi\u1EA5c ng\u1EE7 v\xE0 s\u1EE9c kh\u1ECFe: T\u1EA1i sao ng\u1EE7 \u0111\u1EE7 gi\u1EA5c quan tr\u1ECDng h\u01A1n b\u1EA1n ngh\u0129",
    excerpt:
      "Ng\u1EE7 \u0111\u1EE7 gi\u1EA5c kh\xF4ng ch\u1EC9 gi\xFAp b\u1EA1n t\u1EC9nh t\xE1o m\xE0 c\xF2n \u1EA3nh h\u01B0\u1EDFng s\xE2u s\u1EAFc \u0111\u1EBFn h\u1EC7 mi\u1EC5n d\u1ECBch, tim m\u1EA1ch v\xE0 s\u1EE9c kh\u1ECFe t\xE2m th\u1EA7n.",
    content: "N\u1ED9i dung chi ti\u1EBFt v\u1EC1 gi\u1EA5c ng\u1EE7...",
    image:
      "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&h=500&fit=crop&auto=format",
    author: "BS. CK2 Nguy\u1EC5n V\u0103n Kh\xE1nh",
    authorAvatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format",
    date: "2026-05-28",
    readTime: 5,
    category: "S\u1EE9c kh\u1ECFe",
    tags: ["gi\u1EA5c ng\u1EE7", "s\u1EE9c kh\u1ECFe", "ngh\u1EC9 ng\u01A1i"],
  },
];
const promotions = [
  {
    id: 1,
    title: "Si\xEAu Sale H\xE8 2026",
    subtitle: "Gi\u1EA3m \u0111\u1EBFn 50% to\xE0n b\u1ED9 vitamin & TPCN",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&auto=format",
    badge: "HOT",
    badgeColor: "#e53935",
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString(),
    discount: 50,
    category: "functional-foods",
  },
  {
    id: 2,
    title: "Ng\xE0y S\u1EE9c Kh\u1ECFe",
    subtitle:
      "Mua 2 t\u1EB7ng 1 t\u1EA5t c\u1EA3 s\u1EA3n ph\u1EA9m ch\u0103m s\xF3c da",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=400&fit=crop&auto=format",
    badge: "MUA 2 T\u1EB6NG 1",
    badgeColor: "#1250dc",
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
    discount: 33,
    category: "cosmetics",
  },
  {
    id: 3,
    title: "Freeship To\xE0n Qu\u1ED1c",
    subtitle:
      "Mi\u1EC5n ph\xED v\u1EADn chuy\u1EC3n cho \u0111\u01A1n t\u1EEB 150.000\u0111",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop&auto=format",
    badge: "FREESHIP",
    badgeColor: "#43a047",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
    discount: 0,
    category: "",
  },
  {
    id: 4,
    title: "Flash Sale Thi\u1EBFt B\u1ECB Y T\u1EBF",
    subtitle:
      "M\xE1y \u0111o huy\u1EBFt \xE1p, \u0111\u01B0\u1EDDng huy\u1EBFt gi\xE1 s\u1ED1c",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&auto=format",
    badge: "FLASH SALE",
    badgeColor: "#f05a22",
    endDate: new Date(Date.now() + 12 * 60 * 60 * 1e3).toISOString(),
    discount: 30,
    category: "medical-devices",
  },
];
const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );
const getProductsByCategory = (category) =>
  products.filter((p) => p.category === category);
const getFlashSaleProducts = () => products.filter((p) => p.isFlashSale);
const getBestSellers = () => products.filter((p) => p.isBestSeller);
const getFeaturedProducts = () => products.filter((p) => p.isFeatured);
export {
  blogPosts,
  categories,
  formatPrice,
  getBestSellers,
  getFeaturedProducts,
  getFlashSaleProducts,
  getProductsByCategory,
  products,
  promotions,
};
