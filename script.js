// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-05-07
// @description  try to take over the world!
// @author       You
// @match        https://www.carparts4less.co.uk/basket
// @icon         https://www.google.com/s2/favicons?sz=64&domain=carparts4less.co.uk
// @grant        GM_addStyle
// ==/UserScript==

let stylesheet = `
      .saveContainer {
            height: 12px;
            display: flex;
            gap: 6px;
      }
      .save {
            font-size: 12px;
            line-height: 12px;
            font-weight: 700;
            color: var(--red-500);
      }
`

//initialize totalSavingAmount and subtotal globals for further calculations
let totalSavingAmount = 0;
let subTotal = 0;


// api call for retrieving cart data
async function getCart(cartId, anonymousId) {
   const cartIdCookie = getCookie('basket_cartId__en_gb');
   const userId = getCookie('basket_anonId__en_gb');

  const query = `
    query GetCart($input: GetCartInput!) {
      getCart(input: $input) {
        ... on Cart {
          ...Cart
        }
      }
    }

    fragment Cart on Cart {
      __typename
      id
      anonymousId
      lineItems { ...LineItem }
    }

    fragment LineItem on LineItem {
      id
      name
      quantity
      slugName
      percentageSaving
       variant {
        sku
      }
      price {
            centAmount
        }
        wasPrice {
          centAmount
        }
    }

  `;

  const variables = {
    input: {
      cartId: cartIdCookie,
      anonymousId: userId,
      locale: "x-en-gb-cp4l"
    }
  };

  const res = await fetch("https://www.carparts4less.co.uk/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  return data?.data?.getCart;
}


function isMobile() {
    return window.innerWidth <= 766;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function calculateSubTotal(oldPrice, actualPrice, quantity)
{
const maxPrice = Math.max(oldPrice, actualPrice);
    subTotal += maxPrice * quantity;
}

function getNumberFromElement(num) {
  num = num.replace(/[^0-9.]/g, '');
  return Number(num)
}

async function updatePriceItems() {
  // since we're calling this function every time the final price changes,
  // we remove our additional component to reduce duplication

  const allSaveContainers = document.querySelectorAll('.saveContainer');
  allSaveContainers.forEach(container => container.remove());
  totalSavingAmount = 0;
  subTotal = 0;

  let productSelector = isMobile() ? '[data-testid="mobileLineItems"]' : '[data-testid="desktopLineItems"]'

  const cartData = await getCart();

  // make a map of product items in cart
   const productsDataMap = new Map();
   cartData.lineItems.forEach(item => {
   const sku = item.variant.sku;

   productsDataMap.set(sku, {
       wasPrice: item.wasPrice.centAmount,
       actualPrice: item.price.centAmount,
       quantity: item.quantity,
       percentageSaving: item.percentageSaving,
       name: item.name
    });
});

  //select all products containers
  const products = document.querySelectorAll(productSelector);
  for (const productEl of products) {
    const priceContainer = productEl.querySelector('div.LineItems_prices__cxwdn');
    const productId = productEl.querySelector('[data-testid="lineItemSku"]').textContent;
    const productQty = productEl.querySelector(`#basket-qty-selector-${productId}-combo-label`).textContent;

    //create our new container for showing save percentage and previous price
    const saveContainer = document.createElement("div");
    saveContainer.classList.add("saveContainer");

    const productData = productsDataMap.get(productId)
    const savePercentage = Math.round(productData.percentageSaving);

    const previousPrice = document.createElement("span");
    const save = document.createElement("span");
    previousPrice.classList.add("LineItems_pricePreDiscount__8K5Pc");
    previousPrice.textContent = `£${productData.wasPrice/ 100 * productQty}`;
    save.textContent = `save ${savePercentage}%`;
    save.classList.add("save");

    saveContainer.prepend(previousPrice)
    saveContainer.prepend(save)

    calculateSubTotal(productData.wasPrice, productData.actualPrice, productQty)

    // check if savePercentage is valid and can be shown and add it to our container
    if (savePercentage > 0) {
      const savingPerItem = productData.wasPrice - productData.actualPrice;
      totalSavingAmount += savingPerItem * productQty;
      priceContainer.prepend(saveContainer);
    }

  }

}

// creating/updating total savings amount block considering discount and promocode
function addSavingTotal() {
  let promoCodeBlock = document.querySelector(
    '[data-testid="promotionalDiscountAmount"]'
  ); //check if promocode savings block already exist

  let discountSavingsBlock = document.querySelector(
    "div.my-saving-block"
  ); //check if our new discount savings block exist since we calling this function every total update

  // if we add promocode and we already have our separate total savings block from discount, we remove it to reduce duplication
  if (promoCodeBlock && discountSavingsBlock) {
    discountSavingsBlock.remove();
    discountSavingsBlock = null;
  }

  // if there's no promocode and no savings from discount (product was deleted for example) we remove it
  if (!promoCodeBlock && totalSavingAmount === 0) {
    if (discountSavingsBlock) {
      console.log('No savings, removing block');
      discountSavingsBlock.remove();
    }
      return
  }

  const totalAmount = document.querySelector('[data-testid="totalAmount"]').textContent;

  const hasSavings = totalSavingAmount > 0;

    // if there is no promocode and we have savings => create savings block and update subtotal
  if (!promoCodeBlock && hasSavings) {
    const saving = document.createElement("span");
    saving.innerHTML = 'Saving';
    saving.classList.add("Totals_subtotalLabel__QZ7yq", "Totals_savingLabel__Y4jXz");

    const savingTotalAmount = document.createElement("span");
    savingTotalAmount.innerHTML = `-£${(totalSavingAmount / 100).toFixed(2)}`;
    savingTotalAmount.classList.add("Totals_subtotalAmount__4eHW7", "Totals_savingAmount__x1Icj");

    const savingTotal = document.createElement("div");
    savingTotal.classList.add("Totals_subtotalWrapper__9UFp5", "my-saving-block");

    savingTotal.prepend(savingTotalAmount);
    savingTotal.prepend(saving);
    const subtotalEl = document.querySelector('[data-testid="subtotalAmount"]')
    subtotalEl.textContent = `£${subTotal / 100}`;

    const totalContainer = document.querySelector('div.Totals_totalWrapper__jSdeW');
    totalContainer.before(savingTotal);
  } else {
    // if there is promocode and savings => update existing saving container
    if (hasSavings > 0) {
      const savingAmount = document.querySelector('[data-testid="savingAmount"]');
      savingAmount.innerHTML = `-£${((subTotal / 100) - getNumberFromElement(totalAmount)).toFixed(2)}`;

      const subtotalEl = document.querySelector('[data-testid="subtotalAmount"]')
      subtotalEl.textContent = `£${subTotal / 100}`;
    }
  }
}

async function main() {
  const refresh = async () => {
    await updatePriceItems();
    addSavingTotal();
  };
  // from the first load update save percentage and total saving block
  await refresh();
  let resizeTimer;
  window.addEventListener('resize', () => {
       clearTimeout(resizeTimer);

       resizeTimer = setTimeout(() => {
       refresh();
    }, 300);
    });

  const totalAmountNode = document.querySelector('[data-testid="totalAmount"]');

  // observe Total price changes (promocode adding or quantity changes), if there is a change = recalculate
  const observer = new MutationObserver(function (mutations) {
    for (let mutation of mutations) {
      if (mutation.type === "characterData") {
        setTimeout(() => {
          refresh();
        }, 300);
      }
    }
  });

  observer.observe(totalAmountNode, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });
}

// include css
let s = document.createElement('style');
s.type = "text/css"
s.innerHTML = stylesheet;
(document.head || document.documentElement).appendChild(s);

addEventListener("load", setTimeout(await main, 2000))
// waiting for the DOM to fully load to run the script