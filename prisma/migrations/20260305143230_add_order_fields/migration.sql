-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
    "image" TEXT,
    "providerId" TEXT NOT NULL,
    "allowsCOD" BOOLEAN NOT NULL DEFAULT false,
    "providerType" TEXT NOT NULL DEFAULT 'Dropi',
    "sku" TEXT,
    "dropiId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Dog',
    "costPrice" REAL,
    "sellPrice" REAL,
    "weight" REAL,
    "length" REAL,
    "width" REAL,
    "height" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "color" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "priceAdjustment" REAL NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerRUT" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" REAL NOT NULL,
    "selectedColor" TEXT,
    "trackingCode" TEXT,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
