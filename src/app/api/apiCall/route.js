import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request) {
  const { url, method, headers, params } = await request.json();

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

  let allData = [];
  let nextPageInfo = null; // Initialize nextPageInfo

  try {
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
        // Process orders
        const orders = data.orders.map(order => ({
          id: order.id,
          createdAt: order.created_at,
          total: order.total_price,
          // Add other fields as needed
        }));

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

  } catch (error) {
    console.error('Error connecting to API:', error);
    return NextResponse.json({
      error: 'Error connecting to API',
      details: error.message,
    }, { status: 500 });
  }
}

