import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

const root = process.cwd()
const outputPath = path.join(root, 'by-celeste-product-catalog-migration.xlsx')
const tempDir = path.join(root, '.tmp-product-catalog-xlsx')

const imageMappings = [
  ['Bath', 'imgi_45_JWX5JOVFAINHMI55ZMVUNBPE.jpg', 'Italian Lavender Bath Clay 320mL', 'italian-lavender-bath-clay.jpg', 'Primary', ''],
  ['Hand', 'imgi_23_AWXR5HGBDXU3VY5KYY6YIJYV.jpg', 'Lemon & Rose Hand Cream 120mL', 'lemon-rose-hand-cream.jpg', 'Primary', 'Image label reads Lemon Rose hand cream.'],
  ['Hand', 'imgi_60_LZ5AZSAHOC7OS7XWSWZVR625.jpg', 'Mandarin & Lavender Hand Cream 120mL', 'mandarin-lavender-hand-cream.jpg', 'Primary', ''],
  ['Foot', 'imgi_61_3RN6PPC6SZDSXNMJSTYSNMO2.jpg', 'Mint Tea Foot Scrub 120mL', 'mint-tea-foot-scrub.jpg', 'Primary', ''],
  ['Foot', 'imgi_69_FPOTPVLBZMQUWV774FCPHU5S.jpg', 'Moroccan Mint Foot Butter 120mL', 'moroccan-mint-foot-butter.jpg', 'Primary', 'Image label appears to say Peppermint foot butter.'],
  ['Face', 'imgi_16_WTBETGCRXJCU6VC4QI6TKFGJ.jpg', 'Jojoba Beads Facial Polish 60g', 'jojoba-beads-facial-polish.jpg', 'Primary', ''],
  ['Face', 'imgi_65_ZJEYSN3WMUERHYCIELXEXZ4D.jpg', 'Organic Rosehip Facial Oil 25mL', 'organic-rosehip-facial-oil.jpg', 'Primary', ''],
  ['Face', 'imgi_113_VEJ7P4I4T3NUZGJ6MBFRAKYZ.jpg', 'Green Tea Facial Moisturizer 60g', 'green-tea-facial-moisturizer.jpg', 'Primary', ''],
  ['Face', 'imgi_119_LG5A3VYRV7JINQM2KLB4VVYE.jpg', 'Green Tea Facial Sapone 100g', 'green-tea-facial-sapone.jpg', 'Primary', ''],
  ['Face', 'imgi_125_IJLXDNPMZY4TTKGJGBPQ5PNR.jpg', 'Spicy Moroccan Aftershave Nourishing Balm 100mL', 'spicy-moroccan-aftershave-balm.jpg', 'Primary', 'Catalogue name is longer than visible label.'],
  ['Face', 'imgi_131_FPE74MVSL4MHYDBG5UQRGQ4Z.jpg', 'Lavender Floral Toner 100mL', 'lavender-floral-toner.jpg', 'Primary', 'Image label appears to say Lavender Flower Toner.'],
  ['Face', 'imgi_137_XFGSQVPBD3YWXJ5NCUSDHWFK.jpg', 'Sandalwood Shaving Soap 100g', 'sandalwood-shaving-soap.jpg', 'Primary', ''],
  ['Face', 'imgi_155_ZJEYSN3WMUERHYCIELXEXZ4D.jpg', 'Organic Rosehip Facial Oil 25mL', 'organic-rosehip-facial-oil.jpg', 'Duplicate', 'Duplicate image record for Organic Rosehip Facial Oil.'],
  ['Body', 'imgi_106_I34RB64S3W262CBPYXZJGTHL.jpg', 'Entice Massage Oil', 'entice-massage-oil.jpg', 'Primary', ''],
  ['Body', 'imgi_112_A5H36UQ3UTVWFNW53SWMW64C.jpg', 'Moroccan Spice Body Silk 175mL', 'moroccan-spice-body-silk.jpg', 'Primary', ''],
  ['Body', 'imgi_118_KLDTYJDYIUYZHO3X5SYGQWVS.jpg', 'French Vanilla Body Cream 120mL', 'french-vanilla-body-cream.jpg', 'Primary', ''],
  ['Body', 'imgi_123_GEV7VJATEKOVXPYS5QV7H4CR.jpg', 'Musk Body Cream 120mL', 'musk-body-cream.jpg', 'Primary', ''],
  ['Body', 'imgi_130_WOIKXI36ODAHBEQXFK53KP2P.jpg', 'Moroccan Spice Body Cream 120mL', 'moroccan-spice-body-cream.jpg', 'Primary', ''],
  ['Body', 'imgi_136_UJDAO6KVXEY2O7PKUAU5LYIO.jpg', 'Heart Soap', 'heart-soap.jpg', 'Primary', 'Product may be shown under Body download but catalogue category is Soap.'],
  ['Body', 'imgi_141_BTY3AK4N5QWGNS465GOP4TQW.jpg', 'Lemoncello Body Butter 175mL', 'lemoncello-body-butter.jpg', 'Primary', ''],
  ['Body', 'imgi_148_DFF6Q4TH6R2QAKHRECBGU3DI.jpg', 'Musk Stick Body Silk 175mL', 'musk-stick-body-silk.jpg', 'Primary', ''],
  ['Soap', 'imgi_8_UMULEKHJPUREQ3T7WKGXA7MU.jpg', 'Small Gift Crate with 4 pieces of Soap', 'small-gift-crate-4-soap.jpg', 'Primary', ''],
  ['Soap', 'imgi_9_WVLUG3237Y5JEU5E3X64SUEH.jpg', 'Large Gift Crate with 6 pieces of Soap', 'large-gift-crate-6-soap.jpg', 'Primary', ''],
  ['Soap', 'imgi_10_LB5FPDLNTUS7VMLGWT4YFV3Y.jpg', 'Large Gift Crate with 6 pieces of Soap', 'large-gift-crate-6-soap-alt.jpg', 'Alternate', 'Alternate/duplicate image for large gift crate.'],
  ['Soap', 'imgi_11_B2CKDMKYZD2KTRZMI6GBCEK6.jpg', 'Cotton Soap Bag', 'cotton-soap-bag.jpg', 'Primary', ''],
  ['Soap', 'imgi_12_JPF6NBAYH2KMGR3DIDWHFQHQ.jpg', 'Heart Soap', 'heart-soap.jpg', 'Primary', ''],
  ['Soap', 'imgi_13_3WCNRGZKFFGPGVOHRPQ6XZYY.jpg', 'Shampoo Bar Sapone 100g', 'shampoo-bar-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_14_YKXEEKGNMKK6W6HYCQLVIXMP.jpg', 'Christmas Star Sapone 100g', 'christmas-star-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_15_LWC37NGN6OEDTC5MVZCGPUGH.jpg', 'Moroccan Spice Sapone 100g', 'moroccan-spice-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_16_AEOQIKUZWYVF5MXPEU5D2J23.jpg', 'Mint & Cocoa Sapone 100g', 'mint-cocoa-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_17_LG5A3VYRV7JINQM2KLB4VVYE.jpg', 'Green Tea Facial Sapone 100g', 'green-tea-facial-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_18_UG2SH3AH7LGEFENXOBSAZYQH.jpg', 'Lemon & Goats Milk Sapone 100g', 'lemon-goats-milk-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_19_OQMFS3DPJCWBKBZQRZ63RXMG.jpg', 'Goats Milk Sapone 100g', 'goats-milk-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_20_MX2ISGSC4AR52QXBPEHNNSKI.jpg', 'Seeded Mint Pumice Scrub Sapone 100g', 'seeded-mint-pumice-scrub-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_21_DZAAPQL2544FREMOJPUSPHVR.jpg', 'Sandalwood Black Clay Sapone 100g', 'sandalwood-black-clay-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_22_AWUQO7ONBGMZND44VALNQ3C7.jpg', 'Geranium & Ginger Sapone 100g', 'geranium-ginger-sapone.jpg', 'Primary', 'Image label order appears as Ginger & Geranium.'],
  ['Soap', 'imgi_23_4MUAF2LBVLASXLL7N5P25423.jpg', 'Fig & Almond Sapone 100g', 'fig-almond-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_24_FCP3I4YCMZ3TC2FW7GS2XU3U.jpg', 'Pink Rose Sapone Clay 100g', 'pink-rose-sapone-clay.jpg', 'Primary', ''],
  ['Soap', 'imgi_25_WEN6T45YTEV7PEWWPU7UCVQR.jpg', 'Pomegranate Butter Sapone 100g', 'pomegranate-butter-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_26_SACFFFNDGMR24W3EHE4Z36SN.jpg', 'Roasted Wattle Seed Sapone Scrub 100g', 'roasted-wattle-seed-sapone-scrub.jpg', 'Primary', ''],
  ['Soap', 'imgi_27_LAZTLNWPHYLPQK33SVISNF6I.jpg', 'Field Lavender Sapone 100g', 'field-lavender-sapone.jpg', 'Primary', ''],
  ['Soap', 'imgi_28_XFGSQVPBD3YWXJ5NCUSDHWFK.jpg', 'Sandalwood Shaving Soap 100g', 'sandalwood-shaving-soap.jpg', 'Primary', ''],
  ['Soap', 'imgi_29_VAVZYO3JXDDCPMASHQJ4A6M2.jpg', 'Wooden Soap Rack', 'wooden-soap-rack.jpg', 'Primary', ''],
  ['Other', 'imgi_8_4ZMJ5GFUNXLDSHXKW6U27NAV.jpg', 'Unmatched / ignore', 'ignore-cropped-gift-crate.jpg', 'Ignore', 'Poor crop or partial duplicate.'],
  ['Other', 'imgi_9_UMULEKHJPUREQ3T7WKGXA7MU.jpg', 'Small Gift Crate with 4 pieces of Soap', 'small-gift-crate-4-soap.jpg', 'Duplicate', 'Duplicate of Soap category image.'],
  ['Other', 'imgi_10_WVLUG3237Y5JEU5E3X64SUEH.jpg', 'Large Gift Crate with 6 pieces of Soap', 'large-gift-crate-6-soap.jpg', 'Duplicate', 'Duplicate of Soap category image.'],
  ['Other', 'imgi_11_LB5FPDLNTUS7VMLGWT4YFV3Y.jpg', 'Large Gift Crate with 6 pieces of Soap', 'large-gift-crate-6-soap-alt.jpg', 'Duplicate', 'Duplicate/alternate of Soap category image.'],
  ['Other', 'imgi_12_B2CKDMKYZD2KTRZMI6GBCEK6.jpg', 'Cotton Soap Bag', 'cotton-soap-bag.jpg', 'Duplicate', 'Duplicate of Soap category image.'],
  ['Other', 'imgi_13_3A7T5VT5QI6DSKIKFNBQQIP7.jpg', 'Large Gift Crate — Unfilled', 'large-gift-crate-unfilled.jpg', 'Primary', ''],
  ['Other', 'imgi_14_3WCNRGZKFFGPGVOHRPQ6XZYY.jpg', 'Shampoo Bar Sapone 100g', 'shampoo-bar-sapone.jpg', 'Duplicate', 'Duplicate of Soap category image.'],
  ['Other', 'imgi_15_VAVZYO3JXDDCPMASHQJ4A6M2.jpg', 'Wooden Soap Rack', 'wooden-soap-rack.jpg', 'Duplicate', 'Duplicate, but clearer version may be preferred.'],
]

function stripTypeScript(source) {
  return source
    .replace(/export type ClientCatalogProduct = \{[\s\S]*?\n\}\n\n/, '')
    .replace(/export const CLIENT_CATALOG_PRODUCTS: ClientCatalogProduct\[] = /, 'const CLIENT_CATALOG_PRODUCTS = ')
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function colName(index) {
  let name = ''
  let n = index
  while (n > 0) {
    const r = (n - 1) % 26
    name = String.fromCharCode(65 + r) + name
    n = Math.floor((n - 1) / 26)
  }
  return name
}

function cell(value, rowIndex, colIndex) {
  const ref = `${colName(colIndex)}${rowIndex}`
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
}

function worksheet(rows) {
  const sheetData = rows
    .map((row, rowOffset) => {
      const rowIndex = rowOffset + 1
      const cells = row.map((value, colOffset) => cell(value, rowIndex, colOffset + 1)).join('')
      return `<row r="${rowIndex}">${cells}</row>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="24" customWidth="1"/>
    <col min="2" max="2" width="36" customWidth="1"/>
    <col min="3" max="3" width="22" customWidth="1"/>
    <col min="4" max="20" width="32" customWidth="1"/>
  </cols>
  <sheetData>${sheetData}</sheetData>
</worksheet>`
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-100g$|-120ml$|-175ml$|-320ml$|-25ml$|-60g$/g, '')
}

function normalizeImageSlug(cleanFile) {
  return cleanFile
    .replace(/\.jpg$/i, '')
    .replace(/-alt$/i, '')
}

async function main() {
  const source = await fs.readFile(path.join(root, 'backend/src/data/client-catalog.ts'), 'utf8')
  const script = `${stripTypeScript(source)}\nCLIENT_CATALOG_PRODUCTS`
  const products = vm.runInNewContext(script, {})
  const productsByName = new Map(products.map((product) => [product.name, product]))
  const productsBySlug = new Map(products.map((product) => [product.slug, product]))

  const groupedImages = new Map()
  for (const [category, originalFile, mappedName, cleanFile, status, note] of imageMappings) {
    const normalized = normalizeImageSlug(cleanFile)
    const product = productsByName.get(mappedName) ?? productsBySlug.get(normalized)
    const key = product?.slug ?? normalized
    if (!groupedImages.has(key)) groupedImages.set(key, [])
    groupedImages.get(key).push({ category, originalFile, mappedName, cleanFile, status, note })
  }

  const summaryRows = [
    ['By Celeste Product Content Migration', ''],
    ['Source website', 'https://www.byceleste.com.au/'],
    ['Products in project catalogue', products.length],
    ['Downloaded image records supplied', imageMappings.length],
    ['Primary image records', imageMappings.filter((row) => row[4] === 'Primary').length],
    ['Duplicate/alternate/ignore image records', imageMappings.filter((row) => row[4] !== 'Primary').length],
    ['Purpose', 'Document product information and downloaded image mapping for the new By Celeste ecommerce website.'],
    ['Client permission note', 'Images and product details were collected from the existing By Celeste website with client permission for migration into the new website.'],
    ['Important note', 'Some uploaded images are duplicates or alternate versions. The Product Catalog sheet keeps the official project product names and links the matching downloaded image records where available.'],
  ]

  const catalogRows = [
    [
      'Product Name',
      'Slug',
      'Category',
      'Price AUD',
      'Short Description',
      'Full Description',
      'How To Use',
      'Benefits',
      'Ingredients / Made With',
      'Existing Project Image Path',
      'Suggested Uploaded Image(s)',
      'Original Downloaded File(s)',
      'Uploaded Image Category/Status',
      'Image Notes',
    ],
    ...products.map((product) => {
      const matches = groupedImages.get(product.slug) ?? groupedImages.get(slug(product.name)) ?? []
      return [
        product.name,
        product.slug,
        product.categoryName ?? 'Uncategorised',
        product.priceAud,
        product.shortDescription,
        product.description,
        product.howToUse,
        (product.benefits ?? []).join('; '),
        (product.madeWith ?? []).join('; '),
        product.imagePath,
        matches.map((item) => item.cleanFile).join('; '),
        matches.map((item) => item.originalFile).join('; '),
        matches.map((item) => `${item.category} - ${item.status}`).join('; '),
        matches.map((item) => item.note).filter(Boolean).join('; '),
      ]
    }),
  ]

  const mappingRows = [
    ['Downloaded Category', 'Original Downloaded File', 'Matched Product Name', 'Suggested Clean Filename', 'Status', 'Notes'],
    ...imageMappings.map(([category, originalFile, mappedName, cleanFile, status, note]) => [
      category,
      originalFile,
      mappedName,
      cleanFile,
      status,
      note,
    ]),
  ]

  await fs.rm(tempDir, { recursive: true, force: true })
  await fs.mkdir(path.join(tempDir, '_rels'), { recursive: true })
  await fs.mkdir(path.join(tempDir, 'xl', '_rels'), { recursive: true })
  await fs.mkdir(path.join(tempDir, 'xl', 'worksheets'), { recursive: true })

  await fs.writeFile(
    path.join(tempDir, '[Content_Types].xml'),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  )

  await fs.writeFile(
    path.join(tempDir, '_rels', '.rels'),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  )

  await fs.writeFile(
    path.join(tempDir, 'xl', 'workbook.xml'),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Product Catalog" sheetId="2" r:id="rId2"/>
    <sheet name="Uploaded Image Mapping" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`
  )

  await fs.writeFile(
    path.join(tempDir, 'xl', '_rels', 'workbook.xml.rels'),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`
  )

  await fs.writeFile(path.join(tempDir, 'xl', 'worksheets', 'sheet1.xml'), worksheet(summaryRows))
  await fs.writeFile(path.join(tempDir, 'xl', 'worksheets', 'sheet2.xml'), worksheet(catalogRows))
  await fs.writeFile(path.join(tempDir, 'xl', 'worksheets', 'sheet3.xml'), worksheet(mappingRows))

  await fs.rm(outputPath, { force: true })
  execFileSync('zip', ['-qr', outputPath, '.'], { cwd: tempDir })
  await fs.rm(tempDir, { recursive: true, force: true })

  console.log(`Created ${outputPath}`)
}

await main()
