# Basket Savings Reinforcement Experiment by Kseniya Kravchenko.

This Tampermonkey script enhances the basket page experience by showing discount information (save percentage and previous price) that is not available in the UI by default.


## Showcase with different cases consideration
1. display product discount if there's any + showcasing total saving amount and right subtotal
<img width="360" height="862" alt="Screenshot 2026-05-11 083953" src="https://github.com/user-attachments/assets/a33a6ba0-d4a1-4880-8bbf-065ea8deea4b" />
2. considering promo code use, display updated existing saving amount and subtotal
<img width="352" height="863" alt="Screenshot 2026-05-11 084012" src="https://github.com/user-attachments/assets/68619f63-34c6-41d7-9bbe-fb42bd1bda98" />
3. considering quantity change of discounted product without using promo code
<img width="361" height="858" alt="Screenshot 2026-05-11 084030" src="https://github.com/user-attachments/assets/c28167af-2ca8-4101-b446-3bdad36afe78" />
4. considering quantity change of discounted product with using promo code
<img width="364" height="873" alt="Screenshot 2026-05-11 084046" src="https://github.com/user-attachments/assets/e185dd86-535e-404a-a875-54dd89258f6f" />



  

My variation consists of:

1. JavaScript file for behavior

2. CSS styling is included already in the script

3. Comments are provided

4. Variation is enabled both on desktop and mobile devices

  

Based on the device type, list of products is identified using selectors, in which we can access every separate product and it's data based only on the UI.

  

Since there is no data in the UI about previous price or saving amount, the script makes an asynchronous GraphQL API call to retrieve information needed for further calculations.

  

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
   and anonymous user id if the user not logged in.
 - Classnames and identifiers are unchangeable.
 - There is only one locale (if there's going to be more than one   
   locale, I assume it can be also access via cookies)

  

## Limitations

Debounce prevents excessive recalculations/fetches, but it also introduces a slight delay before UI updates.

  

## Platform used for code injection:

Tampermonkey

  

## Instruction how to run this script on Tampermonkey:

  

To run this script on the website, you must download the Extension:

https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

  

 1. Once downloaded, enable Tampermonkey on your page and enter manage
    extension settings.
    <img width="384" height="313" alt="Screenshot 2026-05-08 181315" src="https://github.com/user-attachments/assets/3f8c7b73-ca23-4175-8af8-6377a6cd358b" />
    <img width="387" height="414" alt="Screenshot 2026-05-08 181623" src="https://github.com/user-attachments/assets/f5c582f8-eedc-4874-bcee-75dc35c7dbd5" />
  

 3. In the opened page, you should enable Developer Mode and Allow User
    Scripts.
     <img width="835" height="126" alt="Screenshot 2026-05-08 181712" src="https://github.com/user-attachments/assets/45084519-40e5-4927-9da2-b714fe07ab5d" />
    <img width="238" height="72" alt="Screenshot 2026-05-08 181726" src="https://github.com/user-attachments/assets/e6d2faec-48c4-4f9c-90da-cc8bbb5fb871" />
 5.  Once enabled, you can choose Create a new script from the extension
    itself.
<img width="342" height="495" alt="Screenshot 2026-05-08 181331" src="https://github.com/user-attachments/assets/421752ec-386c-41c2-b717-378ce8c4bd89" />

 7. In the file editor, delete everything and paste the script from
    script.js.
<img width="1541" height="740" alt="Screenshot 2026-05-08 181435" src="https://github.com/user-attachments/assets/eb8d7bcb-05ad-4ed0-a0f2-c56702c9a3fb" />
8. save everything by ctrl+s and refresh the https://www.carparts4less.co.uk/basket page to see changes

## Use of AI

  

 - GraphQL query: I was unfamiliar with the platform's GraphQL schema;
   AI helped structure the getCart query with proper fragments and
   variable handling.
 - AI assisted in fixing edge cases like promo code + discount   
   interactions/dynamic cart updates
 - Organizing README file for better readability
