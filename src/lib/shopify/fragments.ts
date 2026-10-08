/** Reusable GraphQL fragments. Keep field selections lean — they hit every grid. */

export const IMAGE_FIELDS = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_CARD_FIELDS = /* GraphQL */ `
  ${IMAGE_FIELDS}
  fragment ProductCardFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    availableForSale
    featuredImage { ...ImageFields }
    images(first: 2) { nodes { ...ImageFields } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    variants(first: 1) { nodes { id availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } } }
  }
`;

export const PRODUCT_FULL_FIELDS = /* GraphQL */ `
  ${PRODUCT_CARD_FIELDS}
  fragment ProductFullFields on Product {
    ...ProductCardFields
    description
    descriptionHtml
    seo { title description }
    allImages: images(first: 20) { nodes { ...ImageFields } }
    options {
      id
      name
      optionValues {
        name
        swatch { color image { previewImage { url } } }
      }
    }
    allVariants: variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { ...ImageFields }
      }
    }
  }
`;

export const CART_FIELDS = /* GraphQL */ `
  ${IMAGE_FIELDS}
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
          amountPerQuantity { amount currencyCode }
          compareAtAmountPerQuantity { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions { name value }
            image { ...ImageFields }
            product { handle title }
          }
        }
      }
    }
  }
`;
