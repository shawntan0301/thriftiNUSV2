// create a bunch of categories for the NavItem
export const PRODUCT_CATEGORIES = [
    {
      label: 'Electronics',
      value: 'electronics' as const,
      href: '/products?category=electronics',
      featured: [
        {
          name: 'Computers & Mobile Phones',
          href: '/products?category=electronics&subcategory=computers-mobile',
        },
        {
          name: 'Keyboards & Mouses',
          href: '/products?category=electronics&subcategory=keyboards-mouses',
        },
        {
          name: 'TV & Home Appliances',
          href: '/products?category=electronics&subcategory=tv-home-appliances',
        },
        {
          name: 'Audio & Photography',
          href: '/products?category=electronics&subcategory=audio-photography',
        },
        {
          name: 'Lights & Chargers',
          href: '/products?category=electronics&subcategory=lights-chargers',
        },
        {
          name: 'Video Games & Other Tech',
          href: '/products?category=electronics&subcategory=video-games-others',
        },
      ],
    },
    {
      label: 'Fashion',
      value: 'fashion' as const,
      href: '/products?category=fashion',
      featured: [
        {
          name: 'Women\'s Fashion',
          href: '/products?category=fashion&subcategory=womens-fashion',
        },
        {
          name: 'Men\'s Fashion',
          href: '/products?category=fashion&subcategory=mens-fashion',
        },
      ],
    },
    {
      label: 'Bedding',
      value: 'bedding' as const,
      href: '/products?category=bedding',
      featured: [
        {
          name: 'Bedsheets',
          href: '/products?category=bedding&subcategory=bedsheets',
        },
        {
          name: 'Pillows',
          href: '/products?category=bedding&subcategory=pillows',
        },
        {
          name: 'Blankets',
          href: '/products?category=bedding&subcategory=blankets',
        },
      ],
    },
    {
      label: 'Cleaning',
      value: 'cleaning' as const,
      href: '/products?category=cleaning',
      featured: [
        {
          name: 'Laundry',
          href: '/products?category=cleaning&subcategory=laundry',
        },
        {
          name: 'Kitchen Cleaning',
          href: '/products?category=cleaning&subcategory=kitchen-cleaning',
        },
        {
          name: 'Bathroom Cleaning',
          href: '/products?category=cleaning&subcategory=bathroom-cleaning',
        }
      ],
    },
  ]