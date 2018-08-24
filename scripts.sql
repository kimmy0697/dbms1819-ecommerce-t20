CREATE TABLE "customers" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(80),
  "first_name" VARCHAR(80),
  "middle_name" VARCHAR(80),
  "last_name" VARCHAR(80),
  "state" VARCHAR(80),
  "city" VARCHAR(80),
  "street" VARCHAR(80),
  "zipcode" VARCHAR(80)
);

CREATE TABLE "products_category" (
  "id" SERIAL PRIMARY KEY,
  "product_category_name" VARCHAR(80)
);

CREATE TABLE "brands" (
  "id" SERIAL PRIMARY KEY,
  "brand_name" VARCHAR(80),
  "brand_description" VARCHAR(1000)
);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100),
  "description" VARCHAR(5000),
  "tagline" VARCHAR(1000),
  "price" FLOAT(2),
  "warranty" INT,
  "brand_id" INT REFERENCES brands(id),
  "category_id" INT REFERENCES products_category(id),
  "image" VARCHAR(5000)
);


CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INT REFERENCES products(id),
  "customer_id" INT REFERENCES customers(id),
  "purchase_date" timestamp default current_timestamp,
  "quantity" INT
);


CREATE TABLE "customer_favorite_products" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id)
);