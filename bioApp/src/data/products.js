export const CATEGORIES = [
  { id: 'proteinas', name: 'Proteínas' },
  { id: 'preentrenos', name: 'Pre-entrenos' },
  { id: 'vitaminas', name: 'Vitaminas' },
  { id: 'aminoacidos', name: 'Aminoácidos' },
  { id: 'creatina', name: 'Creatina' },
];

export const BRANDS = ['ProFuel', 'MaxGain', 'NutriX', 'PowerLab', 'VitalPro'];

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Whey Protein Isolate 1kg',
    brand: 'ProFuel',
    price: 39.99,
    category: 'proteinas',
    rating: 4.6,
    description:
      'Proteína aislada de suero con alta pureza y rápida absorción. Ideal para recuperación post-entreno.',
    featured: true,
    image: 'https://gnc.com.mx/media/catalog/product/1/0/107206001-a.jpg',
    video: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: 'p2',
    name: 'Creatina Monohidratada 300g',
    brand: 'MaxGain',
    price: 19.99,
    category: 'creatina',
    rating: 4.8,
    description:
      'Creatina monohidratada micronizada para mejorar fuerza y rendimiento en entrenamientos intensos.',
    featured: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX2gB_zhjWnWr4BTThHAz4m0wrLK2l7YoqNw&s',
  },
  {
    id: 'p3',
    name: 'Pre-entreno Nitro Boost 400g',
    brand: 'PowerLab',
    price: 29.99,
    category: 'preentrenos',
    rating: 4.2,
    description:
      'Fórmula pre-entreno con cafeína, beta-alanina y citrulina para energía explosiva.',
    featured: true,
    image: 'https://i5.walmartimages.com/asr/2cab2a03-7760-4acb-834f-e31b17959e2e.70175405b328d0b8a54c5cc35121bf61.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF',
  },
  {
    id: 'p4',
    name: 'Multivitamínico Diario 60 caps',
    brand: 'VitalPro',
    price: 14.99,
    category: 'vitaminas',
    rating: 4.0,
    description:
      'Complejo multivitamínico para soporte general de salud y bienestar.',
    featured: false,
    image: 'https://m.media-amazon.com/images/I/517zvz+9s8L._AC_UF1000,1000_QL80_.jpg',
  },
  {
    id: 'p5',
    name: 'BCAA 2:1:1 300g',
    brand: 'NutriX',
    price: 24.99,
    category: 'aminoacidos',
    rating: 4.3,
    description:
      'Aminoácidos de cadena ramificada para reducir fatiga y mejorar la recuperación.',
    featured: false,
    image: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02037/l/37.jpg',
  },
  {
    id: 'p6',
    name: 'Caseína Micelar 1kg',
    brand: 'ProFuel',
    price: 44.99,
    category: 'proteinas',
    rating: 4.5,
    description:
      'Proteína de liberación lenta ideal para tomar antes de dormir.',
    featured: false,
    image: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nrb/nrb24980/y/8.jpg',
  },
];