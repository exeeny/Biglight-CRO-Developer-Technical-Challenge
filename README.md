# Basket Savings Reinforcement Experiment

This Tampermonkey script enhances the basket page experience by showing discount information (save percentage and previous price) that is not available in the UI by default.

  

My variation consists of:

1. JavaScript file for behavior

2. CSS styling is included already in the script

3. Comments are provided

4. Variation is enabled both on desktop and mobile devices

  

Based on the device type, list of products is identified using selectors, in which we can access every separate product and it's data based only on the UI.

  

Since there is no data in the UI about previous price or saving amount, the script makes an asynchronous graphqL api call to retrieve information needed for further calculations.

  

For the previous price ui information display quantity is also considered.

  

For the total savings and subtotal calculations, we make additional variables that are populated when the product container UI updates.

  

## Promo code handling

  

If there is a product with a discount in the cart, and no promo code was used, we create a new total saving container in the design of the existing promo code one.

  

If a promo code was used, we just update the existing information in the UI with the saving amount and subtotal.

  

It works both ways: with adding and removing a promo code.

  

## Dynamic basket Update

  

To check if a promo code was added, the quantity of the product changes, or if product was removed, we make an observer on TotalPrice change to recalculate everything with debouncing.

In addition, we also check window resizing and apply our changes with debouncing, to reduce constant recalculation and apply changes only when user is finished with his resizing.

  

## Assumptions:

 - The ability to fetch cart data using cookie values such as cart id   
   and anonymous user id if he's not logged in.
 - Classnames and identifiers are unchangeable.
 - There is only one locale (if there's going to be more than one   
   locale, i assume it can be also access via cookies)

  

## Limitations

Debounce prevents excessive recalculations/fetches, but it also introduces a slight delay before UI updates.

  

## Platform used for code injection:

Tampermonkey

  

## Instruction how to run this script on Tampermonkey:

  

To run this script on the website, you must download the Extension:

https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

  

 1. Once downloaded, enable Tampermonkey on your page and enter manage
    extension settings.
 2. In the opened page, you should enable Developer Mode and Allow User
    Scripts.
 3.  Once enabled, you can choose Create a new script from the extension
    itself.
 4. In the file editor, delete everything and paste the script from
    script.js.

  
  

## Use of AI

  

 - GraphQL query: I was unfamiliar with the platform's GraphQL schema;
   AI helped structure the getCart query with proper fragments and
   variable handling.
 - AI assisted in fixing edge cases like promo code + discount   
   interactions/dynamic cart updates
 - Organizing readme file for better readability
