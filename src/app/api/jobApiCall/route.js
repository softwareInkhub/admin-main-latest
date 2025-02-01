import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request) {
  let { url, method, headers, params, clientId, clientSecret, redirectUrl } = await request.json();

  console.log('Incoming Request:', { url, method, headers, params, clientId, clientSecret, redirectUrl }); // Log incoming request data

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const validHeaders = {};
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (key && value) {
        validHeaders[key] = value;
      }
    }
  }   

  console.log('Headers:', validHeaders);
  console.log('Request Body:', { url, method, params, clientId, clientSecret, redirectUrl }); // Log the incoming request data

  // Append query parameters to the URL if provided
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    let modifiedUrl = url; // Change 'url' to 'modifiedUrl' to allow reassignment
    modifiedUrl += (modifiedUrl.includes('?') ? '&' : '?') + queryString; // Modify the URL
    url = modifiedUrl; // Reassign the modified URL back to 'url'
  }

  let allData = [];
  let nextPageInfo = null; // Initialize nextPageInfo
  let pageCount = 0; // To track the number of pages fetched

  try {
    // Check if the request is for Pinterest token exchange
    if (params && params.code && clientId && clientSecret) {
      const { code } = params; // Extract the authorization code from params

      // Prepare the request body for Pinterest token exchange
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl
      }).toString();

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      // Log the token request details
      console.log('Token Request Body:', tokenRequestBody);
      console.log('Authorization Header:', `Basic ${auth}`);

      // Make the request to Pinterest API to exchange the code for a token
      const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenRequestBody, // Include the request body
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get the error response text
        console.error('Pinterest API Error:', errorText); // Log the error response
        throw new Error(`Pinterest API error: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json();
      console.log('Token Response:', data); // Log the token response
      return NextResponse.json({ token: data.access_token }, { status: 200 }); // Return the token

    } else {
      // Existing logic for handling other API requests
      do {
        // Construct the fetch URL
        let fetchUrl;

        if (nextPageInfo) {
          // If page_info is present, construct the URL with only page_info
          const baseUrl = new URL(url);
          fetchUrl = `${baseUrl.origin}${baseUrl.pathname}?page_info=${nextPageInfo}`;
        } else {
          // Append query parameters to the URL if provided
          const queryString = new URLSearchParams(params).toString();
          fetchUrl = url + (url.includes('?') ? '&' : '?') + queryString;
        }

        console.log('Request URL:', fetchUrl);

        const response = await fetch(fetchUrl, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            ...validHeaders,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Dynamically handle different API responses
        if (data.products) {
          allData = [...allData, ...data.products]; // For Shopify products
        } else if (data.items) {
          allData = [...allData, ...data.items]; // For other APIs that return items
        } else if (Array.isArray(data)) {
          allData = [...allData, ...data]; // If the response is an array
        } else if (data.shop) {
          console.log('Shop data:', data.shop);
          allData.push(data.shop); // Optionally, you can push the shop data to allData
        } else if (data.message) {
          console.log('Received message:', data.message);
          allData.push(data.message); // Optionally, you can push the message to allData
        } else if (data.orders && Array.isArray(data.orders)) {
          let orders = data.orders; // Initialize orders with the current page's orders
          let nextOrderPageInfo = data.nextPageInfo; // Assuming the API provides nextPageInfo for orders

          // Fetch all pages of orders if pagination is supported
          while (nextOrderPageInfo) {
            const orderFetchUrl = `${url}?page_info=${nextOrderPageInfo}`; // Construct the URL for the next page
            const orderResponse = await fetch(orderFetchUrl, {
              method: method,
              headers: {
                'Content-Type': 'application/json',
                ...validHeaders,
              },
            });

            if (!orderResponse.ok) {
              const errorText = await orderResponse.text();
              console.error('Error fetching orders:', errorText);
              throw new Error(`HTTP error! status: ${orderResponse.status}, details: ${errorText}`);
            }

            const orderData = await orderResponse.json();
            orders = [...orders, ...orderData.orders]; // Append new orders to the existing array
            nextOrderPageInfo = orderData.nextPageInfo; // Update nextOrderPageInfo for the next iteration
          }

          // Ensure all orders are processed without limit
          allData = [...allData, ...orders];
        } else {
          console.warn('Unexpected response format:', data);
        }

        // Extract next page info from the Link header
        const linkHeader = response.headers.get('link'); // Get the Link header
        console.log('Link Header:', linkHeader); // Log the Link header

        if (linkHeader && linkHeader.includes('rel="next"')) {
          const regex = /<([^>]+)>; rel="next"/;
          const match = linkHeader.match(regex);
          if (match && match[1]) {
            const urlParams = new URLSearchParams(match[1].split("?")[1]);
            nextPageInfo = urlParams.get("page_info");
          } else {
            nextPageInfo = null; // If no valid next page_info, set to null
          }
        } else {
          nextPageInfo = null; // If no next link, set to null
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before the next request

      } while (nextPageInfo); // Continue until there are no more pages

      console.log(`Total data fetched: ${allData.length}`);
      return NextResponse.json({ data: allData }, { status: 200 });
    }

  } catch (error) {
    console.error('Error connecting to API:', error);
    return NextResponse.json({
      error: 'Error connecting to API',
      details: error.message,
    }, { status: 500 });
  }
}

