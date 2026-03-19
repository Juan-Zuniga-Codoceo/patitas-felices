import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/profile/', '/checkout/'],
        },
        sitemap: 'https://patitasfelices.cl/sitemap.xml',
    };
}
