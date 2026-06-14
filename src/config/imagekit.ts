import ImageKit from 'imagekit';

const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  throw new Error(
    'Variables ImageKit manquantes : IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT'
  );
}

export const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
})

// Dossiers dédiés aux photos produits Ogres de la Terre
export const FOLDERS = {
  products:    '/ogres-de-la-terre/produits',
  collections: '/ogres-de-la-terre/collections',
  atelier:     '/ogres-de-la-terre/atelier',
} as const;

export type FolderKey = keyof typeof FOLDERS;
