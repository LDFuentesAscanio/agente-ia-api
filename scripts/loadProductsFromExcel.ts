import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve(__dirname, '../products.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const tenPercent = Math.ceil(rows.length * 0.1);
  const productsToInsert = rows.slice(0, tenPercent);

  for (const row of productsToInsert) {
    const { TIPO_PRENDA, DESCRIPCIÓN, PRECIO_50_U, CANTIDAD_DISPONIBLE } =
      row as {
        TIPO_PRENDA: string;
        DESCRIPCIÓN: string;
        PRECIO_50_U: number;
        CANTIDAD_DISPONIBLE: number;
      };

    await prisma.product.create({
      data: {
        name: TIPO_PRENDA,
        description: DESCRIPCIÓN,
        price: Number(PRECIO_50_U),
        stock: Number(CANTIDAD_DISPONIBLE),
      },
    });
  }

  console.log(`✅ ${productsToInsert.length} productos cargados exitosamente.`);
}

main()
  .catch((e) => {
    console.error('❌ Error cargando productos:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
