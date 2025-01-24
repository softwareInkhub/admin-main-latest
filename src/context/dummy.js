const connectToApi = async (api) => {
    const { mainUrl, method, headers } = api;

    // Prepare the base URL
    let requestUrl = mainUrl;

    // Check if created_at_min and created_at_max exist in params
    const params = Array.isArray(api.queryParams) ? api.queryParams : [];
    const createdAtMinParam = params.find(param => param.key === 'created_at_min');
    const createdAtMaxParam = params.find(param => param.key === 'created_at_max');
    const pageInfoParam = params.find(param => param.key === 'page_info');

    // Append created_at_min and created_at_max to the URL if they exist
    if (createdAtMinParam && createdAtMinParam.value) {
        requestUrl += `?created_at_min=${encodeURIComponent(createdAtMinParam.value)}`;
    }
    if (createdAtMaxParam && createdAtMaxParam.value) {
        requestUrl += requestUrl.includes('?') ? '&' : '?';
        requestUrl += `created_at_max=${encodeURIComponent(createdAtMaxParam.value)}`;
    }

    // Only add the status parameter if page_info is not present
    if (!pageInfoParam) {
        const statusParam = params.find(param => param.key === 'status');
        if (statusParam && statusParam.value) {
            requestUrl += requestUrl.includes('?') ? '&' : '?';
            requestUrl += `status=${encodeURIComponent(statusParam.value)}`;
        }
    }

    // Prepare the request body
    const body = {
        url: requestUrl,
        method: method,
        headers: headers.reduce((acc, header) => {
            acc[header.key] = header.value; // Convert headers to an object
            return acc;
        }, {}),
    };

    console.log('Request URL:', body); // Log the request URL

    const proxyUrl = `/api/apiCall`;
  
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // Use the constructed body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the entire response for debugging
        setApiResponse(data); // Set the API response to state for UI display

        // Log the API call in Firestore
        const userEmail = "user@example.com"; // Replace with actual user email from your auth system
        const logEntry = {
            uuid: uuidv4(), // Generate a unique ID
            apiName: api.apiName,
            apiTitle: api.apiTitle,
            apiStatus: 'Success',
            mainUrl: mainUrl,
            userEmail: userEmail,
            createdAt: new Date().toISOString(), // Current timestamp
        };

        // Add the log entry to the apiLog collection
        await addDoc(collection(db, 'apiLog'), logEntry);
        console.log('API log entry created:', logEntry);

    } catch (error) {
        console.error('Error connecting to API:', error);
        setApiResponse(null); // Clear the response on error
    }
};