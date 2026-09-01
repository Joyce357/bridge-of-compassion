-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "organizationName" TEXT NOT NULL DEFAULT 'Bridge of Compassion',
    "publicEmail" TEXT NOT NULL DEFAULT 'admin@bridgeofcompassion.org',
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT DEFAULT 'Toronto',
    "province" TEXT DEFAULT 'Ontario',
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Canada',
    "publicLocationLabel" TEXT DEFAULT 'Toronto, Ontario',
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "footerTagline" TEXT DEFAULT 'Nurturing children, protecting nature, and building futures through hands-on environmental education and community action.',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "donationPresetAmounts" INTEGER[] DEFAULT ARRAY[25, 50, 100, 250, 500]::INTEGER[],
    "seoTitle" TEXT DEFAULT 'Bridge of Compassion — Building Bridges, Changing Lives',
    "seoDescription" TEXT DEFAULT 'Bridge of Compassion is a nonprofit organization dedicated to fostering compassion, strengthening communities, and protecting the natural world. Volunteer, donate, and get involved.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
